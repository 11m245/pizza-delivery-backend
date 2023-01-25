import express from "express";
import {
  addItem,
  addItemCategory,
  getItemCategory,
  getItemFromNameOrCode,
  getItemsCategory,
} from "../services/stock.service.js";
const router = express.Router();

async function findAlreadyCategoryExist(currentCategory) {
  const result = await getItemCategory(currentCategory);
  // console.log("find Result is", result);
  if (result) {
    return true;
  } else {
    return false;
  }
}
router.post("/addCategory", async function (request, response) {
  const data = request.body;
  const isAlreadyExist = await findAlreadyCategoryExist(data.category);
  // console.log("is exist is", isAlreadyExist);
  if (isAlreadyExist) {
    response.status(400).send({ message: "Category Already Exist" });
  } else {
    // console.log("add category body", data);
    const result = await addItemCategory(data);
    response.send(result);
  }
});

router.get("/category", async function (request, response) {
  const itemCategories = await getItemsCategory();
  // console.log(itemCategories);
  if (itemCategories?.length > 0) {
    response.send({ message: "Data present", categories: itemCategories });
  } else {
    response.status(400).send({ message: "Data Not present" });
  }
});

async function findItemAlreadyExist(data) {
  const { name, itemCode } = data;
  const result = await getItemFromNameOrCode(name, itemCode);
  console.log("find Item Result is", result);
  if (result) {
    return true;
  } else {
    return false;
  }
}
router.post("/addItem", async function (request, response) {
  const data = request.body;
  console.log("body data in add item is", data);
  const isAlreadyExist = await findItemAlreadyExist(data);
  // console.log("is exist is", isAlreadyExist);
  if (isAlreadyExist) {
    response.status(400).send({ message: "Item Already Exist" });
  } else {
    const formattedData = {
      ...data,
      price: parseInt(data.price),
      isVeg: data.isVeg.toLowerCase() === "yes" ? true : false,
      rating: 0,
    };
    const result = await addItem(formattedData);
    response.send(result);
  }
});

export default router;
