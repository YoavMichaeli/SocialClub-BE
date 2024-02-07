const mongoose = require("mongoose");
var User = require("../user.ts");
var bcrypt = require("bcrypt-nodejs");
const a = require("array-tools");
const _ = require("lodash/_arrayIncludes");

mongoose.connect(require("../../config/app.ts").db.connectionUri, {
  useUnifiedTopology: true,
  useNewUrlParser: true
});

function checkSpace(name) {
  var charSplit = name.split("");
  return _(charSplit, " ");
}

function createNew(obj, cb) {
  if (checkSpace(obj.username)) {
    return cb(null, false);
  } else {
    User.findOne({ username: obj.username }).exec((err, user) => {
      if (user) {
        return cb(null, false);
      } else {
        var newUser = new User({
          username: obj.username,
          firstname: obj.firstname,
          lastname: obj.lastname,
          refreshTokens: [],
          groups: [],
          groupsAdmin: [],
          profile_pic: obj.profile_pic,
          posts: [],
          followers: [],
          following: [],
          lastLogin: new Date()
        });
        newUser.password = newUser.generateHash(obj.password);
        newUser.save((err, res) => {
          return cb(err, res);
        });
      }
    });
  }
}

function editUser(obj, cb) {
  if (checkSpace(obj.username)) {
    return cb(null, false);
  } else {
    User.findOne({ username: obj.username }).exec((err, user) => {
      if (user) {
        for (var key=0; key< Object.keys(obj).length; key++) {
          let currentKey = Object.keys(obj)[key];
          if (Array.isArray(user[currentKey])) {
            user[currentKey].push(obj[currentKey]);
          }else {
            user[currentKey] = obj[currentKey];
          }
          
        }
        user.save((err, res) => {
          return cb(err, res);
        });
        
      } else {
        return cb(null, false);
      }
    });
  }
}
