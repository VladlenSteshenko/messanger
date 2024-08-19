//index
const fs = require('fs');
const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const cors = require('cors');
const http = require('http');
const dotenv = require('dotenv');
const multer = require('multer');
const path = require('path');
const mongoose = require('mongoose');
const jwt = require("jsonwebtoken");
dotenv.config();

const connectDB = require('./config/db');
const schema = require('./graphql/schema');
const root = require('./graphql/resolvers');
const graphQLAuthMiddleware = require('./middleware/graphQLAuth');
const setupSocket = require('./socket/socket');
const Media = require('./models/mediaModel');
const User = require('./models/userModel');
const Message = require('./models/messageModel');
const Chat = require("./models/chatModel");

const app = express();
app.use(express.json());
const server = http.createServer(app);

// Configure CORS
app.use(cors({
    origin: 'http://localhost:3000',  // Allow requests from this origin
    credentials: true,
}));

// Ensure the uploads directory exists
const uploadDir = path.join(__dirname, 'public/uploads/');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}
// Serve static files
app.use(express.static(path.join(__dirname, 'public')));
// Define storage options for Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB limit
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|gif/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('File upload only supports the following filetypes - ' + filetypes));
    }
});

app.post('/upload', upload.single('file'), async (req, res) => {
    console.log("upload receive")
    try {
        const file = req.file;
        const { type, userId, messageId } = req.body;

        if (!file) {
            return res.status(400).send({ message: 'No file uploaded.' });
        }

        if (!type || !['avatar', 'message'].includes(type)) {
            return res.status(400).json({ error: 'Invalid media type' });
        }

        const media = new Media({
            url: `/uploads/${file.filename}`,
            originalFileName: file.originalname,
            type: file.mimetype
        });

        await media.save();

        if (type === 'message') {
            if (!messageId) {
                return res.status(400).json({ error: 'Message ID is required for message image upload' });
            }

            const message = await Message.findById(messageId);
            if (!message) {
                return res.status(404).json({ error: 'Message not found' });
            }
            
            message.image = { _id: media._id, url: media.url };
            await message.save();
        }

        res.status(201).send({ _id: media._id, url: media.url });

    } catch (err) {
        console.error(err);
        res.status(500).send({ message: 'Server error' });
    }
});

  


// Connect to MongoDB
connectDB(process.env.MONGO_URI);

// Middleware
app.use(graphQLAuthMiddleware);

// GraphQL endpoint
app.use('/graphql', graphqlHTTP((req) => ({
    schema: schema,
    rootValue: root,
    graphiql: true,
    context: {
        headers: req.headers, // Pass request headers to the context
    },
})));

// Set up Socket.io
setupSocket(server);

// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
