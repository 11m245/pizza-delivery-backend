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
  console.log("runs get Inventory Item", name);
  return await client
    .db("pizzaDeliveryApp")
    .collection("inventoryItems")
    .findOne({ name: name });
}
export async function getInventoryItemByNameAndCategory(data) {
  const { name, category } = data;
  console.log("runs get Inventory Item", name, category);
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

export async function addInventoryItemCategory(name) {
  return await client
    .db("pizzaDeliveryApp")
    .collection("inventoryItemsCategory")
    .insertOne({ category: name.toLowerCase() });
}

export async function addProductInventoryItemsRequirement(data) {
  return await client
    .db("pizzaDeliveryApp")
    .collection("productInventoryItemsRequirement")
    .insertOne({ ...data });
}

export async function getProductInventoryRequirementById(product_Id) {
  return await client
    .db("pizzaDeliveryApp")
    .collection("productInventoryItemsRequirement")
    .findOne({ product_Id: product_Id });
}
