const express = require("express");
const router = express.Router();
const { Users } = require("../models");
const jwt = require("jsonwebtoken");

const bcrypt = require("bcrypt");

//const secretKey = require("../config/jwtConfig");
// const options = require("../config/jwtConfig");

//회원가입
router.post("/signup", async (req, res) => {
  const { user_type, email, name, company, password } = req.body;
  try {
    const isExistEmail = await Users.findOne({
      where: { email: email },
    });

    if (isExistEmail) {
      return res.status(400).json({ errorMessage: "중복된 이메일입니다." });
    }

    // 이메일 형식확인
    const emailCheck =
      /^[0-9a-zA-Z]([-_\.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_\.]?[0-9a-zA-Z])*\.[a-zA-Z]{2,3}$/;

    //패스워드 형식 확인: 특수문자(@$!%*?&)의무포함, 알파벳 소문자 의무포함, 대문자 가능, 8~20자
    const pwCheck = /^(?=.*[a-z])(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,15}$/;

    if (!pwCheck.test(password) || !emailCheck.test(email)) {
      console.log("test33");
      return res
        .status(412)
        .json({ errorMessage: "유효하지 않은 이메일 혹은 패스워드 입니다." });
    }
    //userType 형식확인
    //lv 로 시작하지 않으면...  자리수가 4자리 이상이면 ....

    //company 형식 확인
    // 자릿수 확인 30자리 이상이면 ...

    //name 형식 확인
    // 특수문자가 입력된경우... 자릿수가 15 자리 이상인경우

    const hashedPassword = await bcrypt.hash(password, 10);

    await Users.create({
      email,
      password: hashedPassword,
      user_type,
      name,
      company,
    });

    console.log("werwerwer");
    return res.status(201).json({ message: "회원가입 성공" });
  } catch (error) {
    return res
      .status(400)
      .json({ errorMessage: "요청이 올바르지 않습니다." } + error);
  }
});

//로그인
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await Users.findOne({ where: { email } });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res
        .status(412)
        .json({ errorMessage: "이메일 또는 패스워드를 확인해주세요." });
    }

    const token = jwt.sign(
      {
        user_id: user.user_id,
      },
      "cloneprojJwt_"
    );

    res.cookie("authorization", `token ${token}`);

    return res.status(201).json({ token:token, message: "로그인 성공" });
  } catch (error) {
    console.log("error : ", error);
    return res.json({ errorMessage: "요청이 올바르지 않습니다." } + error);
  }
});

module.exports = router;
