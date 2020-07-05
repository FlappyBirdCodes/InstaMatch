const express = require('express');
const app = express();
const bycrpt = require("bcrypt");

const homeRouter = express.Router();

module.exports = homeRouter;

//Importing database schema from User.js
const User = require("./Users");

//Renders all pages in the public portfolio
app.use(express.static(__dirname + '/public'));

//Checking if query username exists in database
homeRouter.use(["/homepage", "/settings", "/newMatch", "/contact", "/sendMessage", "/contactMatch/:id", "/addMatch/:0"], (req, res, next) => {
    User.findOne({ username: req.query.username }, (err, user) => {
        if (user) {
            req.user = user;
            next();
        } else {
            res.status(400).send("This user does not exist");
        }
    })
})

homeRouter.post("/contactMatch/:id", (req, res) => {

    let url = req.url;
    let matchIDquery = "&matchID=" + req.query.matchID;

    if (req.query.matchID) {
        url = url.replace(matchIDquery, "&matchID=" + req.params.id);
        res.redirect("/contact" + url.substring(14 + req.params.id.length));
    } else {
        res.redirect("/contact" + url.substring(14 + req.params.id.length) + "&matchID=" + req.params.id);
    }

})

homeRouter.use("/sendMessage", (req, res, next) => {
    let match = req.user.matches[req.query.matchID][0];

    User.findOne({ userID: match }, (err, match) => {
        if (match) {
            req.match = match;
            next();
        } else {
            res.status(404).send("Match not found");
        }
    })
})

//Sets the match variable when user sends the message
homeRouter.use("/contact", (req, res, next) => {

    let matchID = req.user.matches[req.query.matchID][0];

    User.findOne({ userID: matchID }, (err, match) => {
        if (match) {
            req.match = match;
            next();
        } else {
            res.status(404).send("No match");
        }
    })
})

//Looks for correct message routes in database
homeRouter.use("/sendMessage", (req, res, next) => {
    //text message
    const message = req.body.message;

    //Gets the time in AM or PM format
    let time = new Date().toLocaleString("en-US");
    time = time.substring(0, 15) + time.substring(19, 22);

    //Saves new message to sender's database
    req.user.messages.push([req.user.userID, req.match.userID, message, time]);
    req.user.save();

    //Saves new message to reciever's database
    req.match.messages.push([req.user.userID, req.match.userID, message, time])
    req.match.save();

    //Sets all messages in user's database to a global settings variable
    app.set("messages", req.user.messages)
    res.redirect("/contact" + req.url.substring(1));
})

homeRouter.use("/contact", (req, res, next) => {
    console.log(app.settings.messages);
    
    //Gets all messages from the sender
    const senderMessages = app.settings.messages;

    //Reassigns req.user.messages to the setttings messages variable
    if (senderMessages) {
        req.user.messages = senderMessages;
        req.user.save();
        req.match.messages = senderMessages;
        req.match.save();
    }

    let currentUsernames = [];

    for (let i=0; i<req.user.messages.length; i++) {
        currentUsernames.push(req.user.messages[i][0]);
    }

    User.find({userID: currentUsernames}, (err, usernames) => {
        req.currentUsernames = usernames;
        console.log(req.currentUsernames);
        next();
    })
})

homeRouter.use("/contact", (req, res, next) => {
    const currentMessages = [];

    //Loops through each message and adds messages if the message belongs to the current chat
    for (let i = 0; i < req.user.messages.length; i++) {

        //Assigns variables to each element in list
        const currentMessage = req.user.messages[i];

        let sender = currentMessage[0];   
        let userSender = null;     
        for (let i=0; i < req.currentUsernames.length; i++) {
            if (req.currentUsernames[i].userID == sender) {
                userSender = req.currentUsernames[i].username;
                console.log(sender)
                break;
            }
        }

        const reciever = currentMessage[1];
        const message = currentMessage[2];
        const time = currentMessage[3];

        //Checks if message is in the current route
        if (sender == req.user.userID && reciever == req.match.userID || sender == req.match.userID && reciever == req.user.userID) {

            //Puts message data in json format and appends it to currentMessages list
            const jsonData = {
                username: userSender,
                message: message,
                time: time
            }
            currentMessages.push(jsonData);
        }
    }

    //console.log(currentMessages);
    req.messages = currentMessages;
    next();
})



//Sends index file
homeRouter.get("/", (req, res) => {
    res.sendFile('public/index.html', { root: __dirname });
})

