const mongoose = require("mongoose"); // Import Library Mongoose
const mongoosePaginate = require("mongoose-paginate-v2"); // Import Library Mongoose Paginate

/**
 * User Schema.
 */
const schema = mongoose.Schema(
  {
    code_user: { type: String, required: false },
    fullname: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: false },
    province: { type: String, required: false },
    city: { type: String, required: false },
    branch: { type: mongoose.Schema.Types.ObjectId, ref: "Branch" },
    password: { type: String, required: true },
    isConfirmed: { type: Boolean, required: false, default: 0 },
    role: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Role",
      default: "60486936d029a8217bb01cb9",
    },
    master_agen: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    type_user: { type: String },
    status: { type: Boolean, required: true, default: 1 },
    transaction: [
      { type: mongoose.Schema.Types.ObjectId, ref: "InternationalTransaction" },
    ],
    saldo: { type: Number, required: false, default: 0 },
    type_branch: { type: Array, required: false },
  },
  {
    timestamps: true,
  }
);

/* Create Index */
schema.index(
  {
    fullname: "text",
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

module.exports = mongoose.model("User", schema);
