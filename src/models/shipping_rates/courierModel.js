const mongoose = require('mongoose'); // Import Library Mongoose
const mongoosePaginate = require('mongoose-paginate-v2'); // Import Library Mongoose Paginate

/**
 * Courier Schema.
 */
const schema = mongoose.Schema({
    code: String,
    courier_name: String,
    address: String,
    phone: String,
    email: String,
    courier_type: {
        type: String,
        default: 'International'
    },
    status: Boolean
},{
    timestamps: true
});

/* Create Index */
schema.index({
    courier_name: 'text'
},{ background: false });

/* Mengganti _id ke id */
schema.method("toJSON", function() {
    const { __v, _id, ...object } = this.toObject();
    object.id = _id;
    return object;
});

/* Add Plugin Mongoose Paginate */
schema.plugin(mongoosePaginate);

module.exports = mongoose.model("Courier", schema);