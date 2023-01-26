import express from "express";
const router = express.Router();
import { addOrder, UpdateOrderStatus } from "../services/orders.service.js";
import { getUserFromToken } from "../services/user.service.js";

router.post("/new", async function (request, response) {
  const { logintoken } = request.headers;
  // console.log("login token is", logintoken);
  const data = request.body;
  // console.log("body data in add order is", data);
  const { user_id } = await getUserFromToken(logintoken);
  // console.log("ordered user is", user_id);
  const orderAmount1 = data.items.reduce((acc, cobj) => {
    return acc + cobj.price * cobj.quantity;
  }, 0);
  const formattedData = {
    ...data,
    orderedBy: user_id,
    createdAt: Date.now(),
    orderAmount: orderAmount1,
    status: [{ statusCode: "00", updatedAt: Date.now(), updatedBy: user_id }],
  };
  const result = await addOrder(formattedData);
  if (result.insertedId) {
    response.send({ message: "order placed", orderId: result.insertedId });
  } else {
    response.status(500).send({ message: "order not placed" });
  }
});

router.post("/updateStatus/:id", async function (request, response) {
  const { id } = request.params;
  // console.log("params is", id);
  const { logintoken } = request.headers;
  // console.log("login token is", logintoken);
  const { orderId } = request.body;
  // console.log("body data in order Id is", orderId);
  const { user_id } = await getUserFromToken(logintoken);
  // console.log("order update user is", user_id);
  const newStatus = {
    statusCode: id,
    updatedAt: Date.now(),
    updatedBy: user_id,
  };

  const result = await UpdateOrderStatus(orderId, newStatus);
  response.send({ message: "order status updated", result });
});

// addItemInventoryRequirement
export default router;
