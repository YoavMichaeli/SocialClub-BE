const request = require("supertest");
const app = require("../../app.ts");
const jwt = require("jsonwebtoken");
const { postId } = require("../mocks/settings.ts");
var mongoose = require("mongoose");

let accessToken;

beforeAll(() => {
    accessToken = jwt.sign({ _id: "65be6dfc8e04c4599cff3880", user: "test" }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRATION,
      });
});

afterAll(async () => {
    await mongoose.connection.close();
});

describe("Me routes tests (/me)", () => {
    test("/me/post/{postId}", async () => {
        const response = await request(app).patch(`/me/post/${postId}`).set("Authorization", `Bearer ${accessToken}`).send({
            newCaption: "testCaption",
            newComment: {by: "test",
                          text: "testComment"},
            postAuthor: "65be6dfc8e04c4599cff3880"
        });
        expect(response.statusCode).toBe(200);
    })

    test("/me/post/{postId}", async () => {
        const response = await request(app).delete(`/me/post/${postId}`).set("Authorization", `Bearer ${accessToken}`);
        expect(response.statusCode).toBe(200);
    })

});