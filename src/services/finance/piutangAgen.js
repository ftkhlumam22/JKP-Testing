// const AgenModel = require('../../models/users/agenModel');
const UserModel = require("../../models/users/userModel");
const InternationalOrderModel = require("../../models/transaction/internationalOrderModel");
const apiResponse = require("../../helpers/apiResponse");
const paginateLabel = require("../../helpers/paginateLabel");
const { Parser } = require("json2csv");
const json2csvParser = new Parser();
const csv = require("csvtojson");
const { ObjectId } = require("mongodb");

/**
 * Piutang Agen Report Class
 */
class PiutangAgen {
  constructor() {
    //
  }

  /* Get Piutang Agen */
  async getPiutangAgen(req, res) {
    if (req.query.pagination === "false") {
      await UserModel.find()
        .populate("transaction branch") // Relasikan dari field yg sudah didefinisikan di model agen
        .then((result) => {
          return apiResponse.successResponseWithDataAndPagination(res, result);
        })
        .catch((error) => {
          return apiResponse.ErrorResponse(res, error);
        });
    } else {
      const options = {
        page: req.query.page,
        limit: req.query.limit,
        populate: {
          path: "transaction",
          populate: {
            path: "branch",
          },
        },
        customLabels: paginateLabel,
      };
      /* Add Filter Search */
      // var condition = req.query.search ? { $text: { $search: req.query.search } } : {}

      /* Add Advance Filter Search */
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
      }

      if (req.query.search) {
        condition = {
          $and: [],
        };

        condition["$and"].push({
          transaction: { $exists: true, $ne: [] },
        });

        condition["$and"].push({
          type_user: { $regex: ".*Agen.*" },
        });
      } else {
        condition = {
          $and: [],
        };

        condition["$and"].push({
          transaction: { $exists: true, $ne: [] },
        });

        condition["$and"].push({
          type_user: { $regex: ".*Agen.*" },
        });
      }
      if (req.query.branch && req.query.branch !== "all") {
        condition["$and"].push({
          branch: ObjectId(req.query.branch),
        });
      }

      if (req.query.search) {
        condition["$and"].push({
          $or: [
            {
              fullname: { $regex: req.query.search, $options: "i" },
            },
            {
              email: { $regex: req.query.search, $options: "i" },
            },
          ],
        });
      }

      await UserModel.paginate(condition, options)
        .then((result) => {
          return apiResponse.successResponseWithDataAndPagination(res, result);
        })
        .catch((error) => {
          return apiResponse.ErrorResponse(res, error);
        });
    }
  }

  /* Bayar Piutang Agen */
  async payPiutangAgen(req, res) {
    // return new Promise(async (resolve, reject) => {
    Promise.all(
      req.body.map(async (item) => {
        let data = {
          payment_date: new Date(item.payment_date)
            ? new Date(item.payment_date)
            : new Date(),
          total_paid_cash: item.total_paid_cash,
          total_paid_transfer: item.total_paid_transfer,
          payment_type: item.payment_type,
          bank: item.bank,
        };

        if (
          item.total_paid_cash + item.total_paid_transfer ===
            item.amount_paid ||
          item.total_paid_cash + item.total_paid_transfer > item.amount_paid
        ) {
          data.payment_status = "Lunas";
        } else if (
          item.total_paid_cash + item.total_paid_transfer < item.amount_paid &&
          item.total_paid_cash + item.total_paid_transfer > 0
        ) {
          data.payment_status = "Belum Lunas";
        } else {
          data.payment_status = "Belum Bayar";
        }

        await InternationalOrderModel.updateOne(
          {
            _id: item.id,
          },
          {
            $set: data,
          }
        );
      })
    ).then((items) => {
      return apiResponse.successResponse(
        res,
        "Pembayaran Piutang Agen Berhasil"
      );
    });
  }

  // /* Export Template untuk Import */
  async exportTemplatePiutangAgen(req, res) {
    /* Add Advance Filter Search */
    let condition = {
      $and: [],
    };

    if (req.query.start_date && req.query.end_date) {
      condition["$and"].push({
        createdAt: {
          $gte: new Date(req.query.start_date + " 00:00:00"),
          $lt: new Date(req.query.end_date + " 23:59:59"),
        },
      });
    }

    if (req.query.agen && req.query.agen !== "all") {
      condition["$and"].push({
        agen: ObjectId(req.query.agen),
      });
    }
    if (req.query.branch && req.query.branch !== "all") {
      condition["$and"].push({
        branch: ObjectId(req.query.branch),
      });
    }

    await InternationalOrderModel.find(condition)
      .populate(["agen", "branch"])
      .then((result) => {
        console.log(result);
        let data = [];

        result.map((item) => {
          data.push({
            no_order: item.shipment_number,
            awb_no: item.awb_no,
            recipient_name: item.recipient_name,
            sender_name: item.sender_name,
            agen: item.agen ? item.agen.fullname : item.agen_general,
            amount_paid: item.amount_paid,
            create_order: formatDate(item.createdAt),
            total_paid_cash: item.total_paid_cash,
            total_paid_transfer: item.total_paid_transfer,
            // payment_status: "Lunas",
          });
        });

        const csv = json2csvParser.parse(data);

        res.send(csv);
      })
      .catch((error) => {
        return error;
      });
  }

  /* Import */
  async importPiutangAgen(req, res) {
    importCsvData2MongoDB(String(req.file.buffer));

    // -> Import CSV File to MongoDB database
    function importCsvData2MongoDB(filePath) {
      csv()
        .fromString(filePath)
        .then((jsonObj) => {
          // console.log(jsonObj);

          // Insert Json-Object to MongoDB
          Promise.all(
            jsonObj.map(async (item) => {
              let data = {
                payment_date: new Date(item.payment_date)
                  ? new Date(item.payment_date)
                  : new Date(),
                total_paid_cash: item.total_paid_cash
                  ? item.total_paid_cash
                  : 0,
                total_paid_transfer: item.total_paid_transfer
                  ? item.total_paid_transfer
                  : 0,
                payment_status:
                  item.total_paid_cash + item.total_paid_transfer ===
                    item.amount_paid ||
                  item.total_paid_cash + item.total_paid_transfer >
                    item.amount_paid
                    ? "Lunas"
                    : "Belum Lunas",
              };

              return InternationalOrderModel.updateOne(
                {
                  shipment_number: item.no_order,
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
            })
          ).then((items) => {
            items.forEach((item) => {
              if (item.error) {
                return apiResponse.ErrorResponse(res, item.error);
              } else {
                return apiResponse.successResponse(res, "Data Berhasil Dibuat");
              }
            });
          });
        });
    }
  }

  async totalPiutangAgen(req, res) {
    let condition = [
      {
        $match: {
          $and: [
            {
              $or: [
                {
                  $and: [
                    {
                      input_by_agen: { $eq: false },
                    },
                    {
                      createdAt: {
                        $gte: new Date(req.query.start_date + " 00:00:00"),
                        $lt: new Date(req.query.end_date + " 23:59:59"),
                      },
                    },
                  ],
                },

                {
                  $and: [
                    {
                      input_by_agen: { $eq: true },
                    },
                    {
                      awb_input_date: {
                        $gte: new Date(req.query.start_date + " 00:00:00"),
                        $lt: new Date(req.query.end_date + " 23:59:59"),
                      },
                    },
                  ],
                },
              ],
            },
            // {
            //   branch: ObjectId(req.query.branch),
            // },
            // {
            //   payment_status: { $ne: "Lunas" },
            // },
            {
              agen: { $exists: true },
            },
            {
              status_order: { $nin: ["Hold", "Pending", "Cancel"] },
            },
            { position_order: { $ne: "Agen" } },
          ],
        },
      },
      {
        $group: {
          _id: null,
          total_amount: { $sum: "$amount_paid" },
          total_paid_cash: { $sum: "$total_paid_cash" },
          total_paid_transfer: { $sum: "$total_paid_transfer" },
          total_transaction: { $sum: 1 },
        },
      },
    ];
    await InternationalOrderModel.aggregate(condition)
      .then((result) => {
        return apiResponse.successResponseWithData(res, "data", result);
      })
      .catch((error) => {
        return apiResponse.ErrorResponse(res, error);
      });
  }

  async totalPiutangAgenAll(req, res) {
    let condition = [
      {
        $match: {
          $and: [
            {
              payment_status: { $ne: "Lunas" },
            },
            {
              agen: { $exists: true },
            },
            {
              status_order: { $nin: ["Hold", "Pending", "Cancel"] },
            },
            { position_order: { $ne: "Agen" } },
          ],
        },
      },
      {
        $group: {
          _id: null,
          total_amount: { $sum: "$amount_paid" },
          total_paid_cash: { $sum: "$total_paid_cash" },
          total_paid_transfer: { $sum: "$total_paid_transfer" },
          total_transaction: { $sum: 1 },
        },
      },
    ];
    await InternationalOrderModel.aggregate(condition)
      .then((result) => {
        return apiResponse.successResponseWithData(res, "data", result);
      })
      .catch((error) => {
        return apiResponse.ErrorResponse(res, error);
      });
  }
}

function formatDate(date) {
  var d = new Date(date),
    month = "" + (d.getMonth() + 1),
    day = "" + d.getDate(),
    year = d.getFullYear();

  if (month.length < 2) month = "0" + month;
  if (day.length < 2) day = "0" + day;

  return [year, month, day].join("-");
}

module.exports = PiutangAgen;
