const mongoose = require("mongoose");

const ReportSchema = new mongoose.Schema(
  {
    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reported: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reason: {
      type: String,
      required: true,
    },
    feedback: String,
  },
  { timestamps: true }
);

ReportSchema.index({ reporter: 1, reported: 1 }, { unique: true });

module.exports = mongoose.model("Report", ReportSchema);
