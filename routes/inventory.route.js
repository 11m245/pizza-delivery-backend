import { ObjectId, ObjectID } from "bson";
import express from "express";
import {
  addInventoryItem,
  addInventoryItemCategory,
  addProductInventoryItemsRequirement,
  editInventoryCategory,
  editInventoryItem,
  getAllInventoryItemCategories,
  getAllInventoryItems,
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
  console.log("data it item add", data);

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
  console.log("add category node body data", data);
  const isAlreadyExist = await findAlreadyItemCategoryExist(data.category);
  // console.log("is exist is", isAlreadyExist);
  if (isAlreadyExist) {
    response
      .status(400)
      .send({ message: "Inventory Item Category Already Exist" });
  } else {
    const result = await addInventoryItemCategory(data.category);
    response.send({
      message: "New Ineventory Category Inserted Successfully",
      payload: result.insertedId,
    });
  }
});

router.get("/allCategories", async function (request, response) {
  const result = await getAllInventoryItemCategories();
  console.log("all inventory item categories", result);

  if (result.length > 0) {
    response.send({
      message: "Inventory Item Categories fetched",
      payload: result,
    });
  } else {
    response
      .status(400)
      .send({ message: "no Inventory Item Categories available" });
  }
});

router.get("/allItems", async function (request, response) {
  const result = await getAllInventoryItems();
  console.log("all inventory items", result);

  if (result.length > 0) {
    response.send({
      message: "Inventory Items fetched",
      payload: result,
    });
  } else {
    response.status(400).send({ message: "no Inventory Items available" });
  }
});

router.put("/editCategory", async function (request, response) {
  const data = request.body;
  // console.log("edit input data from body", data);
  const result = await getInventoryCategoryByName(data.oldCategoryName);
  if (result) {
    const res = await editInventoryCategory(data);
    // console.log("edit category res is", res);
    if (res.modifiedCount > 0) {
      response.send({ message: "category updated successfully" });
    } else {
      response.status(500).send({
        message: "unable to modify the category",
      });
    }
  } else {
    response.status(400).send({
      message: "no Inventory Item Categories available on this name  error",
    });
  }
});

router.put("/edit", async function (request, response) {
  const data = request.body;
  // console.log("edit input data from body", data);
  const { _id: id, changeItem, category, ...newData } = data;
  // console.log("new data is", newData);
  const result = await getInventoryCategoryByName(category);
  if (result) {
    const res = await editInventoryItem(new ObjectId(id), newData);
    // console.log("edit item res is", res);
    if (res.modifiedCount > 0) {
      response.send({ message: "item updated successfully" });
    } else {
      response.status(500).send({
        message: "unable to modify the item",
      });
    }
  } else {
    response.status(400).send({
      message: "no Inventory Item Categories available on this name error",
    });
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
