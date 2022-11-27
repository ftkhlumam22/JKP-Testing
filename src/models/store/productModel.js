const mongoose = require("mongoose"); // Import Library Mongoose
const mongoosePaginate = require("mongoose-paginate-v2"); // Import Library Mongoose Paginate

/**
 * Agen Schema.
 */
const schema = mongoose.Schema(
  {
    name: String,
    price: Number,
    qty: Number,
    image_url: String,
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

let collectionName = "products";
module.exports = mongoose.model("Products", schema, collectionName);
