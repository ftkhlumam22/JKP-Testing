const InternationalOrderModel = require("../../models/transaction/internationalOrderModel");
const DomesticOrderModel = require("../../models/transaction/domesticOrderModel");
const UserModel = require("../../models/users/userModel");
const BiayaOperasionalModel = require("../../models/finance/biayaOperasionalModel");
const TagihanMitraModel = require("../../models/finance/utangMitraModel");
const { Parser } = require("json2csv");
const json2csvParser = new Parser();

/**
 * Backup Class
 */
class Backup {
  constructor() {
    //
  }

  /* Backup Transaksi International - Done */
  async backupTransactionInternational(req, res) {
    /* Add Advance Filter Search */
    let condition = {};

    if (req.query.start_date && req.query.end_date) {
      condition = {
        $and: [],
      };
    }

    if (req.query.start_date && req.query.end_date) {
      condition["$and"].push({
        createdAt: {
          $gte: new Date(req.query.start_date + " 00:00:00"),
          $lt: new Date(req.query.end_date + " 23:59:59"),
        },
      });
    }

    await InternationalOrderModel.find(condition)
      .populate("agen")
      .populate("member")
      .populate("branch")
      .populate("input_by")
      .populate("scanned_by")
      .populate("master_agen")
      .then((result) => {
        let data = [];
        let jumlah = 0;

        result.map((item) => {
          item.detail_item.map((j) => {
            jumlah += j.total_value;
          });
          data.push({
            no_order: item.shipment_number,
            nama_pengirim: item.sender_name,
            alamat_pengirim: item.sender_address,
            no_hp_pengirim: item.sender_phone,
            /* Lembaran Penerima */
            nama_penerima: item.recipient_name,
            alamat_penerima: item.recipient_address,
            tujuan_negara_penerima: item.recipient_destination,
            kode_pos_penerima: item.recipient_postal_code,
            no_hp_penerima: item.recipient_phone,
            no_id_penerima: item.recipient_no_id,
            provinsi_penerima: item.recipient_state,
            /* Informasi Barang/Ekspedisi */
            mitra_ekspedisi: item.courier,
            no_resi: item.awb_no,
            berat: item.weight,
            koli: item.bag_amount,
            tipe_layanan: item.service_type,
            panjang: item.long, // Volume
            lebar: item.wide, // Volume
            tinggi: item.height, // Volume
            ongkir: item.shipment_fee,
            pickup: item.pickup_by,
            totalValue: jumlah,
            agen: item.agen ? item.agen.fullname : item.agen_general,
            /* Deskripsi/Detail Paket */
            deskripsi_barang: item.detail_item,
            /* Deskripsi Bank/Informasi Pembayaran */
            tipe_pembayaran: item.payment_type,
            bank: item.bank,
            keterangan_pembayaran: item.payment_info,
            /* Extra */
            posisi_order: item.position_order,
            status_order: item.status_order,
            total_yang_harus_dibayar: item.amount_paid,
            hpp: item.cogs,
            cash: item.total_paid_cash,
            transfer: item.total_paid_transfer,
            total_yang_sudah_dibayar: item.total_paid,
            status_pembayaran: item.payment_status,
            tanggal_pembayaran: item.payment_date,
            member: item.member ? item.member.fullname : "",
            input_oleh: item.input_by ? item.input_by.fullname : "",
            scan_oleh: item.scanned_by ? item.scanned_by.fullname : "",
            cabang: item.branch ? item.branch.city_name : "",
            master_agen: item.master_agen ? item.master_agen.fullname : "",
            tgl_order: formatDate(item.createdAt),
          });
        });

        const csv = json2csvParser.parse(data);

        res.send(csv);
      });
  }

