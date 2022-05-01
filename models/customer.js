const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const CustomerSchema = new Schema({
    c_name: String,
    c_state: String,
    c_country: String,
    c_city: String,
    c_email: {
        type: String,
        unique: true
    },
    orders: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Order'
        }
    ]
})

module.exports = mongoose.model('Customer', CustomerSchema);