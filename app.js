const express = require('express');
const { Users } = require('./models');
const MyPageRouter = require('./routes/mypage');
const app = express();

app.use(express.json());
app.get('/', (req, res) => {
    res.send('Hello, World!');
});
app.use('/mypage', MyPageRouter);

const PORT = 3000;
app.listen(PORT, () => {
    console.log(PORT, '포트 번호로 서버가 실행되었습니다.');
});