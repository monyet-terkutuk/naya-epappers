const mongoose = require('mongoose');
const { model, Schema } = mongoose;

const paymentMethodSchema = new Schema(
    {
        name: {
            type: String,        // Field 'name' bertipe String
            required: true,      // Field 'name' wajib diisi
            unique: true,        // Nama metode pembayaran harus unik
        },
    },
    { timestamps: true },     // Mengaktifkan timestamps untuk mencatat waktu pembuatan dan pembaruan data
);

module.exports = model('PaymentMethod', paymentMethodSchema);
