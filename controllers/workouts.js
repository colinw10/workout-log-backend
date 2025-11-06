const express = require('express');
const router = express.Router();
const Workout = require('../models/workout');
const verifyToken = require('../middleware/verify-token');

router.use(verifyToken);

// POST /api/workouts - CREATE a new workout
router.post('/', async (req, res) => {
  try {
    // Add the author field to req.body
    req.body.author = req.user._id;
    const workout = await Workout.create(req.body);
    // Populate the author info before sending back
    workout._doc.author = req.user;
    res.status(201).json(workout);
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});

// GET /api/workouts - INDEX all workouts for the logged-in user
router.get('/', async (req, res) => {
  try {
    const workouts = await Workout.find({ author: req.user._id })
      .populate('author')
      .sort({ date: 'desc' }); 
    res.status(200).json(workouts);
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});

// GET /api/workouts/:workoutId - SHOW a single workout
router.get('/:workoutId', async (req, res) => {
  try {
    const workout = await Workout.findById(req.params.workoutId).populate('author');
    
    // Check if the workout exists and if the user is the author
    if (!workout) {
      return res.status(404).json({ err: 'Workout not found.' });
    }
    if (!workout.author.equals(req.user._id)) {
      return res.status(403).json({ err: 'You are not authorized to view this workout.' });
    }
    
    res.status(200).json(workout);
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});

// PUT /api/workouts/:workoutId - UPDATE a single workout
router.put('/:workoutId', async (req, res) => {
  try {
    const workout = await Workout.findById(req.params.workoutId);

    if (!workout) {
      return res.status(404).json({ err: 'Workout not found.' });
    }
    if (!workout.author.equals(req.user._id)) {
      return res.status(403).json({ err: 'You are not authorized to update this workout.' });
    }

    const updatedWorkout = await Workout.findByIdAndUpdate(
      req.params.workoutId,
      req.body,
      { new: true }
    ).populate('author'); 

    res.status(200).json(updatedWorkout);
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});

// DELETE /api/workouts/:workoutId - DELETE a single workout
router.delete('/:workoutId', async (req, res) => {
  try {
    const workout = await Workout.findById(req.params.workoutId);

    if (!workout) {
      return res.status(404).json({ err: 'Workout not found.' });
    }
    if (!workout.author.equals(req.user._id)) {
      return res.status(403).json({ err: 'You are not authorized to delete this workout.' });
    }

    const deletedWorkout = await Workout.findByIdAndDelete(req.params.workoutId);
    res.status(200).json(deletedWorkout);
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});

// === Embedded Exercise Routes ===
router.post('/:workoutId/exercises', async (req, res) => {
  try {
    const workout = await Workout.findById(req.params.workoutId);
    
    if (!workout) {
      return res.status(404).json({ err: 'Workout not found.' });
    }
    if (!workout.author.equals(req.user._id)) {
      return res.status(403).json({ err: 'You are not authorized to add exercises here.' });
    }

    workout.exercises.push(req.body);
    await workout.save();

    const newExercise = workout.exercises[workout.exercises.length - 1];

    res.status(201).json(newExercise);
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});

module.exports = router;