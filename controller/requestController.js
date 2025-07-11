const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Request = require("../model/Request");
const User = require("../model/User");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const { isAuthenticated } = require("../middleware/auth");

// Bobot tipe surat
const suratWeights = {
    "Dispensasi": 1.0,
    "Keterangan Aktif": 0.6,
    "Kelakuan Baik": 0.4
};

// Fungsi normalisasi tanggal: semakin dekat tanggalnya, makin tinggi urgensinya
const normalizeDateUrgency = (date) => {
    const today = new Date();
    const maxUrgency = 30;
    const diffDays = Math.ceil((new Date(date) - today) / (1000 * 60 * 60 * 24));
    if (diffDays <= 0) return 1;
    if (diffDays > maxUrgency) return 0;
    return (maxUrgency - diffDays) / maxUrgency;
};

// ✅ GET all requests, sorted using SAW method
router.get(
    "/list",
    isAuthenticated,
    catchAsyncErrors(async (req, res) => {
        const requests = await Request.find().populate("user_id");

        const scored = requests.map(req => {
            const typeWeight = suratWeights[req.type.toLowerCase()] || 0;
            const dateUrgency = normalizeDateUrgency(req.date);
            const score = (0.6 * typeWeight) + (0.4 * dateUrgency);

            return {
                id: req._id,
                title: req.title,
                type: req.type,
                date: req.date,
                body: req.body,
                description: req.description,
                status: req.status,
                user: {
                    id: req.user_id?._id,
                    name: req.user_id?.name,
                    email: req.user_id?.email,
                },
                score
            };
        });

        scored.sort((a, b) => b.score - a.score);

        res.status(200).json({
            code: 200,
            status: "success",
            data: scored
        });
    })
);

// ✅ POST /create — buat request baru
router.post(
    "",
    isAuthenticated,
    catchAsyncErrors(async (req, res) => {
        const { title, type, body, description, date } = req.body;

        const request = await Request.create({
            title,
            type,
            body,
            description,
            date,
            user_id: req.user.id,
        });

        res.status(201).json({
            code: 201,
            status: "success",
            data: request,
        });
    })
);

// ✅ GET /:id — ambil satu request
router.get(
    "/:id",
    isAuthenticated,
    catchAsyncErrors(async (req, res) => {
        const request = await Request.findById(req.params.id).populate("user_id");

        if (!request) {
            return res.status(404).json({
                code: 404,
                status: "error",
                message: "Request not found",
            });
        }

        res.status(200).json({
            code: 200,
            status: "success",
            data: request,
        });
    })
);

// ✅ PUT /update/:id — update request
router.put(
    "/:id",
    isAuthenticated,
    catchAsyncErrors(async (req, res) => {
        const { title, type, body, description, date, status } = req.body;

        const updated = await Request.findByIdAndUpdate(
            req.params.id,
            { title, type, body, description, date, status },
            { new: true }
        );

        if (!updated) {
            return res.status(404).json({
                code: 404,
                status: "error",
                message: "Request not found",
            });
        }

        res.status(200).json({
            code: 200,
            status: "success",
            data: updated,
        });
    })
);

// ✅ DELETE /delete/:id — hapus request
router.delete(
    "/:id",
    isAuthenticated,
    catchAsyncErrors(async (req, res) => {
        const deleted = await Request.findByIdAndDelete(req.params.id);

        if (!deleted) {
            return res.status(404).json({
                code: 404,
                status: "error",
                message: "Request not found",
            });
        }

        res.status(200).json({
            code: 200,
            status: "success",
            message: "Request deleted successfully",
        });
    })
);

module.exports = router;
