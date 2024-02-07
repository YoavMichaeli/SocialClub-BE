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