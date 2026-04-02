const express = require('express');
const auth = require('../middleware/auth');
const { listNotifications, markRead, markAllRead } = require('../controllers/notificationController');

const router = express.Router();

router.get('/', auth, listNotifications);
router.put('/:id/read', auth, markRead);
router.put('/read-all', auth, markAllRead);

module.exports = router;
