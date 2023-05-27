/**
 * 로그인
 */

const express = require("express");
const authRouter = express.Router();
// const { authjwt } = require("../middlewares/auth-middlewares");
const { Users } = require("../models");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
console.log("test123123");

// const secretKey = require("../config/jwtConfig");
// const options = require("../config/jwtConfig");

//회원가입
authRouter.post("signup", async (req, res) => {
  console.log("test");
  const { user_type, email, name, company, password } = req.body;
  try {
    console.log("test222");
    await Users.findOne({
      where: { email },
    }).error((error) => {
      return res.status.json({ errorMessage: "중복된 이메일입니다." });
    });

    // 이메일 형식확인
    const emailCheck =
      /^[0-9a-zA-Z]([-_\.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_\.]?[0-9a-zA-Z])*\.[a-zA-Z]{2,3}$/;

    // 패스워드 형식 확인: 특수문자(@$!%*?&)의무포함, 알파벳 소문자 의무포함, 대문자 가능, 4~15자
    const pwCheck = /^(?=.*[a-z])(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{4,15}$/;

    if (!pwCheck.test(password) || !emailCheck.test(email)) {
      res
        .status(412)
        .json({ errorMessage: "유효하지 않은 이메일 혹은 패스워드 입니다." });
      return;
    }
    //userType 형식확인
    //lv1 로 시작하지 않으면...  자리수가 4자리 이상이면 ....

    //company 형식 확인
    // 자릿수 확인 30자리 이상이면 ...

    //name 형식 확인
    // 특수문자가 입력된경우... 자릿수가 15 자리 이상인경우

    const crypyedPw = crypto
      .createHash("sha256")
      .update(password)
      .digest("hex");

    await Users.create({
      email,
      password: crypyedPw,
      user_type,
      name,
      company,
    });

    return res.status(201).json({ message: "회원가입 성공" });
  } catch (error) {
    return res.status(400).json({ message: "요청이 올바르지 않습니다." });
  }
});
//로그인
authRouter.post("login", async (req, res) => {
  try {
    const user = await Users.findOne({ where: { email } });

    if (!user || user.password !== password) {
      return res
        .status(412)
        .json({ errorMessage: "이메일 또는 패스워드를 확인해주세요." });
    }

    const token = jwt.sign(
      {
        userId: user.user_id,
      },
      secretKey
    );
    res.cookie("authorization", `token ${token}`, {
      options,
    });

    return res.status(201).json({ message: "로그인 성공" });
  } catch (error) {
    return res.json({ errorMessage: "요청이 올바르지 않습니다." });
  }
});

module.exports = authRouter;
