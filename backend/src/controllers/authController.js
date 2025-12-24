const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Brand = require("../models/Brand");

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Missing credentials" });
    }

    const brand = await Brand.findOne({ email });
    if (!brand) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, brand.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign( 
      { brandId: brand._id, 
        email: brand.email, 
        brandName: brand.brandName },
        process.env.JWT_SECRET, 
        { expiresIn: "1d" } 
    );

    res.json({
      token,
      brand: {
        id: brand._id,
        brandName: brand.brandName,
        email: brand.email
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Login failed" });
  }
};

exports.register = async (req, res) => {
  try {
    const { brandName, email, password } = req.body;

    if (!brandName || !email || !password) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const existing = await Brand.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: "Brand already exists" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const brand = await Brand.create({
      brandName,
      email,
      passwordHash
    });

    res.status(201).json({ message: "Brand created" });
  } catch (error) {
    res.status(500).json({ message: "Registration failed" });
  }
};
