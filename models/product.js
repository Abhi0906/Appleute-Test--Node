const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const ProductSchema = new Schema({
    p_name: String,
    p_quantity: Number,         //total available qty
    p_id: {                     //skuid
        type: Number,
        unique: true
    }
})

module.exports = mongoose.model('Product', ProductSchema);