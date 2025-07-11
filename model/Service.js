const mongoose = require('mongoose');
const { model, Schema } = mongoose;

const serviceSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
        },
        description: {
            type: String,
            required: true,
        },
        price: {
            type: Number,
            required: true,
        },
    },
    { timestamps: true },
);

module.exports = model('Service', serviceSchema);
