const express = require('express');
const cluster = require('cluster');
const os = require('os');
const app = express();
const cors = require('cors');
const cron = require('node-cron');
require('dotenv').config()
const logger = require('./middleware/logger');
const { paymentReminder, upgradeSubscriptionCronFn } = require('./src/utils/paymentReminder')
require('./src/database/connection')
const path = require('path')
const Router = require('./src/routes/index');
let chat = require('./src/controllers/chat.controller')
const http = require('http').createServer(app)
// const io = require('./src/utils/socket')
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

// let cronJob1 = cron.schedule('*/30 * * * *', async () => {
//    await fetchEmails()
// });
// cronJob1.start();

io.on("connection", (socket) => {
  console.log("Connected to socket.io");
  socket.on("setup", (userData) => {
    socket.join(userData.id);
    socket.emit("connected");
  });

  socket.on("join chat", (room) => {
    socket.join(room);
    console.log("User Joined Room: " + room);
  });
  socket.on("new message", (newMessageRecieved) => {
    if (!newMessageRecieved.users) return console.log("chat.users not defined");

    newMessageRecieved.users.forEach((user) => {
      if (user.id == newMessageRecieved.sender.id) return;

      socket.in(user.id).emit("message recieved", newMessageRecieved);
    });
  });
  socket.off("setup", () => {
    console.log("USER DISCONNECTED");
    socket.leave(userData.id);
  });
});

const numCpu = os.cpus().length;
if (cluster.isMaster) {
  for (let i = 0; i < numCpu; i++) {
    cluster.fork();
  }
  cluster.on('exit', (worker, code, signal) => {
    console.log(`worker ${worker.process.pid} died`);
    cluster.fork();
  })
} else {
  http.listen(process.env.LISTEN_PORT, () => {
    console.log(`Hirise sales is running on ${process.env.LISTEN_PORT} `);
  });

  app.use('/api/v1', Router);

  app.get('/api', (req, res) => {
    res.status(200).json({ msg: 'OK' });
  });
}
// app.get('/chat', (req, res) => {
//   res.redirect('index.html')
// });