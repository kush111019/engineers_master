const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
require('dotenv').config()
const logger = require('./middleware/logger');
const {paymentReminder} = require('./src/utils/paymentReminder')

const app = express();
const path = require('path')
const Router = require('./src/routes/index');
const connection = require('./src/database/connection') 

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('uploads'))
app.use(express.static('public'))
app.use(logger);

let cronJob = cron.schedule('59 59 23 * * *', async () => {
    await paymentReminder();
  });
cronJob.start();


app.listen(process.env.LISTEN_PORT, () => {
    console.log(`Hirise sales is running on ${process.env.LISTEN_PORT} `);
  });
  
  app.use('/api/v1', Router);

  app.get('/api', (req, res) => {
    res.status(200).json({ msg: 'OK' });
  }); 