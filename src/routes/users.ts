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

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../public/profile_pics/')); // Specify the destination directory
  },
  filename: (req, file, cb) => {
    const finalFileName = guid.raw() + '_' + file.originalname;
    cb(null, finalFileName); // Specify the filename
  },
});

const upload = multer({ storage: storage });


router.patch("/profile", upload.single('file') ,async function (req, res, next) {
  const newFirstName = req.body.firstname;
  const newLastName = req.body.lastname;

  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer <token>
  const payload = jwt.decode(token, { complete: true }).payload;
  let user = await db.asyncFindById({ _id: payload._id });

  if(req.file) {
    const filePath = path.join(__dirname, `../public${user.profile_pic}`)
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error('Error deleting file:', err);
      } else {
        console.log('File deleted successfully');
      }
    });
    console.log(req.file);
    const uploadedFile = req.file;
    let final_location = `/profile_pics/${uploadedFile.filename}`;
    user.profile_pic = final_location;
  }
  
  if (newFirstName) {
    user.firstname = newFirstName;
  }

  if (newLastName) {
    user.lastname = newLastName;
  }

  user.save((err, result) => {
    if (err) throw err;
    res.status(200).send("Profile updated");
  });
});

router.get("/me", function (req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer <token>
  const payload = jwt.decode(token, { complete: true }).payload;
  db.findOne({ username: payload.user }, (err, user) => {
    res.status(200).json({
      user: user,
    });
  });
});

module.exports = router;
