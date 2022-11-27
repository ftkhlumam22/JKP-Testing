const mongoose = require('mongoose'); // Import Library Mongoose
const mongoosePaginate = require('mongoose-paginate-v2'); // Import Library Mongoose Paginate

/**
 * Bank Courier Schema.
 */
const schema = mongoose.Schema({
    bank_name: String,
    account_number: String,
    account_name: String
},{
    timestamps: true
});

/* Create Index */
schema.index({
    bank_name: 'text',
    account_name: 'text',
},{ background: false });

/* Mengganti _id ke id */
schema.method("toJSON", function() {
    const { __v, _id, ...object } = this.toObject();
    object.id = _id;
    return object;
});

/* Add Plugin Mongoose Paginate */
schema.plugin(mongoosePaginate);

let collectionName = 'bank-courier';
module.exports = mongoose.model("BankCourier", schema, collectionName);