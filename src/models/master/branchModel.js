const mongoose = require('mongoose'); // Import Library Mongoose
const mongoosePaginate = require('mongoose-paginate-v2'); // Import Library Mongoose Paginate

/**
 * Branch Schema.
 */
const schema = mongoose.Schema({
    city_name: String,
    address: String,
    phone: String
},{
    timestamps: true
});

/* Create Index */
schema.index({
    city_name: 'text',
    address: 'text',
},{ background: false });

/* Mengganti _id ke id */
schema.method("toJSON", function() {
    const { __v, _id, ...object } = this.toObject();
    object.id = _id;
    return object;
});

/* Add Plugin Mongoose Paginate */
schema.plugin(mongoosePaginate);

module.exports = mongoose.model("Branch", schema);