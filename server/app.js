
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import userRouter from './router/auth.js';
import { verifyToken } from './Services/checkAuth.js';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';  // Corrected import
import userSchema from './model/user.js';

// Create an express app
const app = express();

// Create an HTTP server that wraps the express app
const server = http.createServer(app);

// Socket.IO server
const io = new SocketIOServer(server, {
    cors: {
        origin: "http://localhost:3000",  // Replace with your React app URL
        methods: ["GET", "POST"]
    }
});

const PORT = process.env.PORT || 1000;

// Middleware
app.use(cors({ origin: 'http://localhost:3000' })); // Should match your frontend URL
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Auth routes
app.use('/auth', userRouter);

const users = {};


io.on('connection', socket => {
    socket.on('new-user-joined', name => {
        users[socket.id] = name;
        console.log(name, socket.id);
        socket.broadcast.emit('user-joined', name);
    })

    socket.on('send', message => {
        socket.broadcast.emit('receive', { message: message, name: users[socket.id] });
    })


    socket.on('disconnect', (message) => {
        socket.broadcast.emit('user-left', { name: users[socket.id] })
        delete users[socket.id];
    })

    socket.on('disconnect', () => {
        console.log('A user disconnected');
    });
});

// Database connection and server startup
(async () => {
    try {
        const db = await mongoose.connect('mongodb://localhost:27017/chatapp', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Connected to MongoDB');

        // Start the server
        server.listen(PORT, () => {
            console.log(`Server started on port ${PORT}`);
        });
    } catch (error) {
        console.error('Error connecting to the database', error);
        process.exit(1); // Exit if there's an error connecting to the DB
    }
})();