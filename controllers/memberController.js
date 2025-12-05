const common = require('../common/common');
const model = require('../models/memberModel');

const pageSize = 10;

const login = (req, res) => {
    try{
        res.render('member/login');
    } catch{
        res.status(500).send("500 Error");
    }
}

const loginProc = async(req, res) => {
    try {
        let {username, password} = req.body;   // login.html 64, 71행. 공통 모듈의 reqeustFilter

        //xss 들어 있을 수 있음 -> xss 필터링 함
        username = common.reqeustFilter(username, 50, false);   // 50자 이상 들어갈 수 없다고 막음(sql에 그렇게 정해둬서). html 사용 불가
        password = common.reqeustFilter(password, 50, false);
        
        const result = await model.loginCheck(username, password);   // 아이디, 비번 받음

        if(result != null){
            //로그인 처리 --> 세션 저장
            req.session.user = {    // 위에서 받은 아이디, 비번
                id: result.id,
                userid: result.userid,
                name: result.name
            }
            // 로그인 하고 페이지 넘어가야함
            common.alertAndGo(res, '로그인 성공', '/');   // 로그인 하면 로그인 정보가 sessions 폴더에 자동으로 생김

        } else{
            // 아이디 또는 비번 틀린 경우
            //res.send('<script>alert("아이디 또는 비번이 틀립니다."); location.href="/member/login";</script>');
            common.alertAndGo(res, '아이디 또는 비번이 틀립니다.', '/member/login');  // common.js의 공통모듈 사용해서 alert 띄움
        
        }
    } catch(error) {
        res.status(500).send("500 Error: " + error);
    }
}

const logout = async(req, res) => {
    // 로그아웃은 세션을 없애주면됨
    req.session.destroy((error) => {
        if(error){
            console.log("세션 삭제 실패ㅋ")
        }
        common.alertAndGo(res, "", '/');   // 로그아웃은 alert를 띄우지 않음
    })
}

const chechUserId = async(req, res) => {
    try {
        let {user_id} = req.body;

        user_id = common.reqeustFilter(user_id, 50, false);
        let cnt = await model.getIdCount(user_id);    // user_id 개수

        if(cnt == 0){
            // 가입 가능
            res.send("true");
        } else{   // 아니면 가입 불가
            res.send("false");
        }
    } catch (error) {
        res.status(500).send("500 Error:" + error);
    }
}

const join = (req, res) => {
    try {
        res.render('member/join');
    } catch (error) {
        res.status(500).send("500 Error:" + error);
    }
}

const joinProc = async(req, res) => {
    try {
        let {user_id, user_pw, name} = req.body;   // join.html의 div 아이디들

        user_id = common.reqeustFilter(user_id, 50, false);
        user_pw = common.reqeustFilter(user_pw, 50, false);
        name = common.reqeustFilter(name, 50, false);

        // 중복체크. 이유 : 해커들은 여기로 바로 들어올수가 있으니까
        let cnt = await model.getIdCount(user_id);   // user_id 개수

        if(cnt == 0){
            
            await model.insertMember(user_id, user_pw, name);
            common.alertAndGo(res, '회원가입 완료', '/member/login');

        } else{ 
            // 해킹일때
            common.alertAndGo(res, '잡았다 요놈. 잘못된 접근이다', '/member/join');
        }

    } catch (error) {
        res.status(500).send("500 Error:" + error);
    }
}

const list = (async (req, res) => {
    try {
        let loginUserInfo = common.checkLogin(req, res);
        if(loginUserInfo != null) {
            let {page, search_key} = req.query;  // search_key : 검색어. member/index 검색창에 값 들어감
            page = common.reqeustFilter(page, 0, false, 1);  // XSS 방지.
            search_key = common.reqeustFilter(search_key, -1, false, '');  //  false, '' : 검색어 없으면 비워둠

            let totalRecord = await model.getTotalCount(search_key);    
            let list = await model.getList(pageSize, page, search_key);

            res.render('member/index', {pageSize, page, totalRecord, loginUserInfo, list, search_key});
        }
    } catch (error) {
        res.status(500).send('500 Error:'+ error);
    }
});

const view = (async (req, res) =>{
    try {
        let loginUserInfo = common.checkLogin(req, res);
        if(loginUserInfo != null) {
            let {page, id, search_key} = req.query;

            page = common.reqeustFilter(page, 0, false, 1);
            id = common.reqeustFilter(id, 0, false);
            search_key = common.reqeustFilter(search_key, -1, false, '');
            

            let viewData = await model.getData(id, search_key);

            res.render('member/view', {loginUserInfo, viewData, page, search_key});
        }
    } catch (error) {
        res.status(500).send('500 Error:'+ error);
    }
});

const modify = (async (req, res) =>{
    try {
        let loginUserInfo = common.checkLogin(req, res);
        if(loginUserInfo != null) {
            let {page, id, search_key} = req.query;

            page = common.reqeustFilter(page, 0, false, 1);
            id = common.reqeustFilter(id, 0, false);
            search_key = common.reqeustFilter(search_key, -1, false, '');

            let viewData = await model.getData(id, search_key);

            res.render('member/modify', {loginUserInfo, viewData, page, search_key});
        }
    } catch (error) {
        res.status(500).send('500 Error:'+ error);
    }
});

const modifyProc = (async (req, res) => {
    try {
        let loginUserInfo = common.checkLogin(req, res);
        if(loginUserInfo != null) {
            let {page, id, passwd, name, search_key} = req.body;   // join.html의 div 아이디들

            page = common.reqeustFilter(page, 0, false, 1);
            id = common.reqeustFilter(id, 0, false);
            name = common.reqeustFilter(name, 50, false);
            passwd = common.reqeustFilter(passwd, 50, false, '');
            search_key = common.reqeustFilter(search_key, -1, false, '');
            

            await model.updateMember(id, name, passwd);
            common.alertAndGo(res, '', '/member/view?page=' + page + '&id=' + id + '&search_key=' + search_key);
        }
    } catch (error) {
        res.status(500).send('500 Error:'+ error);
    }
});

const deleteProc = (async (req, res) => {
    try {
        let loginUserInfo = common.checkLogin(req, res);
        if(loginUserInfo != null) {
            let {page, id} = req.query;

            page = common.reqeustFilter(page, 0, false, 1);
            id = common.reqeustFilter(id, 0, false);

            await model.deleteMember(id);
            common.alertAndGo(res, '', '/member/');
        }
    } catch (error) {
        res.status(500).send('500 Error:'+ error);
    }
});

const getTodayMember = (async(req, res) => {
    try {
        let loginUserInfo = common.checkLogin(req, res);
        if(loginUserInfo != null) {
            let list = await model.getTodayMember();

            // json 어떻게 하즤...?
            // console.log(list);

            res.send(list);
        }
    } catch (error) {
        res.status(500).send('500 Error:'+ error);
    }
});

module.exports = {
    login,
    loginProc,
    logout,
    join,
    chechUserId,
    joinProc,
    list,
    view,
    modify,
    modifyProc,
    deleteProc,
    getTodayMember
}