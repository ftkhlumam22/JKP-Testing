const AgenModel = require("../../models/users/agenModel");
const apiResponse = require("../../helpers/apiResponse");
const paginateLabel = require("../../helpers/paginateLabel");

/* Cloudinary Setup Config */
require("dotenv").config();
const cloudinary = require("cloudinary").v2;
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
var MAILERSEND_API_KEY = process.env.MAILERSEND_API_KEY; // get MongoDB URL from env

/**
 * Agen Class
 */
class Agen {
  constructor() {
    //
  }

  /* Create Agen */
  async createAgen(req, res) {
    /* Send Notif Email */
    const Recipient = require("mailersend").Recipient;
    const EmailParams = require("mailersend").EmailParams;
    const MailerSend = require("mailersend");

    const mailersend = new MailerSend({
      api_key: MAILERSEND_API_KEY,
    });

    const recipients = [
      new Recipient("marketingjaskipin@gmail.com", "Marketing Jaskipin"),
    ];
    const templateId = "z86org87nzlew137";
    const variables = [
      {
        email: "marketingjaskipin@gmail.com",
        substitutions: [
          {
            var: "full_name",
            value: req.body.full_name,
          },
          {
            var: "email",
            value: req.body.email,
          },
          {
            var: "phone",
            value: req.body.phone,
          },
          {
            var: "address",
            value: req.body.address,
          },
          {
            var: "subdistrict",
            value: req.body.subdistrict,
          },
          {
            var: "city",
            value: req.body.city,
          },
        ],
      },
    ];

    const emailParams = new EmailParams()
      .setFrom("notif@jaskipin.co.id")
      .setFromName("Jaskipin Notification")
      .setRecipients(recipients)
      .setSubject("Pendaftaran Agen Baru")
      .setTemplateId(templateId)
      .setVariables(variables);

    mailersend.send(emailParams);

    try {
      /* Upload Photo Location */
      const photo_location = req.body.photo_location.imageURL;
      const uploadPhotoLocationResponse = await cloudinary.uploader.upload(
        photo_location,
        {
          public_id: `agen/photo-location/${req.body.photo_location.imageName}`,
          tags: `agen, photo_location`,
        }
      );
      console.log(uploadPhotoLocationResponse);

      /* Upload Photo KTP */
      const photo_ktp = req.body.photo_ktp.imageURL;
      const uploadPhotoKTPResponse = await cloudinary.uploader.upload(
        photo_ktp,
        {
          public_id: `agen/photo-ktp/${req.body.photo_ktp.imageName}`,
          tags: `agen, photo_ktp`,
        }
      );
      console.log(uploadPhotoKTPResponse);

      let data = {
        full_name: req.body.full_name,
        email: req.body.email,
        phone: req.body.phone,
        address: req.body.address,
        subdistrict: req.body.subdistrict,
        province: req.body.province,
        city: req.body.city,
        building_type: req.body.building_type,
        job: req.body.job,
        questions: req.body.questions,
        map_location: req.body.map_location,
        photo_location: uploadPhotoLocationResponse.secure_url,
        photo_ktp: uploadPhotoKTPResponse.secure_url,
        instagram: req.body.instagram,
        facebook: req.body.facebook,
      };

      await AgenModel.create(data)
        .then((result) => {
          return apiResponse.successResponse(res, "Data Berhasil Dibuat");
        })
        .catch((error) => {
          return apiResponse.ErrorResponse(res, error);
        });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Upload File Gagal" });
    }
  }

  /* List Agen */
  async listAgen(req, res) {
    if (req.query.pagination === "false") {
      await AgenModel.find()
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
                full_name: { $regex: req.query.search, $options: "i" },
              },
              {
                email: { $regex: req.query.search, $options: "i" },
              },
            ],
          }
        : {};

      await AgenModel.paginate(condition, options)
        .then((result) => {
          return apiResponse.successResponseWithDataAndPagination(res, result);
        })
        .catch((error) => {
          return apiResponse.ErrorResponse(res, error);
        });
    }
  }

  /* Get Agen by Id */
  async getAgen(req, res) {
    await AgenModel.find({
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

  /* Update Agen by ID */
  async updateAgen(req, res) {
    try {
      let photo_location_data;
      let photo_ktp_data;

      if (req.body.photo_location.imageURL && req.body.photo_ktp.imageURL) {
        /* Upload Photo Location */
        const photo_location = req.body.photo_location.imageURL;
        const uploadPhotoLocationResponse = await cloudinary.uploader.upload(
          photo_location,
          {
            public_id: `agen/photo-location/${req.body.photo_location.imageName}`,
            tags: `agen, photo_location`,
          }
        );
        console.log(uploadPhotoLocationResponse);

        photo_location_data = uploadPhotoLocationResponse.secure_url;

        /* Upload Photo KTP */
        const photo_ktp = req.body.photo_ktp.imageURL;
        const uploadPhotoKTPResponse = await cloudinary.uploader.upload(
          photo_ktp,
          {
            public_id: `agen/photo-ktp/${req.body.photo_ktp.imageName}`,
            tags: `agen, photo_ktp`,
          }
        );
        console.log(uploadPhotoKTPResponse);

        photo_ktp_data = uploadPhotoKTPResponse.secure_url;
      } else {
        photo_location_data = req.body.photo_location;
        photo_ktp_data = req.body.photo_ktp;
      }

      let data = {
        full_name: req.body.full_name,
        email: req.body.email,
        phone: req.body.phone,
        address: req.body.address,
        subdistrict: req.body.subdistrict,
        province: req.body.province,
        city: req.body.city,
        building_type: req.body.building_type,
        job: req.body.job,
        questions: req.body.questions,
        map_location: req.body.map_location,
        photo_location: photo_location_data,
        photo_ktp: photo_ktp_data,
        facebook: req.body.facebook,
        instagram: req.body.instagram,
        is_status: req.body.is_status,
      };

      await AgenModel.updateOne(
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
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Upload File Gagal" });
    }
  }

  /* Delete Agen by ID */
  async deleteAgen(req, res) {
    await AgenModel.deleteOne({
      _id: req.params.id,
    })
      .then((result) => {
        return apiResponse.successResponse(res, "Data Berhasil Dihapus");
      })
      .catch((error) => {
        return apiResponse.ErrorResponse(res, error);
      });
  }
}

module.exports = Agen;
