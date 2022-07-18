const express = require('express');
const cors = require('cors');
require('dotenv').config()

const app = express();

const Router = require('./src/routes/index');
const connection = require('./src/database/connection') 

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('uploads'))

app.listen(process.env.LISTEN_PORT, () => {
    console.log(`Hirise sales is running on ${process.env.LISTEN_PORT} `);
  });
  
  app.use('/api/v1', Router);

  app.get('/api', (req, res) => {
    res.status(200).json({ msg: 'OK' });
  }); 