const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema(
  {
    brandId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Brand",
      required: true,
      index: true
    },
    fullName: {
      type: String,
      required: true
    },
    companyName: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    phoneNumber: {           // <-- make sure it's phoneNumber
      type: String,
      required: true
    },
    fullAddress: {           // <-- and fullAddress
      type: String,
      required: true
    },
    language: {
      type: String,
      default: "en",
      required: true
    }
  },
  { timestamps: true }
);


module.exports = mongoose.model("Customer", customerSchema);
