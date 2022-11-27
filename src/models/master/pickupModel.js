const mongoose = require("mongoose"); // Import Library Mongoose
const mongoosePaginate = require("mongoose-paginate-v2"); // Import Library Mongoose Paginate

/**
 * Pickup Schema.
 */
const schema = mongoose.Schema(
  {
    pickup_name: String,
    pickup_phone: String,
    branch: { type: Array, required: false },
  },
  {
    timestamps: true,
  }
);

/* Create Index */
schema.index(
  {
    pickup_name: "text",
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

module.exports = mongoose.model("Pickup", schema);
