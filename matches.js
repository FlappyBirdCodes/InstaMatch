const express = require('express');
const app = express();

const matchesRouter = express.Router();

module.exports = matchesRouter;

//Gets random integer with parameters setting the min and max
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

//Gets random element from list
function randomElement(min, max, lst) {
    const randomIndex = randomInt(min, max);
    return lst[randomIndex];
}

//Importing database schema from User.js
const User = require("./Users");


//Checking if matchUsername exists in database
matchesRouter.use("/newMatch", (req, res, next) => {
    User.findOne({ username: req.query.matchUsername }, (err, user) => {
        
        //Checks if user exists
        if (user) {
            req.matchUser = user;
            next();
        } else {
            res.status(400).send("This user does not exist");
        }
    })
})

//Sets looking for variable
matchesRouter.use("/instaMatch", (req, res, next) => {

    //Gets lookingFor variable from query
    const lookingFor = req.query.lookingFor;

    //Chooses a random gender if user has selected both for looking for
    if (lookingFor == "Both") {
        if (randomInt(1, 2) == 1) {
            req.lookingFor = "Male";
        } else {
            req.lookingFor = "Female";
        }
    } else {
        req.lookingFor = lookingFor;
    }

    //Turns array into string if user spams button
    if (req.lookingFor.constructor.name == "Array") {
        req.lookingFor = req.lookingFor[0];
    }

    next();

})

//Sets gender variable
matchesRouter.use("/instaMatch", (req, res, next) => {

    const gender = req.query.gender;
    if (gender == "Other") {
        if (randomInt(1, 2) == 1) {
            req.gender = "Male";
        } else {
            req.gender = "Female";
        }
    } else {
        req.gender = gender;
    }

    if (req.gender.constructor.name == "Array") {
        req.gender = req.gender[0];
    }

    next();
})

//Sets req.userMaches variable 
matchesRouter.use(["/matches", "/newMatch", "/deleteMatch/:id", "/viewProfile", "/instaMatch"], (req, res, next) => {
    User.findOne({ username: req.query.username }, (err, user) => {
        if (user) {
            req.userMatches = user.matches;
            req.user = user;
            //IDs from all matches
            let matchIDs = [];
            for (let i = 0; i < req.userMatches.length; i++) {
                matchIDs.push(req.userMatches[i][0]);
            }
            req.matchIDs = matchIDs;
            next();
        } else {
            res.status(404).send("User not found");
        }
    })
})

//Sends matches page of user
matchesRouter.get("/matches", (req, res) => {

    //Checks if user has any matches
    if (req.userMatches.length > 0) {

        //Gets all matches from userIDs list req.matchIDs
        User.find().where("userID").in(req.matchIDs).exec((err, matches) => {

            let allMatches = [];
            allMatches.length = req.matchIDs.length;

            for (let i = 0; i < matches.length; i++) {
                let currentID = matches[i].userID;
                let newIndex = req.matchIDs.indexOf(currentID);
                let currentMatch = matches[i];
                let matchJson = {
                    username: currentMatch.username,
                    image: currentMatch.profilePic
                };
                allMatches[newIndex] = matchJson;
            }

            //Renders allMatches with handlebars template
            res.render("matches", { posts: allMatches });
        })

        //Renders empty handlebars template
    } else {
        res.render("matches", { posts: [] });
    }
})

//Sends message to user that instaMatch route cannot be accessed directly
matchesRouter.get("/instaMatch", (req, res) => {
    res.status(404).send("You cannot access this page directly. Please try logging in first.");
})

matchesRouter.post("/instaMatch", (req, res) => {

    console.log(req.lookingFor);
    //Finds all users with the same gender as the user's looking for
    User.find({ gender: req.lookingFor }, (err, matches) => {

        let all_matches = [];

        //Checks if the match's looking for is the same as the user's gender
        for (let i = 0; i < matches.length; i++) {
            if (matches[i].lookingFor == req.gender) {
                all_matches.push(matches[i]);
            }
        }

        if (all_matches.includes(req.user.username)) {
            let userIndex = all_matches.indexOf(req.user.username);
            all_matches.splice(userIndex, 1);
        }


        //Gets a random user from all_matches
        const random_user = randomElement(0, all_matches.length, all_matches);

        //Renders matchProfile
        if (random_user) {
            res.render("matchProfile", { username: random_user.username, age: random_user.age, location: random_user.location, description: random_user.description, lookingFor: random_user.lookingFor, gender: random_user.gender, profilePic: random_user.profilePic });
        } else {
            res.send(random_user);
        }

    })
})

//When user chooses a new match
matchesRouter.post("/newMatch", (req, res) => {

    //Finding the user from the query string
    User.findOne({ username: req.query.username }, (err, user) => {
        if (user) {

            User.findOne({ username: req.query.matchUsername }, (err, match) => {
                //Checks that the match isn't already in the users matches list
                if (!req.matchIDs.includes(match.userID)) {

                    //Gets matchUsername and removes it from query string
                    const matchUsername = req.query.matchUsername;
                    const url = req.url.replace("&matchUsername=" + matchUsername, "");

                    //Pushes the matchID and position to sender's database
                    const matchPosition = user.matches.length + 1;
                    user.matches.push([req.matchUser.userID, matchPosition]);

                    //Pushes recieverID and position to reciever's database
                    const recieverPosition = match.potentialMatches.length + 1;
                    match.potentialMatches.push([user.userID, recieverPosition]);

                    //Sorts matchIDs in ascending order
                    user.matches.sort(function (a, b) { return a - b });
                    match.potentialMatches.sort(function (a, b) { return a - b });

                    match.save();
                    user.save().then(data => {

                        //Redirects to matches
                        res.redirect("/matches" + url.substring(9));
                    });
                } else {
                    res.send("Already in matches");
                }
            })

        } else {
            res.status(400).send("This user does not exist");
        }
    })

})

//Route that deletes match from user's database
matchesRouter.post("/deleteMatch/:id", (req, res) => {
    //Deletes the index in the matches list
    console.log(req.params.id);
    req.user.matches.splice(req.params.id, 1);
    req.user.save()
    .then(data => {
        const query = req.query;
        res.redirect("/matches" + "?username=" + query.username + "&age=" + query.age + "&gender=" + query.gender + "&lookingFor=" + query.lookingFor + "&location=" + query.location + "&description=" + query.description);
    })
})

matchesRouter.get("/viewProfile", (req, res) => {

    const profileMatch = req.user.potentialMatches[req.query.requestID][0];

    User.findOne({ userID: profileMatch }, (err, user) => {
        if (user) {
            res.render("viewProfile", { username: user.username, age: user.age, location: user.location, description: user.description, lookingFor: user.lookingFor, gender: user.gender, profilePic: user.profilePic });
        } else {
            res.status(404).send("User not found");
        }
    })

})


matchesRouter.post("/viewProfile/:id", (req, res) => {

    const query = req.query;
    res.redirect("/viewProfile" + "?username=" + query.username + "&age=" + query.age + "&gender=" + query.gender + "&lookingFor=" + query.lookingFor + "&location=" + query.location + "&description=" + query.description + "&requestID=" + req.params.id);
})