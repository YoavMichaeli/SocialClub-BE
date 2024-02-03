const testUserPosts = [{
    "_id": "a49110d6-c41c-e81b-9a7b-4ab7c0fde567",
    "author": "test",
    "authorID": "65be6dfc8e04c4599cff3880",
    "static_url": "/feeds/bd18cd6b-0d56-5c56-ddb7-aa4b36b44863_apple-touch-icon.png",
    "caption": "test",
    "comments": [],
    "type": "png",
    "createdAt": "2024-02-03T17:08:43.296Z",
    "lastEditedAt": "2024-02-03T17:08:43.296Z"
  }]

const testUser = {user: {
    "_id": "65be6dfc8e04c4599cff3880",
    "groups": [],
    "groupsAdmin": [],
    "followers": [],
    "following": [],
    "refreshTokens": [
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NWJlNmRmYzhlMDRjNDU5OWNmZjM4ODAiLCJ1c2VyIjoidGVzdCIsImlhdCI6MTcwNjk3ODgxN30.K62Ws7fZjiighYu0dvsRVrbwBCtpdSpKwAR778wRnAA"
    ],
    "posts": testUserPosts,
    "chat_rooms": [],
    "notifications": [],
    "username": "test",
    "firstname": "test",
    "lastname": "test",
    "profile_pic": "/profile_pics/d28a8ea6-d321-87bd-fa18-f955b015fa87_books-8405721_1280.jpg",
    "lastLogin": "Sat Feb 03 2024 18:46:57 GMT+0200 (Israel Standard Time)",
    "password": "$2a$08$Gvsgg8cbQu/bto4JuVvQu.lMojtgUS8OGaWaEbcpII7vUiywG14im",
    "__v": 2
  }}

  module.exports = {
    testUser: testUser,
    testUserPosts: testUserPosts
  }
