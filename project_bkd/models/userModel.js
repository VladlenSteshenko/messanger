// models/userModel.js
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    createdAt: { type: Date, default: Date.now },
    login: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    nick: { type: String, default: "no nick" },
    acl: [String],
    avatar: { type: mongoose.Schema.Types.ObjectId, ref: 'Media' },
    chats: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Chat' }],
});

// Pre-save middleware to hash the password
userSchema.pre('save', async function(next) {
    if (this.isModified('password') || this.isNew) {
        try {
            const salt = await bcrypt.genSalt(10);
            this.password = await bcrypt.hash(this.password, salt);
            next();
        } catch (error) {
            next(error);
        }
    } else {
        return next();
    }
});

module.exports = mongoose.model('User', userSchema);