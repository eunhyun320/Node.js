const xss = require('xss');
const path = require('path');
const fs = require('fs');

const dateFormat = (date, pattern = 'yyyy-mm-dd hh:ii:ss') => {
    let month = date.getMonth() + 1;
    let day = date.getDate();
    let hour = date.getHours();
    let minute = date.getMinutes();
    let second = date.getSeconds();

    month = month >= 10 ? month : '0' + month;
    day = day >= 10 ? day : '0' + day;
    hour = hour >= 10 ? hour : '0' + hour;
    minute = minute >= 10 ? minute : '0' + minute;
    second = second >= 10 ? second : '0' + second;

    pattern = pattern.replace(/yyyy/g, date.getFullYear());
    pattern = pattern.replace(/mm/g, month);
    pattern = pattern.replace(/dd/g, day);
    pattern = pattern.replace(/hh/g, hour);
    pattern = pattern.replace(/ii/g, minute);
    pattern = pattern.replace(/ss/g, second);

    return pattern;
}

const checkLogin = (req, res, isMust = true) => {
    let loginUserInfo = req.session.user;

    if (loginUserInfo == null) {
        if (isMust) {
            alertAndGo(res, "로그인 필요합니다.", "/member/login");
        }
        return null;
    }

    return loginUserInfo;
};

// member컨트롤러에서 사용
const alertAndGo = (res, msg, url) => {    // alert 띄울때 쓰는 공통 모듈
    res.render('common/alert', { msg, url });    // views 폴더 아래 common폴더 아래 alert.html 
                                // 띄울메세지, 이동할 화면 경로
}

const isNumber = (n) => {
    return /^-?[\d.]+(?:e-?\d+)?$/.test(n);
};
                                                // 생략 가능 여부
const reqeustFilter = (data, type, isHtml, defaultvalue = null) => {
    switch (type) {
        case 0:
            if (data != undefined) {
                let checkVal = data.replaceAll(',', '');
                if (!isNumber(checkVal)) {
                    throw "parameter is not number Error";
                }
            }
            break;
        case -1:
            if (!isHtml) {
                data = xss(data);
            }
            break;
        default:
            if (type < data.length) {
                throw "input length is too long";
            }
            
            if (!isHtml) {
                data = xss(data);
            }
            break;
    }

    if (data == null || data == '') {
        if (defaultvalue != null) {
            data = defaultvalue;
        } else {
            throw "input parameter not allow null";
        }
    }

    return data;
}

const pageNavigation = (printSize, page, pageSize, totalcount, url, params) => {
    let html = '';

    let totalPage = parseInt(totalcount / pageSize);
    if (totalcount % pageSize != 0) {
        totalPage++;
    }

    if (totalPage > 0 && page <= totalPage) {
        start = parseInt((page - 1) / printSize) * printSize + 1;
        end = start + (printSize - 1);

        if (end > totalPage) end = totalPage;

        html += '<div class="d-flex justify-content-center">';
        html += '   <nav aria-label="page-navigation">';
        html += '       <ul class="pagination">';

        if (start > printSize) {
            let prevPage = start - 1;

            html += '<li class="page-item">';
            html += '   <a class="page-link" href="' + url + '?page=' + prevPage + params + '">&laquo;</a>';
            html += '</li>';
        } else {
            html += '<li class="page-item disabled">';
            html += '   <a class="page-link" href="#" tabindex="-1" aria-disabled="true">&laquo;</a>';
            html += '</li>';
        }

        let cnt = 1;
        for (let i = start; i <= end; i++) {
            if (page == i) {
                html += '<li class="page-item active" aria-current="page">';
                html += '   <a class="page-link" href="' + url + '?page=' + i + params + '">' + i + '</a>';
                html += '</li>';
            } else {
                html += '<li class="page-item">';
                html += '   <a class="page-link" href="' + url + '?page=' + i + params + '">' + i + '</a>';
                html += '</li>';
            }
            if (++cnt > printSize) break;
        }

        if (totalPage - start >= printSize) {
            let nextPage = start + printSize;

            html += '<li class="page-item">';
            html += '   <a class="page-link" href="' + url + '?page=' + nextPage + params + '">&raquo;</a>';
            html += '</li>';
        } else {
            html += '<li class="page-item disabled">';
            html += '   <a class="page-link" href="#" tabindex="-1" aria-disabled="true">&raquo;</a>';
            html += '</li>';
        }

        html += '       </ul>';
        html += '   </nav>';
        html += '</dev>';
    }

    return html;
}

// 파일 첨부할때
const fileFilter = (req, file, callbackfunciton) => {
    const filetypes = /.jpg|.png|.gif|.zip|.bmp|.jpeg|.pdf/  // 허용하는 파일 형태들
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase())

    if (extname) {
        return callbackfunciton(null, true);
    } else {
        callbackfunciton('Error: Image Only!');
    }
}

const fileDelete = (file) => {
    try {
        if (fs.existsSync(file)) {
            fs.unlinkSync(file)
        }
    } catch (error) {
        throw "fileDelete Error";
    }
}

// 확장자 알아내는 거
const getFileEXtension = (filename) => {
    return '.' + filename.split('.').pop();
}

const fileMove = (oldFilePath, newFilePath) => {
    try {
        if (fs.existsSync(oldFilePath)) {
            fs.renameSync(oldFilePath, newFilePath);
        }
    } catch (error) {
        throw "fileMove Error";
    }
}

module.exports = {
    checkLogin,
    alertAndGo,
    reqeustFilter,
    dateFormat,
    pageNavigation,
    fileFilter,
    fileDelete,
    getFileEXtension,
    fileMove
}