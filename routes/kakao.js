const express = require("express");
const router = express.Router();
const passport = require("passport");

router.get("/", passport.authenticate("kakao"));

router.get(
  "/callback",
  passport.authenticate("kakao", {
    failureRedirect: "/singin", // 카카오 로그인에 실패했을 경우 리다이렉션 될 경로입니다.
  }),
  function (req, res) {
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
