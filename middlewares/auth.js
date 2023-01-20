import jwt from "jsonwebtoken";

function auth(request, response, next) {
  try {
    const token = request.headers.logintoken;
    jwt.verify(token, process.env.SECRET_KEY);
    next();
  } catch (error) {
    response.status(401).send({ message: error.message });
  }
}

export { auth };
