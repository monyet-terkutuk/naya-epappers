const express = require("express");
const router = express.Router();
const Template = require("../model/Template");
const Category = require("../model/Category");
const Validator = require("fastest-validator");
const v = new Validator();
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const { isAuthenticated, isAdmin } = require("../middleware/auth");

// Validation schema
const schema = {
    name: { type: "string", empty: false },
    body: { type: "string", empty: false },
    category_id: { type: "string", empty: false }, // wajib ada category
};

// ✅ Create Template
router.post(
    "",
    isAuthenticated,
    catchAsyncErrors(async (req, res) => {
        const validation = v.validate(req.body, schema);
        if (validation !== true) {
            return res.status(400).json({
                code: 400,
                status: "error",
                message: "Validation failed",
                data: validation,
            });
        }

        const { name, body, category_id } = req.body;

        // cek category valid
        const category = await Category.findById(category_id);
        if (!category) {
            return res.status(400).json({
                code: 400,
                status: "error",
                message: "Invalid category_id",
            });
        }

        const template = await Template.create({ name, body, category_id });

        res.status(201).json({
            code: 201,
            status: "success",
            data: template,
        });
    })
);

// ✅ Get All Templates
router.get(
    "/list",
    isAuthenticated,
    catchAsyncErrors(async (req, res) => {
        const templates = await Template.find()
            .sort({ createdAt: -1 })
            .populate("category_id");

        res.status(200).json({
            code: 200,
            status: "success",
            data: templates.map((t) => ({
                id: t._id,
                name: t.name,
                body: t.body,
                category: t.category_id
                    ? {
                        id: t.category_id._id,
                        name: t.category_id.name,
                        description: t.category_id.description,
                        bobot: t.category_id.bobot,
                    }
                    : null,
                createdAt: t.createdAt,
                updatedAt: t.updatedAt,
            })),
        });
    })
);

// ✅ Get Template by ID
router.get(
    "/:id",
    isAuthenticated,
    catchAsyncErrors(async (req, res) => {
        const template = await Template.findById(req.params.id).populate("category_id");
        if (!template) {
            return res.status(404).json({
                code: 404,
                status: "error",
                message: "Template not found",
            });
        }

        res.status(200).json({
            code: 200,
            status: "success",
            data: {
                id: template._id,
                name: template.name,
                body: template.body,
                category: template.category_id
                    ? {
                        id: template.category_id._id,
                        name: template.category_id.name,
                        description: template.category_id.description,
                        bobot: template.category_id.bobot,
                    }
                    : null,
                createdAt: template.createdAt,
                updatedAt: template.updatedAt,
            },
        });
    })
);

// ✅ Update Template
router.put(
    "/:id",
    isAuthenticated,
    catchAsyncErrors(async (req, res) => {
        const validation = v.validate(req.body, schema);
        if (validation !== true) {
            return res.status(400).json({
                code: 400,
                status: "error",
                message: "Validation failed",
                data: validation,
            });
        }

        const { name, body, category_id } = req.body;

        // cek category valid
        const category = await Category.findById(category_id);
        if (!category) {
            return res.status(400).json({
                code: 400,
                status: "error",
                message: "Invalid category_id",
            });
        }

        const template = await Template.findByIdAndUpdate(
            req.params.id,
            { name, body, category_id },
            { new: true }
        ).populate("category_id");

        if (!template) {
            return res.status(404).json({
                code: 404,
                status: "error",
                message: "Template not found",
            });
        }

        res.status(200).json({
            code: 200,
            status: "success",
            message: "Template updated successfully",
            data: template,
        });
    })
);

// ✅ Delete Template
router.delete(
    "/:id",
    isAuthenticated,
    catchAsyncErrors(async (req, res) => {
        const template = await Template.findByIdAndDelete(req.params.id);

        if (!template) {
            return res.status(404).json({
                code: 404,
                status: "error",
                message: "Template not found",
            });
        }

        res.status(200).json({
            code: 200,
            status: "success",
            message: "Template deleted successfully",
        });
    })
);

module.exports = router;
