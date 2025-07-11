const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    address: String,
    password: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    birthdate: Date,
    place_of_birth: String,
    image: String,
    gender: {
      type: String,
      enum: ['laki-laki', 'perempuan'],
    },
    class_name: String,
    role: {
      type: String,
      enum: ['admin', 'user'],
      default: 'user',
      required: true,
    },
    nisn: String,
    nis: String,
  },
  { timestamps: true }
);

module.exports = model('User', userSchema);
