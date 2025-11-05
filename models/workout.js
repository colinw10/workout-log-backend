const mongoose = require('mongoose');

const exerciseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    sets: {
      type: Number,
      required: true,
    },
    reps: {
      type: Number,
      required: true,
    },
    weight: Number,
  },
  { timestamps: true }
);

// Main workout schema
const workoutSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    durationInMinutes: Number,
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    exercises: [exerciseSchema],
  },
  { timestamps: true }
);

const Workout = mongoose.model('Workout', workoutSchema);

module.exports = Workout;