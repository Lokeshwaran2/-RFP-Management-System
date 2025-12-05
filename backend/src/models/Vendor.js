const mongoose = require('mongoose');

const vendorSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    contactPerson: String,
    tags: [String]
}, { timestamps: true });

module.exports = mongoose.model('Vendor', vendorSchema);
