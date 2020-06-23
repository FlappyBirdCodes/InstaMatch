const express = require('express');
const app = express();

const matchRequestsRouter = express.Router();

module.exports = matchRequestsRouter;

//Importing database schema from User.js
const User = require("./Users");

//Sets req.userMaches variable 
matchRequestsRouter.use("/matchRequests", (req, res, next) => {
    User.findOne({ username: req.query.username }, (err, user) => {
        if (user) {
            req.user = user;
            next();
        } else {
            res.status(404).send("User not found");
        }
    })
})

matchRequestsRouter.post("/matchRequests", (req, res) => {
    const query = req.query;
    res.redirect("/matchRequests" + "?username=" + query.username + "&age=" + query.age + "&gender=" + query.gender + "&lookingFor=" + query.lookingFor + "&location=" + query.location + "&description=" + query.description);
})


//Sends the match requests page
matchRequestsRouter.get("/matchRequests", (req, res) => {

    let matchIDs = [];

    //Loops through all potentialMatches of user
    for (let i = 0; i < req.user.potentialMatches.length; i++) {
        //Turns into string and removes all white space
        let matchId = req.user.potentialMatches[i][0].toString();

        //Turns back into integer and pushes matchId into matchIDS list
        matchId = parseInt(matchId.replace(/\s/g, ""));
        matchIDs.push(matchId);
    }

    //Gets all userIDs from list matchIDs
    User.find().where("userID").in(matchIDs).exec((err, matches) => {

        let allMatches = [];
        allMatches.length = matches.length;

        //Assigns each json to appropriate position in allMatches
        for (let i = 0; i < matches.length; i++) {
            let currentID = matches[i].userID;
            let newIndex = matchIDs.indexOf(currentID);
            let currentMatch = matches[i];
            let matchJson = {
                username: currentMatch.username,
            };
            allMatches[newIndex] = matchJson;
        }

        //Renders allMatches with handlebars template
        res.render("matchRequest", { potentialMatches: allMatches });
    })
})

//Adds match when someone else has requested a match
matchRequestsRouter.post("/addMatch/:id", (req, res) => {

    User.findOne({ username: req.query.username }, (err, user) => {

        //Gets user information from potential matches list
        const potentialMatchData = user.potentialMatches[req.params.id];

        //Deletes user from potential matches list
        user.potentialMatches.splice(req.params.id, 1);

        //Checks that new match isn't already in matches list
        if (!user.matches.includes(potentialMatchData)) {
            //Adds reversed list to matches
            user.matches.push(potentialMatchData);
        }

        user.save()
            .then(data => {
                res.redirect("/matches" + req.url.substring(10 + req.params.id.length));
            })

        //let potentialMatches = user.potentialMatches[req.params.id][0];
        //res.send(potentialMatches.toString());

    })


})

matchRequestsRouter.post("/deleteRequest/:id", (req, res) => {

    User.findOne({ username: req.query.username }, (err, user) => {

        //Gets user information from potential matches list
        const potentialMatchData = user.potentialMatches[req.params.id];

        //Deletes user from potential matches list
        user.potentialMatches.splice(req.params.id, 1);

        user.save()
            .then(data => {
                res.redirect("/matchRequests" + req.url.substring(15 + req.params.id.length));
            })

        //let potentialMatches = user.potentialMatches[req.params.id][0];
        //res.send(potentialMatches.toString());

    })
})