const mongoose = require('mongoose');

const eventSchema = mongoose.Schema({
    eventName : {type: String, required: true, unique: true}
});

module.exports = mongoose.model("eventDB", eventSchema);