const request = require("supertest");
const app = require("../../app.ts");
const jwt = require("jsonwebtoken");
var path = require('path');
const { testUserId, testUserName } = require("../mocks/users.ts");
var mongoose = require("mongoose");
const fs = require('fs');


let accessToken, postId;

beforeAll(() => {
    accessToken = jwt.sign({ _id: testUserId, user: testUserName }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRATION,
      });
});

afterAll(async () => {
    await mongoose.connection.close();
});

describe("Me routes tests (/me)", () => {


    test("/me/upload", async () => {
        const response = await request(app).post("/me/upload")
        .field('caption', 'testCaption')
        .attach('file', path.join(__dirname, '../../public/feeds/test/5e08a20c-5c37-f6b1-442f-b9377753dbc1_books-8405721_1280.jpg'))
        .set("Authorization", `Bearer ${accessToken}`);
        postId = response.body.postId;
        expect(response.statusCode).toBe(201);
        });


    test("/me/post/{postId}", async () => {
            const response = await request(app).patch(`/me/post/${postId}`).set("Authorization", `Bearer ${accessToken}`).send({
                newCaption: "testCaption",
                newComment: {by: "test",
                              text: "testComment"},
                postAuthor: testUserId
            });
            expect(response.statusCode).toBe(200);
        })

    test("/me/post/{postId}", async () => {
            const response = await request(app).delete(`/me/post/${postId}`).set("Authorization", `Bearer ${accessToken}`);
            expect(response.statusCode).toBe(200);
        })

});