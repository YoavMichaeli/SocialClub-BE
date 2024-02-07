const request = require("supertest");
const app = require("../../app.ts");
const jwt = require("jsonwebtoken");
var db = require("../../models/dal/user.ts");
var mongoose = require("mongoose");
const { testUserId, testUserName, testPassword } = require("../mocks/users.ts");
var path = require('path');
const fs = require('fs')

let refreshToken, accessToken;

beforeAll(async () => {
  accessToken = jwt.sign({ _id: testUserId, user: testUserName }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRATION,
  });
  refreshToken = jwt.sign({ _id: testUserId, user: testUserName }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_EXPIRATION,
  });

  const user = await db.asyncFindById(testUserId);
  user.refreshTokens = [refreshToken];
  await user.save();
});

afterAll(async () => {
  const user = await db.asyncFindOne({username: 'test2'});
  console.log(user);
  await fs.unlink(path.join(__dirname, `../../public${user.profile_pic}`), (err) => {
    if (err) {
      console.error(err);
      return;
    }
    console.log('Profile Pic deleted successfully');
  });
  await db.deleteOne({username: 'test2'});
  await db.deleteOne({username: 'Yoav'});
  await mongoose.connection.close();
});

describe("Account route tests (/account)", () => {
  test("/account/refresh", async () => {
    const response = await request(app).get("/account/refresh").set("Authorization", `Bearer ${refreshToken}`);
    expect(response.body).toHaveProperty("accessToken");
    expect(response.body).toHaveProperty("refreshToken");
    expect(response.statusCode).toBe(200);
  });


  test("/account/new", async () => {
    const response = await request(app).post("/account/new")
    .field('username', "test2")
    .field('password', "test2")
    .field('firstname', "test2")
    .field('lastname', "test2")
    .attach('file', path.join(__dirname, '../../public/feeds/test/5e08a20c-5c37-f6b1-442f-b9377753dbc1_books-8405721_1280.jpg'));
    expect(response.statusCode).toBe(201);
    });


  test("/account/getin", async () => {
    const response = await request(app).post("/account/getin").send({
      username: testUserName,
      password: testPassword,
    });
    expect(response.body).toHaveProperty("accessToken");
    expect(response.body).toHaveProperty("refreshToken");
    expect(response.statusCode).toBe(200);
  });


  test("/account/newGoogleUser", async () => {
        const response = await request(app).post("/account/newGoogleUser").send({
            token: process.env.TEST_GOOGLE_ACCESS_TOKEN
        })
        expect(response.statusCode).toBe(200);
   });


  test("/account/out", async () => {
    const user = await db.asyncFindById(testUserId);
    const newRefreshToken = user.refreshTokens.pop();
    const response = await request(app).get("/account/out").set("Authorization", `Bearer ${newRefreshToken}`);
    expect(response.statusCode).toBe(200);
  });


});
