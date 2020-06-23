const mongoose = require("mongoose");

const UserSchema = mongoose.Schema({
    userID: Number,
    username: String,
    password: String,
    age: String,
    gender: String,
    lookingFor: String,
    location: String,
    description: String,
    profilePic: {
        type: String,
        default: "https://www.learning.uclg.org/sites/default/files/styles/featured_home_left/public/no-user-image-square.jpg?itok=PANMBJF-",
    },
    matches: {
        type: Array,
        default: [],
    },
    potentialMatches: {
        type: Array,
        default: [],
    },
    messages: {
        type: Array,
        default: [],
    }
});

module.exports = mongoose.model("User", UserSchema);