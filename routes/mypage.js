const express = require("express");
const { Users } = require("../models");
const auth = require("../middlewares/auth-middlewares");
const router = express.Router();

// mypage
router.get("/:user_id", auth, async (req, res) => {
  const { user_id } = req.params;
  const { userId } = res.locals.user;

  // 로그인한 유저가 작성한 글 조회
  

  if (user_id !== userId) {
    return res.status(401).json({ message: "권한이 없습니다." });
  }

  try {
    const users = await Users.findOne({ where: { user_id } });
    res.json(users);
  } catch (err) {
    console.error("err : " + err);
  }
});

module.exports = router;



