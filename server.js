const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const cors = require('cors');
const logger = require('morgan');

// Import routers
const authRouter = require('./controllers/auth');
const workoutsRouter = require('./controllers/workouts');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI);

mongoose.connection.on('connected', () => {
  console.log(`Connected to MongoDB ${mongoose.connection.name}.`);
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(logger('dev'));

// Routes
app.use('/api/auth', authRouter);
app.use('/api/workouts', workoutsRouter);

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`The express app is ready on port ${port}!`);
}); 
