const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        username: { type: String, required: true, unique: true },
        accountId: { type: String, required: true, unique: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        created: { type: Date, required: true }
    },
    {
        collection: "users"
    }
)

const model = mongoose.model('userSchema', userSchema);

module.exports = model;