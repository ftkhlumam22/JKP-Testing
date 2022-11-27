const mongoose = require("mongoose"); // Import Library Mongoose
const mongoosePaginate = require("mongoose-paginate-v2"); // Import Library Mongoose Paginate

/**
 * Utang Mitra Schema.
 */
const schema = mongoose.Schema(
  {
    invoice_number: String,
    cogs: Number,
    total_amount: Number,
    payment_date: String,
    payment_type: String,
    payment_proof: String,
    courier: String,
    status: String,
    percentace: Number,
    transaction: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InternationalTransaction",
    },
  },
  {
    timestamps: true,
  }
);

/* Create Index */
schema.index(
  {
    invoice_number: "text",
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

let collectionName = "utang-mitra";
module.exports = mongoose.model("UtangMitra", schema, collectionName);
