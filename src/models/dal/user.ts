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

function checkUser(obj, cb) {
  User.findOne({ username: obj.username }).exec((err, user) => {
    console.log(user);
    if (err) return cb(err, false);
    if (user) {
      bcrypt.compare(obj.password, user.password, (err, bool) => {
        if (bool) {
          return cb(null, user);
        } else {
          return cb(null, false);
        }
      });
    } else {
      return cb(null, false);
    }
  });
}

function findOne(obj, cb) {
  User.findOne(obj).exec((err, user) => {
    if (err) return cb(err, false);
    if (user) {
      return cb(err, user);
    } else {
      return cb(null, false);
    }
  });
}


function findById(id, cb) {
  User.findById(id).exec((err, user) => {
    if (err) return cb(err, false);
    if (user) {
      return cb(err, user);
    } else {
      return cb(null, false);
    }
  });
}

function asyncFindById(id) {
  return new Promise((resolve, reject) => {
    User.findById(id).exec((err, user) => {
      if (err) {
        reject(err);
      } else {
        resolve(user)  
      }
    });
  });
  
}

function search(opt, cb) {
  User.find({ username: { $gt: opt } }).exec((err, results) => {
    if (err) return cb(err, false);
    if (results) {
      return cb(err, results);
    } else {
      return cb(null, false);
    }
  });
}

function getAll(cb) {
  User.find({}).exec((err, users) => {
    if (err) return cb(err, false);
    if (users) {
      return cb(null, users);
    } else {
      return cb(null, false);
    }
  });
}

function deleteOne(opt, cb) {
  User.deleteOne(opt).exec((err, res) => {
    if (err) return cb(err, null);
    else if (res.n == 0) {
      return cb(null, true);
    }
  });
}
function comment(user, comment, _id, cb) {
  User.findOne(user).exec((err, obj) => {
    if (!obj) return cb("Does not exist.", null);
    console.log(obj);
    for (var i = 0; i < obj.posts.length; i++) {
      if (obj.posts[i]._id == _id) {
        obj.posts[i].comments.push(comment);
        obj.notifications.push({
          msg: `@${comment.by} reacted to your post.`,
          link: `/u/${comment.by}`,
          time: new Date()
        });
        obj = new User(obj);
        obj.save((err, res) => {
          return cb(err, res);
        });
      }
    }
  });
}
function like(user, like, _id, cb) {
  console.log(user);
  User.findOne(user).exec((err, obj) => {
    if (!obj) return cb("Does not exist.", null);
    for (var i = 0; i < obj.posts.length; i++) {
      if (obj.posts[i]._id == _id) {
        obj.posts[i].likes.push(like.by);
        obj.notifications.push({
          msg: `@${like.by} liked your post.`,
          link: `/u/${like.by}`,
          time: new Date()
        });
        obj = new User(obj);
        obj.save(err => {
          cb(err, true);
        });
      }
    }
  });
}

module.exports = {
  createNew: createNew,
  editUser: editUser,
  checkUser: checkUser,
  findOne: findOne,
  findById: findById,
  deleteOne: deleteOne,
  asyncFindById: asyncFindById,
  getAll: getAll,
  comment: comment,
  like: like,
  search: search
};