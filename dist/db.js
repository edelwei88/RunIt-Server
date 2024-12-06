"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SQLiteController = void 0;
const better_sqlite3_1 = __importDefault(require("better-sqlite3"));
const fs_1 = __importDefault(require("fs"));
const crypto_1 = require("crypto");
class SQLiteController {
    constructor() {
        this.db = new better_sqlite3_1.default("data.sqlite");
    }
    init() {
        this.db.exec(fs_1.default.readFileSync(__dirname + "/dbqueries/create_users.sql").toString());
        this.db.exec(fs_1.default.readFileSync(__dirname + "/dbqueries/create_sessions.sql").toString());
    }
    add_user(username, email, password_string) {
        if (username == "" || email == "" || password_string == "")
            return 60;
        const getStatement = this.db.prepare("select * from users where username = ? or email = ?");
        if (getStatement.all(username, email).length !== 0)
            return 601;
        const insertStatement = this.db.prepare("insert into users (username, email, password_hash) values (?, ?, ?)");
        const password_hash = (0, crypto_1.createHash)("sha256").update(password_string).digest("hex");
        insertStatement.run(username, email, password_hash);
        return 0;
    }
    get_user_id(username, password_string) {
        if (username == "" || password_string == "")
            return -1;
        const getStatement = this.db.prepare("select * from users where username = ? and password_hash = ?");
        const password_hash = (0, crypto_1.createHash)("sha256").update(password_string).digest("hex");
        const data = getStatement.all(username, password_hash);
        if (data.length == 0)
            return -1;
        return data[0].id;
    }
    get_user_by_token(token) {
        if (!this.check_token(token))
            return {};
        const getUserId = this.db.prepare("select * from sessions where token = ?");
        const session = getUserId.all(token);
        const getUserData = this.db.prepare("select username, email from users where id = ?");
        return getUserData.all(session[0].userid)[0];
    }
    find_user(username, password_string) {
        if (username == "" || password_string == "")
            return false;
        const getStatement = this.db.prepare("select * from users where username = ? and password_hash = ?");
        const password_hash = (0, crypto_1.createHash)("sha256").update(password_string).digest("hex");
        if (getStatement.all(username, password_hash).length == 0)
            return false;
        return true;
    }
    add_token(userid) {
        const deleteStatement = this.db.prepare("delete from sessions where userid = ?");
        deleteStatement.run(userid);
        const token = (0, crypto_1.randomBytes)(20).toString('hex');
        const expiredate = Date.now() + 6000000;
        const insertStatement = this.db.prepare("insert into sessions values (?, ?, ?)");
        insertStatement.run(userid, token, expiredate);
        return token;
    }
    check_token(token) {
        const currentdate = Date.now();
        const getStatement = this.db.prepare("select * from sessions where token = ?");
        const data = getStatement.all(token);
        if (data.length !== 0 && data[0].expiredate >= currentdate)
            return true;
        return false;
    }
    update_token_expiredate(token) {
        const getStatement = this.db.prepare("select * from sessions where token = ?");
        const data = getStatement.all(token);
        const currentdate = Date.now();
        if (data.length == 0 || data[0].expiredate < currentdate)
            return false;
        const newexpiredate = Date.now() + 6000000;
        const updateStatement = this.db.prepare("update sessions set expiredate = ? where token = ?");
        updateStatement.run(newexpiredate, token);
        return true;
    }
}
exports.SQLiteController = SQLiteController;
