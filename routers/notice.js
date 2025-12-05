const express = require('express');
const router = express.Router();
const controller = require('../controllers/noticeController')
const common = require('../common/common');



// 첨부파일
//npm install multer -> 이거 설치해야함
const multer = require("multer");
const upload = multer({ 
    dest: "uploads/notice",
    fileFilter: common.fileFilter,
    limits: {
        fileSize: 100000000, //limits file to 100mb. 관리자용 공지사항이라 용량 큰거임.
    }
});

router.get("/", controller.list);
router.get("/register", controller.register);
router.get("/modify", controller.modify);
router.get("/view", controller.view);
router.get("/delete", controller.deleteNotice);
router.post('/register', upload.array("attach_file"), controller.register_proc);
router.post('/modify', upload.array("attach_file"), controller.modify_proc);
                                   // attach_file : register.html의 첨부파일 name이 들어감



module.exports = {
    router    // router 넘겨줬고 이걸 app.js에서 받음(Routing 방법 부분)
}