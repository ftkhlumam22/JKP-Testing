// const AgenModel = require('../../models/users/agenModel');
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
class bayarHpp {
  constructor() {
    //
  }

  /* Get Pembayaran Hpp */
  async getPembayaranHpp(req, res) {
    if (req.query.pagination === "false") {
      // jika tidak ada pagination
      await InternationalOrderModel.find()
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
    } else {
      // jika ada pagination

      let condition = [
        {
          $match: {
            $and: [
              {
                createdAt: {
                  $gte: new Date(req.query.start_date + " 00:00:00"),
                  $lt: new Date(req.query.end_date + " 23:59:59"),
                },
              },
            ],
          },
        },
        {
          $lookup: {
            from: "couriers",
            localField: "courier",
            foreignField: "courier_name",
            as: "result_courier",
          },
        },
        {
          $unwind: "$result_courier",
        },
        {
          $match: {
            $or: [{ cogs: { $exists: false } }, { cogs: 0 }],
            // cogs: 0,
          },
        },
        {
          $group: {
            _id: "$courier",
            total: { $sum: 1 },
            mitra: { $max: "$result_courier.courier_name" },
          },
        },
        {
          $sort: { _id: 1 },
        },
        {
          $project: {
            mitra: 1,
            total: 1,
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

  /* detail HPP */
  async getDetailHpp(req, res) {
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
        $and: [
          {
            $or: [{ cogs: { $exists: false } }, { cogs: 0 }],
          },
          {
            createdAt: {
              $gte: new Date(req.query.start_date + " 00:00:00"),
              $lt: new Date(req.query.end_date + " 23:59:59"),
            },
          },
          {
            courier: req.query.courier,
          },
        ],
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

  // bayar hpp
  async payHpp(req, res) {
    // return new Promise(async (resolve, reject) => {
    Promise.all(
      req.body.map(async (item) => {
        let data = {
          basic_rate: item.basic_rate,
          cogs: Math.floor(
            Number((1.1 / 100) * item.basic_rate) + Number(item.basic_rate)
          ),
        };

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
      return apiResponse.successResponse(res, "Pembayaran Hpp Berhasil");
    });
  }

  // export hpp
  async exportTemplateHpp(req, res) {
    /* Add Advance Filter Search */

    await InternationalOrderModel.find({
      $and: [
        {
          $or: [{ cogs: { $exists: false } }, { cogs: 0 }],
        },
        {
          updatedAt: {
            $gte: new Date(req.query.start_date + " 00:00:00"),
            $lt: new Date(req.query.end_date + " 23:59:59"),
          },
        },
        {
          courier: req.query.courier,
        },
      ],
    })
      .populate("agen")
      .then((result) => {
        let data = [];

        result.map((item) => {
          data.push({
            no_order: item.shipment_number,
            awb_no: item.awb_no,
            recipient_name: item.recipient_name,
            recipient_destination: item.recipient_destination,
            weight: item.weight,
            volume_total: item.volume_total,
            service_type: item.service_type,
            courier: item.courier,
            createdAt: formatDate(item.createdAt),
            amount_paid: item.amount_paid,
            basic_rate: item.basic_rate,
          });
        });

        const csv = json2csvParser.parse(data);

        res.send(csv);
      });
  }

  async importTransaksiHpp(req, res) {
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
                no_order: item.shipment_number,
                awb_no: item.awb_no,
                recipient_name: item.recipient_name,
                recipient_destination: item.recipient_destination,
                weight: item.weight,
                volume_total: item.volume_total,
                service_type: item.service_type,
                courier: item.courier,
                amount_paid: item.amount_paid,
                cogs: Math.floor(
                  Number((1.1 / 100) * item.basic_rate) +
                    Number(item.basic_rate)
                ),
                basic_rate: item.basic_rate,
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

module.exports = bayarHpp;
