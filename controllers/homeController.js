const common = require('../common/common');

const home = (req, res) => {
    try {   
        const loginUserInfo = common.checkLogin(req, res);    // common.js의 checkLogin

        if (loginUserInfo != null) {
            // loginUserInfo ==> 로그인한 사용자 정보가 들어있음
            res.render('index', {loginUserInfo});
        }


    } catch (error) {
        res.status(500).send("500 Error");
    }

}

module.exports = {
    home
};