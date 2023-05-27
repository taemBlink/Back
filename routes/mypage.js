const express = require('express');
const { Users } = require('../models');
const router = express.Router();

// mypage
router.get('/', async (req, res) => {
  try {
    // const users = await Users.findOne({ where: { user_id: user_id } });
    const users = await Users.findOne({ where: { user_id: 'test' } });
    res.json(users);
  } catch (err) {
    console.error(err);
    next(err);
  }
});

module.exports = router;
