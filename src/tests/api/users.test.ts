const request = require("supertest");
const app = require("../../app.ts");
const jwt = require("jsonwebtoken");
const { testUserId, testUserName } = require("../mocks/users.ts");
var mongoose = require("mongoose");

let accessToken;

beforeAll(() => {

  accessToken = jwt.sign({ _id: testUserId, user: testUserName }, process.env.JWT_SECRET, {
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
    let response = await request(app).get("/user/me").set("Authorization", `Bearer ${accessToken}`);
    expect(response.body).toHaveProperty('user');
    expect(response.statusCode).toBe(200);
    response = response.body.user;
    expect(response._id).toBe(testUserId);
    expect(response.username).toBe(testUserName);
    expect(response.firstname).toBe('test');
    expect(response.lastname).toBe('test');
    expect(response).toHaveProperty('profile_pic');
    expect(response).toHaveProperty('refreshTokens');
  });
  
  test("/user/myposts", async () => {
    const response = await request(app).get("/user/myposts").set("Authorization", `Bearer ${accessToken}`);
    const post = response.body.posts.pop();
    expect(post.author).toBe(testUserName);
    expect(post.authorID).toBe(testUserId);
    expect(post).toHaveProperty('comments');
    expect(post).toHaveProperty('caption');
    expect(post).toHaveProperty('type');
    expect(post).toHaveProperty('static_url');
    expect(post).toHaveProperty('author');
    expect(post).toHaveProperty('authorID');
    expect(response.statusCode).toBe(200);
  });

  test("/user/getAllUsersPosts", async () => {
    const response = await request(app).get("/user/getAllUsersPosts").set("Authorization", `Bearer ${accessToken}`);
    expect(response.statusCode).toBe(200);
    response.body.posts.forEach(post=> {
      expect(post.author).toBe(testUserName);
      expect(post.authorID).toBe(testUserId);
      expect(post).toHaveProperty('comments');
      expect(post).toHaveProperty('caption');
      expect(post).toHaveProperty('type');
      expect(post).toHaveProperty('static_url');
      expect(post).toHaveProperty('author');
      expect(post).toHaveProperty('authorID');
    });
  });

  test("/user/profile", async () => {
    const response = await request(app).patch("/user/profile").set("Authorization", `Bearer ${accessToken}`).send({
        firstname: 'testFirst',
        lastname: 'testLast'
    });
    expect(response.statusCode).toBe(200);
  });
});
