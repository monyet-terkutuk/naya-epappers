const express = require('express');
const Service = require('../model/Service'); // Assuming the model is stored in the model directory
const router = express.Router();
const { isAuthenticated, isAdmin } = require('../middleware/auth'); // Assuming you have authentication middleware

// CREATE - Create a new service
router.post('', async (req, res) => {
    try {
        const { name, description, price } = req.body;

        // Check if service already exists
        const existingService = await Service.findOne({ name });
        if (existingService) {
            return res.status(400).json({
                code: 400,
                status: 'error',
                data: {
                    error: 'Service with this name already exists',
                },
            });
        }

        const newService = new Service({ name, description, price });
        await newService.save();

        return res.status(201).json({
            code: 201,
            status: 'success',
            data: newService,
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

// READ - Get all services
router.get('', async (req, res) => {
    try {
        const services = await Service.find();
        return res.status(200).json({
            code: 200,
            status: 'success',
            data: services,
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

// READ - Get a specific service by ID
router.get('/service/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const service = await Service.findById(id);
        if (!service) {
            return res.status(404).json({
                code: 404,
                status: 'error',
                data: {
                    error: 'Service not found',
                },
            });
        }
        return res.status(200).json({
            code: 200,
            status: 'success',
            data: service,
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

// UPDATE - Update a service by ID
router.put('/service/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, price } = req.body;

        const service = await Service.findById(id);
        if (!service) {
            return res.status(404).json({
                code: 404,
                status: 'error',
                data: {
                    error: 'Service not found',
                },
            });
        }

        service.name = name || service.name;
        service.description = description || service.description;
        service.price = price || service.price;

        await service.save();

        return res.status(200).json({
            code: 200,
            status: 'success',
            data: service,
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

// DELETE - Delete a service by ID
router.delete('/service/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const service = await Service.findById(id);
        if (!service) {
            return res.status(404).json({
                code: 404,
                status: 'error',
                data: {
                    error: 'Service not found',
                },
            });
        }

        await service.remove();

        return res.status(200).json({
            code: 200,
            status: 'success',
            data: {
                message: 'Service deleted successfully',
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
