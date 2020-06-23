const express = require('express');
const app = express();

const messageRouter = express.Router();

module.exports = messageRouter;

//After user has signed up page
messageRouter.get("/signUp", (req, res) => {
    res.render("message", { message: "Sign up was successful. You can now log in.", button: "Log in" });
})

//Username already in database message
messageRouter.get("/usernameInDatabase", (req, res) => {
    res.render("message", { message: "This username has already been taken. Please try again.", button: "Try again" });
})

//Successful sign up
messageRouter.get("/successSignUp", (req, res) => {
    res.render("message", { message: "Password has not been confirmed properly. Please try again.", button: "Try again" });
})

//User does not exist
messageRouter.get("/noUserExist", (req, res) => {
    res.render("message", { message: "This user does not exist. Please make an account before signing in.", button: "Try again" });
})

//Password too short
messageRouter.get("/passwordTooShort", (req, res) => {
    res.render("message", { message: "Your password needs to be at least 8 characters. Please try again.", button: "Try again" });
})

//Incorrect password
messageRouter.get("/incorrectPassword", (req, res) => {
    res.render("message", { message: "Your password is incorrect. Please try again.", button: "Try again" });
})

//Username already taken when changing it in settins
messageRouter.get("/usernameTaken", (req, res) => {
    res.render("message", { message: "This username has already been taken. Please try again.", button: "Try again" });
})

//Error when password input is too short
messageRouter.get("/usernameTaken", (req, res) => {
    res.render("message", { message: "Your password is too short. Please try again.", button: "Try again" });
})

//Error when age variable is not proper
messageRouter.get("/ageError", (req, res) => {
    res.render("message", { message: "Your age must be an integer. Please try again.", button: "Try again" });
})

//Error when user is too young
messageRouter.get("/tooYoung", (req, res) => {
    res.render("message", { message: "You are not old enough to use this service. Please try again when you're older.", button: "Try again" });
})
