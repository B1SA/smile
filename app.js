"use strict";
const AWS = require("./modules/awsRekogn");
const QUALTRICS = require("./modules/sapQualtrics");
const FACEBOOK = require("./modules/facebook");
const AWSS3 = require("./modules/awsS3");
const myParser = require("body-parser");
const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
var app = express();

app.use(cors());

// Extended capacity on JSON for image base64 strings
app.use(myParser.json({ limit: "10mb" }));
app.use(myParser.urlencoded({ limit: "10mb", extended: true }));
app.use(myParser.text({ limit: "10mb" }));

// Parse JSON bodies (as sent by API clients)
app.use(express.json());

// serves static content for the front-end page
app.use("/static", express.static("static"));

// serves the index page for the front-end (no session ID)
app.get("/", function(req, res) {
  res.sendFile(path.join(__dirname, "/views/index.html"));
});

// serves the index page for the front-end (and pass the session ID along with the URL)
app.get("/s/:sessId", function(req, res) {
  fs.readFile(path.join(__dirname, "/views/index.html"), (err, html) => {
    let htmlPlusData = html.toString().replace("sessionId", req.params.sessId);
    res.send(htmlPlusData);
  });
});

//End-point to analyse picture using AWS Rekognition
app.post("/awsRekogn", function(req, res) {
  AWS.Rekogn(req.body.image, function(error, resp) {
    if (error) {
      res.send(error);
    } else {
      var jsonResponse = JSON.stringify({ rating: resp });
      res.setHeader("Content-Type", "application/json");
      res.status(200).send(jsonResponse);
    }
  });
});

//End-point to fill qualtrics surveys
app.post("/fillSurvey", function(req, res) {
  QUALTRICS.FillSurvey(req.body, function(error, resp) {
    if (error) {
      console.error("Error - " + error);
      res.send(error);
    } else {
      var jsonResponse = JSON.stringify({ surveyresp: resp });
      res.setHeader("Content-Type", "application/json");
      res.status(200).send(jsonResponse);
    }
  });
});

//End-point to post to facebook page
app.post("/postToFacebook", function(req, res) {
  FACEBOOK.PostToFacebookPage(req.body.image, function(error, resp) {
    if (error) {
      console.error("Error - " + error);
      res.send(error);
    } else {
      var jsonResponse = JSON.stringify({ postId: resp });
      res.setHeader("Content-Type", "application/json");
      res.status(200).send(jsonResponse);
    }
  });
});

//End-point to upload image to S3
app.post("/UploadImage", function(req, res) {
  AWSS3.UploadImage(req.body.image, function(error, resp) {
    if (error) {
      console.error("Error - " + error);
      res.send(error);
    } else {
      var jsonResponse = JSON.stringify({ imageUrl: resp });
      res.setHeader("Content-Type", "application/json");
      res.status(200).send(jsonResponse);
    }
  });
});

//End-point to delete image from S3
app.post("/DeleteImage", function(req, res) {
  AWSS3.DeleteImage(req.body.image, function(error, resp) {
    if (error) {
      console.error("Error - " + error);
      res.send(error);
    } else {
      var jsonResponse = JSON.stringify({ imageUrl: resp });
      res.setHeader("Content-Type", "application/json");
      res.status(200).send(jsonResponse);
    }
  });
});

var port = process.env.PORT || 30000;
app.listen(port, function() {
  console.log("Smile Rekognition listening on port " + port);
});
