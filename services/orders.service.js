import { ObjectId } from "mongodb";
import { client } from "../index.js";

export async function addOrder(data) {
  console.log("runs add db order comm", data);
  return await client
    .db("pizzaDeliveryApp")
    .collection("orders")
    .insertOne(data);
}

export async function UpdateOrderStatus(orderId, newStatus) {
  return await client
    .db("pizzaDeliveryApp")
    .collection("orders")
    .updateOne({ _id: ObjectId(orderId) }, { $push: { status: newStatus } });
}

export async function getOrderDetails(orderId) {
  return await client
    .db("pizzaDeliveryApp")
    .collection("orders")
    .findOne({ _id: ObjectId(orderId) });
}

export async function getTodayOrders() {
  // console.log("now get date is", Date.now());
  // console.log("now get date is minus", Date.now() - 86400);
  const startDate = Date.now() - 86400000;
  console.log("start date is", startDate);
  return await client
    .db("pizzaDeliveryApp")
    .collection("orders")
    .find({ createdAt: { $gte: startDate } })
    .toArray();
}
