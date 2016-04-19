var express = require('express');
var request = require('superagent');
var bodyParser = require('body-parser');

var pageToken = process.env.APP_PAGE_TOKEN;
var verifyToken = process.env.APP_VERIFY_TOKEN;

var app = express();
app.use(bodyParser.json());

app.set("port", process.env.PORT || 5000);

app.get("/webhook", (req, res) => {
    if (req.query["hub.verify_token"] === verifyToken)
        return res.send(req.query["hub.challenge"]);

    res.send("Error, wrong validation token");
});

app.post("/webhook", (req, res) => {
    var messaging_events = req.body.entry[0].messaging;
    messaging_events.forEach((event) => {
        var sender = event.sender.id;

        if (event.message && event.message.text) {
            text = event.message.text;
            if (text === "Generic") {
                sendGenericMessage(sender);
            } else {
                sendTextMessage(sender, "Text received, echo: " + text);
            }
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
        .post("https://graph.facebook.com/v2.6/me/messages")
        .query({access_token: pageToken})
        .send({
            recipient: {
                id: sender
            },
            message: message
        })
    .end((err, res) => {
        if (err) {
            console.log("Error sending message: ", err);
        } else if (res.body.error) {
            console.log("Error: ", res.body.error);
        }
    });
}

function sendGenericMessage(sender) {
  messageData = {
    "attachment": {
      "type": "template",
      "payload": {
        "template_type": "generic",
        "elements": [{
          "title": "First card",
          "subtitle": "Element #1 of an hscroll",
          "image_url": "http://messengerdemo.parseapp.com/img/rift.png",
          "buttons": [{
            "type": "web_url",
            "url": "https://www.messenger.com/",
            "title": "Web url"
          }, {
            "type": "postback",
            "title": "Postback",
            "payload": "Payload for first element in a generic bubble",
          }],
        },{
          "title": "Second card",
          "subtitle": "Element #2 of an hscroll",
          "image_url": "http://messengerdemo.parseapp.com/img/gearvr.png",
          "buttons": [{
            "type": "postback",
            "title": "Postback",
            "payload": "Payload for second element in a generic bubble",
          }],
        }]
      }
    }
  };
  request({
    url: "https://graph.facebook.com/v2.6/me/messages",
    query: {access_token:pageToken},
    method: "POST",
    json: {
      recipient: {id:sender},
      message: messageData,
    }
  }, function(error, response, body) {
    if (error) {
      console.log("Error sending message: ", error);
    } else if (response.body.error) {
      console.log("Error: ", response.body.error);
    }
  });
}

app.listen(app.get("port"), () => {
    console.log("App running on port:", app.get("port"));
});