//Adds user to database
homeRouter.post("/signUp", (req, res) => {

    //Turns age variable into a number
    const userAge = Number(req.body.signupAge);

    //Checks the length of userAge and if it's a number
    if (req.body.signupPassword.length < 8) {
        res.redirect("/passwordTooShort");
    } else if (!Number.isInteger(userAge)) {
        res.redirect("/ageError");
    } else if (userAge < 18) {
        res.redirect("/tooYoung");
    } else {

        //Checks if username is already in database
        User.find({ username: req.body.signupUsername }, async (err, docs) => {
            if (docs.length == 1) {
                res.redirect("/usernameInDatabase");
            } else {

                //Checks length of password
                if (req.body.signupPassword.length < 8) {
                    res.redirect("/passwordTooShort");
                } else {
                    //Encrypts password
                    const hashedPassword = await bycrpt.hash(req.body.signupPassword, 10);


                    User.find({}, (err, count) => {

                        userIDs = [];
                        for (let i = 0; i < count.length; i++) {
                            userIDs.push(count[i].userID);
                        }

                        const newID = Math.max.apply(null, userIDs);
                        console.log(newID + 1);

                        //Creates a new user
                        const newUser = new User({
                            userID: newID + 1,
                            username: req.body.signupUsername,
                            password: hashedPassword,
                            age: req.body.signupAge,
                            gender: req.body.signupGender,
                            lookingFor: req.body.signupLooking,
                            location: req.body.signupLocation,
                            description: req.body.signupDescription
                        });
                        //Saves the new user
                        newUser.save().then(data => {
                            res.redirect("/signUp");
                        })
                    })
                }
            }
        })
    }

})

//Sends home page of user
homeRouter.get("/homepage", (req, res) => {
    res.render("homepage", { username: req.user.username, age: req.user.age, lookingFor: req.user.lookingFor, location: req.user.location, description: req.user.description, profilePic: req.user.profilePic, gender: req.user.gender });
})

//Sends setting page of user
homeRouter.get("/settings", (req, res) => {
    res.render("settings", { username: req.user.username, age: req.user.age, location: req.user.location, description: req.user.description, status: req.user.lookingFor, gender: req.user.gender, fileURL: req.user.profilePic });
})

//Allows the user to log into their home page
homeRouter.post("/login", (req, res) => {

    User.findOne({ username: req.body.username }, async (err, user) => {
        if (user) {
            if (await bycrpt.compare(req.body.password, user.password)) {
                res.redirect("/homepage?username=" + user.username + "&age=" + user.age + "&gender=" + user.gender + "&lookingFor=" + user.lookingFor + "&location=" + user.location + "&description=" + user.description);
            } else {
                res.redirect("/incorrectPassword");
            }
        } else {
            res.redirect("/noUserExist");
        }
    })

})

homeRouter.get("/contact", (req, res) => {

    //Gets the matchID
    const matchID = req.user.matches[req.query.matchID][0];

    //Fnds user with the same matchID
    User.findOne({ userID: matchID }, (err, match) => {
        if (match) {
            //Checks app.get("messages") to see if a user has sent a message
            const messages = req.messages;
            res.render("contact", { contact: match.username, messages: messages });

        } else {
            res.status(404).send("Match username does not exist");
        }
    })
})

//Changes personal information
homeRouter.post("/changeInfo", (req, res) => {

    //Finds the username from submitted form
    User.findOne({ username: req.body.username }, (err, user) => {

        //Checks if username is already taken in database
        if (user && req.body.username != req.query.username) {
            res.redirect("/usernameTaken");
        } else {

            //Finds query username and resets information to form inpt
            User.findOne({ username: req.query.username }, (err, user) => {
                if (user) {
                    user.username = req.body.username;
                    user.age = req.body.age;
                    user.gender = req.body.gender;
                    user.lookingFor = req.body.lookingFor;
                    user.location = req.body.location;
                    user.description = req.body.description;

                    if (user.profilePic.length > 5) {
                        user.profilePic = req.body.fileURL;
                    }

                    //Saves information and redirects back to homepage
                    user.save();
                    res.redirect("/homepage?username=" + user.username + "&age=" + user.age + "&gender=" + user.gender + "&lookingFor=" + user.lookingFor + "&location=" + user.location + "&description=" + user.description);
                } else {
                    res.status(404).send("User was not found");
                }
            })

        }
    })

})
