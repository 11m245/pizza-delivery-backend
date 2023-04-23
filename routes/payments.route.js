import express from "express";

import { getProductById } from "../services/products.service.js";
import { getUserFromToken } from "../services/user.service.js";
import * as dotenv from "dotenv";
dotenv.config();
import stripe from "stripe";
import { addOrder } from "../services/orders.service.js";
import {
  addOrderInPayments,
  updateOrderPaymentStatus,
} from "../services/payments.service.js";
const Stripe = stripe(process.env.STRIPE_PRIVATE_KEY);
const router = express.Router();

// Use this sample code to handle webhook events in your integration.

// 1) Paste this code into a new file (server.js)

// 2) Install dependencies
//   npm install stripe
//   npm install express

// 3) Run the server on http://localhost:4000
//   node server.js

// The library needs to be configured with your account's secret key.
// Ensure the key is kept out of any version control system you might be using.

// This is your Stripe CLI webhook secret for testing your endpoint locally.
const endpointSecret =
  "whsec_fb1bea950dabeb2dab1a4041bab0d1446a13300b6e2c8242ab1581a7d46c0922";

router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  async (request, response) => {
    const sig = request.headers["stripe-signature"];

    let event;

    try {
      event = Stripe.webhooks.constructEvent(request.body, sig, endpointSecret);
      // console.log("web hook verified");
    } catch (err) {
      console.log("Webhook Error", err, request.headers);

      response.status(400).send(`Webhook Error: ${err.message}`);
      return;
    }

    // Handle the event
    try {
      switch (event.type) {
        case "checkout.session.completed":
          const checkOutCompleted = event.data.object;
          console.log("checkOutCompleted obj", checkOutCompleted);
          const {
            id: checkOutSessionId,
            amount_total: paidAmount,
            created: updatedAt,
            status: sessionStatus,
            payment_status: paymentStatus,
            payment_intent: paymentIntent,
          } = checkOutCompleted;
          const { userIdString, orderIdString } = checkOutCompleted.metadata;

          await updateOrderPaymentStatus({
            userIdString,
            orderIdString,
            checkOutSessionId,
            paidAmount: paidAmount / 100,
            updatedAt,
            sessionStatus,
            paymentStatus,
            paymentIntent,
          });
          break;
        // ... handle other event types
        default:
          console.log(`Unhandled event type ${event.type}`);
      }
    } catch (err) {
      console.log("error in webhook", err);
    }

    // Return a 200 response to acknowledge receipt of the event
    response.send();
  }
);

function checkOrder(data) {
  const result = data.every((obj) => {
    if (obj._id && obj.qty) {
      return true;
    }
  });
  // console.log("result is", result);
  return result;
}

router.post(
  "/create-checkout-session",
  express.json(),
  async function (request, response) {
    const { logintoken } = request.headers;
    let session;
    let userId;
    //   let formattedOrderData;
    // console.log("login token is", logintoken);
    const data = request.body;
    // console.log("body data in checkout is", data);

    if (data.length < 1) {
      response.status(400).send({ message: "Empty Cart" });
    } else {
      const isValidOrder = checkOrder(data);
      if (isValidOrder) {
        const { user_id } = await getUserFromToken(logintoken);
        userId = user_id;
        // console.log("ordered user is", user_id);
        const productsData = await Promise.all(
          data.map(async (dat) => {
            const productData = await getProductById(dat._id);
            // console.log("product data", productData);
            // console.log("qty", dat.qty);
            return { ...productData, qty: dat.qty };
          })
        );
        // console.log("productsData for from DB", productsData);

        const paymentProductsData = productsData.map((productData) => {
          return {
            price_data: {
              currency: "inr",
              product_data: { name: productData.name },
              unit_amount: productData.price * 100,
            },
            quantity: productData.qty,
          };
        });

        try {
          const orderAmount1 = productsData.reduce((acc, cobj) => {
            return acc + cobj.price * cobj.qty;
          }, 0);

          const formattedOrderData = {
            products: productsData,
            orderedBy: user_id,
            createdAt: Date.now(),
            statusUpdatedAt: Date.now(),
            invoiceAmount: orderAmount1,
            isCompleted: false,
            currentStatus: "00",
            status: [
              {
                statusCode: "00",
                updatedAt: Date.now(),
                updatedBy: user_id,
              },
            ],
          };
          const result = await addOrder(formattedOrderData);
          if (result.insertedId) {
            const result1 = await addOrderInPayments({
              orderId: result.insertedId,
              modeOfPayment: formattedOrderData.modeOfPayment,
              paymentStatus: "not initialised",
              paymentIntent: null,
              invoiceAmount: formattedOrderData.invoiceAmount,
              paidAmount: 0,
              updatedBy: formattedOrderData.orderedBy,
              createdAt: Date.now(),
              updatedAt: Date.now(),
            });
            session = await Stripe.checkout.sessions.create({
              payment_method_types: ["card"],
              // For each item use the id to get it's information
              // Take that information and convert it to Stripe's format
              line_items: paymentProductsData,
              mode: "payment",
              metadata: {
                userIdString: user_id.toString(),
                orderIdString: result.insertedId.toString(),
              },

              // Set a success and cancel URL we will send customers to
              // These must be full URLs
              // In the next section we will setup CLIENT_URL
              success_url: `${process.env.API_CLIENT}/user/payment/success`,
              cancel_url: `${process.env.API_CLIENT}/user/payment/failed`,
            });
            // res.json({ url: session.url });
            // console.log("success session creation payment url", session);
          } else {
            response.send({
              message: "order not updated in DB",
            });
          }

          response.send({
            message: "Successful Payment Session Creation",
            payload: { url: session.url },
          });
        } catch (error) {
          // If there is an error send it to the client
          // res.status(500).json({ error: e.message });
          console.log("Payment Session Creation Error", error);
          response.status(500).send({
            message: "Payment Session Creation Error",
            payload: { url: session.url },
          });
        }
      }
    }
  }
);

export default router;
