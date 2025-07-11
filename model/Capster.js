const mongoose = require('mongoose');
const { model, Schema } = mongoose;

const capsterSchema = new Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
        },
        phone: {
            type: String,
            required: true,
            unique: true,
        },
        description: {
            type: String,
            required: true,
        },
        avatar: {
            type: String,
        },
        rating: {
            type: Number,
            default: 0,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        address: {
            type: String,
        },
    },
    { timestamps: true },
);

module.exports = model('Capster', capsterSchema);
