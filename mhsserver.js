require('dotenv').config()
var express = require("express");
var app = express();
var receive = require('./receive.js');

let currentData = '';
receive((newData) => currentData=newData);

app.get("/maverickhelicopters", (req, res, next) => {
 res.json(currentData);
});
app.listen(3000, () => {
 console.log("Server running on port 3000");
});
