var express = require("express");
var router = express.Router();
var db = require("../models/dal/user.ts");
var formParser = require("../utils/form-parser.ts");
var path = require("path");
const multer = require("multer");
var guid = require("guid");
var mv = require("mv");
const StatusCodes = require("http-status-codes");
const jwt = require("jsonwebtoken");
import { OAuth2Client } from "google-auth-library";
const axios = require("axios");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../public/profile_pics/")); // Specify the destination directory
  },
  filename: (req, file, cb) => {
    const finalFileName = guid.raw() + "_" + file.originalname;
    cb(null, finalFileName); // Specify the filename
  },
});

const upload = multer({ storage: storage });

router.post("/new", upload.single("file"), function (req, res, next) {
  try {
    console.log(req.file);
    const uploadedFile = req.file;
    let final_location = `/profile_pics/${uploadedFile.filename}`;

    req.body.profile_pic = final_location;
    db.createNew(req.body, (error, result) => {
      if (!result) {
        res.status(StatusCodes.BAD_REQUEST).json({
          error: "Bad user details",
        });
      } else {
        res.status(StatusCodes.CREATED).json(result.toObject());
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

const generateUserToken = (user: any) => {
  const accessToken = jwt.sign({ _id: user._id, user: user.username }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRATION,
  });
  const refreshToken = jwt.sign({ _id: user._id, user: user.username }, process.env.JWT_REFRESH_SECRET);
  return {
    accessToken: accessToken,
    refreshToken: refreshToken
  }

};

const client = new OAuth2Client();

router.post("/newGoogleUser", async function (req, response, next) {
  try {
    console.log(req.body);
    axios
      .get(`https://www.googleapis.com/oauth2/v1/userinfo?access_token=${req.body.token}`, {
        headers: {
          Authorization: `Bearer ${req.body.token}`,
          Accept: "application/json",
        },
      })
      .then(async (res) => {
        const payload = res.data;
        const email = payload?.email;
        if (email != undefined) {
         db.findOne({ username: payload.given_name }, async (error, user) => {
          if (user == false) {
            db.createNew(
              {
                firstname: payload.given_name,
                lastname: payload.family_name,
                username: payload.given_name,
                password: "",
                profile_pic: payload.picture,
              },
              async (error, result) => {
                if (!result) {
                  response.status(StatusCodes.BAD_REQUEST).json({
                    error: "Bad user details from google",
                  });
                } else {
                  user = result;
                  const {accessToken, refreshToken} = generateUserToken(user);
                  user.refreshTokens.push(refreshToken);
                  await user.save();
                  return response.status(StatusCodes.OK).json({
                    accessToken: accessToken,
                    refreshToken: refreshToken,
                  });
                }
              });
          }else{
            user.lastLogin = new Date();
            const {accessToken, refreshToken} = generateUserToken(user);
            user.refreshTokens.push(refreshToken);
            await user.save();
            return response.status(StatusCodes.OK).json({
              accessToken: accessToken,
              refreshToken: refreshToken,
            });
          }
         });


        }
      });
  } catch (error) {
    console.error(error);
    response.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/getin", function (req, res, next) {
  console.log(req.body);
  db.checkUser(req.body, async (error, user) => {
    if (!user) {
      return res.status(401).send("Username or Password incorrect");
    } else {
      console.log(user);
      user.lastLogin = new Date();
      const accessToken = jwt.sign({ _id: user._id, user: user.username }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRATION,
      });
      const refreshToken = jwt.sign({ _id: user._id, user: user.username }, process.env.JWT_REFRESH_SECRET);
      user.refreshTokens.push(refreshToken);
      await user.save();
      return res.status(200).json({
        accessToken: accessToken,
        refreshToken: refreshToken,
      });
    }
  });
});

router.get("/refresh", formParser, function (req, res, next) {
  const authHeader = req.headers["authorization"];
  const refreshToken = authHeader && authHeader.split(" ")[1]; // Bearer <token>
  if (refreshToken == null) return res.sendStatus(401);
  jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, async (err, user) => {
    if (err) {
      console.log(err);
      return res.sendStatus(401);
    }
    try {
      let response;
      db.findOne({ _id: user._id }, async (error, user) => {
        if (!user.refreshTokens || !user.refreshTokens.includes(refreshToken)) {
          user.refreshTokens = [];
          await user.save();
          return res.sendStatus(401);
        } else {
          const accessToken = jwt.sign({ _id: user._id, user: user.username }, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRATION,
          });
          const newRefreshToken = jwt.sign({ _id: user._id, user: user.username }, process.env.JWT_REFRESH_SECRET);
          user.refreshTokens = user.refreshTokens.filter((t) => t !== refreshToken);
          user.refreshTokens.push(newRefreshToken);
          await user.save();
          return res.status(200).json({
            accessToken: accessToken,
            refreshToken: newRefreshToken,
          });
        }
      });
    } catch (err) {
      res.sendStatus(401).send(err.message);
    }
  });
});

router.get("/out", function (req, res, next) {
  const authHeader = req.headers["authorization"];
  const refreshToken = authHeader && authHeader.split(" ")[1]; // Bearer <token>
  if (refreshToken == null) return res.sendStatus(401);
  jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, async (err, user) => {
    console.log(err);
    if (err) return res.sendStatus(401);
    try {
      let response;
      db.findOne({ _id: user._id }, async (error, user) => {
        if (!user.refreshTokens || !user.refreshTokens.includes(refreshToken)) {
          user.refreshTokens = [];
          await user.save();
          response = res.sendStatus(401);
        } else {
          user.refreshTokens = user.refreshTokens.filter((t) => t !== refreshToken);
          await user.save();
          response = res.sendStatus(200);
        }
      });
      return response;
    } catch (err) {
      res.sendStatus(401).send(err.message);
    }
  });
});

module.exports = router;
