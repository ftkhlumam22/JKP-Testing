const mongoose = require("mongoose"); // Import Library Mongoose
const mongoosePaginate = require("mongoose-paginate-v2"); // Import Library Mongoose Paginate

/**
 * Utang Mitra Schema.
 */
const allTransaction = mongoose.Schema({
  type: String,
});
const schema = mongoose.Schema(
  {
    invoice_number: String,
    customer: String,
    invoice_date: Date,
    invoice_due_date: Date,
    transaction: [
      { type: mongoose.Schema.Types.ObjectId, ref: "InternationalTransaction" },
    ],
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

let collectionName = "invoice-agen";
module.exports = mongoose.model("InvoiceAgen", schema, collectionName);
