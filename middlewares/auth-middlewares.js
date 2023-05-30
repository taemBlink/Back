const jwt = require("jsonwebtoken");
const { Users } = require("../models");
// const secretKey = require("../config/jwtConfig");
///const options = require("../config/jwtConfig");

module.exports = async (req, res, next) => {
  try {
    const { authorization } = req.cookies;
    const [tokenType, token] = authorization.split(" "); // 중괄호{} 를 대괄호[]로 수정

    // # 403 Cookie가 존재하지 않을 경우
    if (!authorization) {
      return res
        .status(403)
        .json({ errorMessage: "로그인이 필요한 기능입니다." });
    }
    if (tokenType !== "token") {
      res.clearCookie("authorization");
      return res
        .status(401)
        .json({ errorMessage: "전달된 쿠키에서 오류가 발생하였습니다." });
    }

    const { user_id } = jwt.verify(token, "cloneprojJwt_");
    const user = await Users.findByPk(user_id);

    res.locals.user = user;
    next();
  } catch (error) {
    console.log("error : ", error);
    res.clearCookie("authorization");
    return res.status(403).json({
      errorMessage: "요청이 올바르지 않습니다.",
    });
  }
};
