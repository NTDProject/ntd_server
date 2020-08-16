const mysql = require('mysql');
const config = require('./config.js');

const Service = {

  getConn: () => {
    let conn = null;
    try {
      conn = mysql.createConnection({
        host: config.host,
        user: config.user,
        password: config.password,
        database: config.database
      });
      conn.connect();
    }
    catch (err) {

    }
    return conn
  },
  closeConn: conn => {
    if (conn) {
      try {
        conn.end();
      }
      catch (err) {
        console.log(err)
      }
    }
  },
  execute: (sql, bind) => {
    return new Promise(async (resolve, reject) => {
      let conn
      try {
        conn = Service.getConn();

        conn.query(sql, bind, function (error, results) {
          if (error) reject(error);
          resolve(results)
        });
      }
      catch (err) {
        reject(err)
      }
      finally {
        Service.closeConn(conn)
      }
    })
  },
  getNextID: (table, column_name) => {
    

    return new Promise(async (resolve, reject) => {
      console.log(table)
    console.log(column_name)
      let conn;
      let sql = `select ?? from ?? order by ?? desc limit 1`;
      bind = [column_name, table, column_name]
      try {
        conn = Service.getConn();
        conn.query(sql, bind, function (error, results) {
          if (error) reject(error);

          console.log(results.length);
          let rs = 'UV' + '1'.padStart(5, '0');
          if (results.length > 0) {
            rs = 'UV' + (parseInt(results[0].ungvien_id.replace('UV', '')) + 1).toString().padStart(5, '0');
            console.log(rs)
          }
          resolve(rs);
        });
      }
      catch (err) {
        reject(err)
      }
      finally {
        Service.closeConn(conn)
      }
    })
  }

}
module.exports = Service