  /* Backup Transaksi Domestic - Done */
  async backupTransactionDomestic(req, res) {
    /* Add Advance Filter Search */
    let condition = {};

    if (
      (req.query.start_date && req.query.end_date) ||
      (req.query.start_shipment_date && req.query.end_shipment_date)
    ) {
      condition = {
        $and: [],
      };
    }

    if (
      req.query.start_date &&
      req.query.end_date &&
      req.query.start_shipment_date === undefined
    ) {
      condition["$and"].push({
        createdAt: {
          $gte: new Date(req.query.start_date + " 00:00:00"),
          $lt: new Date(req.query.end_date + " 23:59:59"),
        },
      });
    }

    if (req.query.start_shipment_date && req.query.end_shipment_date) {
      condition["$and"].push({
        shipment_date: {
          $gte: new Date(req.query.start_shipment_date + " 00:00:00"),
          $lt: new Date(req.query.end_shipment_date + " 23:59:59"),
        },
      });
    }

    await DomesticOrderModel.find(condition)
      .populate("branch")
      .populate("input_by")
      .then((result) => {
        let data = [];

        result.map((item) => {
          data.push({
            /* Lembaran Pengirim */
            no_order: item.shipment_number,
            nama_pengirim: item.sender_name,
            alamat_pengirim: item.sender_address,
            no_hp_pengirim: item.sender_phone,
            kode_pos_pengirim: item.sender_postal_code,
            /* Lembaran Penerima */
            nama_penerima: item.recipient_name,
            provinsi: item.province,
            kota: item.city,
            alamat_penerima: item.recipient_address,
            kode_pos_penerima: item.recipient_postal_code,
            no_hp_penerima: item.recipient_phone,
            /* Informasi Barang/Ekspedisi */
            kurir: item.courier,
            layanan_kargo: item.cargo_service,
            no_resi: item.awb_no,
            berat: item.weight,
            tipe_layanan: item.service_type,
            ongkir: item.shipment_fee,
            nama_agen: item.agen_name,
            keterangan_barang: item.content_info,
            koli: item.bag_amount,
            /* Extra */
            posisi_order: item.position_order,
            status_order: item.status_order,
            total_yang_harus_dibayar: item.amount_paid,
            admin: item.input_by ? item.input_by.fullname : "-",
            cabang: item.branch ? item.branch.city_name : "-",
            tanggal_order: formatDate(item.shipment_date),
            tanggal_input: formatDate(item.createdAt),
          });
        });

        const csv = json2csvParser.parse(data);

        res.send(csv);
      });
  }

  /* Backup Pelanggan - Done */
  async backupCustomer(req, res) {
    /* Add Advance Filter Search */
    let condition = {};

    if (req.query.start_date && req.query.end_date) {
      condition = {
        $and: [],
      };
    }

    if (req.query.start_date && req.query.end_date) {
      condition["$and"].push({
        createdAt: {
          $gte: new Date(req.query.start_date + " 00:00:00"),
          $lt: new Date(req.query.end_date + " 23:59:59"),
        },
      });
    }

    await InternationalOrderModel.find(condition).then((result) => {
      let data = [];

      result.map((item) => {
        data.push({
          nama_pengirim: item.sender_name,
          alamat_pengirim: item.sender_address,
          no_hp_pengirim: item.sender_phone,
          /* Lembaran Penerima */
          nama_penerima: item.recipient_name,
          alamat_penerima: item.recipient_address,
          tujuan_negara_penerima: item.recipient_destination,
          kode_pos_penerima: item.recipient_postal_code,
          no_hp_penerima: item.recipient_phone,
          no_id_penerima: item.recipient_no_id,
          provinsi_penerima: item.recipient_state,
        });
      });

      const csv = json2csvParser.parse(data);

      res.send(csv);
    });
  }

