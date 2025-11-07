const express = require('express');
const router = express.Router();
const Workout = require('../models/workout');
const verifyToken = require('../middleware/verify-token');

router.use(verifyToken);

// GET /api/workouts - Get all workouts for the logged-in user
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

// GET /api/workouts/:id - Get a single workout
router.get('/:id', async (req, res) => {
  try {
    const workout = await Workout.findOne({
      _id: req.params.id,
      author: req.user._id 
    }).populate('author');
    
    if (!workout) {
      return res.status(404).json({ err: 'Workout not found or you are not authorized.' });
    }
    
    res.status(200).json(workout);
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});

// POST /api/workouts - Create a new workout
router.post('/', async (req, res) => {
  try {
    req.body.author = req.user._id;
    const workout = await Workout.create(req.body);
    workout._doc.author = req.user;
    res.status(201).json(workout);
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});

// PUT /api/workouts/:id - Update a workout
router.put('/:id', async (req, res) => {
  try {
    const updatedWorkout = await Workout.findOneAndUpdate(
      { _id: req.params.id, author: req.user._id },
      req.body,
      { new: true } 
    ).populate('author');

    if (!updatedWorkout) {
      return res.status(404).json({ err: 'Workout not found or you are not authorized.' });
    }
    
    res.status(200).json(updatedWorkout);
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});

// DELETE /api/workouts/:id - Delete a workout
router.delete('/:id', async (req, res) => {
  try {
    const deletedWorkout = await Workout.findOneAndDelete({
      _id: req.params.id,
      author: req.user._id
    });

    if (!deletedWorkout) {
      return res.status(404).json({ err: 'Workout not found or you are not authorized.' });
    }

    res.status(200).json(deletedWorkout);
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});


// === Embedded Exercise Routes ===

// POST /api/workouts/:id/exercises - Add an exercise
router.post('/:id/exercises', async (req, res) => {
  try {
    const workout = await Workout.findOne({
      _id: req.params.id,
      author: req.user._id
    });
    
    if (!workout) {
      return res.status(404).json({ err: 'Workout not found or you are not authorized.' });
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