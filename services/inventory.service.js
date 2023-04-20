import { ObjectId } from "mongodb";
import { client } from "../index.js";

export async function addInventoryItem(data) {
  //   console.log("runs add InventoryItem ", data);
  return await client
    .db("pizzaDeliveryApp")
    .collection("inventoryItems")
    .insertOne(data);
}

export async function getInventoryItemByName(data) {
  const { name } = data;
  // console.log("runs get Inventory Item", name);
  return await client
    .db("pizzaDeliveryApp")
    .collection("inventoryItems")
    .findOne({ name: name });
}
export async function getInventoryItemByNameAndCategory(data) {
  const { name, category } = data;
  // console.log("runs get Inventory Item", name, category);
  return await client
    .db("pizzaDeliveryApp")
    .collection("inventoryItems")
    .findOne({ name: name }, { category: category });
}

export async function getInventoryCategoryByName(name) {
  return await client
    .db("pizzaDeliveryApp")
    .collection("inventoryItemsCategory")
    .findOne({ category: name });
}

export async function editInventoryCategory(data) {
  const { oldCategoryName, newCategoryName } = data;
  return await client
    .db("pizzaDeliveryApp")
    .collection("inventoryItemsCategory")
    .updateOne(
      { category: oldCategoryName },
      { $set: { category: newCategoryName } }
    );
}

export async function getAllInventoryItemCategories() {
  return await client
    .db("pizzaDeliveryApp")
    .collection("inventoryItemsCategory")
    .find({})
    .toArray();
}

export async function getAllInventoryItems() {
  return await client
    .db("pizzaDeliveryApp")
    .collection("inventoryItems")
    .find({})
    .toArray();
}
export async function addInventoryItemCategory(name) {
  return await client
    .db("pizzaDeliveryApp")
    .collection("inventoryItemsCategory")
    .insertOne({ category: name.toLowerCase() });
}

export async function editInventoryItem(objId, newData) {
  // console.log("objid is", objId);
  // console.log("new data is service", newData);
  return await client
    .db("pizzaDeliveryApp")
    .collection("inventoryItems")
    .updateOne({ _id: objId }, { $set: newData });
}

export async function addProductInventoryItemsRequirement(data) {
  return await client
    .db("pizzaDeliveryApp")
    .collection("productInventoryItemsRequirement")
    .insertOne({ ...data });
}

export async function updateExpenseItem(expenseData, orderId) {
  const prev = await client
    .db("pizzaDeliveryApp")
    .collection("inventoryItems")
    .findOne({ _id: ObjectId(expenseData.item_id) });
  // console.log("prev", prev);
  return await client
    .db("pizzaDeliveryApp")
    .collection("inventoryItems")
    .updateOne(
      { _id: ObjectId(expenseData.item_id) },
      { $set: { stock: parseFloat(prev.stock) - parseFloat(expenseData.qty) } }
    );
}
