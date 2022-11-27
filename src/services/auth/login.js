const UserModel = require("../../models/users/userModel");
const apiResponse = require("../../helpers/apiResponse");
const { check, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

/**
 * Login Class
 */
class Login {
  constructor() {
    //
  }

  async userLogin(req, res) {
    /* Cek/Validasi Inputan Data dari Klien */
    check("email", "Silahkan Masukkan Email yang valid")
      .isEmail()
      .normalizeEmail();
    check("password", "Silahkan Masukkan Password yang valid")
      .isLength({
        min: 8,
      })
      .trim()
      .escape();

    const errors = validationResult(req); // Ambil response error dari hasil validasi

    /* Jika ada data yang tidak sesuai maka menampilkan response error ke klien */
    if (!errors.isEmpty()) {
      return apiResponse.validationErrorWithData(
        res,
        "Login Gagal! Silahkan Coba Lagi",
        errors.array()
      );
    }

    /* Define variable dari Inputan Data */
    const { email, password } = req.body;

    try {
      /* Cek Apakah User Sudah Terdaftar? */
      const user = await UserModel.findOne({
        email,
      });

      // console.log(user);

      if (!user) {
        return apiResponse.ErrorResponse(res, "user tidak terdaftar!");
      }

      if (!user.status) {
        // Cek Apakah Akun Aktif atau Tidak
        return apiResponse.ErrorResponse(res, "user tidak aktif!");
      }

      /* Cek/Validasi Inputan Password dengan Hash Password di Database */
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return apiResponse.ErrorResponse(res, "password tidak sesuai!");
      }

      /* ambil user id dan taruh di payload */
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
          expiresIn: "3600d",
        },
        (err, token) => {
          if (err) throw err; // Jika generate token gagal tampilkan error
          res.status(200).json({
            token,
          });
        }
      );
    } catch (error) {
      return apiResponse.ErrorResponse(res, "Server Error");
    }
  }

  async getUserProfile(req, res) {
    try {
      const user = await UserModel.findById(req.user.id)
        .select("-password")
        .populate("role")
        .populate("branch");
      res.json(user);
    } catch (error) {
      return apiResponse.ErrorResponse(res, "Gagal mengambil Data User");
    }
  }
}

// Cek Masa Aktif Transaksi
// function checkUserTransaction(result) {
//     let registerDate = new Date(result.createdAt);
//     let now = new Date();
//     now.setMonth(now.getMonth() - 3);

//     console.log(registerDate.toLocaleDateString());
//     console.log(now.toLocaleDateString());

//     if(registerDate > now) {
//         console.log('Kurang dari 3 bulan');
//         user = result;
//     }else if(registerDate < now) {
//         console.log('Lebih dari 3 bulan');

//         if(result.transaction && result.transaction.length > 0) {
//             let trx = 0;

//             result.transaction.map(item => {
//                 let orderDate = new Date(item.createdAt);
//                 console.log(orderDate.toLocaleDateString());
//                 if(orderDate > now) {
//                     console.log('Ada Transaksi');
//                     trx = parseInt(trx + 1);
//                 }else{
//                     console.log('Tidak Ada Transaksi')
//                 }
//             });

//             if(trx > 0) { // Jika ada transaksi boleh login
//                 user = result;
//             }else{ // Jika tidak ada transaksi selama 3 bulan akun dinonaktifkan
//                 await UserModel.findByIdAndUpdate({
//                     "_id": result.id
//                 },{
//                     $set: {
//                         status: false
//                     }
//                 });

//                 return apiResponse.ErrorResponse(res, "User Nonaktif!");
//             }
//         }else{
//             console.log('Tidak Ada Transaksi')

//             await UserModel.findByIdAndUpdate({
//                 "_id": result.id
//             },{
//                 $set: {
//                     status: false
//                 }
//             });

//             return apiResponse.ErrorResponse(res, "User Nonaktif!");
//         }
//     }
// }

module.exports = Login;
