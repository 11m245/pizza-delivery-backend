import { client } from "../index.js";
export async function addOrderInPayments(data) {
  return await client
    .db("pizzaDeliveryApp")
    .collection("payments")
    .insertOne(data);
}
