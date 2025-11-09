const express = require("express");
const router = express.Router();
const Request = require("../model/Request");
const Category = require("../model/Category");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const { isAuthenticated } = require("../middleware/auth");

// Fungsi normalisasi tanggal: semakin dekat tanggalnya, makin tinggi urgensinya
const normalizeDateUrgency = (date) => {
    const today = new Date();
    const maxUrgency = 30;
    const diffDays = Math.ceil((new Date(date) - today) / (1000 * 60 * 60 * 24));
    if (diffDays <= 0) return 1;
    if (diffDays > maxUrgency) return 0;
    return (maxUrgency - diffDays) / maxUrgency;
};

// ✅ GET /summary?year=2025
router.get(
    "/summary",
    isAuthenticated,
    catchAsyncErrors(async (req, res) => {
        const year = parseInt(req.query.year) || new Date().getFullYear();

        const startOfYear = new Date(`${year}-01-01T00:00:00.000Z`);
        const endOfYear = new Date(`${year}-12-31T23:59:59.999Z`);

        // --- Jalankan aggregate utama ---
        const summary = await Request.aggregate([
            {
                $match: {
                    date: { $gte: startOfYear, $lte: endOfYear },
                    category_id: { $type: "objectId" } // 🔒 hanya ObjectId valid
                },
            },
            {
                $lookup: {
                    from: "categories",
                    localField: "category_id",
                    foreignField: "_id",
                    as: "category",
                },
            },
            { $unwind: "$category" },
            {
                $group: {
                    _id: {
                        month: { $month: "$date" },
                        category_id: "$category._id",
                        category_name: "$category.name",
                    },
                    total_request: { $sum: 1 },
                    total_done: {
                        $sum: {
                            $cond: [{ $eq: ["$status", "Selesai"] }, 1, 0],
                        },
                    },
                },
            },
            { $sort: { "_id.month": 1 } },
            {
                $group: {
                    _id: "$_id.month",
                    month: { $first: "$_id.month" },
                    categories: {
                        $push: {
                            category_id: "$_id.category_id",
                            category_name: "$_id.category_name",
                            total_request: "$total_request",
                            total_done: "$total_done",
                        },
                    },
                },
            },
            { $sort: { month: 1 } },
        ]);

        // --- Tambahkan nama bulan dan isi 12 bulan penuh ---
        const monthNames = [
            "", "Januari", "Februari", "Maret", "April", "Mei", "Juni",
            "Juli", "Agustus", "September", "Oktober", "November", "Desember"
        ];

        // Buat map hasil aggregate (agar pencarian cepat)
        const summaryMap = new Map(summary.map(item => [item.month, item]));

        // Bangun array lengkap 12 bulan
        const fullSummary = [];
        for (let m = 1; m <= 12; m++) {
            if (summaryMap.has(m)) {
                fullSummary.push({
                    month: m,
                    month_name: monthNames[m],
                    categories: summaryMap.get(m).categories
                });
            } else {
                fullSummary.push({
                    month: m,
                    month_name: monthNames[m],
                    categories: [] // jika tidak ada data, kosong
                });
            }
        }

        res.status(200).json({
            code: 200,
            status: "success",
            year,
            data: fullSummary,
        });
    })
);


