const mongoose = require("mongoose"); // Import Library Mongoose
const mongoosePaginate = require("mongoose-paginate-v2"); // Import Library Mongoose Paginate

/**
 * Agen Schema.
 */
const schema = mongoose.Schema(
  {
    full_name: String,
    address: String,
    subdistrict: String,
    province: String,
    city: String,
    email: String,
    phone: String,
    building_type: String,
    job: String,
    questions: Array,
    map_location: String,
    photo_location: String,
    photo_ktp: String,
    instagram: String,
    facebook: String,
    is_status: { type: Boolean, required: true, default: false },
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

let collectionName = "agen";
module.exports = mongoose.model("Agen", schema, collectionName);
