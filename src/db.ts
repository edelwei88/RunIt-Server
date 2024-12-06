import BetterSqlite3 from 'better-sqlite3'
import fs from "fs";
import { createHash, randomBytes } from 'crypto';

export class SQLiteController {
  db: BetterSqlite3.Database;

  constructor() {
    this.db = new BetterSqlite3("data.sqlite");
  }

  init() {
    this.db.exec(fs.readFileSync(__dirname + "/dbqueries/create_users.sql").toString());
    this.db.exec(fs.readFileSync(__dirname + "/dbqueries/create_sessions.sql").toString());
  }

  add_user(username: string, email: string, password_string: string): Number {
    if (username == "" || email == "" || password_string == "")
      return 60;

    const getStatement: BetterSqlite3.Statement = this.db.prepare("select * from users where username = ? or email = ?");
    if (getStatement.all(username, email).length !== 0)
      return 601;


    const insertStatement: BetterSqlite3.Statement = this.db.prepare("insert into users (username, email, password_hash) values (?, ?, ?)");
    const password_hash: string = createHash("sha256").update(password_string).digest("hex");
    insertStatement.run(username, email, password_hash);
    return 0;
  }

  get_user_id(username: string, password_string: string): Number {
    if (username == "" || password_string == "")
      return -1;

    const getStatement: BetterSqlite3.Statement = this.db.prepare("select * from users where username = ? and password_hash = ?");
    const password_hash: string = createHash("sha256").update(password_string).digest("hex");
    const data: any = getStatement.all(username, password_hash);
    if (data.length == 0)
      return -1;

    return data[0].id;
  }

  get_user_by_token(token: string): any {
    if (!this.check_token(token))
      return {};

    const getUserId: BetterSqlite3.Statement = this.db.prepare("select * from sessions where token = ?");
    const session: any = getUserId.all(token);

    const getUserData: BetterSqlite3.Statement = this.db.prepare("select username, email from users where id = ?");
    return getUserData.all(session[0].userid)[0];
  }

  find_user(username: string, password_string: string): Boolean {
    if (username == "" || password_string == "")
      return false;

    const getStatement: BetterSqlite3.Statement = this.db.prepare("select * from users where username = ? and password_hash = ?");
    const password_hash: string = createHash("sha256").update(password_string).digest("hex");
    if (getStatement.all(username, password_hash).length == 0)
      return false;
    return true;
  }

  add_token(userid: Number): string {
    const deleteStatement: BetterSqlite3.Statement = this.db.prepare("delete from sessions where userid = ?");
    deleteStatement.run(userid);

    const token: string = randomBytes(20).toString('hex');
    const expiredate: Number = Date.now() + 6000000;

    const insertStatement: BetterSqlite3.Statement = this.db.prepare("insert into sessions values (?, ?, ?)");
    insertStatement.run(userid, token, expiredate);
    return token;
  }

  check_token(token: string): Boolean {
    const currentdate: Number = Date.now();
    const getStatement: BetterSqlite3.Statement = this.db.prepare("select * from sessions where token = ?");
    const data: any = getStatement.all(token);

    if (data.length !== 0 && data[0].expiredate >= currentdate)
      return true;
    return false;
  }

  update_token_expiredate(token: string): Boolean {
    const getStatement: BetterSqlite3.Statement = this.db.prepare("select * from sessions where token = ?");
    const data: any = getStatement.all(token);

    const currentdate: Number = Date.now();
    if (data.length == 0 || data[0].expiredate < currentdate)
      return false;

    const newexpiredate: Number = Date.now() + 6000000;
    const updateStatement = this.db.prepare("update sessions set expiredate = ? where token = ?");
    updateStatement.run(newexpiredate, token);
    return true;
  }
}
