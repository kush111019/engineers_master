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

let sticky = require('socketio-sticky-session')

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



// const numCpu = os.cpus().length;
// if (cluster.isMaster) {
//   for (let i = 0; i < numCpu; i++) {
//     cluster.fork();
//   }
//   cluster.on('exit', (worker, code, signal) => {
//     console.log(`worker ${worker.process.pid} died`);
//     cluster.fork();
//   })
// } else {
  // http.listen(process.env.LISTEN_PORT, () => {
  //   console.log(`Hirise sales is running on ${process.env.LISTEN_PORT} `);
  // });

// app.use('/api/v1', Router);

// app.get('/api', (req, res) => {
//   res.status(200).json({ msg: 'OK' });
// });


// }
// app.get('/chat', (req, res) => {
//   res.redirect('index.html')
// });




let options = {
    proxy: false,
    num: require('os').cpus().length
}

let server = sticky(options, function() {

    let server = http.listen();
    // var io = require('socket.io').listen(server);
    // let live_data = io.of('/live_data');
    // live_data.on('connection',function(socket){
    //     console.log('Connected: %s', socket.id);
    // });
    let io = require("socket.io")(server,{
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