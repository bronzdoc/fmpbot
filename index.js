var express = require('express');
var request = require('superagent');
var bodyParser = require('body-parser');

var pageToken = process.env.APP_PAGE_TOKEN;
var verifyToken = process.env.APP_VERIFY_TOKEN;

var app = express();
app.use(bodyParser.json());

app.get("/webhook", (req, res) => {
    console.log("got here");
    if (req.query['hub.verify_token'] === verifyToken)
        return res.send(req.query['hub.challenge']);

    res.send('Error, wrong validation token');
});

app.listen(3000);
