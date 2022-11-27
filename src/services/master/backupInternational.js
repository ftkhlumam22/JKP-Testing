const InternationalOrderModel = require("../../models/transaction/internationalOrderModel");
const { Parser } = require("json2csv");
const json2csvParser = new Parser();

/**
 * Backup Class
 */
class BackupInternational {
  constructor() {
    //
  }

  /* Backup Transaksi International - Done */
  async internationalBackup(req, res) {
    /* Add Advance Filter Search */
    let condition = {};

    if (req.query.start_international && req.query.end_international) {
      condition = {
        $and: [],
      };
    }

    if (req.query.start_international && req.query.end_international) {
      condition["$and"].push({
        createdAt: {
          $gte: new Date(req.query.start_international + " 00:00:00"),
          $lt: new Date(req.query.end_international + " 23:59:59"),
        },
      });
    }

    await InternationalOrderModel.find(condition)
      .sort({ createdAt: 1 })
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
            berat: item.weight,
            koli: item.bag_amount,
            tipe_layanan: item.service_type,
            panjang:
              item.detail_volume[0] == undefined
                ? item.long
                : item.detail_volume[0].panjang, // Volume
            lebar:
              item.detail_volume[0] == undefined
                ? item.wide
                : item.detail_volume[0].lebar, // Volume
            tinggi:
              item.detail_volume[0] == undefined
                ? item.height
                : item.detail_volume[0].tinggi, // Volume
            volume: item.volume_total,
            ongkir: item.shipment_fee,
            pickup: item.pickup_by,
            totalValue: item.detail_item.reduce(
              (total, num) => total + parseInt(num.total_value),
              0
            ),
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
            tgl_order: formatDate(item.createdAt),
            manifest_date: item.manifest_date
              ? formatDate(item.manifest_date)
              : "Belum dimanifest",
          });
        });

        const csv = json2csvParser.parse(data);

        res.send(csv);
      });
  }
}

/* Helper */
function formatDate(value) {
  let options = { year: "numeric", month: "short", day: "numeric" };
  let date = new Date(value).toLocaleString("id-ID", options);
  return date;
}

module.exports = BackupInternational;
