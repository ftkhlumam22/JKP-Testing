const DomesticOrderModel = require("../../models/transaction/domesticOrderModel");
const { Parser } = require("json2csv");
const json2csvParser = new Parser();

/**
 * Backup Class
 */
class BackupDomestik {
  constructor() {
    //
  }

  /* Backup Transaksi Domestic - Done */
  async backupTransactionDomestic(req, res) {
    /* Add Advance Filter Search */
    let condition = {};

    if (
      (req.query.start_domestik && req.query.end_domestik) ||
      (req.query.start_shipment_date && req.query.end_shipment_date)
    ) {
      condition = {
        $and: [],
      };
    }

    if (
      req.query.start_domestik &&
      req.query.end_domestik &&
      req.query.start_shipment_date === undefined
    ) {
      condition["$and"].push({
        createdAt: {
          $gte: new Date(req.query.start_domestik + " 00:00:00"),
          $lt: new Date(req.query.end_domestik + " 23:59:59"),
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
}

/* Helper */
function formatDate(value) {
  let options = { year: "numeric", month: "long", day: "numeric" };
  let date = new Date(value).toLocaleString("id-ID", options);
  return date;
}

module.exports = BackupDomestik;
