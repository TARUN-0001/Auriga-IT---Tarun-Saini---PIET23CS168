const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const {
  createHabit,
  getAllHabits,
  getTodayHabits,
  getHabitById,
  updateHabit,
  archiveHabit,
  restoreHabit,
  getArchivedHabits,
  logHabit,
  getHabitLogs,
  getHabitStreak,
  deleteHabit,
} = require('../controllers/habitController');

const router = express.Router();

router.use(authMiddleware);

router.get('/', getAllHabits);
router.get('/today', getTodayHabits);
router.get('/archived', getArchivedHabits);
router.post('/', createHabit);
router.get('/:id/logs', getHabitLogs);
router.get('/:id/streak', getHabitStreak);
router.get('/:id', getHabitById);
router.post('/:id/log', logHabit);
router.put('/:id', updateHabit);
router.patch('/:id/archive', archiveHabit);
router.patch('/:id/restore', restoreHabit);
router.delete('/:id', deleteHabit);

module.exports = router;
