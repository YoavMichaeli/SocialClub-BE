export {};

var createError = require("http-errors");
var express = require("express");
var path = require("path");
var session = require("express-session");
var bodyParser = require("body-parser");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var fs = require("file-system");
var cors = require("cors");

var indexRouter = require("./routes/index.ts");
var usersRouter = require("./routes/users.ts");
var groupsRouter = require("./routes/groups.ts");
var graphRouter = require("./routes/graph.ts");
var accountRouter = require("./routes/auth.ts");
var meRouter = require("./routes/settings.ts");
var restApi = require("./routes/api/v1/index.ts");
var chatRouter = require("./routes/chat.ts");
var counterRouter = require("./controllers/counter.ts");
require('dotenv').config();
var mapRouter = require('./routes/map.ts');
var authMiddleware = require('./middlewares/auth.ts')
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('../swagger-output.json');


export var app = express();

app.conf = require("./config/app.ts");
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

var cooky = {
  secret: "work hard",
  resave: true,
  expires: <any> new Date() * 60 * 60 * 24 * 7,
  saveUninitialized: true
};

app.sessionMiddleware = session(cooky);

app.set("trust proxy", 1); // trust first proxy
app.use(app.sessionMiddleware);
app.use(
  logger("common", {
    stream: fs.createWriteStream(
      __dirname.endsWith(".SocialClub")
        ? __dirname + "/../data/out.log"
        : __dirname + "/out.log",
      { flags: "a" }
    )
  })
);
app.use(cors({
  origin: 'http://localhost:4000'
}
));
app.use(logger("tiny"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

accountRouter.use(authMiddleware);

// app.use(counterRouter);
// app.use("/", indexRouter);
// app.use("/groups", groupsRouter);
// app.use('/map', mapRouter);
// app.use("/graph", graphRouter);
app.use("/user", usersRouter);
app.use("/account", accountRouter);
app.use("/me", meRouter);
// app.use("/api", restApi);
// app.use("/chat", chatRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
