const express = require('express');
const { body } = require('express-validator');
const { registerPatient, registerDoctor, login, refresh, me, updateMe } = require('../controllers/authController');
const validate = require('../middleware/validate');
const auth = require('../middleware/auth');

const router = express.Router();

router.post(
  '/register',
  [body('name').notEmpty(), body('email').isEmail(), body('password').isLength({ min: 6 })],
  validate,
  registerPatient
);
router.post(
  '/register-doctor',
  [
    body('name').notEmpty(),
    body('email').isEmail(),
    body('password').isLength({ min: 6 }),
    body('specialization').notEmpty(),
    body('hospitalId').isMongoId().withMessage('Please select a registered hospital')
  ],
  validate,
  registerDoctor
);

router.post('/login', [body('email').isEmail(), body('password').notEmpty()], validate, login);
router.post('/refresh', [body('refreshToken').notEmpty()], validate, refresh);
router.get('/me', auth, me);
router.put('/me', auth, updateMe);

module.exports = router;
