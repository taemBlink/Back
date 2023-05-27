const express = require('express');
const { Users } = require('./models');
const MyPageRouter = require('./routes/mypage');
const authRouter = require("./routes/auth.js");
const cookieParser = require("cookie-parser");
// const cors = require("cors");
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use("/", [authRouter]);
app.use('/mypage', MyPageRouter);

const PORT = 3000;
app.listen(PORT, () => {
    console.log(PORT, '포트 번호로 서버가 실행되었습니다.');
});