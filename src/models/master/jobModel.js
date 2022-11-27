const mongoose = require('mongoose'); // Import Library Mongoose
const mongoosePaginate = require('mongoose-paginate-v2'); // Import Library Mongoose Paginate

/**
 * Job Schema.
 */
const schema = mongoose.Schema({
    position: String,
    job_desc: String,
    requirement: String,
    location: String,
    experience: String,
    job_type: String,
    start_date: String,
    end_date: String,
    misc_info: String
},{
    timestamps: true
});

/* Create Index */
schema.index({
    position: 'text',
    location: 'text',
},{ background: false });

/* Mengganti _id ke id */
schema.method("toJSON", function() {
    const { __v, _id, ...object } = this.toObject();
    object.id = _id;
    return object;
});

/* Add Plugin Mongoose Paginate */
schema.plugin(mongoosePaginate);

module.exports = mongoose.model("Job", schema);