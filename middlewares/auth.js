import jwt from "jsonwebtoken";
import { getUserFromToken } from "../services/user.service.js";

function auth(request, response, next) {
  try {
    const token = request.headers.logintoken;
    jwt.verify(token, process.env.SECRET_KEY);
    next();
  } catch (error) {
    response.status(401).send({ message: error.message });
  }
}

async function authAdmin(request, response, next) {
  try {
    const token = request.headers.logintoken;
    const { user_id } = await getUserFromToken(token);
    const user = await getUserFromID(user_id);
    if (user.role === "admin") {
      jwt.verify(token, process.env.SECRET_KEY);
      next();
    } else {
      throw Error;
    }
  } catch (error) {
    response.status(401).send({ message: error.message });
  }
}

export { auth, authAdmin };
