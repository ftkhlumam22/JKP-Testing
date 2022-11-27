const mongoose = require("mongoose"); // Import Library Mongoose
const mongoosePaginate = require("mongoose-paginate-v2"); // Import Library Mongoose Paginate

/**
 * Agen Schema.
 */
const schema = mongoose.Schema(
  {
    qty: Number,
    price: Number,
    name: String,
    image_url: String,
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Products",
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    branch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
    },
    status: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

/* Mengganti _id ke id */
schema.method("toJSON", function () {
  const { __v, _id, ...object } = this.toObject();
  object.id = _id;
  return object;
});

/* Add Plugin Mongoose Paginate */
schema.plugin(mongoosePaginate);

let collectionName = "cart";
module.exports = mongoose.model("Cart", schema, collectionName);
