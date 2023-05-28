const express = require('express');
const { Users } = require('../models');
const auth = require('../middlewares/auth-middlewares');
const router = express.Router();

// mypage
router.get('/:user_id', auth, async (req, res) => {
  const { user_id } = req.params;
  // const { userId } = res.locals.user;
  try {
    const users = await Users.findOne({ where: { user_id } });
    // const users = await Users.findOne({ where: { user_id: 'test' } });
    res.json(users);
  } catch (err) {
    console.error('err : ' + err);
  }
});

module.exports = router;
