import { ObjectId } from "mongodb";
import { client } from "../index.js";

export async function addOrder(data) {
  // console.log("runs add db order comm", data);
  return await client
    .db("pizzaDeliveryApp")
    .collection("orders")
    .insertOne(data);
}

export async function getOrdersStatus(order_Ids) {
  console.log("runs get orders status", order_Ids);
  return await client
    .db("pizzaDeliveryApp")
    .collection("orders")
    .find({ _id: { $in: order_Ids } })
    .toArray();
}

export async function getTodayUserOrders() {
  console.log("runs get today user orders");
  return await client
    .db("pizzaDeliveryApp")
    .collection("orders")
    .aggregate([
      {
        $lookup: {
          from: "users",
          localField: "orderedBy",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $match: {
          createdAt: {
            $gte: Date.now() - 86400000,
          },
        },
      },
    ])
    .toArray();
}

export async function getAllOrders() {
  console.log("runs get all orders");
  return await client
    .db("pizzaDeliveryApp")
    .collection("orders")
    .aggregate([
      {
        $lookup: {
          from: "users",
          localField: "orderedBy",
          foreignField: "_id",
          as: "user",
        },
      },

      {
        $sort: {
          createdAt: -1,
        },
      },
    ])
    .toArray();
}

export async function UpdateOrderStatus(orderId, newStatus) {
  if (newStatus.statusCode === "05") {
    await client
      .db("pizzaDeliveryApp")
      .collection("orders")
      .updateOne({ _id: ObjectId(orderId) }, { $set: { isCompleted: true } });
  }
  await client
    .db("pizzaDeliveryApp")
    .collection("orders")
    .updateOne(
      { _id: ObjectId(orderId) },
      {
        $set: {
          currentStatus: newStatus.statusCode,
          statusUpdatedAt: Date.now(),
        },
      }
    );
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

// export async function getUserOrders(user_Id) {
//   console.log("runs get all user orders");
//   return await client
//     .db("pizzaDeliveryApp")
//     .collection("orders")
//     .find({ orderedBy: user_Id })
//     .toArray();
// }
export async function getUserOrders(user_Id) {
  console.log("runs get all orders");
  return await client
    .db("pizzaDeliveryApp")
    .collection("orders")
    .aggregate([
      { $match: { orderedBy: user_Id } },
      {
        $lookup: {
          from: "users",
          localField: "orderedBy",
          foreignField: "_id",
          as: "user",
        },
      },

      {
        $sort: {
          createdAt: -1,
        },
      },
    ])
    .toArray();
}
