const mongoose = require('mongoose');
const { model, Schema } = mongoose;

const categorySchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
        },
        description: {
            type: String,
        },
        bobot: {
            type: Number,
            required: true,
        },
    },
    { timestamps: true },
);

module.exports = model('Category', categorySchema);
