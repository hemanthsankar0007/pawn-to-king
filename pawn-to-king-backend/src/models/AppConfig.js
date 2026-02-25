const mongoose = require("mongoose");

const AppConfigSchema = new mongoose.Schema(
  {
    defaultHomeworkLink: {
      type: String,
      required: true,
      trim: true
    }
  },
  { timestamps: true, collection: "app_config" }
);

module.exports = mongoose.model("AppConfig", AppConfigSchema);
