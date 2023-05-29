const express = require('express');
const { Users } = require('./models');
const MyPageRouter = require('./routes/mypage');
const authRouter = require("./routes/auth.js");
const kakaoRouter = require('./routes/kakao');
const passport = require('passport');
const kakao = require('./passport/kakaoStrategy');
const cookieParser = require("cookie-parser");
const session = require('express-session');
// const cors = require("cors");
const app = express();
// const greenlock = require('greenlock-express');
require('dotenv').config();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(
    session({
       secret: process.env.SESSION_SECRET, // 세션 암호화에 사용할 키입니다. 실제로는 .env 등에 저장하는 것이 좋습니다.
       resave: false,
       saveUninitialized: false,
    }),
  );

app.use(passport.initialize()); // Passport를 초기화합니다.
app.use(passport.session()); // Passport 세션을 사용합니다.


passport.serializeUser((user, done) => {  // Strategy 성공 시 호출됨
  // console.log('serializeUser', user);
  done(null, user.sns_id);
});

passport.deserializeUser(async (sns_id, done) => {  // 매개변수 id는 req.session.passport.user에 저장된 값
  // console.log('deserializeUser', sns_id);
  try {
    const user = await Users.findOne({ where: { sns_id: sns_id } });  // id를 기준으로 사용자 정보를 조회합니다.
    // console.log('Found user', user);
    done(null, user); // 조회한 정보를 req.user에 저장합니다.
  } catch (error) {
    console.error('Error in deserializeUser' ,error);
    done(error);
  }
}); 

kakao();  // kakaoStrategy.js의 module.exports를 실행합니다.

app.use("/", [authRouter]);
app.use('/mypage', MyPageRouter);
app.use('/kakao', kakaoRouter);

// Greenlock의 설정
// const lex = greenlock.create({
//   version: 'draft-12', 
//   configDir: '/etc/letsencrypt', // 또는 '~/.config/acme/'
//   server: 'https://acme-v02.api.letsencrypt.org/directory',
//   email: 'bchi2000@gmail.com', // Let's Encrypt에 등록할 이메일 주소
//   agreeTos: true, // 이메일 주소의 소유자가 이용 약관에 동의함
//   approveDomains: ['teamblink.shop'], // 인증서를 얻을 도메인
// });

// // Greenlock와 Express.js 앱 연결
// require('http').createServer(lex.middleware(require('redirect-https')())).listen(80, function () {
//   console.log("HTTP Server listening on port 80 for ACME challenges and redirects to HTTPS");
// });

// require('https').createServer(lex.httpsOptions, lex.middleware(app)).listen(443, function () {
//   console.log("HTTPS Server listening on port 443");
// });

const PORT = 3000;
app.listen(PORT, () => {
    console.log(PORT, '포트 번호로 서버가 실행되었습니다.');
});