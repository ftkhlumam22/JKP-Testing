const Cart = require("../../models/store/cartModel");
const apiResponse = require("../../helpers/apiResponse");
const paginateLabel = require("../../helpers/paginateLabel");
const productModel = require("../../models/store/productModel");
const { ObjectId } = require("mongodb");

async function getCart(req, res) {
  try {
    const result = await Cart.find({
      branch: ObjectId(req.query.branch),
      status: false,
    });
    return apiResponse.successResponseWithData(res, "Data Success", result);
  } catch (error) {
    return apiResponse.ErrorResponse(res, error);
  }
}

async function createCart(req, res) {
  await Cart.create(req.body);
  return apiResponse.successResponseWithData(res, "Data Success", req.body);
  // let payload = req.body;
  // const response = await productModel.find({ name: payload.name });

  // const qty = response[0].qty;
  // // product update qty
  // await productModel
  //   .findByIdAndUpdate(
  //     response[0]._id,
  //     {
  //       qty: qty - payload.qty,
  //     },
  //     { new: true }
  //   )
  //   .then(async (result) => {
  //     await Cart.create(req.body);
  //     return apiResponse.successResponseWithData(res, result);
  //   })
  //   .catch((error) => {
  //     return apiResponse.ErrorResponse(res, error);
  //   });
}

async function deleteCart(req, res) {
  let payload = req.body;
  await Cart.findByIdAndRemove(payload.id);
  return apiResponse.successResponseWithData(res, "Data Success", payload);
}

async function updateCart(req, res) {
  let payload = req.body;
  //   update cart with name
  await Cart.findByIdAndUpdate(payload.id, { qty: payload.qty }, { new: true })
    .then((result) => {
      return apiResponse.successResponseWithData(res, result);
    })
    .catch((error) => {
      return apiResponse.ErrorResponse(res, error);
    });
}

async function updateCartMinus(req, res) {
  let payload = req.body;
  //   update cart with name
  await Cart.findByIdAndUpdate(payload.id, { qty: payload.qty }, { new: true })
    .then(async (result) => {
      console.log(result);
      return apiResponse.successResponseWithData(res, result);
    })
    .catch((error) => {
      return apiResponse.ErrorResponse(res, error);
    });
}

module.exports = {
  createCart,
  getCart,
  deleteCart,
  updateCart,
  updateCartMinus,
};
