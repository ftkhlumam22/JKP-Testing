const mongoose = require('mongoose'); // Import Library Mongoose
const mongoosePaginate = require('mongoose-paginate-v2'); // Import Library Mongoose Paginate

/**
 * Cost Schema.
 */
const schema = mongoose.Schema({
    cost: Number,
    etd: String,
    weight: Number,
    destination: String,
    category: String,
    courier: String,
    zone: String,
    type: String
},{
    timestamps: true
});

/* Create Index */
schema.index({
    courier: 'text',
    destination: 'text',
    category: 'text'
},{ background: false });

/* Mengganti _id ke id */
schema.method("toJSON", function() {
    const { __v, _id, ...object } = this.toObject();
    object.id = _id;
    return object;
});

/* Add Plugin Mongoose Paginate */
schema.plugin(mongoosePaginate);

module.exports = mongoose.model("Cost", schema);