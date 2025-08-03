const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
    sender : String,
    room : String,
    content : String,
    timestamp : { type: Date, default: Date.now }
});

module.exports = mongoose.model("message_history", messageSchema);