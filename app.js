const express = require("express");
const { Users, sequelize } = require("./models");
const MyPageRouter = require("./routes/mypage");
const authRouter = require("./routes/auth.js");
const kakaoRouter = require("./routes/kakao");
const passport = require("passport");
const kakao = require("./passport/kakaoStrategy");
const jobRouter = require("./routes/jobs");
const chooseTypeRouter = require('./routes/choosetype');
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

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());

app.use(
  session({
    secret: process.env.SESSION_SECRET, // 세션 암호화에 사용할 키입니다. 실제로는 .env 등에 저장하는 것이 좋습니다.
    resave: false,  // 세션을 항상 저장할 지 여부를 정합니다.
    saveUninitialized: false, // 세션이 저장되기 전에 uninitialized 상태로 미리 만들어서 저장합니다.
    cookie: {
      domain: '.ysizuku.com', // .ysizuku.com으로 설정하면 모든 서브도메인에서 쿠키를 사용할 수 있습니다.
      path: '/',  // /로 설정하면 모든 페이지에서 쿠키를 사용할 수 있습니다.
      secure: false,  // https가 아닌 환경에서도 사용할 수 있습니다.
      httpOnly: false,  // 자바스크립트에서 쿠키를 확인할 수 있습니다.
  },
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

app.use("/", [authRouter, jobRouter, chooseTypeRouter]);
app.use("/mypage", MyPageRouter);
app.use("/kakao", kakaoRouter);

// app.get("/", (req, res) => {
//   res.send("Hello World!");
// });

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