const common = require('../common/common');
const model = require('../models/noticeModel');

const pageSize = 10;

const list = (async(req, res) => {
    try {
        let loginUserInfo = common.checkLogin(req, res);
        if(loginUserInfo != null) {
            let {page, search_key} = req.query;  // search_key : 검색어
            page = common.reqeustFilter(page, 0, false, 1);  // XSS 방지
            search_key = common.reqeustFilter(search_key, -1, false, '');  // 검색어 없으면 비워둠

            let totalRecord = await model.getNoticeTotalCount(search_key);
            let list = await model.getNoticeList(pageSize, page, search_key);

            res.render('notice/index', {pageSize, page, totalRecord, loginUserInfo, list, search_key});
        }
    } catch (error) {
        res.status(500).send('500 Error:'+ error);
    }
});

const register = (async(req, res) => {
    try {
        let loginUserInfo = common.checkLogin(req, res);
        if(loginUserInfo != null) {
            res.render('notice/register', {loginUserInfo})
            
            console.log(loginUserInfo);  // 로그인한 정보 { id: 2, userid: 'test1', name: '테스터1' }
        }
    } catch (error) {
        res.status(500).send('500 Error:'+ error);
    }
})

const register_proc = async(req, res) => {
    try {
        let loginUserInfo = common.checkLogin(req, res);
        if(loginUserInfo != null) {
                // register.html의 name들
            let {title, content}  = req.body; 
            let {filepath, filename} = ['',''];

            if(req.files && req.files[0] != null) {   // 첨부파일 필수 아님
                // 'uploads/notice/' + req.files[0].originalname : 원래 파일명
                // filepath : 파일경로
                filename = 'uploads/notice/' + req.files[0].originalname
                filepath = 'uploads/notice/' + req.files[0].filename + common.getFileEXtension(req.files[0].originalname);   // 파일명에 원래 파일명의 확장자 합치는거
                                                                                // 확장자 알아내는거 
                
                common.fileMove('uploads/notice/' + req.files[0].filename, filepath);       
                
                console.log(filename);
                console.log(filepath);
            }

            // Model 저장
            await model.insertNotice(loginUserInfo.id, title, content, filepath, filename);
            
            common.alertAndGo(res, '저장되었습니다.', '/notice');   // 저장된거는 uploads 폴더에 들어가있음. 웹에서 이거 볼려면 localhost/uploads/noitce/파일명
        }
    } catch (error) {
        res.status(500).send('500 Error:'+ error);
    }
}

const view = (async(req, res) => {
    try {
        let loginUserInfo = common.checkLogin(req, res);
        if(loginUserInfo != null) {
            let {id, page, search_key} = req.query;
            id = common.reqeustFilter(id, 0, false);
            page = common.reqeustFilter(page, 0, false, 1);
            search_key = common.reqeustFilter(search_key, -1, false, '');

            // 조회수 업데이트
            await model.updateViewCount(id);

            let noticeData = await model.getNoticeData(id);

            res.render('notice/view', {loginUserInfo, noticeData, page, search_key});
        }
    } catch (error) {
        res.status(500).send('500 Error:'+ error);
    }
});

const modify = (async(req, res) => {
    try {
        let loginUserInfo = common.checkLogin(req, res);
        if (loginUserInfo != null) {
            let {id, page, search_key} = req.query;
            id = common.reqeustFilter(id, 0, false);
            page = common.reqeustFilter(page, 0, false, 1);
            search_key = common.reqeustFilter(search_key, -1, false, '');

            let noticeData = await model.getNoticeData(id);

            // 권한 체크: 작성자만 수정 가능
            if (noticeData.fkmember != loginUserInfo.id) {
                common.alertAndGo(res, '수정 권한이 없습니다.', '/notice/?page='+page+'&search_key='+encodeURIComponent(search_key));
                return;
            }

            res.render('notice/modify', {loginUserInfo, noticeData, page, search_key});
        }
    } catch (error) {
        res.status(500).send('500 Error:'+ error);
    }
});

const modify_proc = async (req, res) => {
    try {
        let loginUserInfo = common.checkLogin(req, res);
        if (loginUserInfo != null) {
            let {id, page, search_key, title, content, old_filepath, old_filename} = req.body;
            id = common.reqeustFilter(id, 0, false);
            page = common.reqeustFilter(page, 0, false, 1);
            search_key = common.reqeustFilter(search_key, -1, false, '');

            // 기본값은 기존 파일
            let filepath = old_filepath || '';
            let filename = old_filename || '';

            if (req.files && req.files[0] != null) {
                // 새 파일 업로드 처리
                filename = 'uploads/notice/' + req.files[0].originalname;
                filepath = 'uploads/notice/' + req.files[0].filename + common.getFileEXtension(req.files[0].originalname);

                common.fileMove('uploads/notice/' + req.files[0].filename, filepath);

                // 이전 파일 삭제
                if (old_filepath && old_filepath != '') {
                    common.fileDelete(old_filepath);
                }
            }

            await model.updateNotice(id, title, content, filepath, filename);

            common.alertAndGo(res, '수정되었습니다.', '/notice/view?page='+page+'&id='+id+'&search_key='+encodeURIComponent(search_key));
        }
    } catch (error) {
        res.status(500).send('500 Error:'+ error);
    }
}

const deleteNotice = (async(req, res) => {
    try {
        let loginUserInfo = common.checkLogin(req, res);
        if(loginUserInfo != null) {
            let {id, page, search_key} = req.query;
            id = common.reqeustFilter(id, 0, false);
            page = common.reqeustFilter(page, 0, false, 1);
            search_key = common.reqeustFilter(search_key, -1, false, '');

            // 삭제 권한 확인
            let noticeData = await model.getNoticeData(id);
            
            if(noticeData.fkmember == loginUserInfo.id) {
                // 첨부파일 삭제
                if (noticeData.filepath && noticeData.filepath != '') {
                    common.fileDelete(noticeData.filepath);
                }
                await model.deleteNotice(id);
                common.alertAndGo(res, '삭제되었습니다.', '/notice/?page='+page+'&search_key='+encodeURIComponent(search_key));
            } else {
                common.alertAndGo(res, '삭제 권한이 없습니다.', '/notice/?page='+page+'&search_key='+encodeURIComponent(search_key));
            }
        }
    } catch (error) {
        // console.log(error);
        res.status(500).send('500 Error:'+ error);
    }
});

const getTodayNotice = async (req, res) => {
    try {
        let loginUserInfo = common.checkLogin(req, res);
        if(loginUserInfo != null) {
            const list = await model.getTodayNotice();

            res.json(list);  
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};



module.exports = {
    list,
    register,
    register_proc,
    view,
    modify,
    modify_proc,
    deleteNotice,
    getTodayNotice
}