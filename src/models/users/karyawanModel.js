const mongoose = require("mongoose"); // Import Library Mongoose
const mongoosePaginate = require("mongoose-paginate-v2"); // Import Library Mongoose Paginate

/**
 * Member Schema.
 */
const schema = mongoose.Schema(
  {
    full_name: String,
    birth_date: Date,
    types: String,
    address: String,
    email: String,
    phone: String,
    join: Date,
  },
  {
    timestamps: true,
  }
);

/* Create Index */
schema.index(
  {
    full_name: "text",
    email: "text",
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

module.exports = mongoose.model("Karyawan", schema);
