const express = require('express');
const app = express();
const http = require('http').createServer(app)
let io = require("socket.io")(http, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
      allowedHeaders: [
        "Access-Control-Allow-Origin",
        "*",
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept, Authorization",
      ],
      credentials: true,
    },
});

module.exports = io

