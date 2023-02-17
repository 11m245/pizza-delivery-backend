import express from "express";
import {
  addProduct,
  addProductCategory,
  deleteProductById,
  editProductById,
  getAllProducts,
  getProductById,
  getProductCategory,
  getProductFromNameOrCode,
  getProductsCategory,
} from "../services/products.service.js";
const router = express.Router();

async function findAlreadyCategoryExist(currentCategory) {
  const result = await getProductCategory(currentCategory);
  // console.log("find Result is", result);
  if (result) {
    return true;
  } else {
    return false;
  }
}
router.post("/addCategory", async function (request, response) {
  const data = request.body;
  const isAlreadyExist = await findAlreadyCategoryExist(data.category);
  // console.log("is exist is", isAlreadyExist);
  if (isAlreadyExist) {
    response.status(400).send({ message: "Category Already Exist" });
  } else {
    // console.log("add category body", data);
    const result = await addProductCategory(data);
    response.send(result);
  }
});

router.get("/category", async function (request, response) {
  const productCategories = await getProductsCategory();
  // console.log(productCategries);
  if (productCategories?.length > 0) {
    response.send({ message: "Data present", categories: productCategories });
  } else {
    response.status(400).send({ message: "Data Not present" });
  }
});

async function findProductAlreadyExist(data) {
  const { name, productCode } = data;
  const result = await getProductFromNameOrCode(name, productCode);
  console.log("find product Result is", result);
  if (result) {
    return result;
  } else {
    return false;
  }
}
router.post("/addProduct", async function (request, response) {
  const data = request.body;
  console.log("body data in add product is", data);
  const isAlreadyExist = await findProductAlreadyExist(data);
  console.log("is exist is", isAlreadyExist);
  if (isAlreadyExist) {
    response.status(400).send({
      message: "Product Already Exist",
      itemCode: isAlreadyExist.itemCode,
    });
  } else {
    const formattedData = {
      ...data,
      price: parseInt(data.price),
      rating: parseInt(data.rating),
    };
    const result = await addProduct(formattedData);
    if (result) {
      response.send({ message: "added new product", payload: result });
    } else {
      response
        .status(400)
        .send({ message: "cant add new product", payload: result });
    }
  }
});

router.get("/getAllProducts", async function (request, response) {
  const productsFromDB = await getAllProducts();
  // console.log("itemFromDB is", itemFromDB);
  if (productsFromDB?.length > 0) {
    response.send({ message: "Products present", products: productsFromDB });
  } else {
    response.status(400).send({ message: "Products Not present" });
  }
});

router.get("/getProduct/:id", async function (request, response) {
  const { id } = request.params;
  const productFromDB = await getProductById(id);
  // console.log("itemFromDB is", itemFromDB);
  if (productFromDB) {
    response.send({ message: "Product present", product: productFromDB });
  } else {
    response.status(400).send({ message: "Product Not present" });
  }
});

router.put("/editProduct/:id", async function (request, response) {
  const { id } = request.params;
  const data = request.body;
  // console.log("id and data is", id, data);
  const productFromDB = await getProductById(id);

  if (productFromDB) {
    const res = await editProductById(id, data);
    response.send({ message: "Product updated", res });
  } else {
    response.status(400).send({ message: "Product Not present" });
  }
});

router.delete("/deleteProduct/:id", async function (request, response) {
  const { id } = request.params;
  console.log("delete id  is", id);
  const productFromDB = await getProductById(id);
  if (productFromDB) {
    const res = await deleteProductById(id);
    response.send({ message: "Product deleted", res });
  } else {
    response.status(400).send({ message: "Product Not present" });
  }
});

export default router;
