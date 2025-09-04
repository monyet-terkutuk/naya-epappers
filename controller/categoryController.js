const express = require('express');
const Category = require('../model/Category'); // asumsi path ke model Category
const router = express.Router();

// CREATE - Create a new category
router.post('', async (req, res) => {
    try {
        const { name, description, bobot } = req.body;

        // Check if category already exists
        const existingCategory = await Category.findOne({ name });
        if (existingCategory) {
            return res.status(400).json({
                code: 400,
                status: 'error',
                data: {
                    error: 'Category with this name already exists',
                },
            });
        }

        const newCategory = new Category({ name, description, bobot });
        await newCategory.save();

        return res.status(201).json({
            code: 201,
            status: 'success',
            data: newCategory,
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

// READ - Get all categories
router.get('/list', async (req, res) => {
    try {
        const categories = await Category.find();
        return res.status(200).json({
            code: 200,
            status: 'success',
            data: categories,
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

// READ - Get a specific category by ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const category = await Category.findById(id);
        if (!category) {
            return res.status(404).json({
                code: 404,
                status: 'error',
                data: {
                    error: 'Category not found',
                },
            });
        }
        return res.status(200).json({
            code: 200,
            status: 'success',
            data: category,
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

// UPDATE - Update a category by ID
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, bobot } = req.body;

        const category = await Category.findById(id);
        if (!category) {
            return res.status(404).json({
                code: 404,
                status: 'error',
                data: {
                    error: 'Category not found',
                },
            });
        }

        category.name = name || category.name;
        category.description = description || category.description;
        category.bobot = bobot || category.bobot;

        await category.save();

        return res.status(200).json({
            code: 200,
            status: 'success',
            data: category,
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

// DELETE - Delete a category by ID
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const category = await Category.findByIdAndDelete(id);
        if (!category) {
            return res.status(404).json({
                code: 404,
                status: 'error',
                data: {
                    error: 'Category not found',
                },
            });
        }


        return res.status(200).json({
            code: 200,
            status: 'success',
            data: {
                message: 'Category deleted successfully',
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
