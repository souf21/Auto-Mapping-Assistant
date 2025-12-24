const express = require("express");
const Customer = require("../models/Customer");
const auth = require("../middlewares/authMiddleware");
const validateCustomer = require("../middlewares/validateCustomer");

const router = express.Router();

// GET all customers
router.get("/", auth, async (req, res, next) => {
  try {
    const customers = await Customer.find({ brandId: req.brand.id });
    res.json(customers);
  } catch (err) {
    next(err);
  }
});

// CREATE customer
router.post("/", auth, validateCustomer, async (req, res, next) => {
  try {
    const customer = await Customer.create({
      ...req.body,
      brandId: req.brand.id
    });

    res.status(201).json(customer);
  } catch (err) {
    next(err);
  }
});

// UPDATE customer
router.put("/:id", auth, validateCustomer, async (req, res, next) => {
  try {
    const customer = await Customer.findOneAndUpdate(
      { _id: req.params.id, brandId: req.brand.id },
      req.body,
      { new: true }
    );

    if (!customer) {
      return res.status(404).json({ message: "Not found" });
    }

    res.json(customer);
  } catch (err) {
    next(err);
  }
});

// DELETE customer
router.delete("/:id", auth, async (req, res, next) => {
  try {
    const customer = await Customer.findOneAndDelete({
      _id: req.params.id,
      brandId: req.brand.id
    });

    if (!customer) {
      return res.status(404).json({ message: "Not found" });
    }

    res.json({ message: "Deleted" });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
