const express = require("express");
const router = express.Router();
const Template = require("../model/Template");
const Validator = require("fastest-validator");
const v = new Validator();
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const { isAuthenticated, isAdmin } = require("../middleware/auth");

// Validation schema
const schema = {
    name: { type: "string", empty: false },
    body: { type: "string", empty: false },
    type: { type: "string", empty: false },
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

        const template = await Template.create(req.body);

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
        const templates = await Template.find().sort({ createdAt: -1 });

        res.status(200).json({
            code: 200,
            status: "success",
            data: templates.map((t) => ({
                id: t._id,
                name: t.name,
                body: t.body,
                type: t.type,
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
        const template = await Template.findById(req.params.id);
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
                type: template.type,
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

        const template = await Template.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

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
