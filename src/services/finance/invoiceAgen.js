const UserModel = require("../../models/users/userModel");
const InvoiceAgenModel = require("../../models/finance/invoiceAgenModel");
const InternationalOrderModel = require("../../models/transaction/internationalOrderModel");
const apiResponse = require("../../helpers/apiResponse");
const paginateLabel = require("../../helpers/paginateLabel");
const { Parser } = require("json2csv");
const json2csvParser = new Parser();
const csv = require("csvtojson");
const { ObjectId } = require("mongodb");

/**
 * Piutang Member Class
 */
class InvoiceAgen {
  constructor() {
    //
  }
  async createInvoiceAgen(req, res) {
    console.log(req.body);
    let data = {
      invoice_number: req.body.invoice_number,
      customer: req.body.customer,
      invoice_date: req.body.invoice_date,
      invoice_due_date: req.body.invoice_due_date,
      transaction: req.body.transaction.map((item) => item.id),
    };
    await InvoiceAgenModel.create(data)
      .then((result) => {
        return apiResponse.successResponseWithData(
          res,
          "Data Berhasil Dibuat",
          result
        );
      })
      .catch((error) => {
        return apiResponse.ErrorResponse(res, error);
      });
  }

  async getLastRecordInvoice(req, res) {
    await InvoiceAgenModel.find(
      { invoice_number: { $exists: true, $ne: "" } },
      function (err, item) {
        return apiResponse.successResponseWithData(
          res,
          "Data Berhasil Diambil",
          item
        );
      }
    )
      .limit(1)
      .sort({ invoice_number: -1 });
  }

  // List Invoice mitra
  async getListInvoiceMitra(req, res) {
    if (req.query.pagination === "false") {
      await InvoiceAgenModel.find()
        .populate("transaction")
        .then((result) => {
          return apiResponse.successResponseWithData(
            res,
            "Get Data Berhasil",
            result
          );
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
            path: "input_by",
          },
        },
        customLabels: paginateLabel,
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
      }
      if (req.query.search) {
        condition["$and"].push({
          $or: [
            {
              invoice_number: { $regex: req.query.search, $options: "i" },
            },
            {
              customer: { $regex: req.query.search, $options: "i" },
            },
          ],
        });
      }
      await InvoiceAgenModel.paginate(condition, options)
        .then((result) => {
          return apiResponse.successResponseWithDataAndPagination(res, result);
        })
        .catch((error) => {
          return apiResponse.ErrorResponse(res, error);
        });
    }
  }
  /* Get Piutang Member */
  async getInvoiceAgen(req, res) {
    if (req.query.pagination === "false") {
      // jika tidak ada pagination
      await InternationalOrderModel.find()
        .then((result) => {
          return apiResponse.successResponseWithData(
            res,
            "Get Piutang Member Berhasil",
            result
          );
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

  /* Get Detail List Piutang Member */
  async getDetailListInvoiceAgen(req, res) {
    if (req.query.pagination === "false") {
      await InternationalOrderModel.find()
        .then((result) => {
          return apiResponse.successResponseWithData(res, result);
        })
        .catch((error) => {
          return apiResponse.ErrorResponse(res, error);
        });
    } else {
      await InternationalOrderModel.find({
        payment_status: { $ne: "Lunas" },
        agen_general: req.query.customer,
        createdAt: {
          $gte: new Date(req.query.start_date + " 00:00:00"),
          $lt: new Date(req.query.end_date + " 23:59:59"),
        },
      })
        .populate("branch")
        .then((result) => {
          return apiResponse.successResponseWithDataAndPagination(res, result);
        })
        .catch((error) => {
          return apiResponse.ErrorResponse(res, error);
        });
    }
  }

  /* Bayar Piutang Member */
  async payInvoiceAgen(req, res) {
    // return new Promise(async (resolve, reject) => {
    Promise.all(
      req.body.map(async (item) => {
        let data = {
          payment_date: item.payment_date ? item.payment_date : new Date(),
          total_paid_cash: item.total_paid_cash,
          total_paid_transfer: item.total_paid_transfer,
          payment_date: item.payment_date,
          bank: item.bank,
        };
        // payment date

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
    )
      .then((items) => {
        return apiResponse.successResponse(
          res,
          "Pembayaran Piutang Member Berhasil"
        );
      })
      .catch((error) => {
        return apiResponse.ErrorResponse(res, error);
      });
  }

  // /* Export Template untuk Import */
  async exportTemplateInvoiceAgen(req, res) {
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
      condition["$and"].push({
        payment_status: { $ne: "Lunas" },
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
        if (result.length === 0) {
          return "Data tidak ditemukan";
        } else {
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
              total_paid_cash: "",
              total_paid_transfer: "",
              // payment_status: "Lunas",
            });
          });

          const csv = json2csvParser.parse(data);

          res.send(csv);
        }
      })
      .catch((error) => {
        return error;
      });
  }

  /* Import */
  async importInvoiceAgen(req, res) {
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
                payment_date: item.payment_date
                  ? new Date(item.payment_date + " 00:00:00")
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

  // total pelanggan
  async totalPiutangPelanggan(req, res) {
    let condition = [
      {
        $match: {
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
          $and: [
            // {
            //   branch: ObjectId(req.query.branch),
            // },
            // {
            //   payment_status: { $ne: "Lunas" },
            // },
            {
              agen: { $exists: false },
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

  async totalPiutangPelangganAll(req, res) {
    let condition = [
      {
        $match: {
          $and: [
            {
              payment_status: { $ne: "Lunas" },
            },
            {
              agen: { $exists: false },
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

async function getTotalPaymentStatus(id, type, start_date, end_date, branch) {
  let _result;

  await InternationalOrderModel.find({
    $and: [
      { agen_general: id },
      {
        payment_status: type,
      },
      {
        createdAt: {
          $gte: new Date(start_date + " 00:00:00"),
          $lt: new Date(end_date + " 23:59:59"),
        },
      },
      {
        branch:
          branch == "" && branch !== "all"
            ? ObjectId(branch)
            : { $exists: true },
      },
    ],
  })
    .countDocuments()
    .then((result) => {
      _result = result;
    });
  return _result ? _result : 0;
}

function formatDate(value) {
  let options = { year: "numeric", month: "long", day: "numeric" };
  let date = new Date(value).toLocaleString("id-ID", options);
  return date;
}

module.exports = InvoiceAgen;
