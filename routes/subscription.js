const express = require("express");
const Router = express.Router();
const Subscription = require("../models/Subscription");
const webpush = require("web-push");

const vapidKeys = {
  privateKey: "AyD4IcYBJlt-kRBzThhLHQhNXsjxtW1m1yzsbKZrX24",
  publicKey:
    "BJHyU8y3LWW1gVABQsOlfBhgo5hVDvAathO4WJWKbyDzLk6d2NW5sp92TWi4C95KjLQrBdX-jijAkHmmo1pd94Y",
};

webpush.setVapidDetails(
  "mailto:example@yourdomain.org",
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

Router.post("/", async (req, res) => {
  const subscriptionRequest = req.body.data;
  const newSubscription = new Subscription({
    subscription: subscriptionRequest,
  });
  const response = await newSubscription.save();
  res.status(201).json({ id: response.id });
});

Router.get("/push", async (req, res) => {
  try {
    const allSubscription = await Subscription.find();
    for (let subscription of allSubscription) {
      await webpush.sendNotification(
        subscription.subscription,
        JSON.stringify({
          title: "Có phim mới",
          text: "Uấy!!! Có phim mới rồi này",
          tag: "new-film",
          url: "/",
        })
      );
    }
    res.status(202).json({});
  } catch (err) {
    console.log(err);
  }
});

module.exports = Router;
