import express from "express";
import { ObjectId } from "mongodb";
import { updateExpenseItem } from "../services/inventory.service.js";

const router = express.Router();
import {
  addOrder,
  getAllOrdersWithPayment,
  getOrderDetails,
  getOrdersStatus,
  getTodayUserOrdersWithPayment,
  getUserOrders,
  UpdateOrderStatus,
} from "../services/orders.service.js";
import { addOrderInPayments } from "../services/payments.service.js";
import { getProductById } from "../services/products.service.js";
import { getUserFromToken } from "../services/user.service.js";

//npm i stripe then.. setup Stripe

function checkOrder(data) {
  const result = data.every((obj) => {
    if (obj._id && obj.qty) {
      return true;
    }
  });
  // console.log("result is", result);
  return result;
}

router.post("/new", async function (request, response) {
  const { logintoken } = request.headers;
  // console.log("login token is", logintoken);
  const data = request.body;
  // console.log("body data in add order is", data);

  if (data.length < 1) {
    response.status(500).send({ message: "order not placed invalid " });
  } else {
    const isValidOrder = checkOrder(data);
    if (isValidOrder) {
      const { user_id } = await getUserFromToken(logintoken);
      // console.log("ordered user is", user_id);
      const productsData = await Promise.all(
        data.map(async (dat) => {
          const productData = await getProductById(dat._id);
          // console.log("product data", productData);
          // console.log("qty", dat.qty);
          return { ...productData, qty: dat.qty };
        })
      );
      // console.log("productsData for payment", productsData);
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

      await processPayment(paymentProductsData);

      const orderAmount1 = productsData.reduce((acc, cobj) => {
        return acc + cobj.price * cobj.qty;
      }, 0);
      const formattedOrderData = {
        products: productsData,
        orderedBy: user_id,
        createdAt: Date.now(),
        statusUpdatedAt: Date.now(),
        orderAmount: orderAmount1,
        isCompleted: false,
        currentStatus: "00",
        paymentMode: "cod",
        status: [
          { statusCode: "00", updatedAt: Date.now(), updatedBy: user_id },
        ],
      };
      const result = await addOrder(formattedOrderData);

      if (result.insertedId) {
        const result1 = await addOrderInPayments({
          orderId: result.insertedId,
          modeOfPayment: formattedData.paymentMode,
          status: "pending",
          transaction: "NIL",
          amount: formattedData.orderAmount,
          updatedBy: formattedData.orderedBy,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
        response.send({
          message: "order placed",
          orderId: result.insertedId,
        });
      }
    } else {
      response.status(500).send({ message: "order not placed invalid data" });
    }
  }
});

// router.get("/getTodayOrders", async function (request, response) {
//   const result = await getTodayOrders();
//   console.log("today order res", result);
//   if (result.length > 0) {
//     response.send({ message: "orders fetched", orders: result });
//   } else {
//     response.status(400).send({ message: "no orders found" });
//   }
// });
router.get("/getAllOrdersWithPayment", async function (request, response) {
  const result = await getAllOrdersWithPayment();
  // console.log("all order with payment res", result);
  if (result.length > 0) {
    response.send({ message: "all orders fetched", orders: result });
  } else {
    response.status(400).send({ message: "no orders found" });
  }
});
router.get(
  "/getTodayUserOrdersWithPayment",
  async function (request, response) {
    const result = await getTodayUserOrdersWithPayment();
    // console.log("today user order with payment res", result);
    if (result) {
      if (result.length > 0) {
        response.send({ message: "orders fetched", orders: result });
      } else {
        response.send({ message: "no orders fetched", orders: result });
      }
    } else {
      response.status(400).send({ message: "invalid req no orders found" });
    }
  }
);

router.post("/updateStatus/:id", async function (request, response) {
  const { id } = request.params;
  // console.log("params is", id);

  const { logintoken } = request.headers;
  // console.log("login token is", logintoken);
  const { orderId } = request.body;
  // console.log("body data in order Id is", orderId);
  if (id === "03") {
    const orderDetail = await getOrderDetails(orderId);
    const { products: orderedProductsList } = orderDetail;
    // console.log("orderedProductsList", orderedProductsList);
    let productsInventoryExpenseList = [];
    orderedProductsList.forEach(async function getProductInventoryRequirement(
      orderedProduct
    ) {
      const { inventoryRequirement } = await getProductById(orderedProduct._id);
      inventoryRequirement.forEach((itemExpense) => {
        const currentOrderItemExpense = {
          item_id: itemExpense.item_Id,
          qty: parseFloat(itemExpense.qty) * parseFloat(orderedProduct.qty),
        };
        productsInventoryExpenseList.push(currentOrderItemExpense);
      });
      // console.log(
      //   "111 productsInventoryExpenseList",
      //   productsInventoryExpenseList
      // );
      await updateInventoryStock(productsInventoryExpenseList, orderId);

      async function updateInventoryStock(
        productsInventoryExpenseList,
        orderId
      ) {
        productsInventoryExpenseList.forEach((itemExpense) => {
          updateExpenseItem(itemExpense, orderId);
        });
      }
    });
  }
  const { user_id } = await getUserFromToken(logintoken);
  // console.log("order update user is", user_id);
  const newStatus = {
    statusCode: id,
    updatedAt: Date.now(),
    updatedBy: user_id,
  };

  if (["00", "01", "02", "03", "04", "05"].includes(newStatus.statusCode)) {
    const result = await UpdateOrderStatus(orderId, newStatus);
    if (result.modifiedCount > 0) {
      response.send({ message: "order status updated", result });
    } else {
      response
        .status(500)
        .send({ message: "order status not updated", result });
    }
  } else {
    response.status(400).send({ message: "order status invalid" });
  }
});

router.get("/getOrdersStatus", async function (request, response) {
  const orderIds = request.headers.orderids;
  const order_Ids = orderIds.split(",").map((id) => ObjectId(id));
  // console.log("oreeee status", order_Ids);
  const result = await getOrdersStatus(order_Ids);
  // console.log("today orders status", result);
  if (result.length > 0) {
    response.send({ message: "orders status fetched", orders: result });
  } else {
    response.status(400).send({ message: "no orders status found" });
  }
});

router.get("/getUserOrders", async function (request, response) {
  const token = request.headers.logintoken;
  // console.log("login token", token);
  const { user_id } = await getUserFromToken(token);
  const result = await getUserOrders(user_id);
  // console.log(" user orders", result);
  if (result.length > 0) {
    response.send({ message: "all orders fetched", orders: result });
  } else {
    response.status(400).send({ message: "no orders found" });
  }
});
export default router;
