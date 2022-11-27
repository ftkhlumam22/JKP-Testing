const InternationalOrderModel = require("../../models/transaction/internationalOrderModel");
const UserModel = require("../../models/users/userModel");
const apiResponse = require("../../helpers/apiResponse");
const { Parser } = require("json2csv");
const mongoose = require("mongoose"); // Import Library Mongoose
const ObjectId = mongoose.Types.ObjectId;

/**
 * Report Finance Class
 */
class ReportFinanceOrder {
  constructor() {
    //
  }

  async getReportFinance(req, res) {
    /* Cek Tipe User */
    // let users = [];
    // await UserModel.findOne({"_id": req.query.input_by}).then(async result => {
    //     if(result.type_user == 'Admin Pusat'){
    //         await UserModel.find({"type_user": 'Admin Pusat'}).then(res => {
    //             res.map(item => {
    //                 users.push({"input_by": ObjectId(item._id)});
    //             });
    //             users.push({

    //                 input_by_agen: true
    //             })
    //         });
    //     }
    // });

    /* Add Advance Filter Search */
    let condition = {};

    if (
      (req.query.start_date && req.query.end_date) ||
      req.query.status_order ||
      req.query.branch_mutiple ||
      req.query.branch ||
      req.query.type_branch ||
      req.query.status_payment ||
      req.query.cabang_multiple
    ) {
      condition = {
        $and: [],
      };
    }

    if (req.query.status_order) {
      condition["$and"].push({ status_order: req.query.status_order });
    }

    if (req.query.status_payment) {
      condition["$and"].push({ payment_status: req.query.status_payment });
    }

    if (req.query.branch_mutiple) {
      req.query.branch_mutiple.map((item) => {
        condition["$and"].push({ status_order: { $ne: item } });
      });
    }

    if (req.query.type_branch) {
      let type_branch = [];
      req.query.type_branch.map((item) => {
        type_branch.push({
          branch: ObjectId(item),
        });
      });
      condition["$and"].push({
        $or: type_branch,
      });
    }

    if (req.query.cabang_multiple) {
      let cabang_multiple = [];
      req.query.cabang_multiple.map((item) => {
        cabang_multiple.push({
          branch: ObjectId(item),
        });
      });
      condition["$and"].push({
        $or: cabang_multiple,
      });
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
    condition["$and"].push({
      $or: [{ position_order: { $ne: "Agen" } }],
    });
    // condition[0].$match.$and.push({
    //   $or: [
    //     {
    //       status_order: { $nin: ["Hold", "Pending", "Cancel"] },
    //     },
    //   ],
    // });
    // condition[0].$match.$and.push({
    //   $or: [{ position_order: { $ne: "Agen" } }],
    // });

    // if(req.query.input_by){
    //     if(users.length > 0){
    //         condition['$and'].push({
    //             '$or': users
    //         });
    //     }else{
    //         condition['$and'].push({
    //             '$or': [
    //                 {
    //                     "input_by": ObjectId(req.query.input_by)
    //                 },
    //                 {
    //                     input_by_agen: true
    //                 }
    //             ]
    //         });
    //     }
    // }

    await InternationalOrderModel.find(condition)
      .populate("agen")
      .populate("branch")
      .populate("member") // Relasi dengan collection Agen
      .then((result) => {
        let dataReady = [];
        result.map((item) => {
          let data = {
            shipment_number: item.shipment_number,
            sender_name: item.sender_name,
            branch: item.branch ? item.branch.city_name : "-",
            recipient_name: item.recipient_name,
            recipient_destination: item.recipient_destination,
            courier: item.courier,
            awb_no: item.awb_no,
            weight: item.weight,
            amount: item.amount_paid ? item.amount_paid : 0,
            volume: parseInt((item.wide * item.long * item.height) / 5000)
              ? parseInt((item.wide * item.long * item.height) / 5000)
              : item.volume_total
              ? item.volume_total
              : 0,
            pickup: item.pickup_by,
            payment_type: item.payment_type,
            shipment_fee: item.shipment_fee,
            cash: item.total_paid_cash ? item.total_paid_cash : 0,
            transfer: item.total_paid_transfer ? item.total_paid_transfer : 0,
          };

          if (item.agen) {
            data.agen = item.agen.fullname;
          } else {
            data.agen = item.agen_general;
          }

          dataReady.push(data);
        });

        return apiResponse.successResponseWithDataAndPagination(res, dataReady);
      })
      .catch((error) => {
        console.log(error);
        return apiResponse.ErrorResponse(res, error);
      });
  }

  async downloadReportFinance(req, res) {
    /* Cek Tipe User */

    /* Add Advance Filter Search */
    let condition = {};

    if (
      (req.query.start_date && req.query.end_date) ||
      req.query.status_order ||
      req.query.branch_mutiple ||
      req.query.branch ||
      req.query.type_branch ||
      req.query.status_payment ||
      req.query.cabang_multiple
    ) {
      condition = {
        $and: [],
      };
    }
    if (req.query.status_payment) {
      condition["$and"].push({ payment_status: req.query.status_payment });
    }

    if (req.query.status_order) {
      condition["$and"].push({ status_order: req.query.status_order });
    }

    if (req.query.branch_mutiple) {
      req.query.branch_mutiple.map((item) => {
        condition["$and"].push({ status_order: { $ne: item } });
      });
    }

    if (req.query.type_branch) {
      let type_branch = [];
      req.query.type_branch.map((item) => {
        type_branch.push({
          branch: ObjectId(item),
        });
      });
      condition["$and"].push({
        $or: type_branch,
      });
    }

    if (req.query.cabang_multiple) {
      let cabang_multiple = [];
      req.query.cabang_multiple.map((item) => {
        cabang_multiple.push({
          branch: ObjectId(item),
        });
      });
      condition["$and"].push({
        $or: cabang_multiple,
      });
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
    condition["$and"].push({
      $or: [{ position_order: { $ne: "Agen" } }],
    });

    await InternationalOrderModel.find(condition)
      .populate("agen")
      .populate("branch")
      .populate("member")
      .populate("input_by") // Relasi dengan collection Agen
      .then((result) => {
        let dataReady = [];
        result.map((item) => {
          let data = {
            shipment_number: item.shipment_number,
            branch: item.branch.city_name ? item.branch.city_name : "-",
            sender_name: item.sender_name,
            recipient_name: item.recipient_name,
            recipient_destination: item.recipient_destination,
            courier: item.courier,
            awb: item.awb_no,
            weight: item.weight ? item.weight : 0,
            // volume: parseInt((item.wide * item.long * item.height) / 5000),
            volume: parseInt((item.wide * item.long * item.height) / 5000)
              ? parseInt((item.wide * item.long * item.height) / 5000)
              : item.volume_total
              ? item.volume_total
              : 0,
            pickup: item.pickup_by,
            input_by: item.input_by.fullname,
            payment_type: item.payment_type,
            shipment_fee: item.amount_paid,
            createdAt: formatTanggal(item.createdAt),
            cash: item.total_paid_cash ? item.total_paid_cash : 0,
            transfer: item.total_paid_transfer ? item.total_paid_transfer : 0,
          };

          if (item.agen) {
            data.agen = item.agen.fullname;
          } else {
            data.agen = item.agen_general;
          }

          dataReady.push(data);
          // console.log(data);
        });

        const xl = require("excel4node");
        const wb = new xl.Workbook();
        const ws = wb.addWorksheet("Laporan Keuangan Harian");

        const headingColumnNames = [
          "No",
          "No AWB",
          "No Order",
          "Nama Penerima",
          "Nama Pengirim",
          "Negara",
          "Ekspedisi",
          "Berat",
          "Volume",
          "Pembayaran",
          "Tanggal Order",
          "Cabang",
          "Admin",
          "Agen",
          "Pickup",
          "Bayar Jaskipin",
          "Cash",
          "Transfer",
          "Hutang",
        ];

        /* Styling Excel Table */
        var headerStyle = wb.createStyle({
          font: {
            bold: true,
            color: "black",
          },
          alignment: {
            horizontal: "center",
            vertical: "center",
          },
          border: {
            left: {
              style: "thin",
              color: "black",
            },
            right: {
              style: "thin",
              color: "black",
            },
            top: {
              style: "thin",
              color: "black",
            },
            bottom: {
              style: "thin",
              color: "black",
            },
          },
        });

        var contentStyle = wb.createStyle({
          font: {
            bold: false,
            color: "black",
          },
          alignment: {
            horizontal: "center",
            vertical: "center",
          },
          border: {
            left: {
              style: "thin",
              color: "black",
            },
            right: {
              style: "thin",
              color: "black",
            },
            top: {
              style: "thin",
              color: "black",
            },
            bottom: {
              style: "thin",
              color: "black",
            },
          },
        });

        //Write Column Title in Excel file
        let headingColumnIndex = 1;
        headingColumnNames.forEach((heading) => {
          ws.cell(3, headingColumnIndex++)
            .string(heading)
            .style(headerStyle);
        });

        //Write Data in Excel file
        let rowIndex = 4;
        dataReady.map((record) => {
          // let columnIndex = 1;

          ws.cell(rowIndex, 1)
            .number(parseInt(rowIndex - 3))
            .style(contentStyle);
          ws.cell(rowIndex, 2)
            .string(record["awb"] != undefined ? record["awb"] : "-")
            .style(contentStyle);
          ws.cell(rowIndex, 3)
            .string(
              record["shipment_number"] != undefined
                ? record["shipment_number"]
                : "-"
            )
            .style(contentStyle);
          ws.cell(rowIndex, 4)
            .string(record["recipient_name"])
            .style(contentStyle);
          ws.cell(rowIndex, 5)
            .string(record["sender_name"])
            .style(contentStyle);
          ws.cell(rowIndex, 6)
            .string(record["recipient_destination"])
            .style(contentStyle);
          ws.cell(rowIndex, 7).string(record["courier"]).style(contentStyle);
          ws.cell(rowIndex, 8).number(record["weight"]).style(contentStyle);
          ws.cell(rowIndex, 9).number(record["volume"]).style(contentStyle);
          ws.cell(rowIndex, 10)
            .string(
              record["cash"] == 0
                ? "Transfer"
                : record["transfer"] == 0
                ? "Cash"
                : "Cash & Transfer"
            )
            .style(contentStyle);
          ws.cell(rowIndex, 11).string(record["createdAt"]).style(contentStyle);
          ws.cell(rowIndex, 12).string(record["branch"]).style(contentStyle);
          ws.cell(rowIndex, 13).string(record["input_by"]).style(contentStyle);
          ws.cell(rowIndex, 14).string(record["agen"]).style(contentStyle);
          ws.cell(rowIndex, 15).string(record["pickup"]).style(contentStyle);
          ws.cell(rowIndex, 16)
            .number(Number(record["shipment_fee"]))
            .style(contentStyle);
          ws.cell(rowIndex, 17).number(record["cash"]).style(contentStyle);
          ws.cell(rowIndex, 18).number(record["transfer"]).style(contentStyle);
          ws.cell(rowIndex, 19)
            .number(
              Number(
                record["shipment_fee"] -
                  (record["cash"] == 0
                    ? record["transfer"]
                    : record["transfer"] == 0
                    ? record["cash"]
                    : record["cash"] + record["transfer"])
              )
            )
            .style(contentStyle);

          // Object.keys(record ).forEach(columnName => {
          // if(columnName == 'weight' || columnName == 'volume' || columnName == 'shipment_fee') {
          //     ws.cell(rowIndex,columnIndex++)
          //     .number(record [columnName])
          // }else if(columnName == 'awb' && record [columnName] == undefined || columnName == 'awb' && record [columnName] != undefined) {
          //     ws.cell(rowIndex,columnIndex++)
          //     .string('-')
          // }else if(columnName == 'sender_name' || columnName == 'recipient_name' || columnName == 'recipient_destination' || columnName == 'courier' || columnName == 'pickup'){
          //     ws.cell(rowIndex,columnIndex++)
          //     .string(record [columnName])
          // }
          // });
          rowIndex++;
        });

        // Today Date
        let d = new Date();
        const options = { year: "numeric", month: "long", day: "numeric" };
        let today = d.toLocaleString("id-ID", options);

        // Add Header
        ws.cell(1, 1, 1, 19, true)
          .string(today)
          .style({
            alignment: {
              horizontal: "right",
              vertical: "center",
            },
          });
        ws.cell(2, 1, 2, 19, true)
          .string("Keuangan Admin")
          .style({
            alignment: {
              horizontal: "center",
              vertical: "center",
            },
            font: {
              bold: true,
              color: "black",
              size: 30,
            },
          });

        /* Get Total Ongkir Cash & Transfer */

        let total_uang = dataReady.reduce((a, { shipment_fee }) => {
          return a + Number(shipment_fee);
        }, 0);

        let cash_total = dataReady.reduce(
          (total, num) =>
            num.payment_type !== "" && num.shipment_fee !== ""
              ? total + Number(num.cash)
              : total + 0,
          0
        );
        let transfer_total = dataReady.reduce(
          (total, num) =>
            num.payment_type !== "" && num.shipment_fee !== ""
              ? total + Number(num.transfer)
              : total + 0,
          0
        );

        function formatPrice(number) {
          var rupiah = "";
          var angkarev = number.toString().split("").reverse().join("");
          for (var i = 0; i < angkarev.length; i++)
            if (i % 3 == 0) rupiah += angkarev.substr(i, 3) + ".";
          return rupiah
            .split("", rupiah.length - 1)
            .reverse()
            .join("");
        }

        // Add Footer
        ws.cell(rowIndex, 1, rowIndex, 7, true)
          .string("Total Berat")
          .style(contentStyle);
        ws.cell(rowIndex, 8)
          .formula("SUM(H4:H" + (rowIndex - 1).toString() + ")")
          .style(contentStyle);
        ws.cell(rowIndex, 9, rowIndex, 15, true)
          .string("Total")
          .style(contentStyle);
        // ws.cell(rowIndex, 13).string(dataReady.reduce((total, num) => total + parseInt(num.shipment_fee), 0)).style(contentStyle);
        ws.cell(rowIndex, 16)
          .formula("SUM(P4:P" + (rowIndex - 1).toString() + ")")
          .style(contentStyle);
        ws.cell(rowIndex, 17)
          .formula("SUM(Q4:Q" + (rowIndex - 1).toString() + ")")
          .style(contentStyle);
        ws.cell(rowIndex, 18)
          .formula("SUM(R4:R" + (rowIndex - 1).toString() + ")")
          .style(contentStyle);
        ws.cell(rowIndex, 19)
          .formula("SUM(S4:S" + (rowIndex - 1).toString() + ")")
          .style(contentStyle);
        ws.cell(rowIndex + 1, 1, rowIndex + 1, 13, true).string(
          "Pembayaran Cash = Rp" + formatPrice(cash_total).toString()
        );
        ws.cell(rowIndex + 2, 1, rowIndex + 2, 13, true).string(
          "Pembayaran Transfer = Rp" + formatPrice(transfer_total).toString()
        );
        ws.cell(rowIndex + 3, 1, rowIndex + 3, 13, true).string(
          "Hutang = Rp" +
            formatPrice(total_uang - cash_total - transfer_total).toString()
        );
        ws.cell(rowIndex + 4, 1, rowIndex + 4, 13, true).string(
          "*Mohon di cek dan informasikan jika ada ketidaksesuaian data"
        );
        ws.cell(rowIndex + 5, 1, rowIndex + 5, 13, true).string(
          "Cirebon, " + today
        );
        ws.cell(rowIndex + 6, 1, rowIndex + 6, 13, true).string(
          req.query.admin
        );

        wb.write("uploads/LaporanKeuangan.xlsx");

        // const file = `./LaporanKeuangan.xlsx`;
        // res.download(file); // Set disposition and send it.

        // const fields = [
        //     {
        //         label: 'Nama Pengirim',
        //         value: 'sender_name'
        //     },
        //     {
        //         label: 'Nama Penerima',
        //         value: 'recipient_name'
        //     },
        //     {
        //         label: 'Negara Tujuan',
        //         value: 'recipient_destination'
        //     },
        //     {
        //         label: 'Mitra Ekspedisi',
        //         value: 'courier'
        //     },
        //     {
        //         label: 'Resi',
        //         value: 'awb'
        //     },
        //     {
        //         label: 'Berat',
        //         value: 'weight'
        //     },
        //     {
        //         label: 'Volume',
        //         value: 'volume'
        //     },
        //     {
        //         label: 'Agen',
        //         value: 'agen'
        //     },
        //     {
        //         label: 'Pickup',
        //         value: 'pickup'
        //     },
        // ]

        // function downloadResource(res, fileName, fields, data) {
        //     const json2csv = new Parser({ fields });
        //     const csv = json2csv.parse(data);
        //     res.header('Content-Type', 'text/csv');
        //     res.attachment(fileName);
        //     return res.send(csv);
        // }

        // return downloadResource(res, 'laporan-keuangan.csv', fields, dataReady);
        return apiResponse.successResponseWithDataAndPagination(
          res,
          "Download Sukses"
        );
      })
      .catch((error) => {
        console.log(error);
        return apiResponse.ErrorResponse(res, error);
      });
  }
}
function formatTanggal(value) {
  let options = { year: "numeric", month: "long", day: "numeric" };
  let date = new Date(value).toLocaleString("id-ID", options);
  return date;
}

module.exports = ReportFinanceOrder;
