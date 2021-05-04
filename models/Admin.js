const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const AdminSchema = new Schema({
  loginID: {
    type: String,
    required: true,
  },
  permission: {
    type: Boolean,
    default: true,
  },
  password: {
    type: String,
    required: true,
  },
});

module.exports = Admin = mongoose.model("Admin", AdminSchema);
