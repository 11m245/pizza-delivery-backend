import { ObjectId } from "mongodb";
import { client } from "../index.js";
import * as dotenv from "dotenv";
dotenv.config();
export async function addOrderInPayments(data) {
  return await client
    .db("pizzaDeliveryApp")
    .collection("payments")
    .insertOne(data);
}

export async function updateOrderPaymentStatus({
  userIdString,
  orderIdString,
  checkOutSessionId,
  paidAmount,
  updatedAt,
  sessionStatus,
  paymentStatus,
  paymentIntent,
}) {
  try {
    const client = new MongoClient(process.env.MONGO_URL);
    client.connect();

    console.log("update payment runss");
    return await client
      .db("pizzaDeliveryApp")
      .collection("payments")
      .updateOne(
        { orderId: ObjectId(orderIdString) },
        {
          $set: {
            modeOfPayment: "stripe",
            checkOutSessionId: checkOutSessionId,
            paidAmount: paidAmount,
            updatedAt: updatedAt,
            sessionStatus: sessionStatus,
            paymentStatus: paymentStatus,
            paymentIntent: paymentIntent,
          },
        }
      );
  } catch (err) {
    console.log("error in update payment in db by hook", err);
  }
}
