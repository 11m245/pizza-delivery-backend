import { ObjectId } from "mongodb";
import { client } from "../index.js";

export async function addProductCategory(data) {
  console.log("runs add db com", data);
  return await client
    .db("pizzaDeliveryApp")
    .collection("productsCategory")
    .insertOne(data);
}
export async function getProductsCategory() {
  return await client
    .db("pizzaDeliveryApp")
    .collection("productsCategory")
    .find({})
    .toArray();
}

export async function getProductCategory(currentCategory) {
  return await client
    .db("pizzaDeliveryApp")
    .collection("productsCategory")
    .findOne({ category: currentCategory });
}

export async function getProductFromNameOrCode(
  currentName,
  currentProductCode
) {
  return await client
    .db("pizzaDeliveryApp")
    .collection("products")
    .findOne({
      $or: [{ name: currentName }, { productCode: currentProductCode }],
    });
}

export async function addProduct(productData) {
  // const result = await addInventoryRequirement(inventoryData);
  return await client
    .db("pizzaDeliveryApp")
    .collection("products")
    .insertOne(productData);
}

async function addInventoryRequirement(data) {
  return await client
    .db("pizzaDeliveryApp")
    .collection("inventoryRequirements")
    .insertOne(data);
}

export async function getProductById(id) {
  return await client
    .db("pizzaDeliveryApp")
    .collection("products")
    .findOne({ _id: ObjectId(id) });
}

export async function editProductById(id, data) {
  return await client
    .db("pizzaDeliveryApp")
    .collection("products")
    .updateOne({ _id: ObjectId(id) }, { $set: data });
}

export async function deleteProductById(id) {
  return await client
    .db("pizzaDeliveryApp")
    .collection("products")
    .deleteOne({ _id: ObjectId(id) });
}
