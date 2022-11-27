const mongoose = require('mongoose'); // Import Library Mongoose
const mongoosePaginate = require('mongoose-paginate-v2'); // Import Library Mongoose Paginate

/**
 * Page Setting Schema.
 */
const schema = mongoose.Schema({
    home_slider: Array,
    home_benefit: Array,
    about_title: String,
    about_desc: String,
    about_body: String,
    faq_list: Array,
    contact_title: String,
    contact_desc: String,
    contact_address: String,
    contact_email: String,
    contact_phone: String,
    contact_whatsapp: String,
    job_title: String,
    job_desc: String
},{
    timestamps: true
});

/* Create Index */
schema.index({},{ background: false });

/* Mengganti _id ke id */
schema.method("toJSON", function() {
    const { __v, _id, ...object } = this.toObject();
    object.id = _id;
    return object;
});

/* Add Plugin Mongoose Paginate */
schema.plugin(mongoosePaginate);

let collectionName = 'page-setting';
module.exports = mongoose.model("PageSetting", schema, collectionName);