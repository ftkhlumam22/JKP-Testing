const Product = require("../../models/store/productModel");
const apiResponse = require("../../helpers/apiResponse");
const paginateLabel = require("../../helpers/paginateLabel");
const { ObjectId } = require("mongodb");

async function getProduct(req, res) {
  if (req.query.pagination === "false") {
    try {
      const result = await Product.find();
      return apiResponse.successResponseWithData(res, "Data Success", result);
    } catch (error) {
      return apiResponse.ErrorResponse(res, error);
    }
  } else {
    let option = {
      page: req.query.page,
      limit: req.query.limit,
      customLabels: paginateLabel,
      populate: "",
      sort: { createdAt: -1 },
    };
    let condition = {};
    if (req.query.search) {
      condition = {
        $and: [],
      };
      condition["$and"].push({
        name: { $regex: req.query.search, $options: "i" },
      });
    }

    await Product.paginate(condition, option)
      .then((result) => {
        return apiResponse.successResponseWithDataAndPagination(res, result);
      })
      .catch((error) => {
        return apiResponse.ErrorResponse(res, error);
      });
  }
}

async function getProductById(req, res) {
  try {
    await Product.findById(req.params.id)
      .then((result) => {
        return apiResponse.successResponseWithData(res, "Data Success", result);
      })
      .catch((error) => {
        return apiResponse.ErrorResponse(res, error);
      });
  } catch (error) {
    return apiResponse.ErrorResponse(res, error);
  }
}

async function createProduct(req, res) {
  try {
    const result = await Product.create(req.body);
    return apiResponse.successResponseWithData(res, result);
  } catch (error) {
    return apiResponse.ErrorResponse(res, error);
  }
}

async function updateProduct(req, res) {
  try {
    const result = await Product.findByIdAndUpdate(req.params.id, req.body);
    return apiResponse.successResponseWithData(res, result);
  } catch (error) {
    return apiResponse.ErrorResponse(res, error);
  }
}

async function deleteProduct(req, res) {
  try {
    const result = await Product.findByIdAndDelete(req.params.id);
    return apiResponse.successResponseWithData(res, result);
  } catch (error) {
    return apiResponse.ErrorResponse(res, error);
  }
}

module.exports = {
  getProduct,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
