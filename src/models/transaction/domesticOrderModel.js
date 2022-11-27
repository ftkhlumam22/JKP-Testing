const mongoose = require("mongoose"); // Import Library Mongoose
const mongoosePaginate = require("mongoose-paginate-v2"); // Import Library Mongoose Paginate

/**
 * Domestic Order Schema.
 */
const schema = mongoose.Schema(
  {
    /* Lembaran Pengirim */
    shipment_number: String,
    shipment_date: Date,
    sender_name: String,
    sender_address: String,
    sender_phone: String,
    sender_postal_code: String,
    /* Lembaran Penerima */
    recipient_name: String,
    province: String,
    city: String,
    recipient_address: String,
    recipient_postal_code: String,
    recipient_phone: String,
    /* Informasi Barang/Ekspedisi */
    courier: String,
    cargo_service: String,
    awb_no: String,
    weight: Number,
    service_type: String,
    shipment_fee: Number,
    agen_name: String,
    content_info: String,
    bag_amount: Number,
    /* Extra */
    position_order: {
      type: String,
      default: "Agen",
    },
    status_order: String,
    amount_paid: Number,
    input_by: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    branch: { type: mongoose.Schema.Types.ObjectId, ref: "Branch" },
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

let collectionName = "domestic-transaction";
module.exports = mongoose.model("DomesticTransaction", schema, collectionName);
