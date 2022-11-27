const karyawanModel = require("../../models/users/karyawanModel");
const apiResponse = require("../../helpers/apiResponse");
const paginateLabel = require("../../helpers/paginateLabel");

async function getAllKaryawan(req, res, next) {
  await karyawanModel
    .find()
    .then((result) => {
      return res.status(200).json({
        message: "sukses ambil data",
        data: result,
      });
    })
    .catch((e) => next(e));
}
async function getKaryawan(req, res) {
  if (req.query.pagination === "false") {
    await karyawanModel
      .find()
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
    };

    /* Add Filter Search */
    var condition = req.query.search
      ? {
          $or: [
            {
              city_name: { $regex: req.query.search, $options: "i" },
            },
            {
              address: { $regex: req.query.search, $options: "i" },
            },
          ],
        }
      : {};

    await karyawanModel
      .paginate(condition, options)
      .then((result) => {
        return apiResponse.successResponseWithDataAndPagination(res, result);
      })
      .catch((error) => {
        return apiResponse.ErrorResponse(res, error);
      });
  }
}

/* Get Member by Id */
async function getIdKaryawan(req, res) {
  await karyawanModel
    .find({
      _id: req.params.id,
    })
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

/* Update Karyawan by ID */
async function updateKaryawan(req, res) {
  await karyawanModel
    .updateOne(
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

async function postKaryawan(req, res, next) {
  await karyawanModel
    .create(req.body)
    .then((item) => {
      return res.status(200).json(item);
    })
    .catch((e) => next(e));
}

async function deleteKaryawan(req, res) {
  await karyawanModel
    .deleteOne({
      _id: req.params.id,
    })
    .then((result) => {
      return apiResponse.successResponse(res, "Data Berhasil Dihapus");
    })
    .catch((error) => {
      return apiResponse.ErrorResponse(res, error);
    });
}

module.exports = {
  getIdKaryawan,
  updateKaryawan,
  postKaryawan,
  getKaryawan,
  deleteKaryawan,
  getAllKaryawan,
};
