const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    passwordHash: { type: String, required: true }, // Simple for now
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
