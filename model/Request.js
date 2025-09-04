const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const requestSchema = new Schema(
    {
        title: {
            type: String,
            required: true,
        },
        // type: {
        //     type: String,
        //     required: true,
        // },
        body: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        date: {
            type: Date,
            default: Date.now,
        },
        status: {
            type: String,
            enum: ['Di Proses', 'Menunggu', 'Selesai', 'Di Tolak'],
            default: 'Menunggu',
        },
        category_id: {
            type: Schema.Types.ObjectId,
            ref: "Category",
            required: true
        },
        user_id: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
    },
    { timestamps: true }
);

module.exports = model('request', requestSchema);
