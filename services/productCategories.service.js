import { client } from "../index.js";
export async function getAllProductCategories() {
  return await client
    .db("pizzaDeliveryApp")
    .collection("productsCategory")
    .find({})
    .toArray();
}
