const mongoose = require('mongoose');
const { model, Schema } = mongoose;

const templateSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
        },
        body: {
            type: String,
            required: true,
        },
        type: {
            type: String,
            required: true,
        },
    },
    { timestamps: true },
);

module.exports = model('Template', templateSchema);
