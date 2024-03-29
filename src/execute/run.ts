#!/usr/bin/env node

/**
 * Module dependencies.
 */
process.title = "SocialClub";

var app = require("../app.ts");
var io = require("socket.io");
var debug = require("debug")("v2.0.0:server");
var http = require("http");
/**
 * Get port from environment and store in Express.
 */

var port = normalizePort(process.env.PORT || app.conf.http.port);
app.set("port", port);

/**
 * Create HTTP server.
 */

var server = http.createServer(app);
var sio = io(server);

/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port);
server.on("error", onError);
server.on("listening", onListening);

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== "listen") {
    throw error;
  }

  var bind = typeof port === "string" ? "Pipe " + port : "Port " + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case "EACCES":
      console.error(bind + " requires elevated privileges");
      process.exit(1);
      break;
    case "EADDRINUSE":
      console.error(bind + " is already in use");
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  var addr = server.address();
  var bind = typeof addr === "string" ? "pipe " + addr : "port " + addr.port;
  debug("Listening on " + bind);
  console.log(
    `\n${app.conf.name} is listening on http://${app.conf.http.host}:${addr.port}\n`
  );
}

module.exports = { sio, server };

if (process.argv.find(a => a == "--app")) {
  require("../controllers/app_socket.ts");
}

var socket = require("../controllers/socket.ts");
