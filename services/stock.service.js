import { client } from "../index.js";

export async function addItemCategory(data) {
  console.log("runs add db com", data);
  return await client
    .db("pizzaDeliveryApp")
    .collection("itemsCategory")
    .insertOne(data);
}
export async function getItemsCategory() {
  return await client
    .db("pizzaDeliveryApp")
    .collection("itemsCategory")
    .find({})
    .toArray();
}

export async function getItemCategory(currentCategory) {
  return await client
    .db("pizzaDeliveryApp")
    .collection("itemsCategory")
    .findOne({ category: currentCategory });
}

export async function getItemFromNameOrCode(currentName, currentItemCode) {
  return await client
    .db("pizzaDeliveryApp")
    .collection("items")
    .findOne({ $or: [{ name: currentName }, { itemCode: currentItemCode }] });
}

export async function addItem(data) {
  return await client
    .db("pizzaDeliveryApp")
    .collection("items")
    .insertOne(data);
}
