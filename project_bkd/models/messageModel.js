// models/chatModel.js
const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    createdAt: { type: Date, default: Date.now },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    chat: { type: mongoose.Schema.Types.ObjectId, ref: 'Chat' },
    text: { type: String, required: true },
    media: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Media' }],
    replies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Message' }],
    replyTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Message' },
});

module.exports = mongoose.model('Message', messageSchema);
