import { client } from "../index.js";

export async function addUser(data) {
  return await client
    .db("pizzaDeliveryApp")
    .collection("users")
    .insertOne(data);
}

// export async function getUserFromDB(data) {
//   const { email } = data;
//   return await client
//     .db("pizzaDeliveryApp")
//     .collection("users")
//     .findOne({ email });
// }

export async function getUserFromDBbyEmail(data) {
  const { email } = data;
  return await client
    .db("pizzaDeliveryApp")
    .collection("users")
    .findOne({ email: email.toLowerCase() });
}

// export async function getUserFromDBByUserName(data) {
//   const { username } = data;
//   return await client
//     .db("pizzaDeliveryApp")
//     .collection("users")
//     .findOne({ username });
// }

export async function storeResetTokenInDB(data) {
  return await client
    .db("pizzaDeliveryApp")
    .collection("usersResetTokens")
    .insertOne({ ...data, createdAt: Date.now() });
}

export async function getUserFromResetToken(urlData) {
  return await client
    .db("pizzaDeliveryApp")
    .collection("usersResetTokens")
    .findOne({ resetToken: urlData });
}

export async function getUserFromID(id) {
  // console.log(" got id in getUserFromID", id);
  return await client
    .db("pizzaDeliveryApp")
    .collection("users")
    .findOne({ _id: id });
}

export async function updatePasswordInDB(email, newpassword) {
  return await client
    .db("pizzaDeliveryApp")
    .collection("users")
    .updateOne({ email }, { $set: { password: newpassword } });
}

export async function storeLoginToken(data) {
  return await client
    .db("pizzaDeliveryApp")
    .collection("usersLoginTokens")
    .insertOne({ ...data, createdAt: Date.now() });
}

export async function getUserFromToken(token) {
  return await client
    .db("pizzaDeliveryApp")
    .collection("usersLoginTokens")
    .findOne({ token: token });
}

export async function storeActivationToken(data) {
  return await client
    .db("pizzaDeliveryApp")
    .collection("usersActivationTokens")
    .insertOne({ ...data, createdAt: Date.now() });
}

export async function getUserFromActivationToken(token) {
  return await client
    .db("pizzaDeliveryApp")
    .collection("usersActivationTokens")
    .findOne({ token: token });
}

export async function activateUserInDB(email) {
  return await client
    .db("pizzaDeliveryApp")
    .collection("users")
    .updateOne({ email }, { $set: { isActivated: true } });
}
