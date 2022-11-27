const mongoose = require('mongoose'); // Import Library Mongoose
const mongoosePaginate = require('mongoose-paginate-v2'); // Import Library Mongoose Paginate

/**
 * Origin Schema.
 */
const schema = mongoose.Schema({
    city_name: String,
    type: String
},{
    timestamps: true
});

/* Create Index */
schema.index({
    city_name: 'text'
},{ background: false });

/* Mengganti _id ke id */
schema.method("toJSON", function() {
    const { __v, _id, ...object } = this.toObject();
    object.id = _id;
    return object;
});

/* Add Plugin Mongoose Paginate */
schema.plugin(mongoosePaginate);

module.exports = mongoose.model("Origin", schema);