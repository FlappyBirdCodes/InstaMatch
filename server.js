const express = require("express");
const app = express();
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const expbs = require("express-handlebars");

const PORT = process.env.PORT || 3000;

//Setting up express handlebars
app.engine("handlebars", expbs());
app.set("view engine", "handlebars");

const MongoDB_URL = "mongodb+srv://flappybird:patrickpatterson333@instamatchusers-b1trs.mongodb.net/<dbname>?retryWrites=true&w=majority";

//Connecting to mongodb database
mongoose.connect(MongoDB_URL, { useNewUrlParser: true, useUnifiedTopology: true });
const connection = mongoose.connection;
connection.once("open", () => {
    console.log("MongoDB database connection established successfully");
});
mongoose.set('useFindAndModify', false);

//Setting up body-parsing middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//Renders all pages in the public portfolio
app.use(express.static(__dirname + '/public'));

const homeRouter = require("./home.js");
app.use("/", homeRouter);
const errorRouter = require("./message.js");
app.use("/", errorRouter);
const matchesRouter = require("./matches.js");
app.use("/", matchesRouter);
const matchRequestsRouter = require("./matchRequests.js");
app.use("/", matchRequestsRouter);

//Starts server listening on PORT 3000
app.listen(PORT, () => console.log("Listening on port 3000"));