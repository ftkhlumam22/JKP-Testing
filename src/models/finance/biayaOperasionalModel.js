const mongoose = require("mongoose"); // Import Library Mongoose
const mongoosePaginate = require("mongoose-paginate-v2"); // Import Library Mongoose Paginate

/**
 * Biaya Operasional Schema.
 */
const schema = mongoose.Schema(
  {
    cost_description: String,
    nominal: Number,
    proof_image: String,
    payment_method: String,
    cost_information: String,
    cost_date: Date,
    cost_category: String,
    source_of_fund: String,
    branch: { type: mongoose.Schema.Types.ObjectId, ref: "Branch" },
    category_id: { type: mongoose.Schema.Types.ObjectId, ref: "CostCategory" },
    isActive: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

/* Create Index */
schema.index(
  {
    cost_description: "text",
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

let collectionName = "biaya-operasional";
module.exports = mongoose.model("BiayaOperasional", schema, collectionName);
