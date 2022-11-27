const BiayaOperasionalModel = require("../../models/finance/biayaOperasionalModel");
const BranchModel = require("../../models/master/branchModel");
const apiResponse = require("../../helpers/apiResponse");
const paginateLabel = require("../../helpers/paginateLabel");
const csv = require("csvtojson");
const { ObjectId } = require("mongodb");

/**
 * Biaya Operasional Class
 */
class BiayaOperasional {
  constructor() {
    //
  }

  /* Create BiayaOperasional */
  async createBiayaOperasional(req, res) {
    await BiayaOperasionalModel.create(req.body)
      .then((result) => {
        return apiResponse.successResponse(res, "Data Berhasil Dibuat");
      })
      .catch((error) => {
        return apiResponse.ErrorResponse(res, error);
      });
  }

  /* List BiayaOperasional */
  async listBiayaOperasional(req, res) {
    if (req.query.pagination === "false") {
      await BiayaOperasionalModel.find()
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
        populate: "branch category_id",
        sort: { createdAt: -1 },
      };

      /* Add Advance Filter Search */
      let condition = {};

      if (
        req.query.search ||
        req.query.branch ||
        (req.query.start_date && req.query.end_date)
      ) {
        condition = {
          $and: [],
        };
      }

      if (req.query.search) {
        condition["$and"].push({
          cost_description: { $regex: req.query.search, $options: "i" },
        });
      }
      if (req.query.branch) {
        condition["$and"].push({
          branch: ObjectId(req.query.branch),
        });
      }

      if (req.query.start_date && req.query.end_date) {
        condition["$and"].push({
          cost_date: {
            $gte: new Date(req.query.start_date + " 00:00:00"),
            $lt: new Date(req.query.end_date + " 23:59:59"),
          },
        });
      }

      await BiayaOperasionalModel.paginate(condition, options)
        .then((result) => {
          return apiResponse.successResponseWithDataAndPagination(res, result);
        })
        .catch((error) => {
          return apiResponse.ErrorResponse(res, error);
        });
    }
  }

  /* Get BiayaOperasional by Id */
  async getBiayaOperasional(req, res) {
    await BiayaOperasionalModel.find({
      _id: req.params.id,
    })
      .populate("branch")
      .populate("category_id")
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

  /* Update BiayaOperasional by ID */
  async updateBiayaOperasional(req, res) {
    await BiayaOperasionalModel.updateOne(
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

  /* Delete BiayaOperasional by ID */
  async deleteBiayaOperasional(req, res) {
    await BiayaOperasionalModel.deleteOne({
      _id: req.params.id,
    })
      .then((result) => {
        return apiResponse.successResponse(res, "Data Berhasil Dihapus");
      })
      .catch((error) => {
        return apiResponse.ErrorResponse(res, error);
      });
  }

  /* Get Total BiayaOperasional */
  async getTotalBiayaOperasional(req, res) {
    let condition = [
      {
        $match: {
          cost_date: {
            $gte: new Date(req.query.start_date + " 00:00:00"),
            $lt: new Date(req.query.end_date + " 23:59:59"),
          },
          // isActive: true,
        },
      },
      {
        $group: {
          _id: null,
          total_cost: {
            $sum: "$nominal",
          },
          count: { $sum: 1 },
        },
      },
    ];

    await BiayaOperasionalModel.aggregate(condition)
      .then((result) => {
        return apiResponse.successResponseWithData(
          res,
          "Data Berhasil Diambil",
          result
        );
      })
      .catch((error) => {
        console.log(error);
      });
  }

  async getTotalBiayaOperasionalBranch(req, res) {
    let condition = [
      {
        $match: {
          cost_date: {
            $gte: new Date(req.query.start_date + " 00:00:00"),
            $lt: new Date(req.query.end_date + " 23:59:59"),
          },
        },
      },
      {
        $group: {
          _id: null,
          total_cost: {
            $sum: "$nominal",
          },
          count: { $sum: 1 },
        },
      },
    ];

    if (req.query.branch) {
      condition[0].$match.branch = ObjectId(req.query.branch);
    }

    await BiayaOperasionalModel.aggregate(condition)
      .then((result) => {
        return apiResponse.successResponseWithData(
          res,
          "Data Berhasil Diambil",
          result
        );
      })
      .catch((error) => {
        console.log(error);
      });
  }

  // /* Export Template untuk Import */
  // async exportTemplateBiayaOperasional(req, res) {
  //     /* Add Advance Filter Search */
  //     let condition = {};

  //     if(req.query.start_date && req.query.end_date){
  //         condition = {
  //             '$and': []
  //         };
  //     }

  //     if(req.query.start_date && req.query.end_date){
  //         condition['$and'].push(
  //             {
  //                 "createdAt": {
  //                     $gte: new Date(req.query.start_date + ' 00:00:00'),
  //                     $lt: new Date(req.query.end_date + ' 23:59:59')
  //                 }
  //             }
  //         );
  //     }

  //     await BiayaOperasionalModel.find(condition).then(result => {
  //         let data = [];

  //         result.map(item => {
  //             data.push({
  //                 no_order: item.shipment_number,

  //             })
  //         });

  //         const csv = json2csvParser.parse(data);

  //         res.send(csv);
  //     })
  // }

  /* Import */
  async importBiayaOperasional(req, res) {
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
              let id_branch;

              await BranchModel.findOne({
                city_name: { $regex: item.branch, $options: "i" },
              }) // Relasi dengan collection Agen
                .then((result) => {
                  id_branch = result.id;
                })
                .catch((error) => {
                  console.log(error);
                });

              let data = {
                cost_description: item.cost_description,
                nominal: item.nominal,
                payment_method: item.payment_method,
                cost_information: item.cost_information,
                cost_date: new Date(item.cost_date + " 00:00:00"),
                cost_category: item.cost_category,
                branch: id_branch,
              };

              return BiayaOperasionalModel.create(data).catch((error) => ({
                error,
              }));
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

module.exports = BiayaOperasional;
