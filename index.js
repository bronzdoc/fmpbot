var express = require('express');
var request = require('superagent');
var bodyParser = require('body-parser');

var pageToken = process.env.APP_PAGE_TOKEN;
var verifyToken = process.env.APP_VERIFY_TOKEN;

var app = express();
app.use(bodyParser.json());

app.get("/webhook", (req, res) => {
    if (req.query['hub.verify_token'] === verifyToken)
        return res.send(req.query['hub.challenge']);

    res.send('Error, wrong validation token');
});

app.post("/webhook", (req, res) => {
    var messaging_events = req.body.entry[0].messaging;
    messaging_events.forEach((event) => {
        var sender = event.sender.id;

        if (event.message && event.message.text) {
            text = event.message.text;
        }
    })
    res.sendStatus(200);
});

app.listen(3000);
