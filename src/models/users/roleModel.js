const mongoose = require('mongoose'); // Import Library Mongoose
const mongoosePaginate = require('mongoose-paginate-v2'); // Import Library Mongoose Paginate

/**
 * Role Schema.
 */
const schema = mongoose.Schema({
    role_name: { type: String, required: true },
    access_permission: { type: String, required: false }
},{
    timestamps: true
});

/* Create Index */
schema.index({
    role_name: 'text',
},{ background: false });

/* Mengganti _id ke id */
schema.method("toJSON", function() {
    const { __v, _id, ...object } = this.toObject();
    object.id = _id;
    return object;
});

/* Add Plugin Mongoose Paginate */
schema.plugin(mongoosePaginate);

module.exports = mongoose.model("Role", schema);