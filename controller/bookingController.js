const express = require('express');
const Transaction = require('../model/Booking'); // Assuming the model is stored in the model directory
const router = express.Router();

// CREATE - Create a new booking/transaction
router.post('', async (req, res) => {
    try {
        const { name, email, phone, date, hour, capster_id, payment_id, rating, image, haircut_type, service_id, status } = req.body;

        // Check if the transaction already exists (optional validation)
        const existingTransaction = await Transaction.findOne({ email, date, hour, capster_id });
        if (existingTransaction) {
            return res.status(400).json({
                code: 400,
                status: 'error',
                data: {
                    error: 'Booking already exists for this time and capster.',
                },
            });
        }

        const newTransaction = new Transaction({
            name,
            email,
            phone,
            date,
            hour,
            capster_id,
            payment_id,
            rating,
            image,
            haircut_type,
            service_id,
            status,
        });

        await newTransaction.save();

        return res.status(201).json({
            code: 201,
            status: 'success',
            data: newTransaction,
        });
    } catch (error) {
        return res.status(500).json({
            code: 500,
            status: 'error',
            data: {
                error: error.message,
            },
        });
    }
});

// READ - Get all bookings/transactions
router.get('', async (req, res) => {
    try {
        const transactions = await Transaction.find()
            .populate('capster_id', 'username') // Populate capster name or other info as needed
            .populate('payment_id', 'name') // Populate payment method name
            .populate('service_id', 'name'); // Populate service name

        return res.status(200).json({
            code: 200,
            status: 'success',
            data: transactions,
        });
    } catch (error) {
        return res.status(500).json({
            code: 500,
            status: 'error',
            data: {
                error: error.message,
            },
        });
    }
});

// READ - Get a specific transaction by ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const transaction = await Transaction.findById(id)
            .populate('capster_id', 'username')
            .populate('payment_id', 'name')
            .populate('service_id', 'name');

        if (!transaction) {
            return res.status(404).json({
                code: 404,
                status: 'error',
                data: {
                    error: 'Transaction not found',
                },
            });
        }

        return res.status(200).json({
            code: 200,
            status: 'success',
            data: transaction,
        });
    } catch (error) {
        return res.status(500).json({
            code: 500,
            status: 'error',
            data: {
                error: error.message,
            },
        });
    }
});

// UPDATE - Update a booking/transaction by ID
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, phone, date, hour, capster_id, payment_id, rating, image, haircut_type, service_id, status } = req.body;

        const transaction = await Transaction.findById(id);
        if (!transaction) {
            return res.status(404).json({
                code: 404,
                status: 'error',
                data: {
                    error: 'Transaction not found',
                },
            });
        }

        transaction.name = name || transaction.name;
        transaction.email = email || transaction.email;
        transaction.phone = phone || transaction.phone;
        transaction.date = date || transaction.date;
        transaction.hour = hour || transaction.hour;
        transaction.capster_id = capster_id || transaction.capster_id;
        transaction.payment_id = payment_id || transaction.payment_id;
        transaction.rating = rating || transaction.rating;
        transaction.image = image || transaction.image;
        transaction.haircut_type = haircut_type || transaction.haircut_type;
        transaction.service_id = service_id || transaction.service_id;
        transaction.status = status || transaction.status;

        await transaction.save();

        return res.status(200).json({
            code: 200,
            status: 'success',
            data: transaction,
        });
    } catch (error) {
        return res.status(500).json({
            code: 500,
            status: 'error',
            data: {
                error: error.message,
            },
        });
    }
});

// DELETE - Delete a transaction by ID
router.delete('/transaction/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const transaction = await Transaction.findById(id);
        if (!transaction) {
            return res.status(404).json({
                code: 404,
                status: 'error',
                data: {
                    error: 'Transaction not found',
                },
            });
        }

        await transaction.remove();

        return res.status(200).json({
            code: 200,
            status: 'success',
            data: {
                message: 'Transaction deleted successfully',
            },
        });
    } catch (error) {
        return res.status(500).json({
            code: 500,
            status: 'error',
            data: {
                error: error.message,
            },
        });
    }
});

module.exports = router;
