const express = require("express");
const multer = require("multer");
const path = require("path");
const router = express.Router();
const authjwt = require("../middlewares/auth-middlewares");
const { Users, Jobs, sequelize, JusoLists } = require("../models");

// image_file 서버에 저장해주는 multer 설정
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

// image_file 확장자 필터링
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
// image_file 저장
const upload = multer({ storage: fileStorage, fileFilter: fileFilter }).single(
  "file"
);

// 0. 이미지 파일 업로드 API
//    @ image_file 작성
router.post("/job/upload", upload, async (req, res) => {
  try {
    const imageName = req.file.filename;
    return res
      .status(200)
      .json({ imageName: imageName, message: "업로드 성공" });
  } catch (e) {
    console.log(e);
    return res
      .status(400)
      .json({ errorMessage: "이미지 업로드 실패, 요청이 올바르지 않습니다." });
  }
});

// 1. 채용공고 글 작성 API
//      @ 토큰을 검사하여, 유효한 토큰일 경우에만 채용공고 글 작성 가능
//      @ title, content, image_file, keywords, address 작성
router.post("/job/write", authjwt, async (req, res) => {
  try {
    const { user_id } = res.locals.user;
    // req.body로 작성 내용 받아오기
    const { title, content, address, keywords, end_date } = req.body;
    // content로 넘어온 HTML 형식을 분석해서 넘겨주기
    const visibility = true;

    // 유효성 검사
    if (title < 1) {
      return res
        .status(412)
        .json({ errorMessage: "유효하지 않은 타이틀입니다." });
    }
    if (content < 1) {
      return res
        .status(412)
        .json({ errorMessage: "유효하지 않은 content입니다." });
    }
    if (keywords < 1) {
      return res
        .status(412)
        .json({ errorMessage: "유효하지 않은 키워드 정보입니다." });
    }
    if (end_date < 1) {
      return res
        .status(412)
        .json({ errorMessage: "유효하지 않은 마감 일자 형식입니다." });
    }
    if (address < 1) {
      return res
        .status(412)
        .json({ errorMessage: "유효하지 않은 주소 형식입니다." });
    }

    // 채용공고 글 작성
    await Jobs.create({
      user_id,
      title,
      content,
      end_date,
      address,
      keywords,
      visibility,
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
        [
          sequelize.literal(
            `(SELECT company FROM Users WHERE Users.user_id = Jobs.user_id)`
          ),
          "company",
        ],
        "end_date",
        "address",
        "visibility",
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

    // 작성된 채용공고 글이 없을 경우.
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
        [
          sequelize.literal(
            `(SELECT company FROM Users WHERE Users.user_id = Jobs.user_id)`
          ),
          "company",
        ],
        "title",
        "content",
        "end_date",
        "keywords",
        "address",
        "visibility",
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
      attributes: [
        "job_id",
        "title",
        "visibility",
        [
          sequelize.literal(
            `(SELECT company FROM Users WHERE Users.user_id = Jobs.user_id)`
          ),
          "company",
        ],
      ],
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
    const { user_id } = res.locals.user;
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
    if (user_id !== job.user_id) {
      return res
        .status(403)
        .json({ errorMessage: "채용공고 글 수정 권한이 없습니다." });
    }

    // 유효성 검사
    if (title < 1) {
      return res
        .status(412)
        .json({ errorMessage: "유효하지 않은 타이틀입니다." });
    }
    if (content < 1) {
      return res
        .status(412)
        .json({ errorMessage: "유효하지 않은 content입니다." });
    }
    if (keywords < 1) {
      return res
        .status(412)
        .json({ errorMessage: "유효하지 않은 키워드 정보입니다." });
    }
    if (end_date < 1) {
      return res
        .status(412)
        .json({ errorMessage: "유효하지 않은 마감 일자 형식입니다." });
    }
    if (address < 1) {
      return res
        .status(412)
        .json({ errorMessage: "유효하지 않은 주소 형식입니다." });
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
    if (!(title || content || keywords || end_date || address)) {
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

// 5. 채용공고 글 내리기/올리기 API
//    @ 토큰을 검사, 해당 사용자가 작성한 채용공고 글만 올리고 내리기 가능
router.patch("/job/:job_id", authjwt, async (req, res) => {
  try {
    // user
    const { user_id } = res.locals.user;
    // job_id
    const { job_id } = req.params;
    // 채용공고 글 조회
    const job = await Jobs.findOne({ where: { job_id } });
    // 입력 받은 visibility
    const { visibility } = req.body;
    console.log(visibility);

    // 채용공고 글이 없을 경우
    if (!job) {
      return res
        .status(400)
        .json({ errorMessage: "존재하지 않는 채용공고 글입니다." });
    }
    // 권한이 없을 경우
    if (user_id !== job.user_id) {
      return res
        .status(403)
        .json({ errorMessage: "채용공고 글 상태 전환 권한이 없습니다." });
    }

    // 유효성 검사
    if (visibility === undefined) {
      return res
        .status(412)
        .json({ errorMessage: "유효하지 않은 요청입니다." });
    } else {
      job.visibility = visibility;
    }
    const updateVisibilityCount = await job.save();

    // 수정한 채용공고 글이 없을 경우
    if (!updateVisibilityCount) {
      return res
        .status(401)
        .json({ errorMessage: "채용공고 글 상태를 수정하지 못했습니다." });
    }

    // 수정 완료
    return res
      .status(200)
      .json({ message: "채용공고 글 상태를 전환했습니다." });
  } catch (e) {
    console.log(e);
    return res.status(400).json({
      errorMessage:
        "채용공고 글 상태를 처리하지 못했어요. 요청이 올바르지 않습니다.",
    });
  }
});

// 6. 채용공고 글 삭제 API
//    @ 토큰을 검사, 해당 사용자가 작성한 채용공고 글만 삭제 가능
router.delete("/job/:job_id", authjwt, async (req, res) => {
  try {
    // user
    const { user_id } = res.locals.user;
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
    if (user_id !== job.user_id) {
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

//시도 검색
router.get("/findsido", async (req, res) => {
  try {
    //시도 데이터가 있다면
    const count = await JusoLists.count({
      distinct: true,
      col: "sido",
    });

    if (count > 1) {
      const sidoList = await JusoLists.findAll({
        attributes: [[sequelize.fn("DISTINCT", sequelize.col("sido")), "sido"]],
        group: ["sido"],
        order: [["sido", "asc"]],
      });

      console.log(sidoList);
      return res.status(200).json({ data: sidoList });
    } else {
      return res.status(201).json({ data: "데이터가 존재하지 않습니다." });
    }
  } catch (error) {
    res.status(400).json({ errorMessage: "요청이 올바르지 않습니다." });
  }
});

// 구군 검색
router.get("/findsigungu/:sido", async (req, res) => {
  try {
    const { sido } = req.params;
    console.log(sido);
    if (!sido) {
      res.status(400).json({ errorMessage: "요청이 올바르지 않습니다." });
    }
    const count = await JusoLists.count({
      distinct: true,
      col: "sido",
    });
    if (count > 1) {
      //시도 데이터가 있다면.
      await JusoLists.findAll({
        attributes: [
          [sequelize.fn("DISTINCT", sequelize.col("sigungu")), "sigungu"],
        ],
        where: [{ sido }],
        group: ["sigungu"],
        order: [["sigungu", "asc"]],
      }).then((result) => {
        // console.log("test " +result)
        return res.status(200).json({ data: result });
      });
    }
  } catch (error) {
    res.status(400).json({ errorMessage: "요청이 올바르지 않습니다." } + error);
  }
});

//시군구 데이터 DB 삽입
router.get("/importSidoData", async (req, res) => {
  try {
    const count = await JusoLists.count({
      distinct: true,
      col: "sido",
    });

    if (count === 0) {
      const fs = require("fs");
      const path = require("path");
      const FILE_NAME = "dataAPI_1.csv";
      const csvPath = path.join(__dirname, FILE_NAME);

      console.log(csvPath);
      const rows = fs.readFileSync(csvPath, "utf-8").split("\r");
      console.log("import ing~");
      //console.log("i ======>"+rows.length);
      let importData = {};
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i].split(",");

        if (row[7] !== "" || row[2] === "") {
          continue;
        }

        if (row[1].substring(row[1].length - 1) === "시") {
          //중복방지
          const result = await JusoLists.count({
            col: "juso_id",
            where: [{ sido: row[1], sigungu: row[2] }],
          });
          //console.log("result " + result);
          if (result == 0) {
            await JusoLists.create({
              sido: row[1],
              sigungu: row[2],
            });
          }
        } else {
          if (row[3] === "") {
            continue;
          }
          const result = await JusoLists.count({
            col: "juso_id",
            where: [{ sido: row[2], sigungu: row[3] }],
          });

          // console.log("result 2 ===>" + result);
          if (result == 0) {
            await JusoLists.create({
              sido: row[2],
              sigungu: row[3],
            });
          }
        }
      }
      console.log("import end");
      return res.status(200).json({ message: "DB import success" });
    } else {
      throw new Error();
    }
  } catch (error) {
    return res.status(400).json({ message: "DB import fail" } + error);
  }
});

module.exports = router;
