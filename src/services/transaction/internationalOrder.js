const InternationalOrderModel = require("../../models/transaction/internationalOrderModel");
const UserModel = require("../../models/users/userModel");
const BranchModel = require("../../models/master/branchModel");
// const AgenModel = require('../../models/users/agenModel');
// const MemberModel = require('../../models/users/memberModel');
const internationalOrderIntegration = require("./internationalOrderIntegration");
const apiResponse = require("../../helpers/apiResponse");
const paginateLabel = require("../../helpers/paginateLabel");
const csv = require("csvtojson");
const mongoose = require("mongoose"); // Import Library Mongoose
const { response } = require("express");
const ObjectId = mongoose.Types.ObjectId;

/**
 * International Order Class
 */
class InternationalOrder {
  constructor() {
    //
  }

  /* Create International Order */
  async createInternationalOrder(req, res) {
    const checkOrder = await InternationalOrderModel.findOne({
      shipment_number: { $exists: true, $ne: "" },
    }).sort({ shipment_number: -1 });
    let newShipmentNumber;
    if (checkOrder) {
      newShipmentNumber = next(checkOrder.shipment_number);
    } else {
      newShipmentNumber = "JEX0000000001";
    }

    let data = req.body;
    data.shipment_number = newShipmentNumber;

    /* Integrasi Janio & TGI Express */
    const integration = new internationalOrderIntegration();

    if (data.courier == "Janio") {
      integration.createOrderJanio(data);
    }

    if (data.courier == "Tabitha") {
      integration.createOrderTGIExpress(data);
    }

    await InternationalOrderModel.create(data)
      .then(async (result) => {
        /* Relasi dengan Agen */
        await UserModel.findOneAndUpdate(
          { _id: result.agen }, // Cari Akun Agen
          { $push: { transaction: result._id } },
          { new: true }
        );

        if (result.member !== null) {
          /* Relasi dengan Member */
          await UserModel.findOneAndUpdate(
            { _id: result.member }, // Cari Akun Member
            { $push: { transaction: result._id } },
            { new: true }
          );
        }

        return apiResponse.successResponse(res, "Data Berhasil Dibuat");
      })
      .catch((error) => {
        return apiResponse.ErrorResponse(res, error);
      });
  }

  async listInternationalPelanggan(req, res) {
    await InternationalOrderModel.aggregate([
      {
        $group: {
          _id: "$id",
          myfield: { $addToSet: "$agen_general" },
        },
      },
    ])
      .then((result) => {
        return apiResponse.successResponseWithDataAndPagination(res, result);
      })
      .catch((error) => {
        return apiResponse.ErrorResponse(res, error);
      });
  }

