// socket/socket.js
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

const setupSocket = (server) => {
    const io = require('socket.io')(server, {
        cors: {
            origin: 'http://localhost:3000', // Replace with your frontend's origin
            methods: ['GET', 'POST'],
            credentials: true,
        }
    });

    const jwt = require('jsonwebtoken');
    const User = require('../models/userModel'); // Adjust the path as needed
    // Assign io to global.io
    global.io = io;
    const sockets = {};

    io.on('connection', (socket) => {
        console.log('User connected:', socket.id);

        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.id);
            delete sockets[socket.id];
        });

        socket.on('jwt', async (token) => {
            let decoded;

            try {
                decoded = jwt.verify(token.replace('Bearer ', ''), "abc");
            } catch (e) {
                socket.emit('jwt_fail', e);
                return;
            }

            socket.emit('jwt_ok', decoded);

            // Fetch user data based on the decoded token
            const userId = decoded.sub.id; // Ensure this is the correct field containing the ObjectId
            console.log("\nn\n\n\\n\n\n\n decoded", decoded)
            const user = await User.findById(userId);
            if (!user) {
                socket.emit('user_not_found', { message: 'User not found' });
                console.log("user_not_found")
                return;
            }

            // Example of emitting an event after authentication
            socket.emit('user_authenticated', { userId: user._id, username: user.username });
            console.log("user_authenticated")
        });
    });
};

module.exports = setupSocket;
