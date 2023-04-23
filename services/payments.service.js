import { ObjectId } from "mongodb";
import { client } from "../index.js";
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
}
