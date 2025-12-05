const express = require("express") ;
const nunjucks = require("nunjucks");
const common = require('./common/common');

const app = express();    // express가 was임
app.set('view engine', 'html');  // view engine은 html을 쓸거

// View Engine 설정
nunjucks.configure('views', {
    express: app,
    watch: true    // html 바뀌면 재시작 안해줘도 웹브라우저에서 새로고침하면 바로 바뀜
})

// post 데이터 받기
app.use(express.urlencoded({
    extended: true
}));

//view 단에서 common 함수 사용할때
app.locals.common = common;

// 정적파일 설정                    (// 절대경로    있는 위치)
app.use('/assets', express.static( __dirname + '/views/assets'));
app.use('/uploads', express.static( __dirname + '/uploads'));   // 파일 첨부할때 사용



// Session 사용 설정
const session = require('express-session');
const sessionFile = require('session-file-store')(session);   // 파일로 저장할 때
const sessionDB = require('express-mysql-session')(session);   
const db = require('./common/db');

// 실제 session 적용
app.use(
    session({
        secret: "kiwu",   // 세션 명칭
        resave: true,     // 저장해라 라는 뜻
        saveUninitialized: false,    // 아무 정보 없는 세션 저장 금지하는 옵셥

        // file에 저장
        // store: new sessionFile({logFn: function() {} })   // 파일 쓸건데 파일 로그인 함수 무효화 위해

        // db에 저장
        store: new sessionDB(db.db)  //db.js안에 있는 db 정보
    })   
);

// Routing 방법
const indexRouter = require('./routers/home');
const memberRouter = require('./routers/member');
const noticeRouter = require('./routers/notice');

app.use('/', indexRouter.router);
app.use('/member', memberRouter.router);
app.use('/notice', noticeRouter.router);

// 404 Notfound
app.use((req, res) => {
    res.status(404).send('404 Not Found');
});

app.listen(80, () => {
    console.log(80, '번에서 express 동작중');
});