const UtangMitraModel = require("../../models/finance/utangMitraModel");
const InternationalOrderModel = require("../../models/transaction/internationalOrderModel");
const apiResponse = require("../../helpers/apiResponse");
const paginateLabel = require("../../helpers/paginateLabel");
const { Parser } = require("json2csv");
const json2csvParser = new Parser();
const csv = require("csvtojson");
const mongoose = require("mongoose"); // Import Library Mongoose
const ObjectId = mongoose.Types.ObjectId;

/**
 * Utang Mitra Class
 */
class UtangAdmin {
  constructor() {
    //
  }

  /* Create UtangMitra */
  async createUtangMitra(req, res) {
    await UtangMitraModel.create(req.body)
      .then(async (result) => {
        await InternationalOrderModel.findOneAndUpdate(
          { _id: req.body.transaction },
          { tagihan_mitra: result._id }
        )
          .then((response) => {
            return apiResponse.successResponse(res, "Data Berhasil Dibuat");
          })
          .catch((error) => {
            console.log(error);
          });
      })
      .catch((error) => {
        return apiResponse.ErrorResponse(res, error);
      });
  }

  /* List Utang Admin */
  async listUtangAdmin(req, res) {
    if (req.query.pagination === "false") {
      await UtangMitraModel.find()
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
        customLabels: paginateLabel,
        populate: "tagihan_mitra agen branch",
        sort: {
          createdAt: -1,
        },
      };

      /* Add Filter Search */
      let condition = {};
      if (
        req.query.search ||
        (req.query.start_date && req.query.end_date) ||
        req.query.branch ||
        req.query.agen ||
        req.query.agen_multiple
      ) {
        condition = {
          $and: [],
        };
      }
      if (req.query.start_date && req.query.end_date) {
        condition["$and"].push({
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
        });
      }

      if (req.query.branch) {
        condition["$and"].push({
          branch: ObjectId(req.query.branch),
        });
      }

      if (req.query.agen) {
        condition["$and"].push({
          agen: ObjectId(req.query.agen),
        });
      }

      if (req.query.agen_multiple) {
        let agen_multiple = [];
        req.query.agen_multiple.map((item) => {
          agen_multiple.push({
            agen_general: item,
          });
        });
        condition["$and"].push({
          $or: agen_multiple,
        });
      }

      if (req.query.search) {
        condition["$and"].push({
          $or: [
            {
              shipment_number: { $regex: req.query.search, $options: "i" },
            },
            {
              sender_name: { $regex: req.query.search, $options: "i" },
            },
            {
              recipient_name: { $regex: req.query.search, $options: "i" },
            },
            {
              awb_no: { $regex: req.query.search, $options: "i" },
            },
            {
              payment_status: { $regex: req.query.search, $options: "i" },
            },
          ],
        });
      }

      await InternationalOrderModel.paginate(condition, options)
        .then((result) => {
          return apiResponse.successResponseWithDataAndPagination(res, result);
        })
        .catch((error) => {
          return apiResponse.ErrorResponse(res, error);
        });
    }
  }

  /* Get UtangMitra by Id */
  async getUtangAdmin(req, res) {
    await InternationalOrderModel.find({
      _id: req.params.id,
    })
      .populate(["tagihan_mitra", "agen", "branch"])
      .then((result) => {
        return apiResponse.successResponseWithData(
          res,
          "Data Berhasil Diambil",
          result
        );
      })
      .catch((error) => {
        return apiResponse.ErrorResponse(res, error);
      });
  }

  /* Update UtangMitra by ID */
  async updateUtangAdmin(req, res) {
    await InternationalOrderModel.updateOne(
      {
        _id: req.params.id,
      },
      {
        $set: req.body,
      }
    )
      .then((result) => {
        return apiResponse.successResponse(res, "Data Berhasil Diubah");
      })
      .catch((error) => {
        return apiResponse.ErrorResponse(res, error);
      });
  }

  /* Delete UtangMitra by ID */
  async deleteUtangMitra(req, res) {
    await UtangMitraModel.deleteOne({
      _id: req.params.id,
    })
      .then((result) => {
        return apiResponse.successResponse(res, "Data Berhasil Dihapus");
      })
      .catch((error) => {
        return apiResponse.ErrorResponse(res, error);
      });
  }

  // /* Export Template untuk Import */
  async exportTemplateUtangMitra(req, res) {
    /* Add Advance Filter Search */
    let condition = {};

    if (req.query.start_date && req.query.end_date) {
      condition = {
        $and: [],
      };
    }

    if (req.query.start_date && req.query.end_date) {
      condition["$and"].push({
        createdAt: {
          $gte: new Date(req.query.start_date + " 00:00:00"),
          $lt: new Date(req.query.end_date + " 23:59:59"),
        },
      });
    }

    await InternationalOrderModel.find(condition)
      .populate("tagihan_mitra")
      .then((result) => {
        let data = [];

        result.map((item) => {
          if (
            req.query.status &&
            item.tagihan_mitra &&
            req.query.status === item.tagihan_mitra.status
          ) {
            data.push({
              no_order: item.shipment_number,
              invoice_number:
                item.tagihan_mitra && item.tagihan_mitra.invoice_number
                  ? item.tagihan_mitra.invoice_number
                  : "",
              cogs:
                item.tagihan_mitra && item.tagihan_mitra.cogs
                  ? item.tagihan_mitra.cogs
                  : "",
              total_amount:
                item.tagihan_mitra && item.tagihan_mitra.total_amount
                  ? item.tagihan_mitra.total_amount
                  : "",
              payment_date:
                item.tagihan_mitra && item.tagihan_mitra.payment_date
                  ? item.tagihan_mitra.payment_date
                  : "",
              payment_type:
                item.tagihan_mitra && item.tagihan_mitra.payment_type
                  ? item.tagihan_mitra.payment_type
                  : "",
              status:
                item.tagihan_mitra && item.tagihan_mitra.status
                  ? item.tagihan_mitra.status
                  : "",
              transaction: item.id,
            });
          } else {
            data.push({
              no_order: item.shipment_number,
              invoice_number:
                item.tagihan_mitra && item.tagihan_mitra.invoice_number
                  ? item.tagihan_mitra.invoice_number
                  : "",
              cogs:
                item.tagihan_mitra && item.tagihan_mitra.cogs
                  ? item.tagihan_mitra.cogs
                  : "",
              total_amount:
                item.tagihan_mitra && item.tagihan_mitra.total_amount
                  ? item.tagihan_mitra.total_amount
                  : "",
              payment_date:
                item.tagihan_mitra && item.tagihan_mitra.payment_date
                  ? item.tagihan_mitra.payment_date
                  : "",
              payment_type:
                item.tagihan_mitra && item.tagihan_mitra.payment_type
                  ? item.tagihan_mitra.payment_type
                  : "",
              status:
                item.tagihan_mitra && item.tagihan_mitra.status
                  ? item.tagihan_mitra.status
                  : "",
              transaction: item.id,
            });
          }
        });

        const csv = json2csvParser.parse(data);

        res.send(csv);
      });
  }

  /* Import */
  async importUtangMitra(req, res) {
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
                invoice_number: item.invoice_number,
                cogs: item.cogs,
                total_amount: item.total_amount,
                payment_date: new Date(item.payment_date),
                payment_type: item.payment_type,
                status: item.status,
                transaction: item.transaction,
              };

              return UtangMitraModel.create(data)
                .then(async (result) => {
                  await InternationalOrderModel.findOneAndUpdate(
                    { _id: item.transaction },
                    { tagihan_mitra: result._id }
                  );
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
}

module.exports = UtangAdmin;
