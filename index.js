const express = require('express');
const cluster = require('cluster');
const os = require('os');
const app = express();
const cors = require('cors');
const helmet = require('helmet')
const cron = require('node-cron');
require('dotenv').config()
const logger = require('./middleware/logger');
const { paymentReminder, upgradeSubscriptionCronFn } = require('./src/utils/paymentReminder')
const { targetDateReminder } = require('./src/utils/salesTargetDateReminder')
require('./src/database/connection')
const Router = require('./src/routes/index');
const http = require('http').createServer(app)
const sticky = require('socketio-sticky-session')
const { instantNotificationsList } = require('./src/utils/helper')

app.use(cors());
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('uploads'))
app.use(express.static('public'))
app.use(logger);

let cronJob = cron.schedule('59 59 23 * * *', async () => {
  if (cluster.isMaster) {
    await paymentReminder();
    await upgradeSubscriptionCronFn()
    await targetDateReminder()
  }
});
cronJob.start();

let options = {
  proxy: false,
  num: os.cpus().length
}

let server = sticky(options, () => {
  let server = http.listen();
  let io = require("socket.io")(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
      allowedHeaders: [
        "Access-Control-Allow-Origin",
        "*",
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept, Authorization",
      ],
      credentials: true
    }
  });

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

    // socket for notification
    socket.on("newNotification", (newNotificationRecieved) => {
      console.log(newNotificationRecieved, 'newNotificationRecieved111111111111')
      if (!newNotificationRecieved.id) return console.log("notification not defined");
      let checkNotification = instantNotificationsList(newNotificationRecieved, socket)
      
    });

    socket.off("setup", () => {
      console.log("USER DISCONNECTED");
      socket.leave(userData.id);
    });
  });

  return server
})
server.listen(process.env.LISTEN_PORT, () => {
  console.log((cluster.worker ? 'WORKER ' + cluster.worker.id : 'MASTER') + ' | PORT ' + process.env.LISTEN_PORT)
})

app.use('/api/v1', Router);

app.get('/api', (req, res) => {
  res.status(200).json({ msg: 'OK' });
});