  /* Backup Pickup - Done */
  async backupPickup(req, res) {
    /* Add Advance Filter Search */
    let condition = {};

    if (req.query.start_date && req.query.end_date && req.query.pickup_by) {
      condition = {
        $and: [],
      };
    }

    if (req.query.start_date && req.query.end_date && req.query.pickup_by) {
      condition["$and"].push({
        createdAt: {
          $gte: new Date(req.query.start_date + " 00:00:00"),
          $lt: new Date(req.query.end_date + " 23:59:59"),
        },
        pickup_by: req.query.pickup_by,
      });
    }

    await InternationalOrderModel.find(condition)
      .populate("agen")
      .populate("member")
      .populate("branch")
      .populate("input_by")
      .populate("scanned_by")
      .populate("master_agen")
      .then((result) => {
        let data = [];

        result.map((item) => {
          data.push({
            no_order: item.shipment_number,
            nama_pengirim: item.sender_name,
            alamat_pengirim: item.sender_address,
            no_hp_pengirim: item.sender_phone,
            /* Lembaran Penerima */
            nama_penerima: item.recipient_name,
            alamat_penerima: item.recipient_address,
            tujuan_negara_penerima: item.recipient_destination,
            kode_pos_penerima: item.recipient_postal_code,
            no_hp_penerima: item.recipient_phone,
            no_id_penerima: item.recipient_no_id,
            provinsi_penerima: item.recipient_state,
            /* Informasi Barang/Ekspedisi */
            mitra_ekspedisi: item.courier,
            no_resi: item.awb_no,
            volume: item.volume_total,
            detail_volume: item.detail_volume,
            berat: item.weight,
            koli: item.bag_amount,
            tipe_layanan: item.service_type,
            ongkir: item.shipment_fee,
            pickup: item.pickup_by,
            agen: item.agen ? item.agen.fullname : item.agen_general,
            /* Deskripsi/Detail Paket */
            deskripsi_barang: item.detail_item,
            /* Deskripsi Bank/Informasi Pembayaran */
            tipe_pembayaran: item.payment_type,
            bank: item.bank,
            keterangan_pembayaran: item.payment_info,
            /* Extra */
            posisi_order: item.position_order,
            status_order: item.status_order,
            total_yang_harus_dibayar: item.amount_paid,
            hpp: item.cogs,
            total_yang_sudah_dibayar: item.total_paid,
            status_pembayaran: item.payment_status,
            tanggal_pembayaran: item.payment_date,
            member: item.member ? item.member.fullname : "",
            input_oleh: item.input_by ? item.input_by.fullname : "",
            scan_oleh: item.scanned_by ? item.scanned_by.fullname : "",
            cabang: item.branch ? item.branch.city_name : "",
            master_agen: item.master_agen ? item.master_agen.fullname : "",
          });
        });

        const csv = json2csvParser.parse(data);

        res.send(csv);
      });
  }

  /* Backup Tagihan Mitra - done */
  async backupTagihanMitra(req, res) {
    /* Add Advance Filter Search */
    let condition = {};

    if (req.query.start_date && req.query.end_date) {
      condition = {
        $and: [],
      };
    }

    if (req.query.start_date && req.query.end_date) {
      condition["$and"].push({
        createdAt: {
          $gte: new Date(req.query.start_date + " 00:00:00"),
          $lt: new Date(req.query.end_date + " 23:59:59"),
        },
      });
    }

    await TagihanMitraModel.find(condition).then((result) => {
      let data = [];

      result.map((item) => {
        data.push({
          tanggal_mulai: item.start_date,
          tanggal_akhir: item.end_date,
          no_invoice: item.invoice_number,
          resi: item.awb,
          total: item.total_amount,
          mitra: item.courier,
          tanggal_pembayaran: item.payment_date,
          bukti_pembayaran: item.payment_proof,
          status: item.status,
        });
      });

      const csv = json2csvParser.parse(data);

      res.send(csv);
    });
  }

