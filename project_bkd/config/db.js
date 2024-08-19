//config/db.js
const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect('mongodb://localhost:27017/VChat', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        console.log('MongoDB connected');

        // Create and initialize models (this step is not strictly necessary as Mongoose will automatically create collections based on schemas when they are first used)
        await mongoose.model('User').init();
        await mongoose.model('Chat').init();
        await mongoose.model('Message').init();
        await mongoose.model('Media').init();

        console.log('Models initialized and collections created if they didn\'t exist');
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
};

module.exports = connectDB;
