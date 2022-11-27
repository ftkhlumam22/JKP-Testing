const DomesticOrderModel = require("../../models/transaction/domesticOrderModel");
const UserModel = require("../../models/users/userModel");
const apiResponse = require("../../helpers/apiResponse");
const paginateLabel = require("../../helpers/paginateLabel");
const mongoose = require("mongoose"); // Import Library Mongoose
const ObjectId = mongoose.Types.ObjectId;

class incomeDomestik {
  constructor() {
    //
  }

  /* Get Omzet */
  async getOmzetDomestik(req, res) {
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
        $group: {
          _id: null,
          amount_paid: { $sum: "$shipment_fee" },
        },
      },
    ];

    if (req.query.branch) {
      condition[0].$match.$and.push({
        branch: ObjectId(req.query.branch),
      });
    }

    // if (req.query.master_agen) {
    //   condition[0].$match.$and.push({
    //     $or: [
    //       {
    //         input_by: ObjectId(req.query.input_by),
    //       },
    //       {
    //         master_agen: ObjectId(req.query.master_agen),
    //       },
    //     ],
    //   });
    // }

    await DomesticOrderModel.aggregate(condition)
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

  /* Get Order */
  async getOrderDomestik(req, res) {
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
          // $or: [
          //     { status_order: "Manifest" },
          //     { status_order: "Hold" }
          // ]
        },
      },
      { $group: { _id: null, count: { $sum: 1 } } },
    ];

    if (req.query.branch) {
      condition[0].$match.$and.push({
        branch: ObjectId(req.query.branch),
      });
    }

    if (req.query.master_agen) {
      condition[0].$match.$and.push({
        $or: [
          {
            input_by: ObjectId(req.query.input_by),
          },
          {
            master_agen: ObjectId(req.query.master_agen),
          },
        ],
      });
    }

    await DomesticOrderModel.aggregate(condition)
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

  /* Get Order Statistics */
  async getStatisticsDomestik(req, res) {
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
      { $unwind: "$createdAt" },
      {
        $group: {
          _id: {
            date: {
              $dateToString: {
                format: "%Y-%m-%d",
                date: "$createdAt",
                timezone: "Asia/Jakarta",
              },
            },
          },
          count: {
            $sum: 1,
          },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ];

    if (req.query.branch) {
      condition[0].$match.$and.push({
        branch: ObjectId(req.query.branch),
      });
    }

    if (req.query.master_agen) {
      condition[0].$match.$and.push({
        $or: [
          {
            input_by: ObjectId(req.query.input_by),
          },
          {
            master_agen: ObjectId(req.query.master_agen),
          },
        ],
      });
    }

    await DomesticOrderModel.aggregate(condition)
      .then((result) => {
        let data = [];
        result.map((item) => {
          data.push({
            date: item._id.date,
            order_count: item.count,
          });
        });

        return apiResponse.successResponseWithData(
          res,
          "Data Berhasil Diambil",
          data
        );
      })
      .catch((error) => {
        return apiResponse.ErrorResponse(res, error);
      });
  }

  /* Get Weight */
  async getWeightDomestik(req, res) {
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
          // $or: [
          //     { status_order: "Manifest" },
          //     { status_order: "Hold" }
          // ]
        },
      },
      { $group: { _id: null, weight: { $sum: "$weight" } } },
    ];

    if (req.query.branch) {
      condition[0].$match.$and.push({
        branch: ObjectId(req.query.branch),
      });
    }

    if (req.query.master_agen) {
      condition[0].$match.$and.push({
        $or: [
          {
            input_by: ObjectId(req.query.input_by),
          },
          {
            master_agen: ObjectId(req.query.master_agen),
          },
        ],
      });
    }

    await DomesticOrderModel.aggregate(condition)
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

  /* Get Order Transakctions Admin */
  async getAdminTransactionsDomestik(req, res) {
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
        $unwind: "$createdAt",
      },

      {
        $lookup: {
          from: "users",
          localField: "input_by",
          foreignField: "_id",
          as: "userRole",
        },
      },
      {
        $unwind: "$userRole",
      },
      {
        $group: {
          _id: "$input_by",
          total: { $sum: 1 },
          admin: { $max: "$userRole.fullname" },
        },
      },
      {
        $sort: { _id: 1 },
      },
      {
        $project: {
          admin: 1,
          total: 1,
        },
      },
    ];

    if (req.query.branch) {
      condition[0].$match.$and.push({
        branch: ObjectId(req.query.branch),
      });
    }

    if (req.query.master_agen) {
      condition[0].$match.$and.push({
        $or: [
          {
            input_by: ObjectId(req.query.input_by),
          },
          {
            master_agen: ObjectId(req.query.master_agen),
          },
        ],
      });
    }

    await DomesticOrderModel.aggregate(condition)
      .then((result) => {
        let data = [];
        result.map((item) => {
          data.push({
            pengguna: item.admin,
            total: item.total,
          });
        });
        return apiResponse.successResponseWithData(
          res,
          "Data Berhasil Diambil",
          data
        );
      })
      .catch((error) => {
        return apiResponse.ErrorResponse(res, error);
      });
  }
}

module.exports = incomeDomestik;
