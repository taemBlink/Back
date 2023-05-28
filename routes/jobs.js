const express = require("express");
const multer = require("multer");
const path = require("path");
const router = express.Router();
const authjwt = require("../middlewares/auth-middlewares");
const { Users, Jobs, sequelize } = require("../models");

// 0. 이미지 파일 업로드 API
//    @ image_file 작성
router.post;
// // image_file 서버에 저장해주는 multer 설정
const fileStorage = multer.diskStorage({
  // 저장 방식
  destination: (req, file, cb) => {
    // 저장되는 곳 지정
    cb(null, path.join(__dirname, "../uploads/"));
  },
  filename: (req, file, cb) => {
    // 저장되는 이름 지정
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

const fileFilter = (req, file, cb) => {
  // 확장자 필터링
  const allowedFileTypes = [
    "image/png",
    "image/jpg",
    "image/jpeg",
    "image/gif",
    "image/bmp",
  ];
  if (allowedFileTypes.includes(file.mimetype)) {
    cb(null, true); // 해당 mimetype만 받겠다는 의미
  } else {
    // 다른 mimetype은 저장되지 않음
    cb(null, false);
    return res
      .status(412)
      .json({ errorMessage: "유효하지 않은 이미지파일 형식입니다." });
  }
};

const upload = multer({ storage: fileStorage, fileFilter: fileFilter }).single(
  "image"
);

// 정규 표현식을 이용한 유효성 검사
const RE_TITLE = /^[a-zA-Z0-9\s\S]{1,40}$/; // 채용공고 글 제목 정규 표현식
const RE_HTML_ERROR = /<[\s\S]*?>/; // 채용공고 글 HTML 에러 정규 표현식
const RE_CONTENT = /^[\s\S]{1,3000}$/; // 채용공고 글 내용 정규 표현식
const RE_ADDRESS = /^[\s\S]$/; // 채용공고 글 주소 정규 표현식

// 1. 채용공고 글 작성 API
//      @ 토큰을 검사하여, 유효한 토큰일 경우에만 채용공고 글 작성 가능
//      @ title, content, image_file, keywords, address 작성
router.post("/job/write", authjwt, async (req, res) => {
  try {
    const user = res.locals.user;
    // req.body로 작성 내용 받아오기
    const { title, content, image_file, address, keywords, end_date } =
      req.body;
    // image_file은 file 형식으로 받기
    // const image_file = req.file;
    // const imageFileName = image_file.filename;

    // 채용공고 글 작성
    await Jobs.create({
      user_id: user.user_id,
      title,
      content,
      image_file,
      end_date,
      address,
      keywords,
    });
    return res.status(200).json({ message: "채용공고 작성에 성공했습니다." });
  } catch (e) {
    console.log(e);
    return res.status(400).json({ message: "요청이 올바르지 않습니다." });
  }
});

// 2. 전체 채용공고 글 목록 조회 API
//      @ title, keywords, company, image_file, end_date, address 작성
//      @ 작성 날짜 기준으로 최근 글이 먼저 보이게 내림차순으로 정렬
router.get("/job", async (req, res) => {
  try {
    //채용공고 글 목록 조회
    const jobs = await Jobs.findAll({
      attributes: [
        "job_id",
        "user_id",
        "title",
        "keywords",
        [sequelize.col("company"), "company"],
        "image_file",
        "end_date",
        "address",
      ],
      include: [
        {
          model: Users,
          attributes: [],
        },
      ],
      group: ["Jobs.job_id"],
      order: [["createdAt", "DESC"]],
      raw: true,
    });

    // 작성된 채용공고 글이 없을 경우
    if (jobs.length === 0) {
      return res
        .status(400)
        .json({ message: "작성된 채용공고 글이 없습니다." });
    }
    // 채용공고 글 전체 목록 조회
    return res.status(200).json({ jobs });
  } catch (e) {
    console.log(e);
    return res.status(400).json({ message: "목록 조회에 실패" });
  }
});

// 3. 채용공고 글 상세 조회 API
//      @ title, content, keywords, company, end_date, image_file, address 작성
router.get("/job/:job_id", async (req, res) => {
  try {
    const { job_id } = req.params;
    // 채용공고 글 상세 조회
    const job = await Jobs.findOne({
      attributes: [
        "job_id",
        "user_id",
        [sequelize.col("company"), "company"],
        "title",
        "content",
        "end_date",
        "keywords",
        "image_file",
        "address",
      ],
      where: { job_id },
      include: [
        {
          model: Users,
          attributes: [],
        },
      ],
      group: ["Jobs.job_id"],
      raw: true,
    });

    // 조회한 job의 keywords에 해당하는 다른 채용공고 글 조회
    const keywords = job.keywords;

    const otherJobs = await Jobs.findAll({
      attributes: ["job_id", "user_id", [sequelize.col("company"), "company"]],
      where: { keywords },
      include: [
        {
          model: Users,
          attributes: [],
        },
      ],
      raw: true,
    });

    // 채용공고 글이 없을 경우
    if (job.length === 0) {
      return res
        .status(400)
        .json({ message: "존재하지 않는 채용공고 글입니다." });
    }
    // 채용공고 글 상세 조회
    // (otherJobs X)
    if (otherJobs.length === 0) {
      return res.status(200).json({ job });
    }
    // (otherJobs O)
    else {
      return res.status(200).json({ job, otherJobs });
    }
  } catch (e) {
    console.log(e);
    return res
      .status(400)
      .json({ errorMessage: "채용공고 글 조회에 실패했습니다." });
  }
});

// 4. 채용공고 글 수정 API
//    @ 토큰을 검사하여, 해당 사용자가 작성한 채용공고 글만 수정 가능
//    @ title, content, keyword, end_date, address
router.put("/job/:job_id", authjwt, async (req, res) => {
  try {
    // user
    const { user } = res.locals.user;
    // params로 job_id
    const { job_id } = req.params;
    // 채용공고 글 조회
    const job = await Jobs.findOne({ where: { job_id } });
    // 입력 받은 title, content, keywords, end_date, address
    const { title, content, keywords, end_date, address } = req.body;

    // 채용공고 글이 없을 경우
    if (!job) {
      return res
        .status(400)
        .json({ errorMessage: "존재하지 않는 채용공고 글입니다." });
    }
    // 권한이 없을 경우
    if (user.user_id !== job.user_id) {
      return res
        .status(403)
        .json({ errorMessage: "채용공고 글 수정 권한이 없습니다." });
    }

    // 수정할 내용에 따라 수정해주기
    if (title) {
      job.title = title;
    }
    if (content) {
      job.content = content;
    }
    if (keywords) {
      job.keywords = keywords;
    }
    if (end_date) {
      job.end_date = end_date;
    }
    if (address) {
      job.address = address;
    }

    // 수정할 부분이 모두 없을 경우/ 수정할 내용이 있다면 해당 부분만 수정
    if (!(title && content && keywords && end_date && address)) {
      return res.status(400).json({ errorMessage: "수정할 내용이 없습니다." });
    }

    const updateCount = await job.save();

    // 수정한 채용공고 글이 없을 경우
    if (updateCount < 1) {
      return res.status(401).json({
        errorMessage: "채용공고 글이 정상적으로 수정되지 않았습니다.",
      });
    }

    // 수정 완료한 경우
    return res.status(200).json({ message: "채용공고 글을 수정하였습니다." });
  } catch (e) {
    console.log(e);
    return res.status(400).json({
      errorMessage: "채용공고 글 수정 실패, 요청이 올바르지 않습니다.",
    });
  }
});

// 5. 채용공고 글 삭제 API
//    @ 토큰을 검사형, 해당 사용자가 작성한 채용공고 글만 삭제 가능
router.delete("/job/:job_id", async (req, res) => {
  try {
    // user
    const user = res.locals.user;
    // job_id
    const { job_id } = req.params;
    // job 조회
    const job = await Jobs.findByPk(job_id);

    // 채용공고 글이 없을 경우
    if (job.length < 1) {
      return res
        .status(400)
        .json({ errorMessage: "존재하지 않는 채용공고 글입니다." });
    }
    // 채용공고 글 권한 확인
    if (user.user_id !== job.user_id) {
      return res
        .status(403)
        .json({ errorMessage: "채용공고 글 삭제 권한이 없습니다." });
    }

    // 채용공고 글 삭제
    const deleteCount = await Jobs.destroy({ where: { job_id } });
    if (deleteCount < 1) {
      return res.status(400).json({
        errorMessage: "채용공고 글이 정상적으로 삭제되지 않았습니다.",
      });
    }
    // 삭제 완료
    return res.status(200).json({ message: "채용공고 글을 삭제했습니다." });
  } catch (e) {
    console.log(e);
    return res.status(400).json({
      errorMessage:
        "채용공고 글이 정상적으로 삭제되지 않았습니다. 요청이 올바르지 않습니다.",
    });
  }
});

module.exports = router;
