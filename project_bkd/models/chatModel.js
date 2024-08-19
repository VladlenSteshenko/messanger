// models/chatModel.js
const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
    createdAt: { type: Date, default: Date.now },
    lastModified: { type: Date, default: Date.now },
    lastMessage: { type: mongoose.Schema.Types.ObjectId, ref: 'Message' },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    title: { type: String, required: true },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    messages: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Message' }],
    avatar: { type: mongoose.Schema.Types.ObjectId, ref: 'Media' },
});

chatSchema.methods.initializeDefaults = function () {
    this.title = this.title || "Untitled Chat";
    this.members = this.members || [];
    this.messages = this.messages || [];
    this.createdAt = this.createdAt || Date.now();
    this.lastModified = this.lastModified || Date.now();
};

module.exports = mongoose.model('Chat', chatSchema);
