const express = require("express");
const router = express.Router();
const passport = require("passport");
const jwt = require("jsonwebtoken");

router.get("/", passport.authenticate("kakao"));

router.get(
  "/callback",
  passport.authenticate("kakao", {
    failureRedirect: "/singin", // 카카오 로그인에 실패했을 경우 리다이렉션 될 경로입니다.
  }),
  function (req, res) {
    // 사용자가 성공적으로 인증되었으므로 JWT를 생성합니다.
    const token = jwt.sign({ user_id: req.user.id }, 'cloneprojJwt_');
    // 생성한 JWT를 쿠키에 저장합니다.
    res.cookie('authorization', 'token ' + token);

    // Successful authentication, redirect home.
    // res.redirect("http://react.ysizuku.com");
    if (req.user.user_type) {
      // res.redirect("/");
      res.redirect("http://react.ysizuku.com");
    } else {
      res.redirect("/choose_type");
    }
  }
);

module.exports = router;
