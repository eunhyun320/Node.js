const db = require('../common/db');

const insertNotice = async (fkmember, title, content, filepath, filename) => {
    try {
        const sql = 'insert into notice(fkmember, title, content, filepath, filename) values (?, ?, ?, ?, ?)';
        const params = [fkmember, title, content, filepath, filename]

        const result = await db.runSql(sql, params);
    } catch (error) {
        throw "sql error" + error;
    }
}

// 전체 페이지수 카운트 
const getNoticeTotalCount = async (search_key) => {  // 검색어가 있거나 없거나. title 또는 content가 search_key인걸 찾아야함
    try {

        const sql = "select count(id) as cnt from notice where (title like ? or content like ?)";
        const param = ['%' + search_key + '%', '%' + search_key + '%'];


        const result = await db.runSql(sql, param);

        return result[0].cnt;
    } catch (error) {
        throw "sql error" + error;
    }
}

const getNoticeList = async (pageSize, page, search_key) => {
    try {
        let start = (page - 1) * pageSize;

        const sql = "select n.id, n.fkmember, n.title, n.content, n.filepath, n.filename, n.regdate, n.viewcount, m.name from notice n left join member m on n.fkmember = m.id where (n.title like ? or n.content like ?) order by n.id desc limit ?, ?";
        const param = ['%' + search_key + '%', '%' + search_key + '%', start, pageSize];

        const result = await db.runSql(sql, param);

        return result;
    } catch (error) {
        throw "sql error" + error;
    }
}

const getNoticeData = async (id) => {
    try {
        const sql = "select n.id, n.fkmember, n.title, n.content, n.filepath, n.filename, n.regdate, n.viewcount, m.name from notice n left join member m on n.fkmember = m.id where n.id = ?";
        const param = [id];

        const result = await db.runSql(sql, param);

        return result[0];
    } catch (error) {
        throw "sql error" + error;
    }
}

const updateViewCount = async (id) => {
    try {
        const sql = "update notice set viewcount = viewcount + 1 where id = ?";
        const param = [id];

        const result = await db.runSql(sql, param);

        return result;
    } catch (error) {
        throw "sql error" + error;
    }
}

const deleteNotice = async (id) => {
    try {
        const sql = "delete from notice where id = ?";
        const param = [id];

        const result = await db.runSql(sql, param);

        return result;
    } catch (error) {
        throw "sql error" + error;
    }
}

const updateNotice = async (id, title, content, filepath, filename) => {
    try {
        const sql = "update notice set title = ?, content = ?, filepath = ?, filename = ? where id = ?";
        const param = [title, content, filepath, filename, id];

        const result = await db.runSql(sql, param);

        return result;
    } catch (error) {
        throw "sql error" + error;
    }
}

const getTodayNotice = async () => {
    try {
        const sql = `
            SELECT 
                n.id,
                n.title,
                m.name,
                DATE_FORMAT(n.regdate, '%Y-%m-%d') AS regdate
            FROM notice n
            JOIN member m ON n.fkmember = m.id
            ORDER BY n.regdate DESC
            LIMIT 5
        `;
        
        const result = await db.runSql(sql);
        
        return result;
    } catch (error) {
        throw "sql error" + error;
    }
};


module.exports = {
    insertNotice,
    getNoticeTotalCount,
    getNoticeList,
    getNoticeData,
    updateViewCount,
    deleteNotice,
    updateNotice,
    getTodayNotice

}