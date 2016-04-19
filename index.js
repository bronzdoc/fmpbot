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
            sendTextMessage(sender, "Text received, echo: " + text);
        }
    })
    res.sendStatus(200);
});

function sendTextMessage(sender, message) {
    sendMessage(sender, {
        text: message
    });
}

function sendMessage (sender, message) {
    request
        .post('https://graph.facebook.com/v2.6/me/messages')
        .query({access_token: pageToken})
        .send({
            recipient: {
                id: sender
            },
            message: message
        })
    .end((err, res) => {
        if (err) {
            console.log('Error sending message: ', err);
        } else if (res.body.error) {
            console.log('Error: ', res.body.error);
        }
    });
}

app.listen(3000);
