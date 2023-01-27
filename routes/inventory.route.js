import express from "express";
import {
  addInventoryItem,
  addInventoryItemCategory,
  addProductInventoryItemsRequirement,
  getInventoryCategoryByName,
  getInventoryItemByName,
  getInventoryItemByNameAndCategory,
} from "../services/inventory.service.js";
import { getUserFromToken } from "../services/user.service.js";
const router = express.Router();

async function checkItemAlreadyExist(data) {
  return await getInventoryItemByNameAndCategory(data);
}

router.post("/new", async function (request, response) {
  const { logintoken } = request.headers;
  const data = request.body;

  const { user_id } = await getUserFromToken(logintoken);
  //   console.log("trying user is", user_id);
  const isAlreadyExist = await checkItemAlreadyExist(data);
  if (isAlreadyExist) {
    response.status(400).send({
      message: "Item Already Exist",
      itemCode: isAlreadyExist.itemCode,
    });
  } else {
    const formattedData = { ...data, createdBy: user_id };
    const result = await addInventoryItem(formattedData);
    if (result.insertedId) {
      response.send({
        message: "added to Inventory",
        orderId: result.insertedId,
      });
    } else {
      response.status(500).send({ message: "Not Added" });
    }
  }
});
async function findAlreadyItemCategoryExist(currentCategory) {
  //   console.log("c. cat", currentCategory);
  const result = await getInventoryCategoryByName(
    currentCategory.toLowerCase()
  );
  //   console.log("find Result is", result);
  if (result) {
    return true;
  } else {
    return false;
  }
}

router.post("/addCategory", async function (request, response) {
  const data = request.body;
  console.log("adc", data);
  const isAlreadyExist = await findAlreadyItemCategoryExist(data.category);
  // console.log("is exist is", isAlreadyExist);
  if (isAlreadyExist) {
    response
      .status(400)
      .send({ message: "Inventory Item Category Already Exist" });
  } else {
    const result = await addInventoryItemCategory(data.category);
    response.send(result);
  }
});
async function findAlreadyProductInventoryItemsRequirementExist(data) {
  const result = await getProductInventoryRequirementById(data.product_Id);
  return result;
}

router.post(
  "/inventoryItemsRequirements/addRequirement",
  async function (request, response) {
    const data = request.body;
    const isAlreadyExist =
      await findAlreadyProductInventoryItemsRequirementExist(data);
    console.log("is exist is", isAlreadyExist);
    if (isAlreadyExist) {
      response
        .status(400)
        .send({ message: "Product Inventory Item Requirement Already Exist" });
    } else {
      const result = await addProductInventoryItemsRequirement(data);
      response.send(result);
    }
  }
);
export default router;
