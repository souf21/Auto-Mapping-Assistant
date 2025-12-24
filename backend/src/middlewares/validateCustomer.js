// src/middlewares/validateCustomer.js
module.exports = (req, res, next) => {
  const {
    fullName,
    companyName,
    email,
    phoneNumber,
    fullAddress,
    language
  } = req.body;

  // Basic presence check
  if (
    !fullName ||
    !companyName ||
    !email ||
    !phoneNumber ||
    !fullAddress ||
    !language
  ) {
    return res.status(400).json({
      message: "Missing required customer fields"
    });
  }

  // Optional: basic trimming / empty string check
  if (
    fullName.trim() === "" ||
    companyName.trim() === "" ||
    email.trim() === "" ||
    phoneNumber.trim() === "" ||
    fullAddress.trim() === "" ||
    language.trim() === ""
  ) {
    return res.status(400).json({
      message: "Customer fields cannot be empty"
    });
  }

  // You can add more checks later (email format, etc.)
  next();
};
