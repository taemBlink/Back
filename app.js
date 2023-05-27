/**
 *  app.js
 *
 *
 */
//express 가져오기
const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const app = express();
//port 3000번으로 설정

// app.use(
//   cors({
//     origin: "*",
//     allowedHeaders: "set-cookie",
//   })
// );
const authRouter = require("./routes/auth.js");

app.use(express.json());
//app.use(express.urlencoded({ extended: false }));
app.use(cookieParser);

app.use("/", [authRouter]);
app.set("port", process.env.PORT || 3000);
app.listen(app.get("port"), () => {
  console.log(app.get("port"), "번 포트에서 대기 중");
});
