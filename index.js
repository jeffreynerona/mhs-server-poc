require('dotenv').config()
var express = require("express");
var app = express();
var receive = require('./receive.js');

let currentData = '';
receive((newData) => currentData=newData);

app.get("/flightdatatest", (req, res, next) => {
 res.json(currentData);
});
app.listen(3333, () => {
 console.log("Server running on port 3333");
});
