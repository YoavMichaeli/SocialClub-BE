var express = require("express");
var router = express.Router();
var path = require("path");
const multer = require('multer');
const fs = require("file-system");
var db = require("../models/dal/user.ts");
var group = require("../models/dal/group.ts");
var textParser = require("../utils/text-parser.ts");
var formParser = require("../utils/form-parser.ts");
var Room = require("../models/room.ts");
var guid = require("guid");
var mv = require("mv");
const StatusCodes =  require("http-status-codes");
const jwt = require("jsonwebtoken");

router.get("/getAllUsersPosts", async function (req, res, next) {
  const returnedPosts = [];
  await db.getAll(async (err, users) => {
    await Promise.all(
      users.map((user) => {
        returnedPosts.push(...user.posts);
      })
    );

    res.status(200).json({
      posts: returnedPosts,
    });
  });
});

router.get("/myposts", function (req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer <token>
  const payload = jwt.decode(token, { complete: true }).payload;
  db.findOne({ username: payload.user }, (err, user) => {
    res.status(200).json({
      posts: user.posts,
    });
  });
});
