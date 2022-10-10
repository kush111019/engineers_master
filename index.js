const express = require('express');
const app = express();
const cors = require('cors');
const cron = require('node-cron');
require('dotenv').config()
const logger = require('./middleware/logger');
const { paymentReminder, upgradeSubscriptionCronFn } = require('./src/utils/paymentReminder')
require('./src/database/connection')
const path = require('path')
const Router = require('./src/routes/index');
let chat =require('./src/controllers/chat.controller')
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

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('uploads'))
app.use(express.static('public'))
app.use(logger);

let cronJob = cron.schedule('59 59 23 * * *', async () => {
  await paymentReminder();
  await upgradeSubscriptionCronFn()
});
cronJob.start();


io.on('connection', (socket) => {
  console.log("user connected", socket.id);
  
  socket.on('chat message', async (msg) => {
    let res = await chat.sendMessage(msg)
    io.emit('chat message', res);
  });

  socket.on('chat list', async (msg) => {
    let res = await chat.chatList(msg)
    res.socket_id = socket.id
    io.emit('chat list', res);
  });

  socket.on('chat history', async (msg) => {
    let res = await chat.chatHistory(msg)
    io.emit('chat history', res);
  });

  socket.on("disconnect", () => {
    console.log("user disconnected", socket.id);
  });

  socket.on("error", (err) => {
    console.log(err);
  });
});


http.listen(process.env.LISTEN_PORT, () => {
  console.log(`Hirise sales is running on ${process.env.LISTEN_PORT} `);
});

app.use('/api/v1', Router);

app.get('/api', (req, res) => {
  res.status(200).json({ msg: 'OK' });
});

// app.get('/chat', (req, res) => {
//   res.redirect('index.html')
// });