const mongoose = require('mongoose'); // Import Library Mongoose
const mongoosePaginate = require('mongoose-paginate-v2'); // Import Library Mongoose Paginate

/**
 * Cost Category Schema.
 */
const schema = mongoose.Schema({
    cost_category_name: String,
},{
    timestamps: true
});

/* Create Index */
schema.index({
    cost_category_name: 'text'
},{ background: false });

/* Mengganti _id ke id */
schema.method("toJSON", function() {
    const { __v, _id, ...object } = this.toObject();
    object.id = _id;
    return object;
});

/* Add Plugin Mongoose Paginate */
schema.plugin(mongoosePaginate);

let collectionName = 'cost-categories';
module.exports = mongoose.model("CostCategory", schema, collectionName);