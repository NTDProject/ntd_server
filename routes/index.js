const express = require('express');
const router = express.Router();
const dbs = require('../utils/dbs');
const jwt = require('jsonwebtoken');
const config = require('../utils/config');
const bcryptjs = require('bcryptjs');

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/signin', async function (req, res) {
  let username = req.body.username;
  let password = req.body.password;
  
  try {
    let user = await dbs.execute('select * from td_user where username = ?',[username]);    
    
    if (user[0]) {
      let rs = bcryptjs.compareSync(password, user[0].password);   
      if (rs) {
        let sql1000 = 'select p.title, p.href from td_path p, td_group g, td_map_group_path m where p.path_id = m.path_id and g.group_id = m.group_id and g.group_id ="' + user[0].group_id +'"'
        let path = await dbs.execute(sql1000)
        delete user[0].password;
        var token = jwt.sign(JSON.parse(JSON.stringify(user[0])), config.secret, { expiresIn: config.expires });
        res.json({ success: true, token: token, expires: new Date(Date.now() + config.expires * 1000), path: path });
      } else {
        res.json({ success: false, msg: 'Sai Tên Đăng Nhập Hoặc Mật Khẩu !' });
      }
    } else {
      res.json({ success: false, msg: 'Sai Tên Đăng Nhập Hoặc Mật Khẩu !' });
    }
  } catch (error) {    
    res.json({ success: false, msg: 'Sai Tên Đăng Nhập Hoặc Mật Khẩu !' });
  }
});

module.exports = router;
