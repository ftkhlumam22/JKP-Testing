const orderModels = require("../../models/store/orderModel");
const apiResponse = require("../../helpers/apiResponse");
const paginateLabel = require("../../helpers/paginateLabel");
const { ObjectId } = require("mongodb");
const cartModel = require("../../models/store/cartModel");
const productModel = require("../../models/store/productModel");
const orderModel = require("../../models/store/orderModel");
const { Parser } = require("json2csv");
const json2csvParser = new Parser();

async function getOrders(req, res) {
  if (req.query.pagination === "false") {
    try {
      const result = await orderModels.find({
        isActive: { $ne: "Success" },
      });
      return apiResponse.successResponseWithData(
        res,
        "berhasil diambil",
        result
      );
    } catch (error) {
      return apiResponse.ErrorResponse(res, error);
    }
  } else {
    let option = {
      page: req.query.page,
      limit: req.query.limit,
      customLabels: paginateLabel,
      populate: "productId user branch",
      sort: { createdAt: -1 },
    };
    let condition = {};
    if (req.query.start_date && req.query.end_date) {
      condition = {
        $and: [],
      };
      condition["$and"].push({
        createdAt: {
          $gte: new Date(req.query.start_date + " 00:00:00"),
          $lt: new Date(req.query.end_date + " 23:59:59"),
        },
      });
      condition["$and"].push({
        isActive: { $ne: "Success" },
      });
    }
    if (req.query.branch) {
      condition = {
        $and: [],
      };
      condition["$and"].push({
        branch: ObjectId(req.query.branch),
      });
    }
    if (req.query.search) {
      condition = {
        $and: [],
      };
      condition["$and"].push({
        name: { $regex: req.query.search, $options: "i" },
      });
    }

    await orderModels
      .paginate(condition, option)
      .then((result) => {
        return apiResponse.successResponseWithDataAndPagination(res, result);
      })
      .catch((error) => {
        return apiResponse.ErrorResponse(res, error);
      });
  }
}

async function createOrders(req, res) {
  try {
    req.body.map(async (item) => {
      let data = {
        status: true,
      };
      await cartModel
        .updateOne(
          {
            _id: item.id,
          },
          {
            $set: data,
          }
        )
        .then((result) => {
          return result;
        })
        .catch((error) => {
          return error;
        });
    });
    const result = await orderModels.create(req.body);
    return apiResponse.successResponseWithData(res, result);
  } catch (error) {
    return apiResponse.ErrorResponse(res, error);
  }
}

async function deleteOrders(req, res) {
  try {
    let data = req.body;
    await productModel.findById(data.productId).then((result) => {
      // update product qty
      const qty = result.qty;
      // product update qty
      productModel
        .findByIdAndUpdate(
          result._id,
          {
            qty: qty + data.qty,
          },
          { new: true }
        )
        .then(async (result) => {
          await orderModels.findByIdAndRemove(data.id).then((result) => {
            return apiResponse.successResponseWithData(res, result);
          });
        })
        .catch((error) => {
          return error;
        });
    });
  } catch (error) {
    return apiResponse.ErrorResponse(res, error);
  }
}

async function updateOrders(req, res) {
  try {
    let data = req.body;
    await productModel.findById(data.productId).then((result) => {
      // update product qty
      const qty = result.qty;
      // product update qty
      productModel
        .findByIdAndUpdate(
          result._id,
          {
            qty: qty - data.qty,
          },
          { new: true }
        )
        .then(async (result) => {
          await orderModel
            .findByIdAndUpdate(data.id, data, { new: true })
            .then((result) => {
              return apiResponse.successResponseWithData(res, result);
            });
        })
        .catch((error) => {
          return error;
        });
    });
  } catch (error) {
    return apiResponse.ErrorResponse(res, error);
  }
}

async function backupOrders(req, res) {
  /* Add Advance Filter Search */
  let condition = {};

  if ((req.query.start_date && req.query.end_date) || req.query.branch) {
    condition = {
      $and: [],
    };
  }
  if (req.query.branch) {
    condition["$and"].push({
      branch: ObjectId(req.query.branch),
    });
  }
  if (req.query.start_date && req.query.end_date) {
    condition["$and"].push({
      createdAt: {
        $gte: new Date(req.query.start_date + " 00:00:00"),
        $lt: new Date(req.query.end_date + " 23:59:59"),
      },
    });
  }

  await orderModel.find(condition).then((result) => {
    let data = [];

    result.map((item) => {
      data.push({
        name: item.name,
        qty: item.qty,
        price: item.price,
        total: item.qty * item.price,
      });
    });

    const csv = json2csvParser.parse(data);

    res.send(csv);
  });
}

module.exports = {
  getOrders,
  createOrders,
  deleteOrders,
  updateOrders,
  backupOrders,
};
