const db = require('../common/db');

const loginCheck = async (user_id, user_pw) => {
    try {
        const sql = "select id, userid, name from member where userid = ? and passwd = ?";
        const params = [user_id, user_pw];

        const result = await db.runSql(sql, params);   //async여서 await 해줘야함
        return result[0];
    } catch (error) {
        throw "sql error: " + error;
    }
}

const getIdCount = async (user_id) => {
    try {
        const sql = "select count(id) as cnt from member where userid = ?"
        const params = [user_id]

        const result = await db.runSql(sql, params);

        return result[0].cnt
    } catch (error) {
        throw "sql error" + error;
    }
}

const insertMember = async (user_id, user_pw, name) => {
    try {
        const sql = 'insert into member(userid, passwd, name) values (?, ?, ?)';
        const params = [user_id, user_pw, name]

        const result = await db.runSql(sql, params);
    } catch (error) {
        throw "sql error" + error;
    }
}

// 전체 페이지수 카운트 
const getTotalCount = async (search_key) => {  // 검색어가 있거나 없거나. id또는 이름이 search_key인걸 찾아야함
    try {

        const sql = "select count(id) as cnt from member where (userid like ? or name like ?)";
        const param = ['%' + search_key + '%', '%' + search_key + '%'];


        const result = await db.runSql(sql, param);

        return result[0].cnt;
    } catch (error) {
        throw "sql error" + error;
    }
}

const getList = async (pageSize, page, search_key) => {
    try {
        let start = (page - 1) * pageSize;

        const sql = "select id, userid, name, regdate from member where (userid like ? or name like ?) order by id desc limit ?, ?";
        const param = ['%' + search_key + '%', '%' + search_key + '%', start, pageSize];  // 윗줄 ?에 순서대로 넣어주는거임

        const result = await db.runSql(sql, param);

        return result;
    } catch (error) {
        throw "sql error" + error;
    }
}

const getData = async (pkid) => {
    try {
        const sql = "select id, userid, name, regdate from member where id = ?";
        const param = [pkid];

        const result = await db.runSql(sql, param);

        return result[0];
    } catch (error) {
        throw "sql error" + error;
    }
}

const updateMember = async (id, name, passwd) => {
    try {
        let sql = '';
        let param = null;

        if (passwd != null && passwd != '') {
            sql = "update member set name = ?, passwd = ? where id = ?";
            param = [name, passwd, id];
        } else {
            sql = "update member set name = ? where id = ?";
            param = [name, id];
        }
        const result = await db.runSql(sql, param);

        return result[0];
    } catch (error) {
        throw "sql error" + error;
    }
}

const deleteMember = async (id) => {
    try {
        const sql = "delete from member where id = ?";
        const param = [id];

        const result = await db.runSql(sql, param);

        return result[0];
    } catch (error) {
        throw "sql error" + error;
    }
}

const getTodayMember = async () => {
    try {
        const sql = "select id, userid, name, DATE_FORMAT(regdate, '%Y-%m-%d') AS regdate from member order by id desc limit 5";   // 이미 정렬된 기본키(id)를 가져와서 정렬하는게 빠름
        

        const result = await db.runSql(sql);

        return result;
    } catch (error) {
        throw "sql error" + error;
    }
}
module.exports = {
    loginCheck,
    getIdCount,
    insertMember,
    getTotalCount,
    getList,
    getData,
    updateMember,
    deleteMember,
    getTodayMember
}