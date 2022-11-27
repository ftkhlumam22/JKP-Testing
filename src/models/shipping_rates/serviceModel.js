const mongoose = require('mongoose'); // Import Library Mongoose
const mongoosePaginate = require('mongoose-paginate-v2'); // Import Library Mongoose Paginate

/**
 * Service Schema.
 */
const schema = mongoose.Schema({
    service_name: String,
    service_type: {
        type: String,
        default: 'International'
    },
},{
    timestamps: true
});

/* Create Index */
schema.index({
    service_name: 'text'
},{ background: false });

/* Mengganti _id ke id */
schema.method("toJSON", function() {
    const { __v, _id, ...object } = this.toObject();
    object.id = _id;
    return object;
});

/* Add Plugin Mongoose Paginate */
schema.plugin(mongoosePaginate);

module.exports = mongoose.model("Service", schema);