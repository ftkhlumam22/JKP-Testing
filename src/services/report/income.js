const InternationalOrderModel = require("../../models/transaction/internationalOrderModel");
const UserModel = require("../../models/users/userModel");
const apiResponse = require("../../helpers/apiResponse");
const paginateLabel = require("../../helpers/paginateLabel");
const mongoose = require("mongoose"); // Import Library Mongoose
const ObjectId = mongoose.Types.ObjectId;

/**
 * Income Class
 */
class Income {
  constructor() {
    //
  }

  async getStatisticOmzet(req, res) {
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
          amount_paid: {
            $sum: "$amount_paid",
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

    await InternationalOrderModel.aggregate(condition)
      .then((result) => {
        let data = [];
        result.map((item) => {
          data.push({
            date: item._id.date,
            omzet: item.amount_paid,
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

  /* Get Omzet */
  async getOmzet(req, res) {
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
          ],
          // $and: [
          //   {
          //     createdAt: {
          //       $gte: new Date(req.query.start_date + " 00:00:00"),
          //       $lt: new Date(req.query.end_date + " 23:59:59"),
          //     },
          //   },
          // ],

          // $or: [
          //   { status_order: { $ne: "Cancel" } },
          //   { status_order: { $ne: "Hold" } },
          //   { status_order: { $ne: "Pending" } },
          // ],
        },
      },
      {
        $group: {
          _id: null,
          amount_paid: { $sum: "$amount_paid" },
          total_paid_cash: { $sum: "$total_paid_cash" },
          total_paid_transfer: { $sum: "$total_paid_transfer" },
        },
      },
    ];

    if (req.query.type_branch) {
      let type_branch = [];
      req.query.type_branch.map((item) => {
        type_branch.push({
          branch: ObjectId(item),
        });
      });
      condition[0].$match.$and.push({
        $or: type_branch,
      });
    }

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

    await InternationalOrderModel.aggregate(condition)
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

  async getOmzetReal(req, res) {
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
          ],
        },
      },
      {
        $group: {
          _id: null,
          amount_paid: { $sum: "$amount_paid" },
          cash: { $sum: "$total_paid_cash" },
          transfer: { $sum: "$total_paid_transfer" },
        },
      },
    ];

    if (req.query.type_branch) {
      let type_branch = [];
      req.query.type_branch.map((item) => {
        type_branch.push({
          branch: ObjectId(item),
        });
      });
      condition[0].$match.$and.push({
        $or: type_branch,
      });
    }

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
    condition[0].$match.$and.push({
      $or: [
        {
          status_order: { $nin: ["Hold", "Pending", "Cancel"] },
        },
      ],
    });
    condition[0].$match.$and.push({
      $or: [{ position_order: { $ne: "Agen" } }],
    });
    await InternationalOrderModel.aggregate(condition)
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
  async getOrder(req, res) {
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
          //   { position_order: { $ne: "Agen" } },
          //   { status_order: { $nin: ["Cancel", "Hold", "Pending"] } },
          // ],
        },
      },
      { $group: { _id: null, count: { $sum: 1 } } },
    ];

    if (req.query.type_branch) {
      let type_branch = [];
      req.query.type_branch.map((item) => {
        type_branch.push({
          branch: ObjectId(item),
        });
      });
      condition[0].$match.$and.push({
        $or: type_branch,
      });
    }

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

    await InternationalOrderModel.aggregate(condition)
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

  /* Get Weight */
  async getWeight(req, res) {
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

    if (req.query.type_branch) {
      let type_branch = [];
      req.query.type_branch.map((item) => {
        type_branch.push({
          branch: ObjectId(item),
        });
      });
      condition[0].$match.$and.push({
        $or: type_branch,
      });
    }

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

    await InternationalOrderModel.aggregate(condition)
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
  async getOrderStatistics(req, res) {
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

    if (req.query.type_branch) {
      let type_branch = [];
      req.query.type_branch.map((item) => {
        type_branch.push({
          branch: ObjectId(item),
        });
      });
      condition[0].$match.$and.push({
        $or: type_branch,
      });
    }

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

    await InternationalOrderModel.aggregate(condition)
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

  /* Get Order Transakctions Admin */
  async getAdminTransactions(req, res) {
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
        $match: {
          "userRole.type_user": {
            $ne: "Agen",
          },
        },
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

    if (req.query.type_branch) {
      let type_branch = [];
      req.query.type_branch.map((item) => {
        type_branch.push({
          branch: ObjectId(item),
        });
      });
      condition[0].$match.$and.push({
        $or: type_branch,
      });
    }

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

    await InternationalOrderModel.aggregate(condition)
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

  /* Get Order Transakctions Agen */
  async getAgenTransactions(req, res) {
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
        $match: {
          "userRole.type_user": "Agen",
        },
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

    if (req.query.type_branch) {
      let type_branch = [];
      req.query.type_branch.map((item) => {
        type_branch.push({
          branch: ObjectId(item),
        });
      });
      condition[0].$match.$and.push({
        $or: type_branch,
      });
    }

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

    await InternationalOrderModel.aggregate(condition)
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

  /* Get Omzet Agen List */
  async getOmzetAgenList(req, res) {
    if (req.query.pagination === "false") {
      await UserModel.find()
        .populate("transaction") // Relasikan dari field yg sudah didefinisikan di model agen
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
        },
        customLabels: paginateLabel,
      };

      /* Add Filter Search */
      // var condition = req.query.search ? { $text: { $search: req.query.search } } : {}

      /* Add Advance Filter Search */
      let condition = {};

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

      if (req.query.type_branch) {
        let type_branch = [];
        req.query.type_branch.map((item) => {
          type_branch.push({
            branch: ObjectId(item),
          });
        });
        condition[0].$match.$and.push({
          $or: type_branch,
        });
      }

      if (req.query.branch) {
        condition["$and"].push({
          branch: ObjectId(req.query.branch),
        });
      }

      if (req.query.master_agen) {
        condition["$and"].push({
          master_agen: ObjectId(req.query.master_agen),
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
}

module.exports = Income;
