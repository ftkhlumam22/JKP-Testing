const mongoose = require('mongoose'); // Import Library Mongoose
const mongoosePaginate = require('mongoose-paginate-v2'); // Import Library Mongoose Paginate

/**
 * Booking International Schema.
 */
const schema = mongoose.Schema({
    name: String,
    phone: String,
    address: String,
    content: String,
    pickup_date: String,
    weight: Number,
    long: Number,
    wide: Number,
    height: Number,
    area: String,
    category: String,
    destination: String,
    courier: String,
    etd: String,
    price: String,
    status_pickup: {
        type: Boolean,
        default: false
    }
},{
    timestamps: true
});

/* Create Index */
schema.index({
    name: 'text',
},{ background: false });

/* Mengganti _id ke id */
schema.method("toJSON", function() {
    const { __v, _id, ...object } = this.toObject();
    object.id = _id;
    return object;
});

/* Add Plugin Mongoose Paginate */
schema.plugin(mongoosePaginate);

let collectionName = 'booking-international';
module.exports = mongoose.model("BookingInternational", schema, collectionName);