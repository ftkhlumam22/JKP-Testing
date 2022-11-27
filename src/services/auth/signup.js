const UserModel = require("../../models/users/userModel");
const apiResponse = require("../../helpers/apiResponse");
const { check, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

/**
 * Signup Class
 */
class Signup {
  constructor() {
    //
  }

  async userSignup(req, res) {
    /* Cek/Validasi Inputan Data dari Klien */
    check("fullname", "Silahkan Masukkan Nama Lengkap")
      .not()
      .isEmpty()
      .trim()
      .escape();
    check("email", "Silahkan Masukkan Email yang valid")
      .isEmail()
      .normalizeEmail();
    check("phone", "Silahkan Masukkan No HP yang valid")
      .not()
      .isEmpty()
      .trim()
      .escape();
    check("password", "Silahkan Masukkan Password minimal 8 karakter")
      .isLength({
        min: 8,
      })
      .trim()
      .escape();
    check("role", "Silahkan Masukkan Role Pengguna").not().isEmpty();

    const errors = validationResult(req); // Ambil response error dari hasil validasi

    /* Jika ada data yang tidak sesuai maka menampilkan response error ke klien */
    if (!errors.isEmpty()) {
      return apiResponse.validationErrorWithData(
        res,
        "Data Gagal Dibuat",
        errors.array()
      );
    }

    /* Define variable dari Inputan Data */
    const {
      code_user,
      fullname,
      email,
      phone,
      address,
      province,
      city,
      branch,
      type_user,
      password,
      role,
      master_agen,
      saldo,
      type_branch,
    } = req.body;

    try {
      /* Cek Apakah User (Email atau No HP) Sudah Terdaftar? */
      let user = await UserModel.findOne({
        $or: [{ email: email }, { phone: phone }],
      });
      if (user) {
        return apiResponse.ErrorResponse(res, "User Sudah Terdaftar!");
      }

      /* Simpan/Input data dari klien ke Model/Collection User  */
      user = UserModel({
        code_user,
        fullname,
        email,
        phone,
        address,
        province,
        city,
        branch,
        type_user,
        password,
        role,
        master_agen,
        saldo,
        type_branch,
      });

      /* Hash Password dengan bcrypt Library */
      user.password = await this.hashPassword(password);

      /* Simpan Data User */
      await user.save();

      /* Ambil ID dari Data yang baru disimpan */
      const payload = {
        user: {
          id: user.id,
        },
      };

      /* Generate jsonwebtoken */
      jwt.sign(
        payload,
        "randomString",
        {
          expiresIn: 10000,
        },
        (err, token) => {
          if (err) throw err; // Jika generate token gagal tampilkan error
          // res.status(200).json({
          //     token
          // });
          const data = {
            token: token,
          };
          return apiResponse.successResponseWithData(
            res,
            "User Berhasil Didaftarkan",
            data
          );
        }
      );
    } catch (error) {
      console.log(error);
      return apiResponse.ErrorResponse(res, "User Gagal Didaftarkan!");
    }
  }

  async mutipleUserSignup(item, res) {
    /* Cek/Validasi Inputan Data dari Klien */
    check("fullname", "Silahkan Masukkan Nama Lengkap")
      .not()
      .isEmpty()
      .trim()
      .escape();
    check("email", "Silahkan Masukkan Email yang valid")
      .isEmail()
      .normalizeEmail();
    check("phone", "Silahkan Masukkan No HP yang valid")
      .not()
      .isEmpty()
      .trim()
      .escape();
    check("password", "Silahkan Masukkan Password minimal 8 karakter")
      .isLength({
        min: 8,
      })
      .trim()
      .escape();

    const errors = validationResult(item); // Ambil response error dari hasil validasi

    /* Jika ada data yang tidak sesuai maka menampilkan response error ke klien */
    if (!errors.isEmpty()) {
      return apiResponse.validationErrorWithData(
        res,
        "Data Gagal Dibuat",
        errors.array()
      );
    }

    /* Define variable dari Inputan Data */
    const {
      code_user,
      fullname,
      email,
      phone,
      address,
      province,
      city,
      branch,
      type_user,
      password,
      role,
      master_agen,
      saldo,
      type_branch,
    } = item;

    try {
      /* Cek Apakah User (Email atau No HP) Sudah Terdaftar? */
      let user = await UserModel.findOne({
        $or: [{ email: email }, { phone: phone }],
      });
      if (user) {
        return apiResponse.ErrorResponse(res, "User Sudah Terdaftar!");
      }

      /* Simpan/Input data dari klien ke Model/Collection User  */
      user = UserModel({
        code_user,
        fullname,
        email,
        phone,
        address,
        province,
        city,
        branch,
        type_user,
        password,
        role,
        master_agen,
        saldo,
        type_branch,
      });

      /* Hash Password dengan bcrypt Library */
      user.password = await this.hashPassword(password);

      /* Simpan Data User */
      await user.save();

      /* Ambil ID dari Data yang baru disimpan */
      const payload = {
        user: {
          id: user.id,
        },
      };

      /* Generate jsonwebtoken */
      jwt.sign(
        payload,
        "randomString",
        {
          expiresIn: 10000,
        },
        (err, token) => {
          if (err) throw err; // Jika generate token gagal tampilkan error
          const data = {
            token: token,
          };
          return true;
          // return apiResponse.successResponseWithData(res, "User Berhasil Didaftarkan", data)
        }
      );
    } catch (error) {
      console.log(error);
      return error;
      // return apiResponse.ErrorResponse(res, "User Gagal Didaftarkan!");
    }
  }

  async hashPassword(password) {
    /* Hash Password dengan bcrypt Library */
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
  }
}

module.exports = Signup;
