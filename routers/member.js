const express = require('express');
const router = express.Router();
const controller = require('../controllers/memberController')

router.get("/login", controller.login);
router.post("/login", controller.loginProc);
router.get("/logout", controller.logout);
router.get("/join", controller.join);
router.post("/check_user_id", controller.chechUserId);
router.post("/join", controller.joinProc);

router.get('/', controller.list);
router.get('/view', controller.view);
router.get('/modify', controller.modify);
router.post('/modify', controller.modifyProc);
router.get('/delete', controller.deleteProc);

router.get('/getTodayMember', controller.getTodayMember);

module.exports = {
    router    // router 넘겨줬고 이걸 app.js에서 받음(Routing 방법 부분)
}