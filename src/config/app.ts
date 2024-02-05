require('dotenv').config();

var dbConnectionURI = process.env.dbConnectionURI || "mongodb://localhost:27017/SocialClub";
module.exports = {
  name: "SocialClub",
  title: "SocialClub",
  http: {
    host: "0.0.0.0",
    port: 443
  },
  version: "2.0.0",
  db: {
    connectionUri: dbConnectionURI,
    params: {}
  }
};