  /* Backup Biaya Operasional */
  async backupBiayaOperasional(req, res) {
    /* Add Advance Filter Search */
    let condition = {};

    if (req.query.start_date && req.query.end_date) {
      condition = {
        $and: [],
      };
    }

    if (req.query.start_date && req.query.end_date) {
      condition["$and"].push({
        createdAt: {
          $gte: new Date(req.query.start_date + " 00:00:00"),
          $lt: new Date(req.query.end_date + " 23:59:59"),
        },
      });
    }

    await BiayaOperasionalModel.find(condition).then((result) => {
      let data = [];

      result.map((item) => {
        data.push({
          deskripsi_biaya: item.cost_description,
          source_of_fund: item.source_of_fund,
          nominal: item.nominal,
          bukti_gambar: item.proof_image,
          metode_pembayaran: item.payment_method,
          info_biaya: item.cost_information,
          tanggal_biaya: item.cost_date,
        });
      });

      const csv = json2csvParser.parse(data);

      res.send(csv);
    });
  }

  /* Backup Piutang Agen */
  async backupPiutangAgen(req, res) {
    await UserModel.find({
      $or: [{ type_user: "Agen" }, { type_user: "Master Agen" }],
    })
      .populate("transaction")
      .then((result) => {
        let data = [];

        result.map((item) => {
          data.push({
            nama_agen: item.fullname,
            lunas: item.transaction.filter(
              (item) => item.payment_status === "Lunas"
            ).length,
            belum_lunas: item.transaction.filter(
              (item) => item.payment_status === "Belum Lunas"
            ).length,
            total_transaksi: item.transaction.length,
            total_nominal: item.transaction.reduce(
              (total, num) =>
                total +
                parseInt(
                  num.amount_paid !== null
                    ? num.amount_paid - num.total_paid
                    : 0
                ),
              0
            ),
          });
        });

        const csv = json2csvParser.parse(data);

        res.send(csv);
      });
  }

  /* Biaya Operasional New */
  async backupOperasional(req, res) {
    /* Add Advance Filter Search */

    let condition = {};

    if (req.query.start_operasional && req.query.end_operasional) {
      condition = {
        $and: [],
      };
    }

    if (req.query.start_operasional && req.query.end_operasional) {
      condition["$and"].push({
        createdAt: {
          $gte: new Date(req.query.start_operasional + " 00:00:00"),
          $lt: new Date(req.query.end_operasional + " 23:59:59"),
        },
      });
    }

    await BiayaOperasionalModel.find(condition).then((result) => {
      // return res.json(result);
      let data = [];

      result.map((item) => {
        data.push({
          deskripsi_biaya: item.cost_description,
          nominal: item.nominal,
          bukti_gambar: item.proof_image,
          metode_pembayaran: item.payment_method,
          info_biaya: item.cost_information,
          tanggal_biaya: item.cost_date,
        });
      });

      const csv = json2csvParser.parse(data);

      res.send(csv);
    });
  }

  async categoryBackupOperasional(req, res) {
    /* Add Advance Filter Search */

    let condition = [
      {
        $match: {
          $and: [
            {
              createdAt: {
                $gte: new Date(req.query.start_operasional + " 00:00:00"),
                $lt: new Date(req.query.end_operasional + " 23:59:59"),
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
          from: "cost-categories",
          localField: "category_id",
          foreignField: "_id",
          as: "categoryRole",
        },
      },
      {
        $unwind: "$categoryRole",
      },
      {
        $group: {
          _id: "$category_id",
          total: { $sum: "$nominal" },
          category: { $max: "$categoryRole.cost_category_name" },
        },
      },
      {
        $sort: { _id: 1 },
      },
      {
        $project: {
          category: 1,
          total: 1,
        },
      },
    ];

    await BiayaOperasionalModel.aggregate(condition).then((result) => {
      // return res.json(result);
      let data = [];

      result.map((item) => {
        data.push({
          nama_kategory: item.category,
          total_uang: formatPrice(item.total),
        });
      });

      const csv = json2csvParser.parse(data);

      res.send(csv);
    });
  }
}

/* Helper */
function formatDate(value) {
  let options = { year: "numeric", month: "long", day: "numeric" };
  let date = new Date(value).toLocaleString("id-ID", options);
  return date;
}
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

module.exports = Backup;
