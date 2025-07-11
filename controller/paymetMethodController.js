const express = require('express');
const PaymentMethod = require('../model/PaymentMethod');
const router = express.Router();
const { isAuthenticated, isAdmin } = require('../middleware/auth'); // Assuming you have authentication and authorization middleware

// CREATE - Create a new payment method
router.post('', async (req, res, next) => {
    try {
        const { name } = req.body;

        // Check if the payment method already exists
        const existingPaymentMethod = await PaymentMethod.findOne({ name });
        if (existingPaymentMethod) {
            return res.status(400).json({
                code: 400,
                status: 'error',
                data: {
                    error: 'Payment method with this name already exists',
                },
            });
        }

        const newPaymentMethod = new PaymentMethod({ name });
        await newPaymentMethod.save();

        return res.status(201).json({
            code: 201,
            status: 'success',
            data: newPaymentMethod,
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

// READ - Get all payment methods
router.get('/list', async (req, res, next) => {
    try {
        const paymentMethods = await PaymentMethod.find();
        return res.status(200).json({
            code: 200,
            status: 'success',
            data: paymentMethods,
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

// READ - Get a specific payment method by ID
router.get('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;

        const paymentMethod = await PaymentMethod.findById(id);
        if (!paymentMethod) {
            return res.status(404).json({
                code: 404,
                status: 'error',
                data: {
                    error: 'Payment method not found',
                },
            });
        }

        return res.status(200).json({
            code: 200,
            status: 'success',
            data: paymentMethod,
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

// UPDATE - Update a payment method by ID
router.put('/payment-method/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name } = req.body;

        const paymentMethod = await PaymentMethod.findById(id);
        if (!paymentMethod) {
            return res.status(404).json({
                code: 404,
                status: 'error',
                data: {
                    error: 'Payment method not found',
                },
            });
        }

        paymentMethod.name = name || paymentMethod.name;
        await paymentMethod.save();

        return res.status(200).json({
            code: 200,
            status: 'success',
            data: paymentMethod,
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

// DELETE - Delete a payment method by ID
router.delete('/payment-method/:id', isAdmin, async (req, res, next) => {
    try {
        const { id } = req.params;

        const paymentMethod = await PaymentMethod.findById(id);
        if (!paymentMethod) {
            return res.status(404).json({
                code: 404,
                status: 'error',
                data: {
                    error: 'Payment method not found',
                },
            });
        }

        await paymentMethod.remove();

        return res.status(200).json({
            code: 200,
            status: 'success',
            data: {
                message: 'Payment method deleted successfully',
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
