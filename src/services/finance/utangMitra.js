const UtangMitraModel = require("../../models/finance/utangMitraModel");
const InternationalOrderModel = require("../../models/transaction/internationalOrderModel");
const apiResponse = require("../../helpers/apiResponse");
const paginateLabel = require("../../helpers/paginateLabel");
const { Parser } = require("json2csv");
const json2csvParser = new Parser();
const csv = require("csvtojson");

/**
 * Utang Mitra Class
 */
class UtangMitra {
  constructor() {
    //
  }

  async countAllMitra(req, res) {
    try {
      let condition = {};

      if ((req.query.start_date && req.query.end_date) || req.query.courier) {
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
      if (req.query.courier) {
        condition["$and"].push({
          courier: req.query.courier,
        });
      }

      await InternationalOrderModel.find(condition)
        .populate("tagihan_mitra")
        .then((result) => {
          let data = [];
          result.map((item) => {
            data.push({
              mitra: item.courier,
              status: item.tagihan_mitra
                ? item.tagihan_mitra.status
                : "BELUM BAYAR",
              cogs: item.cogs ? item.cogs : "",
              bayar_mitra: item.tagihan_mitra ? item.tagihan_mitra.cogs : 0,
            });
          });
          return apiResponse.successResponseWithData(
            res,
            "Data berhasil",
            data
          );
        });
    } catch (error) {
      console.log(error);
    }
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

  /* List UtangMitra */
  async listUtangMitra(req, res) {
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
        populate: "tagihan_mitra",
        sort: { createdAt: -1 },
      };

      /* Add Filter Search */
      var condition = {};
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

      if (req.query.filter_mitra) {
        condition = {
          $and: [],
        };
        condition["$and"].push({
          courier: req.query.filter_mitra,
        });
      }

      if (req.query.search) {
        condition = {
          $and: [],
        };
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
  async getUtangMitra(req, res) {
    await InternationalOrderModel.find({
      _id: req.params.id,
    })
      .populate("tagihan_mitra")
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
  async updateUtangMitra(req, res) {
    let payload = req.body;
    await UtangMitraModel.updateOne(
      {
        _id: req.params.id,
      },
      {
        $set: payload,
      }
    )
      .then(async (result) => {
        await InternationalOrderModel.updateOne(
          {
            _id: payload.transaction,
          },
          {
            cogs: Math.floor(
              Number((1.1 / 100) * payload.basic_rate) +
                Number(payload.basic_rate)
            ),
            basic_rate: payload.basic_rate,
          }
        ).then((res) => {
          console.log(res);
        });
        return apiResponse.successResponse(res, "Data Berhasil Diubah");
      })
      .catch((error) => {
        return apiResponse.ErrorResponse(res, error);
      });
    console.log(req.body);
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
    try {
      let condition = {};

      if ((req.query.start_date && req.query.end_date) || req.query.courier) {
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
      if (req.query.courier) {
        condition["$and"].push({
          courier: req.query.courier,
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
                transaction: item.id,
                no_order: item.shipment_number,
                courier: item.courier && item.courier ? item.courier : "",
                createdAt:
                  item.createdAt && item.createdAt ? item.createdAt : "",
                invoice_number:
                  item.tagihan_mitra && item.tagihan_mitra.invoice_number
                    ? item.tagihan_mitra.invoice_number
                    : "",
                awb_no: item.awb_no && item.awb_no ? item.awb_no : "",
                cogs: item.cogs && item.cogs ? item.cogs : "",
                total_amount:
                  item.tagihan_mitra && item.tagihan_mitra.total_amount
                    ? item.tagihan_mitra.total_amount
                    : "",

                payment_type:
                  item.tagihan_mitra && item.tagihan_mitra.payment_type
                    ? item.tagihan_mitra.payment_type
                    : "",
                status:
                  item.tagihan_mitra && item.tagihan_mitra.status
                    ? item.tagihan_mitra.status
                    : "",
              });
            } else {
              data.push({
                transaction: item.id,
                no_order: item.shipment_number,
                courier: item.courier && item.courier ? item.courier : "",
                createdAt:
                  item.createdAt && item.createdAt ? item.createdAt : "",
                invoice_number:
                  item.tagihan_mitra && item.tagihan_mitra.invoice_number
                    ? item.tagihan_mitra.invoice_number
                    : "",
                awb_no: item.awb_no ? item.awb_no : "",
                cogs: item.cogs ? item.cogs : "",
                total_amount:
                  item.tagihan_mitra && item.tagihan_mitra.total_amount
                    ? item.tagihan_mitra.total_amount
                    : "",

                payment_type:
                  item.tagihan_mitra && item.tagihan_mitra.payment_type
                    ? item.tagihan_mitra.payment_type
                    : "",
                status:
                  item.tagihan_mitra && item.tagihan_mitra.status
                    ? item.tagihan_mitra.status
                    : "",
              });
            }
          });

          const csv = json2csvParser.parse(data);

          res.send(csv);
        });
    } catch (error) {
      console.log(error);
    }
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
                courier: item.courier,
                total_amount: item.total_amount,
                payment_date: formatDate(new Date()),
                payment_type: item.payment_type,
                status: item.status,
                transaction: item.transaction,
              };

              return UtangMitraModel.create(data)
                .then(async (result) => {
                  await InternationalOrderModel.findOneAndUpdate(
                    { _id: item.transaction },
                    {
                      tagihan_mitra: result._id,
                    }
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

function formatDate(date) {
  var d = new Date(date),
    month = "" + (d.getMonth() + 1),
    day = "" + d.getDate(),
    year = d.getFullYear();

  if (month.length < 2) month = "0" + month;
  if (day.length < 2) day = "0" + day;

  return [year, month, day].join("-");
}

module.exports = UtangMitra;
