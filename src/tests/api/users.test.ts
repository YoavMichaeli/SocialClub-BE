const request = require("supertest");
const app = require("../../app.ts");
const jwt = require("jsonwebtoken");
const { testUser, testUserPosts } = require("../mocks/users.ts");
var mongoose = require("mongoose");

let accessToken;

beforeAll(() => {
  accessToken = jwt.sign({ _id: "65be6dfc8e04c4599cff3880", user: "test" }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRATION,
  });
});

afterAll(async () => {
await request(app).patch("/user/profile").set("Authorization", `Bearer ${accessToken}`).send({
        firstname: 'test',
        lastname: 'test'
    });
  await mongoose.connection.close();
});

describe("Users routes tests (/user)", () => {
  test("/user/me", async () => {
    const response = await request(app).get("/user/me").set("Authorization", `Bearer ${accessToken}`);
    expect(response.body).toStrictEqual(testUser);
    expect(response.statusCode).toBe(200);
  });

  test("/user/myposts", async () => {
    const response = await request(app).get("/user/myposts").set("Authorization", `Bearer ${accessToken}`);
    expect(response.body.posts).toStrictEqual(testUserPosts);
    expect(response.statusCode).toBe(200);
  });

  test("/user/getAllUsersPosts", async () => {
    const response = await request(app).get("/user/getAllUsersPosts").set("Authorization", `Bearer ${accessToken}`);
    expect(response.body.posts).toStrictEqual(testUserPosts);
    expect(response.statusCode).toBe(200);
  });

  test("/user/profile", async () => {
    const response = await request(app).patch("/user/profile").set("Authorization", `Bearer ${accessToken}`).send({
        firstname: 'testFirst',
        lastname: 'testLast'
    });
    expect(response.statusCode).toBe(200);
  });
});