  async listAgenGeneral(req, res) {
    await InternationalOrderModel.aggregate([
      { $unwind: "$agen_general" },
      {
        $match: {
          cek_agen: "Pelanggan",
        },
      },
      {
        $group: {
          _id: "$agen_general",
        },
      },
      {
        $project: {
          _id: 0,
          agen_general: "$_id",
        },
      },
    ])
      .then((result) => {
        return apiResponse.successResponseWithDataAndPagination(res, result);
      })
      .catch((error) => {
        return apiResponse.ErrorResponse(res, error);
      });
  }
  /* List International Order */
  async listInternationalOrder(req, res) {
    if (req.query.pagination === "false") {
      await InternationalOrderModel.find()
        .populate("agen")
        .populate("member") // Relasi dengan collection Agen
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
        populate: "agen member", // Relasi dengan collection Agen
        customLabels: paginateLabel,
      };

      /* Add Filter Search */
      var condition = req.query.search
        ? {
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
                recipient_destination: {
                  $regex: req.query.search,
                  $options: "i",
                },
              },
            ],
          }
        : {};

      await InternationalOrderModel.paginate(condition, options)
        .then((result) => {
          return apiResponse.successResponseWithDataAndPagination(res, result);
        })
        .catch((error) => {
          return apiResponse.ErrorResponse(res, error);
        });
    }
  }

  /* Get International Order by Id */
  async getInternationalOrder(req, res) {
    await InternationalOrderModel.find({
      _id: req.params.id,
    })
      .populate("agen member") // Relasi dengan collection Agen
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

  /* Update International Order by ID */
  async updateInternationalOrder(req, res) {
    /* Integrasi Janio & TGI Express */
    const integration = new internationalOrderIntegration();

    if (req.body.courier == "Janio") {
      integration.createOrderJanio(req.body);
    }

    if (req.body.courier == "Tabitha") {
      integration.createOrderTGIExpress(req.body);
    }

    if (req.body.amount_paid > 0 && req.body.total_paid == 0) {
      let sisa_saldo;
      let total_paid;

      /* Cek Saldo */
      await UserModel.find({
        _id: req.body.agen,
      }).then(async (result) => {
        if (result[0].saldo > 0) {
          if (result[0].saldo == req.body.amount_paid) {
            sisa_saldo = 0;
            total_paid = result[0].saldo;
          } else if (result[0].saldo - req.body.amount_paid < 0) {
            sisa_saldo = 0;
            total_paid = result[0].saldo;
          } else if (result[0].saldo - req.body.amount_paid > 0) {
            sisa_saldo = result[0].saldo - req.body.amount_paid;
            total_paid = req.body.amount_paid;
          }

          // console.log('Sisa Saldo: ' + sisa_saldo);
          // console.log('Total yang dibayarkan: ' + total_paid);

          /* Update Saldo */
          await UserModel.findOneAndUpdate(
            { _id: result[0]._id }, // Cari Akun Agen
            { $set: { saldo: sisa_saldo } }
          );

          let data = {
            amount_paid: req.body.amount_paid,
            total_paid: total_paid,
            payment_date: new Date(),
          };

          if (
            total_paid === req.body.amount_paid ||
            total_paid > req.body.amount_paid
          ) {
            data.payment_status = "Lunas";
          }

          await InternationalOrderModel.updateOne(
            {
              _id: req.params.id,
            },
            {
              $set: data,
            }
          )
            .then((result) => {
              return apiResponse.successResponse(res, "Data Berhasil Diubah");
            })
            .catch((error) => {
              return apiResponse.ErrorResponse(res, error);
            });
        } else {
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
      });
    } else {
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
  }

  /* Delete International Order by ID */
  async deleteInternationalOrderOne(req, res) {
    await InternationalOrderModel.deleteOne({
      _id: req.params.id,
    })
      .then((result) => {
        return apiResponse.successResponse(res, "Data Berhasil Dihapus");
      })
      .catch((error) => {
        return apiResponse.ErrorResponse(res, error);
      });
  }

  /* Reset International Order */
  async deleteInternationalOrderAll(req, res) {
    await InternationalOrderModel.deleteMany()
      .then((result) => {
        return apiResponse.successResponse(res, "Data Berhasil Dihapus");
      })
      .catch((error) => {
        return apiResponse.ErrorResponse(res, error);
      });
  }

  /* Get Last Record */
  async getLastRecordInternationalOrder(req, res) {
    await InternationalOrderModel.find(
      { shipment_number: { $exists: true, $ne: "" } },
      function (err, item) {
        return apiResponse.successResponseWithData(
          res,
          "Data Berhasil Diambil",
          item
        );
      }
    )
      .limit(1)
      .sort({ shipment_number: -1 });
  }

  /* Update Position Order */
  async updatePositionOrderInternationalOrder(req, res) {
    /* Auto Manifest Date */
    let data = {};
    if (req.body.position_order == "Mitra") {
      let today = new Date();
      data = {
        position_order: req.body.position_order,
        manifest_date: today,
        status_order: "Manifest",
      };
    } else {
      data = {
        position_order: req.body.position_order,
      };
    }

    await InternationalOrderModel.findByIdAndUpdate(
      {
        _id: req.params.id,
      },
      data
    )
      .then((result) => {
        return apiResponse.successResponse(
          res,
          "Status Order Berhasil Diupdate"
        );
      })
      .catch((error) => {
        return apiResponse.ErrorResponse(res, error);
      });
  }

  /* List International Order with Advance Filter */
  async listInternationalOrderWithFilter(req, res) {
    if (req.query.pagination === "false") {
      await InternationalOrderModel.find()
        .populate("agen")
        .populate("member") // Relasi dengan collection Agen
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
        populate: "agen member scanned_by input_by master_agen branch", // Relasi dengan collection Agen
        customLabels: paginateLabel,
        sort: { updatedAt: -1 },
      };

      /* Add Advance Filter Search */
      let condition = {};

      if (
        req.query.search ||
        (req.query.start_date && req.query.end_date) ||
        req.query.courier ||
        req.query.destination ||
        req.query.status_order ||
        req.query.filter_shipment_number ||
        req.query.branch ||
        req.query.awb_filter ||
        req.query.input_by ||
        req.query.master_agen ||
        req.query.manifest_date ||
        req.query.search_no_order ||
        req.query.search_awb_no ||
        req.query.search_recipient_name ||
        req.query.agen ||
        req.query.admin ||
        req.query.payment_method ||
        req.query.branch_mutiple
      ) {
        condition = {
          $and: [],
        };
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
              recipient_destination: {
                $regex: req.query.search,
                $options: "i",
              },
            },
            {
              awb_no: { $regex: req.query.search },
            },
          ],
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

      if (req.query.courier) {
        condition["$and"].push({
          courier: req.query.courier,
        });
      }

      if (req.query.destination) {
        condition["$and"].push({
          recipient_destination: req.query.destination,
        });
      }

      if (req.query.status_order) {
        condition["$and"].push({
          status_order: req.query.status_order,
        });
      }

      if (req.query.filter_shipment_number) {
        condition["$and"].push({
          shipment_number: { $exists: true, $ne: "" },
        });
      }

      if (req.query.branch) {
        condition["$and"].push({
          branch: ObjectId(req.query.branch),
        });
      }

      if (req.query.branch_mutiple) {
        let branch_mutiple = [];
        req.query.branch_mutiple.map((item) => {
          branch_mutiple.push({
            branch: ObjectId(item),
          });
        });
        condition["$and"].push({
          $or: branch_mutiple,
        });
      }

      if (req.query.awb_filter && req.query.awb_filter == "awb_exist") {
        condition["$and"].push({
          awb_no: { $nin: ["", "0"] },
        });
      }

      if (req.query.awb_filter && req.query.awb_filter == "request_awb") {
        condition["$and"].push({
          awb_no: { $in: ["", "0"] },
        });
      }

      if (req.query.input_by && req.query.master_agen == undefined) {
        condition["$and"].push({
          input_by: ObjectId(req.query.input_by),
        });
      }

      if (req.query.agen) {
        if (req.query.agen.includes("value")) {
          const agen = JSON.parse(req.query.agen);
          condition["$and"].push({
            agen: ObjectId(agen.value),
          });
        } else {
          condition["$and"].push({
            agen_general: req.query.agen,
          });
        }
      }

      if (req.query.admin) {
        condition["$and"].push({
          input_by: ObjectId(req.query.admin),
        });
      }

      if (req.query.payment_method) {
        condition["$and"].push({
          payment_type: req.query.payment_method,
        });
      }

      if (req.query.master_agen) {
        condition["$and"].push({
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

      if (req.query.manifest_date) {
        condition["$and"].push({
          manifest_date: {
            $gte: new Date(req.query.manifest_date + " 00:00:00"),
            $lt: new Date(req.query.manifest_date + " 23:59:59"),
          },
        });
      }

      if (req.params.position_order) {
        condition["$and"].push({
          position_order: req.params.position_order,
        });
      }

      if (req.query.search_no_order) {
        condition["$and"].push({
          shipment_number: req.query.search_no_order,
        });
      }

      if (req.query.search_awb_no) {
        condition["$and"].push({
          awb_no: req.query.search_awb_no,
        });
      }

      if (req.query.search_recipient_name) {
        condition["$and"].push({
          recipient_name: {
            $regex: req.query.search_recipient_name,
            $options: "i",
          },
        });
      }

      await InternationalOrderModel.paginate(condition, options)
        .then((result) => {
          return apiResponse.successResponseWithDataAndPagination(res, result);
        })
        .catch((error) => {
          console.log(error);
          return apiResponse.ErrorResponse(res, error);
        });
    }
  }

  /* List International Order with Advance Filter */
  async listInternationalOrderWithFilterSuratJalan(req, res) {
    if (req.query.pagination === "false") {
      await InternationalOrderModel.find()
        .populate("agen")
        .populate("member")
        .populate("branch") // Relasi dengan collection Agen
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
        populate: "agen member branch", // Relasi dengan collection Agen
        customLabels: paginateLabel,
        sort: { recipient_name: 1 },
      };

      /* Add Advance Filter Search */
      let condition = {};

      if (
        req.query.search ||
        (req.query.start_date && req.query.end_date) ||
        req.query.courier ||
        req.query.destination ||
        req.query.status_order ||
        req.query.filter_shipment_number ||
        req.query.branch ||
        req.query.awb_filter ||
        req.query.input_by ||
        req.query.master_agen ||
        req.query.exclude_branch ||
        req.query.manifest_date ||
        req.query.agen ||
        req.query.admin ||
        req.query.payment_method ||
        req.query.branch_mutiple
      ) {
        condition = {
          $and: [],
        };
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
              recipient_destination: {
                $regex: req.query.search,
                $options: "i",
              },
            },
            {
              awb_no: { $regex: req.query.search },
            },
          ],
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

      if (req.query.courier) {
        condition["$and"].push({
          courier: req.query.courier,
        });
      }

      if (req.query.destination) {
        condition["$and"].push({
          recipient_destination: req.query.destination,
        });
      }

      if (req.query.status_order) {
        condition["$and"].push({
          status_order: req.query.status_order,
        });
      }

      if (req.query.branch_mutiple) {
        let branch_mutiple = [];
        req.query.branch_mutiple.map((item) => {
          branch_mutiple.push({
            branch: ObjectId(item),
          });
        });
        condition["$and"].push({
          $or: branch_mutiple,
        });
      }

      if (req.query.filter_shipment_number) {
        condition["$and"].push({
          shipment_number: { $exists: true, $ne: "" },
        });
      }

      if (req.query.branch) {
        condition["$and"].push({
          branch: ObjectId(req.query.branch),
        });
      }

      if (req.query.awb_filter && req.query.awb_filter == "awb_exist") {
        condition["$and"].push({
          awb_no: { $ne: "" },
        });
      }

      if (req.query.awb_filter && req.query.awb_filter == "request_awb") {
        condition["$and"].push({
          awb_no: { $eq: "" },
        });
      }

      // if(req.query.input_by && req.query.master_agen == undefined){
      //     condition['$and'].push(
      //         {
      //             "input_by": ObjectId(req.query.input_by)
      //         }
      //     );
      // }

      if (req.query.input_by && req.query.master_agen == undefined) {
        condition["$and"].push({
          $or: [
            {
              input_by: ObjectId(req.query.input_by),
            },
            {
              input_by_agen: true,
            },
          ],
        });
      }

      if (req.query.exclude_branch) {
        req.query.exclude_branch.map((item) => {
          condition["$and"].push({
            branch: { $ne: item },
          });
        });
      }

      if (req.query.agen) {
        if (req.query.agen.includes("value")) {
          const agen = JSON.parse(req.query.agen);
          condition["$and"].push({
            agen: ObjectId(agen.value),
          });
        } else {
          condition["$and"].push({
            agen_general: req.query.agen,
          });
        }
      }

      if (req.query.admin) {
        condition["$and"].push({
          input_by: ObjectId(req.query.admin),
        });
      }

      if (req.query.payment_method) {
        condition["$and"].push({
          payment_type: req.query.payment_method,
        });
      }

      if (req.query.master_agen) {
        condition["$and"].push({
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

      if (req.query.manifest_date) {
        condition["$and"].push({
          manifest_date: {
            $gte: new Date(req.query.manifest_date + " 00:00:00"),
            $lt: new Date(req.query.manifest_date + " 23:59:59"),
          },
        });
      }

      await InternationalOrderModel.paginate(condition, options)
        .then((result) => {
          return apiResponse.successResponseWithDataAndPagination(res, result);
        })
        .catch((error) => {
          console(error);
          return apiResponse.ErrorResponse(res, error);
        });
    }
  }

  /* List International Order with Advance Filter */
  async listInternationalAgen(req, res) {
    if (req.query.pagination === "false") {
      await InternationalOrderModel.find({
        agen: req.params.agen,
      })
        .populate("agen")
        .populate("member") // Relasi dengan collection Agen
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
        populate: "agen member", // Relasi dengan collection Agen
        customLabels: paginateLabel,
        sort: { createdAt: -1 },
      };

      /* Add Advance Filter Search */
      let condition = {
        agen: req.params.agen,
      };

      if (
        req.query.search ||
        (req.query.start_date && req.query.end_date) ||
        req.query.courier ||
        req.query.destination ||
        req.query.status_order ||
        req.params.agen ||
        req.query.filter_shipment_number
      ) {
        condition = {
          $and: [
            {
              agen: req.params.agen,
            },
          ],
        };
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
              recipient_destination: {
                $regex: req.query.search,
                $options: "i",
              },
            },
            {
              awb_no: { $regex: req.query.search },
            },
          ],
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

      if (req.query.courier) {
        condition["$and"].push({
          courier: req.query.courier,
        });
      }

      if (req.query.destination) {
        condition["$and"].push({
          recipient_destination: req.query.destination,
        });
      }

      if (req.query.status_order) {
        condition["$and"].push({
          status_order: req.query.status_order,
        });
      }

      if (req.query.filter_shipment_number) {
        condition["$and"].push({
          shipment_number: { $exists: true, $ne: "" },
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

  /* List International Order with Advance Filter */
  async listInternationalAllAgen(req, res) {
    if (req.query.pagination === "false") {
      await InternationalOrderModel.find({
        agen: req.params.agen,
      })
        .populate("agen")
        .populate("member") // Relasi dengan collection Agen
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
        populate: "agen member", // Relasi dengan collection Agen
        customLabels: paginateLabel,
      };

      /* Add Advance Filter Search */
      let condition = {};

      if (
        req.query.search ||
        (req.query.start_date && req.query.end_date) ||
        req.query.courier ||
        req.query.destination ||
        req.query.status_order ||
        req.query.filter_shipment_number
      ) {
        condition = {
          $and: [
            {
              input_by_agen: { $exists: true, $ne: false },
            },
          ],
        };
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
              recipient_destination: {
                $regex: req.query.search,
                $options: "i",
              },
            },
            {
              awb_no: { $regex: req.query.search },
            },
          ],
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

      if (req.query.courier) {
        condition["$and"].push({
          courier: req.query.courier,
        });
      }

      if (req.query.destination) {
        condition["$and"].push({
          recipient_destination: req.query.destination,
        });
      }

      if (req.query.status_order) {
        condition["$and"].push({
          status_order: req.query.status_order,
        });
      }

      if (req.query.filter_shipment_number) {
        condition["$and"].push({
          shipment_number: { $exists: true, $ne: "" },
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

  /* List International Order with Advance Filter */
  async listInternationalMember(req, res) {
    if (req.query.pagination === "false") {
      await InternationalOrderModel.find({
        member: req.params.member,
      })
        .populate("agen")
        .populate("member") // Relasi dengan collection Agen
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
        populate: "agen member", // Relasi dengan collection Agen
        customLabels: paginateLabel,
      };

      /* Add Advance Filter Search */
      let condition = {
        member: req.params.member,
      };

      if (
        req.query.search ||
        (req.query.start_date && req.query.end_date) ||
        req.query.courier ||
        req.query.status_order ||
        req.params.member ||
        req.query.filter_shipment_number
      ) {
        condition = {
          $and: [
            {
              member: req.params.member,
            },
          ],
        };
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
              recipient_destination: {
                $regex: req.query.search,
                $options: "i",
              },
            },
          ],
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

      if (req.query.courier) {
        condition["$and"].push({
          courier: req.query.courier,
        });
      }

      if (req.query.destination) {
        condition["$and"].push({
          recipient_destination: req.query.destination,
        });
      }

      if (req.query.status_order) {
        condition["$and"].push({
          status_order: req.query.status_order,
        });
      }

      if (req.query.filter_shipment_number) {
        condition["$and"].push({
          shipment_number: { $exists: true, $ne: "" },
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

  /* Update Position Order */
  async updateByScanBarcodeInternationalOrder(req, res) {
    // console.log(req.body.scanned_by)
    // await UserModel.findOne({
    //     "_id": ObjectId(req.body.scanned_by)
    // }) // Relasi dengan collection Agen
    //     .then(async result => {
    //         console.log(result)
    //         if(result.type_user == 'Admin Pusat' || result.type_user == 'Admin Cabang' || result.type_user == 'Gudang Pusat' || result.type_user == 'Kurir') {

    //             /* Check Position */
    //             let check_position;

    //             await InternationalOrderModel.findOne({
    //                 "shipment_number": req.params.shipment_number
    //             })
    //                 .then(result => {
    //                     if(result.position_order == 'Kurir') {
    //                         check_position = 'Cabang';
    //                     }else if(result.position_order == 'Cabang') {
    //                         check_position = 'Warehouse';
    //                     }
    //                     console.log(check_position)
    //                 })

    //             await InternationalOrderModel.findOneAndUpdate({
    //                 "shipment_number": req.params.shipment_number
    //             },{
    //                 position_order: check_position,
    //                 scanned_by: req.body.scanned_by,
    //             })
    //                 .then(result => {
    //                     return apiResponse.successResponse(res, "Status Order Berhasil Diupdate");
    //                 })
    //                 .catch(error => {
    //                     return apiResponse.ErrorResponse(res, error);
    //                 });
    //         }else{
    //             await InternationalOrderModel.findOneAndUpdate({
    //                 "shipment_number": req.params.shipment_number
    //             },{
    //                 position_order: req.body.position_order,
    //                 scanned_by: req.body.scanned_by,
    //                 status_order: req.body.status_order,
    //             })
    //                 .then(result => {
    //                     return apiResponse.successResponse(res, "Status Order Berhasil Diupdate");
    //                 })
    //                 .catch(error => {
    //                     return apiResponse.ErrorResponse(res, error);
    //                 });
    //         }
    //     })
    //     .catch(error => {
    //         console.log(error)
    //     });
    await InternationalOrderModel.findOneAndUpdate(
      {
        shipment_number: req.params.shipment_number,
      },
      {
        position_order: req.body.position_order,
        scanned_by: req.body.scanned_by,
        status_order: req.body.status_order,
        manifest_date: req.body.manifest_date,
      }
    )
      .then((result) => {
        return apiResponse.successResponse(
          res,
          "Status Order Berhasil Diupdate"
        );
      })
      .catch((error) => {
        return apiResponse.ErrorResponse(res, error);
      });
  }

  /* Import Transaction */
  async importTransaction(req, res) {
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
              let id_agen;
              let id_input_by;
              let id_branch;

              await UserModel.findOne({
                fullname: item.agen,
              }) // Relasi dengan collection Agen
                .then((result) => {
                  id_agen = result.id;
                })
                .catch((error) => {
                  console.log(error);
                });

              await UserModel.findOne({
                fullname: item.input_by,
              }) // Relasi dengan collection Agen
                .then((result) => {
                  id_input_by = result.id;
                })
                .catch((error) => {
                  console.log(error);
                });

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
                shipment_number: item.shipment_number,
                sender_name: item.sender_name,
                sender_address: item.sender_address,
                sender_phone: item.sender_phone,
                recipient_name: item.recipient_name,
                recipient_address: item.recipient_address,
                recipient_destination: item.recipient_destination,
                recipient_postal_code: item.recipient_postal_code,
                recipient_phone: item.recipient_phone,
                recipient_no_id: item.recipient_no_id,
                courier: item.courier,
                awb_no: item.awb_no,
                weight: item.weight,
                bag_amount: item.bag_amount,
                service_type: item.service_type,
                long: item.long,
                wide: item.wide,
                height: item.height,
                shipment_fee: item.shipment_fee,
                pickup_by: item.pickup_by,
                detail_item: item.detail_item,
                payment_type: item.payment_type,
                bank: item.bank,
                payment_info: item.payment_info,
                position_order: item.position_order,
                status_order: item.status_order,
                amount_paid: item.amount_paid,
                payment_status: item.payment_status,
                payment_date: item.payment_date,
                member: item.member,
                scanned_by: item.scanned_by,
                createdAt: Date(item.createdAt),
                agen: id_agen,
                input_by: id_input_by,
                branch: id_branch,
              };

              return InternationalOrderModel.create(data).catch((error) =>
                console.log(error)
              );
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

  /* Get Total Order */
  async getTotalInternationalOrder(req, res) {
    async function getTotalOrder(position_order) {
      let response;

      let condition = [
        {
          $match: {
            $and: [{ position_order: position_order }],
          },
        },
        { $group: { _id: null, count: { $sum: 1 } } },
      ];

      if (req.query.search) {
        condition[0].$match.$and.push({
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
              recipient_destination: {
                $regex: req.query.search,
                $options: "i",
              },
            },
          ],
        });
      }

      if (req.query.start_date && req.query.end_date) {
        condition[0].$match.$and.push({
          createdAt: {
            $gte: new Date(req.query.start_date + " 00:00:00"),
            $lt: new Date(req.query.end_date + " 23:59:59"),
          },
        });
      }

      if (req.query.courier) {
        condition[0].$match.$and.push({
          courier: { $in: req.query.courier },
        });
      }

      if (req.query.destination) {
        condition[0].$match.$and.push({
          recipient_destination: req.query.destination,
        });
      }

      if (req.query.status_order) {
        condition[0].$match.$and.push({
          status_order: req.query.status_order,
        });
      }

      if (req.params.agen) {
        condition[0].$match.$and.push({
          agen: ObjectId(req.params.agen),
        });
      }

      if (req.query.branch) {
        condition[0].$match.$and.push({
          branch: ObjectId(req.query.branch),
        });
      }

      if (req.query.awb_filter && req.query.awb_filter == "awb_exist") {
        condition[0].$match.$and.push({
          awb_no: { $ne: "" },
        });
      }

      if (req.query.awb_filter && req.query.awb_filter == "request_awb") {
        condition[0].$match.$and.push({
          awb_no: { $eq: "" },
        });
      }

      if (req.query.input_by && req.query.master_agen == undefined) {
        condition[0].$match.$and.push({
          input_by: ObjectId(req.query.input_by),
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

      if (req.query.manifest_date) {
        condition[0].$match.$and.push({
          manifest_date: {
            $gte: new Date(req.query.manifest_date + " 00:00:00"),
            $lt: new Date(req.query.manifest_date + " 23:59:59"),
          },
        });
      }

      await InternationalOrderModel.aggregate(condition).then((result) => {
        response = result;
      });

      return response;
    }

    const total_order_agen = await getTotalOrder("Agen");
    const total_order_kurir = await getTotalOrder("Kurir");
    const total_order_cabang = await getTotalOrder("Cabang");
    const total_order_warehouse = await getTotalOrder("Warehouse");
    const total_order_mitra = await getTotalOrder("Mitra");

    let data = {
      total_order_agen:
        total_order_agen.length > 0 ? total_order_agen[0].count : 0,
      total_order_kurir:
        total_order_kurir.length > 0 ? total_order_kurir[0].count : 0,
      total_order_cabang:
        total_order_cabang.length > 0 ? total_order_cabang[0].count : 0,
      total_order_warehouse:
        total_order_warehouse.length > 0 ? total_order_warehouse[0].count : 0,
      total_order_mitra:
        total_order_mitra.length > 0 ? total_order_mitra[0].count : 0,
    };

    return apiResponse.successResponseWithData(
      res,
      "Data Berhasil Diambil",
      data
    );

    // await InternationalOrderModel.aggregate(condition)
    //     .then(result => {
    //         return apiResponse.successResponseWithData(res, "Data Berhasil Diambil", result);
    //     })
    //     .catch(error => {
    //         return apiResponse.ErrorResponse(res, error);
    //     });
  }

  /* Get International Order by Field */
  async getInternationalOrderSearchByField(req, res) {
    let condition;

    if (req.query.sender_name) {
      condition = { sender_name: { $regex: req.query.sender_name } };
    }

    if (req.query.recipient_name) {
      condition = { recipient_name: { $regex: req.query.recipient_name } };
    }

    await InternationalOrderModel.find(condition)
      .populate("agen member") // Relasi dengan collection Agen
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

  /* Get International Order by Field */
  async getInternationalOrderByField(req, res) {
    let condition;

    if (req.query.sender_name) {
      condition = { sender_name: req.query.sender_name };
    }

    if (req.query.recipient_name) {
      condition = { recipient_name: req.query.recipient_name };
    }

    await InternationalOrderModel.find(condition)
      .populate("agen member") // Relasi dengan collection Agen
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

  /* Get Total Order */
  async getTotalInternationalOrderNotification(req, res) {
    let condition = [
      {
        $match: {
          $and: [
            {
              awb_no: { $in: ["", "0"] },
            },
          ],
        },
      },
      { $group: { _id: null, count: { $sum: 1 } } },
    ];

    if (req.query.branch && req.query.master_agen == undefined) {
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

    let data = {
      total_order: 0,
      list_data: [],
    };

    await InternationalOrderModel.aggregate(condition)
      .then((result) => {
        data.total_order = result[0].count;
      })
      .catch((error) => {
        //console.log(error)
      });

    let listCondition = {
      $and: [
        {
          awb_no: { $eq: "" },
        },
      ],
    };

    if (req.query.branch && req.query.master_agen == undefined) {
      listCondition["$and"].push({
        branch: ObjectId(req.query.branch),
      });
    }

    if (req.query.master_agen) {
      listCondition["$and"].push({
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

    await InternationalOrderModel.find(listCondition)
      .populate("agen")
      .populate("member")
      .sort({ createdAt: -1 })
      .limit(4)
      .then((result) => {
        result.map((item) => {
          data.list_data.push({
            id: item.id,
            shipment_number: item.shipment_number,
            recipient_name: item.recipient_name,
            recipient_destination: item.recipient_destination,
          });
        });
      })
      .catch((error) => {
        console.log(error);
      });

    return apiResponse.successResponseWithData(
      res,
      "Data Berhasil Diambil",
      data
    );
  }

  /* Get Total Shipment Fee & Total Amount Paid */
  async TotalShipmentFee(req, res) {
    let condition = [
      {
        $match: {},
      },
      {
        $group: {
          _id: null,
          total_shipment_fee: {
            $sum: {
              $convert: {
                input: "$shipment_fee",
                to: "int",
                onError: "An error occurred",
                onNull: "Input was null or empty",
              },
            },
          },
          total_amount_paid: { $sum: "$amount_paid" },
          count: { $sum: 1 },
        },
      },
    ];

    await InternationalOrderModel.aggregate(condition)
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

  async AdvanceSearchTransaction(req, res) {
    let search = {};
    search[req.query.field] = req.query.search;

    await InternationalOrderModel.findOne(search)
      .then((result) => {
        return apiResponse.successResponseWithData(
          res,
          "Hasil Pencarian",
          result
        );
      })
      .catch((error) => {
        return apiResponse.ErrorResponse(res, error);
      });
  }

  async ResetManifest(req, res) {
    await InternationalOrderModel.findOneAndUpdate(
      {
        _id: req.params.id,
      },
      {
        $set: {
          position_order: req.body.position_order,
          status_order: "",
        },
      }
    );

    await InternationalOrderModel.findOneAndUpdate(
      {
        _id: req.params.id,
      },
      {
        $unset: {
          scanned_by: "",
          manifest_date: "",
        },
      }
    ).then((result) => {
      return apiResponse.successResponseWithData(
        res,
        "Sukses diupdate",
        result
      );
    });
  }

  async AutoManifestTransaction(req, res) {
    await InternationalOrderModel.find({
      $or: [{ position_order: "Mitra" }, { status_order: "Manifest" }],
    }).then(async (result) => {
      result.map(async (item) => {
        await InternationalOrderModel.findOneAndUpdate(
          {
            _id: item.id,
          },
          {
            manifest_date: item.updatedAt,
          }
        );
      });

      return apiResponse.successResponse(res, "Auto Manifest Berhasil");
    });
  }
}

/* Helpers - Generator No Order */
function next(invoiceNumber) {
  if (!invoiceNumber) throw new Error("invoiceNumber cannot be empty");
  var array = invoiceNumber.split(/[_/:\-;\\]+/);
  var lastSegment = array.pop();
  var priorSegment = invoiceNumber.substr(
    0,
    invoiceNumber.indexOf(lastSegment)
  );
  var nextNumber = alphaNumericIncrementer(lastSegment);
  return priorSegment + nextNumber;
}
function alphaNumericIncrementer(str) {
  if (str && str.length > 0) {
    var invNum = str.replace(/([^a-z0-9]+)/gi, "");
    invNum = invNum.toUpperCase();
    var index = invNum.length - 1;
    while (index >= 0) {
      if (invNum.substr(index, 1) === "9") {
        invNum = invNum.substr(0, index) + "0" + invNum.substr(index + 1);
      } else if (invNum.substr(index, 1) === "Z") {
        invNum = invNum.substr(0, index) + "A" + invNum.substr(index + 1);
      } else {
        var char = String.fromCharCode(invNum.charCodeAt(index) + 1);
        invNum = invNum.substr(0, index) + char + invNum.substr(index + 1);
        index = 0;
      }
      index--;
    }
    return invNum;
  } else {
    throw new Error("str cannot be empty");
  }
}

module.exports = InternationalOrder;
