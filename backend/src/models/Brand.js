const mongoose = require("mongoose");

const brandSchema = new mongoose.Schema(
  {
    brandName: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    passwordHash: {
      type: String,
      required: true
    },

    // NEW FIELD
    emailTemplate: {
      subject: {
        type: String,
        default: "You're invited by {{brandName}}"
      },
      body: {
        type: String,
        default:
          "Hello {{customerName}},\n\nYou have been invited by {{brandName}} on {{invitationDate}}."
      }
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Brand", brandSchema);
