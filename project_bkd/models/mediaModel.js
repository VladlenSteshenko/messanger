// models/mediaModel.js
const mongoose = require('mongoose');

const mediaSchema = new mongoose.Schema({
    createdAt: { type: Date, default: Date.now },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    text: String,
    url: { type: String, required: true },
    originalFileName: String,
    type: String,
    userAvatar: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    chatAvatars: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Chat' }],
    messages: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Message' }],
});

module.exports = mongoose.model('Media', mediaSchema);
