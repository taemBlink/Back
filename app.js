const express = require("express");

const { Users, sequelize } = require("./models");
const MyPageRouter = require("./routes/mypage");
const authRouter = require("./routes/auth.js");
const kakaoRouter = require("./routes/kakao");
const passport = require("passport");
const kakao = require("./passport/kakaoStrategy");
const jobRouter = require("./routes/jobs");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const cors = require("cors");
const app = express();
require("dotenv").config();

app.use(
  cors({
    origin: [
      "*.ysizuku.com",
      "http://localhost:3000",
      "http://react.ysizuku.com",
    ],
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(
  session({
    secret: process.env.SESSION_SECRET, // 세션 암호화에 사용할 키입니다. 실제로는 .env 등에 저장하는 것이 좋습니다.
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize()); // Passport를 초기화합니다.
app.use(passport.session()); // Passport 세션을 사용합니다.

passport.serializeUser((user, done) => {
  console.log("serializeUser", user);
  done(null, user.dataValues.user_id);
});

passport.deserializeUser(async (userId, done) => {
  console.log("deserializeUser", userId);
  try {
    const user = await Users.findOne({ where: { user_id: userId } });
    console.log("Found user", user);
    done(null, user);
  } catch (error) {
    console.error("Error in deserializeUser", error);
    done(error);
  }
});

kakao(); // kakaoStrategy.js의 module.exports를 실행합니다.

app.use("/", [authRouter, jobRouter]);
app.use("/mypage", MyPageRouter);
app.use("/kakao", kakaoRouter);

app.get("/download/:imageName", (req, res) => {
  const imageName = req.params; // 저장된 이미지 파일 경로

  res.setHeader("Content-Disposition", "attachment; filename=image.jpg");
  res.setHeader("Content-Type", "image/jpeg");
  res.sendFile(__dirname + "/uploads/" + imageName.imageName);
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(PORT, "포트 번호로 서버가 실행되었습니다.");
});
