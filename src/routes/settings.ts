var express = require("express");
var router = express.Router();
var path = require("path");
var guid = require("guid");
var mv = require("mv");
const mime = require("mime-types");
const multer = require('multer');
var db = require("../models/dal/user.ts");
var groupHandler = require("../models/dal/group.ts");
var formParser = require("../utils/form-parser.ts");
const fs = require("file-system");
var { deleteUserAccount } = require("../controllers/users.ts");
const StatusCodes =  require("http-status-codes");
const jwt = require("jsonwebtoken");

router.patch("/post/:postId", async function (req, res, next) {
  const newCaption = req.body.newCaption;
  const newComment = req.body.newComment;
  let id = req.params.postId;
  let user = await db.asyncFindById({_id: req.body.postAuthor});
  const postIndex = user.posts.findIndex(post => post._id == id);
  if (newCaption) {
    
    user.posts.splice(postIndex, 1, { ...user.posts[postIndex], caption: newCaption });
  }

  if (newComment) {

    user.posts[postIndex].comments.splice(user.posts[postIndex].comments.length, 0, newComment);

  }
  user.markModified('posts')

  user.save((err, result) => {
    if (err) throw err;
    res.status(200).send("Caption updated");
  });

});

router.delete("/post/:postId", function (req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer <token>
  const payload = jwt.decode(token, { complete: true }).payload;
  db.findOne({ username: payload.user }, (err, u) => {
    let id = req.params.postId;
    console.log(u);
    if (u.posts[u.posts.indexOf(u.posts.find((x) => x._id == id))].static_url)
      fs.unlinkSync("./src/public" + u.posts[u.posts.indexOf(u.posts.find((x) => x._id == id))].static_url);
    u.posts.splice(u.posts.indexOf(u.posts.find((x) => x._id == id)), 1);
    u.save((err) => {
      if (err) throw err;
      console.log("Post deleted");
      res.status(200).send("Post deleted");
    });
  });
});


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../public/feeds/')); // Specify the destination directory
  },
  filename: (req, file, cb) => {
    const finalFileName = guid.raw() + '_' + file.originalname;
    cb(null, finalFileName); // Specify the filename
  },
});

const upload = multer({ storage: storage });

router.post("/upload", upload.single('file'), function (req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer <token>
  const payload = jwt.decode(token, { complete: true }).payload;
  // res.status(403).send("forbiddennnn");
  // Generate a random id
  console.log(req.file);
  const uploadedFile = req.file;
  let final_location = `/feeds/${uploadedFile.filename}`;

  var type = mime.lookup(uploadedFile.filename).split("/")[1];

  db.findOne({ username: payload.user }, (err, u) => {
    console.log(u);
    u.posts.push({
      _id: uploadedFile.filename.split('_')[0],
      author: payload.user,
      authorID: payload._id,
      static_url: final_location,
      caption: req.body.caption,
      comments: [],
      type: type,
      createdAt: new Date(),
      lastEditedAt: new Date(),
    });
    u.save((err) => {
      if (err) throw err;
      console.log("Post saved");
      // Redirect back after the job is done.
     res.status(StatusCodes.CREATED).json({message: "Post saved successfully",
      postId: uploadedFile.filename.split('_')[0]
    });
    });
  });
});

module.exports = router;
