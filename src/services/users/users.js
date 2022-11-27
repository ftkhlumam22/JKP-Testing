const UserModel = require("../../models/users/userModel");
const RoleModel = require("../../models/users/roleModel");
const BranchModel = require("../../models/master/branchModel");
const apiResponse = require("../../helpers/apiResponse");
const paginateLabel = require("../../helpers/paginateLabel");
const csv = require("csvtojson");
const signup_service = require("../auth/signup"); // Import User Service
const { ObjectId } = require("bson");
const Signup = new signup_service(); // Instance Object

/**
 * User Class
 */
class User {
  constructor() {
    //
  }

  /* Create User */
  async createUser(req, res) {
    await Signup.userSignup(req, res);
  }

  /* Import User */
  async importUser(req, res) {
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
              let id_role;
              let id_branch;

              await RoleModel.findOne({
                role_name: { $regex: item.role, $options: "i" },
              }) // Relasi dengan collection Agen
                .then((result) => {
                  id_role = result.id;
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
                fullname: item.fullname,
                email: item.email,
                phone: item.phone,
                address: item.address,
                province: item.province,
                branch: id_branch,
                type_user: item.type_user,
                password: item.password,
                role: id_role,
              };

              console.log(data);

              Signup.mutipleUserSignup(data).catch((error) => {
                console.log(error);
              });
            })
          ).then((items) => {
            items.forEach((item) => {
              if (item.error) {
                console.log(item.error);
                apiResponse.ErrorResponse(res, item.error);
              } else {
                apiResponse.successResponse(res, "Data Berhasil Dibuat");
              }
            });
          });

          return apiResponse.successResponse(res, "Data Berhasil Dibuat"); // Abaikan Error
        });
    }
  }

  /* List User */
  async listUser(req, res, next) {
    try {
      if (req.query.pagination === "false") {
        await UserModel.find()
          .populate("branch")
          .populate("role")
          .populate("master_agen") // Relasi dengan collection Role
          .then((result) => {
            return apiResponse.successResponseWithDataAndPagination(
              res,
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
          populate: "branch role master_agen", // Relasi dengan collection Role
          customLabels: paginateLabel,
        };

        /* Add Filter Search */
        let condition = {};
        if (req.query.search || req.query.role_mutiple || req.query.branch) {
          condition = {
            $and: [],
          };
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
              {
                phone: { $regex: req.query.search, $options: "i" },
              },
            ],
          });
        }

        if (req.query.branch) {
          condition["$and"].push({
            branch: ObjectId(req.query.branch),
          });
        }

        if (req.query.role_mutiple) {
          let role_mutiple = [];
          req.query.role_mutiple.map((item) => {
            role_mutiple.push({
              role: ObjectId(item),
            });
          });
          condition["$and"].push({
            $or: role_mutiple,
          });
        }

        await UserModel.paginate(condition, options)
          .then((result) => {
            return apiResponse.successResponseWithDataAndPagination(
              res,
              result
            );
          })
          .catch((error) => {
            console.log(error);
            return apiResponse.ErrorResponse(res, error);
          });
      }
    } catch (error) {
      next(error);
    }
  }

  /* Get User by Id */
  async getUser(req, res) {
    await UserModel.find({
      _id: req.params.id,
    })
      .populate("branch")
      .populate("role")
      .populate("master_agen") // Relasi dengan collection Role
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

  /* Update User by ID */
  async updateUser(req, res) {
    let password = null;

    if (req.body.password) {
      /* Hash Password dengan bcrypt Library */
      password = await Signup.hashPassword(req.body.password);
    }

    /* Simpan/Input data dari klien ke Model/Collection User  */
    let data = {
      code_user: req.body.code_user,
      fullname: req.body.fullname,
      email: req.body.email,
      phone: req.body.phone,
      address: req.body.address,
      province: req.body.province,
      city: req.body.city,
      branch: req.body.branch,
      type_user: req.body.type_user,
      role: req.body.role,
      status: req.body.status,
      master_agen: req.body.master_agen,
      type_branch: req.body.type_branch,
      saldo: req.body.saldo,
    };

    if (req.body.password) {
      data.password = password;
    }

    await UserModel.updateOne(
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
  }

  /* Delete User by ID */
  async deleteUser(req, res) {
    await UserModel.deleteOne({
      _id: req.params.id,
    })
      .then((result) => {
        return apiResponse.successResponse(res, "Data Berhasil Dihapus");
      })
      .catch((error) => {
        return apiResponse.ErrorResponse(res, error);
      });
  }

  /* Delete Many User */
  async deleteManyUser(req, res) {
    await UserModel.deleteMany()
      .then((result) => {
        return apiResponse.successResponse(res, "Data Berhasil Dihapus");
      })
      .catch((error) => {
        return apiResponse.ErrorResponse(res, error);
      });
  }
}

module.exports = User;
