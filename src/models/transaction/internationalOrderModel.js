const mongoose = require("mongoose"); // Import Library Mongoose
const mongoosePaginate = require("mongoose-paginate-v2"); // Import Library Mongoose Paginate
const aggregatePaginate = require("mongoose-aggregate-paginate-v2");

/**
 * International Order Schema.
 */
const detail_item = mongoose.Schema({
  item_name: String,
  qty: Number,
  code: String,
  unit: String,
  total_value: Number,
});

const detail_volume = mongoose.Schema({
  berat: Number,
  koli: Number,
  panjang: Number,
  lebar: Number,
  tinggi: Number,
});

const schema = mongoose.Schema(
  {
    /* Lembaran Pengirim */
    shipment_number: String,
    sender_name: String,
    sender_address: String,
    sender_phone: String,
    /* Lembaran Penerima */
    recipient_name: String,
    recipient_address: String,
    recipient_destination: String,
    recipient_postal_code: String,
    recipient_phone: String,
    recipient_no_id: String,
    recipient_state: String,
    /* Informasi Barang/Ekspedisi */
    courier: String,
    awb_no: String,
    weight: Number,
    bag_amount: Number,
    service_type: String,
    long: Number, // Volume
    wide: Number, // Volume
    height: Number, // Volume
    shipment_fee: Number,
    pickup_by: String,
    agen: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    agen_general: String,
    /* Deskripsi/Detail Paket */
    detail_item: [detail_item],
    detail_volume: [detail_volume],
    volume_total: Number, // Volume total
    charge_weight: Number, // Charge Weight total
    /* Deskripsi Bank/Informasi Pembayaran */
    payment_type: String,
    bank: String,
    payment_info: String,
    /* Extra */
    position_order: {
      type: String,
      default: "Agen",
    },
    status_order: String,
    amount_paid: Number,
    cogs: {
      type: Number,
      default: 0,
    },
    basic_rate: {
      type: Number,
      default: 0,
    },
    total_paid: {
      type: Number,
      default: 0,
    },
    payment_status: {
      type: String,
      default: "Belum Lunas",
    },
    payment_date: Date,
    member: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      require: false,
    },
    input_by: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    scanned_by: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    branch: { type: mongoose.Schema.Types.ObjectId, ref: "Branch" },
    master_agen: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    input_by_agen: {
      type: Boolean,
      default: false,
    },
    manifest_date: Date,
    transaction_message: String,
    awb_input_date: Date,
    /* Finance */
    total_paid_cash: {
      type: Number,
      default: 0,
    },
    total_paid_transfer: {
      type: Number,
      default: 0,
    },
    tagihan_mitra: { type: mongoose.Schema.Types.ObjectId, ref: "UtangMitra" },
    cek_agen: String,
  },
  {
    timestamps: true,
  }
);

/* Create Index */
schema.index(
  {
    shipment_number: "text",
  },
  { background: false }
);

/* Mengganti _id ke id */
schema.method("toJSON", function () {
  const { __v, _id, ...object } = this.toObject();
  object.id = _id;
  return object;
});

/* Add Plugin Mongoose Paginate */
schema.plugin(mongoosePaginate);
schema.plugin(aggregatePaginate);

let collectionName = "international-transaction";
module.exports = mongoose.model(
  "InternationalTransaction",
  schema,
  collectionName
);
