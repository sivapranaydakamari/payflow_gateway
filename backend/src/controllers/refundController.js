const RefundService = require("../services/refundService");

const createRefund = async (req, res) => {
    try {
        const refund = await RefundService.createRefund(
            req.merchant.id,
            req.params.paymentId,
            req.body
        );

        res.status(201).json(refund);
    } catch (err) {
        res.status(err.status || 500).json({
            error: {
                code: err.code || "INTERNAL_ERROR",
                description: err.message || "Something went wrong",
            },
        });
    }
};

const getRefund = async (req, res) => {
    try {
        const refund = await RefundService.getRefundById(
            req.params.id,
            req.merchant.id
        );
        res.json(refund);
    } catch (err) {
        res.status(err.status || 500).json({
            error: {
                code: err.code || "INTERNAL_ERROR",
                description: err.message || "Something went wrong",
            },
        });
    }
};

const listRefunds = async (req, res) => {
    try {
        const refunds = await RefundService.listRefunds(req.merchant.id);
        res.json(refunds);
    } catch (err) {
        res.status(500).json({
            error: {
                code: "INTERNAL_ERROR",
                description: "Failed to fetch refunds",
            },
        });
    }
};

module.exports = { createRefund, getRefund, listRefunds };
