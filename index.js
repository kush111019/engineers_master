const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
require('dotenv').config()
const logger = require('./middleware/logger');
const {paymentReminder} = require('./src/utils/paymentReminder')
const app = express();
const path = require('path')
const Router = require('./src/routes/index');
require('./src/database/connection') 

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

// // Replace this endpoint secret with your endpoint's unique secret
// // If you are testing with the CLI, find the secret by running 'stripe listen'
// // If you are using an endpoint defined with the API or dashboard, look in your webhook settings
// // at https://dashboard.stripe.com/webhooks
// const endpointSecret = 'whsec_...';


// app.post('/webhook', async (request, response) => {
//   let event = request.body;
//   // Only verify the event if you have an endpoint secret defined.
//   // Otherwise use the basic event deserialized with JSON.parse
//   if (endpointSecret) {
//     // Get the signature sent by Stripe
//     const signature = request.headers['stripe-signature'];
//     try {
//       event = stripe.webhooks.constructEvent(
//         request.body,
//         signature,
//         endpointSecret
//       );
//     } catch (err) {
//       console.log(`⚠️  Webhook signature verification failed.`, err.message);
//       return response.sendStatus(400);
//     }
//   }

//   // Handle the event
//   switch (event.type) {
//     case 'invoice.payment_succeeded':
//       const invoicePaymentSucceded = event.data.object;
//       console.log(`PaymentIntent for ${invoicePayment.amount} was successful!`);
//       let payment = await recurringPaymentData(invoicePaymentSucceded);
//       break;
//     case 'invoice.payment_failed':
//       const paymentMethod = event.data.object;
//       // Then define and call a method to handle the successful attachment of a PaymentMethod.
//       // handlePaymentMethodAttached(paymentMethod);
//       break;
//     default:
//       // Unexpected event type
//       console.log(`Unhandled event type ${event.type}.`);
//   }

//   // Return a 200 response to acknowledge receipt of the event
//   response.send();
// });



app.listen(process.env.LISTEN_PORT, () => {
    console.log(`Hirise sales is running on ${process.env.LISTEN_PORT} `);
  });
  
  app.use('/api/v1', Router);

  app.get('/api', (req, res) => {
    res.status(200).json({ msg: 'OK' });
  }); 