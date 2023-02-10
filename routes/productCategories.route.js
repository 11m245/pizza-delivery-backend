import express from "express";
import { getAllProductCategories } from "../services/productCategories.service.js";
const router = express.Router();

router.get("/all", async function (request, response) {
  const result = await getAllProductCategories();
  if (result) {
    result.length > 0
      ? response.send({
          message: "product categories fetched",
          categories: result,
        })
      : response.send({
          message: "product categories not found",
          categories: result,
        });
  } else {
    response
      .status(500)
      .send({ message: "product categories not fetched error" });
  }
});

export default router;
