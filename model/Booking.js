const mongoose = require('mongoose');
const { model, Schema } = mongoose;

const bookingSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: false,
        },
        phone: {
            type: String,
            required: true,
        },
        date: {
            type: Date,
            required: true,
        },
        hour: {
            type: Number,
            required: true,
        },
        capster_id: {
            type: Schema.Types.ObjectId,
            ref: 'Capster',
            required: true,
        },
        payment_id: {
            type: Schema.Types.ObjectId,
            ref: 'PaymentMethod',
            required: false,
        },
        rating: {
            type: Number,
            default: 0,
        },
        image: {
            type: String,
            required: false,
        },
        haircut_type: {
            type: String,
            required: false,
        },
        service_id: {
            type: Schema.Types.ObjectId,
            ref: 'Service',
            required: true,
        },
        status: {
            type: String,
            enum: ['Menunggu', 'Di Konfirmasi', 'Di Batalkan', 'Di Jadwalkan Ulang', 'Sedang Di Layani', 'Selesai', 'Tidak Hadir', 'Expired'],
            default: 'Menunggu',
        },
    },
    { timestamps: true },
);

module.exports = model('Booking', bookingSchema);
