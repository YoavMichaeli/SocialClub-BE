const request = require("supertest");
const app = require("../../app.ts");
const jwt = require("jsonwebtoken");
var db = require("../../models/dal/user.ts");
const { postId } = require("../mocks/settings.ts");
var mongoose = require("mongoose");
var path = require('path');

let refreshToken, accessToken;

beforeAll(async () => {
  accessToken = jwt.sign({ _id: "65be6dfc8e04c4599cff3880", user: "test" }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRATION,
  });
  refreshToken = jwt.sign({ _id: "65be6dfc8e04c4599cff3880", user: "test" }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_EXPIRATION,
  });

  const user = await db.asyncFindById("65be6dfc8e04c4599cff3880");
  user.refreshTokens = [refreshToken];
  await user.save();
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe("Account route tests (/account)", () => {
  test("/account/refresh", async () => {
    const response = await request(app).get("/account/refresh").set("Authorization", `Bearer ${refreshToken}`);
    expect(response.body).toHaveProperty("accessToken");
    expect(response.body).toHaveProperty("refreshToken");
    expect(response.statusCode).toBe(200);
  });


  test("/account/getin", async () => {
    const response = await request(app).post("/account/getin").send({
      username: "test",
      password: "test",
    });
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
    .attach('file', path.join(__dirname, '../../public/profile_pics/d28a8ea6-d321-87bd-fa18-f955b015fa87_books-8405721_1280.jpg'));
    expect(response.statusCode).toBe(201);
    });


    test("/account/newGoogleUser", async () => {
        const response = await request(app).post("/account/newGoogleUser").send({
            token: process.env.TEST_GOOGLE_ACCESS_TOKEN
        })
        expect(response.statusCode).toBe(200);
        });


  test("/account/out", async () => {
    const user = await db.asyncFindById("65be6dfc8e04c4599cff3880");
    const newRefreshToken = user.refreshTokens.pop();
    const response = await request(app).get("/account/out").set("Authorization", `Bearer ${newRefreshToken}`);
    expect(response.statusCode).toBe(200);
  });


});