router.get(
    "/summary/table",
    isAuthenticated,
    catchAsyncErrors(async (req, res) => {
        const year = parseInt(req.query.year) || new Date().getFullYear();

        const startOfYear = new Date(`${year}-01-01T00:00:00.000Z`);
        const endOfYear = new Date(`${year}-12-31T23:59:59.999Z`);

        const summary = await Request.aggregate([
            {
                $match: {
                    date: { $gte: startOfYear, $lte: endOfYear },
                    category_id: { $type: "objectId" },
                },
            },
            {
                $lookup: {
                    from: "categories",
                    localField: "category_id",
                    foreignField: "_id",
                    as: "category",
                },
            },
            { $unwind: "$category" },
            {
                $group: {
                    _id: {
                        month: { $month: "$date" },
                        category_id: "$category._id",
                        category_name: "$category.name",
                    },
                    total_request: { $sum: 1 },
                    total_done: {
                        $sum: {
                            $cond: [{ $eq: ["$status", "Selesai"] }, 1, 0],
                        },
                    },
                },
            },
            { $sort: { "_id.month": 1 } },
            {
                $group: {
                    _id: "$_id.month",
                    month: { $first: "$_id.month" },
                    categories: {
                        $push: {
                            category_id: "$_id.category_id",
                            category_name: "$_id.category_name",
                            total_request: "$total_request",
                            total_done: "$total_done",
                        },
                    },
                },
            },
            { $sort: { month: 1 } },
        ]);

        const months = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];

        const result = {};

        months.forEach((monthName, index) => {
            const found = summary.find((s) => s.month === index + 1);
            result[monthName] = found ? found.categories : [];
        });

        res.status(200).json({
            code: 200,
            status: "success",
            year,
            data: result,
        });
    })
);


// ✅ GET all requests, sorted using SAW method
router.get(
    "/list",
    isAuthenticated,
    catchAsyncErrors(async (req, res) => {
        const requests = await Request.find()
            .populate("user_id")
            .populate("category_id"); // ambil category data

        const scored = requests.map((req) => {
            const typeWeight = req.category_id?.bobot || 0; // ambil bobot dari category
            const dateUrgency = normalizeDateUrgency(req.date);
            const score = 0.6 * typeWeight + 0.4 * dateUrgency;

            return {
                id: req._id,
                title: req.title,
                type: req.category_id?.name, // tampilkan nama category
                category: req.category_id
                    ? {
                        id: req.category_id._id,
                        name: req.category_id.name,
                        description: req.category_id.description,
                        bobot: req.category_id.bobot,
                    }
                    : null,
                date: req.date,
                body: req.body,
                description: req.description,
                status: req.status,
                user: {
                    id: req.user_id?._id,
                    name: req.user_id?.name,
                    email: req.user_id?.email,
                },
                score,
            };
        });

        scored.sort((a, b) => b.score - a.score);

        res.status(200).json({
            code: 200,
            status: "success",
            data: scored,
        });
    })
);

// ✅ POST /create — buat request baru
router.post(
    "",
    isAuthenticated,
    catchAsyncErrors(async (req, res) => {
        const { title, body, description, date, category_id } = req.body;

        // Pastikan category valid
        const category = await Category.findById(category_id);
        if (!category) {
            return res.status(400).json({
                code: 400,
                status: "error",
                message: "Invalid category_id",
            });
        }

        const request = await Request.create({
            title,
            body,
            description,
            date,
            category_id,
            user_id: req.user.id,
        });

        res.status(201).json({
            code: 201,
            status: "success",
            data: request,
        });
    })
);

// ✅ GET /:id
router.get(
    "/:id",
    catchAsyncErrors(async (req, res) => {
        const request = await Request.findById(req.params.id)
            .populate("user_id")
            .populate("category_id");

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
            data: {
                id: request._id,
                title: request.title,
                type: request.category_id?.name,
                category: request.category_id,
                body: request.body,
                description: request.description,
                date: request.date,
                status: request.status,
                createdAt: request.createdAt,
                updatedAt: request.updatedAt,
                user: request.user_id,
            },
        });
    })
);

// ✅ PUT /update/:id
router.put(
    "/:id",
    isAuthenticated,
    catchAsyncErrors(async (req, res) => {
        const { title, body, description, date, status, category_id } = req.body;

        if (category_id) {
            const category = await Category.findById(category_id);
            if (!category) {
                return res.status(400).json({
                    code: 400,
                    status: "error",
                    message: "Invalid category_id",
                });
            }
        }

        const updated = await Request.findByIdAndUpdate(
            req.params.id,
            { title, body, description, date, status, category_id },
            { new: true }
        )
            .populate("user_id")
            .populate("category_id");

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

// ✅ DELETE /delete/:id
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
