const express = require('express');
const router = express.Router();
const dbs = require('../../utils/dbs');
const { check, validationResult, body } = require('express-validator');
const bcryptjs = require('bcryptjs');
const privateRouteUser = require('./user');
const nodemailer = require("nodemailer");
/* Add User */
router.post('/', [
    check('name', 'Username là trường bắt buộc').notEmpty(),
    check('email', 'Email là trường bắt buộc').notEmpty(),
    check('group_id', 'Nhóm quyền là trường bắt buộc').notEmpty(),
    body('name').custom(async value => {
        let user = await dbs.execute('select * from td_user where username = ?', [value])
        if (user[0]) {
            return Promise.reject('Đã tồn tại username');
        }
    }),
    body('email').custom(async value => {
        let user = await dbs.execute('select * from td_user where email = ?', [value])
        if (user[0]) {
            return Promise.reject('Đã tồn tại email');
        }
    }),
], async (req, res) => {
    console.log(req.body)
    try {
        // Check Errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {            
            res.json({ errors: errors.array() });
        } else {
            let passgen = Math.floor(Math.random()*(999999-100000))
            const saltRounds = 10;
            let salt = bcryptjs.genSaltSync(saltRounds);
            let pass = bcryptjs.hashSync(passgen.toString(), salt);
            let sql = `insert into td_user(username, password, trangthai, email, group_id ) values(?, ?, ?, ?, ?)`;       
            let bind = [req.body.name, pass, 1, 1, 1, req.body.email,req.body.group_id];
            let rs = await dbs.execute(sql, bind);

            let transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: 'nguyet.httt.mta',
                    pass: 'nguyetnga'
                }
            });
            let content = "<b>Bạn đã được cấp tài khoản truy cập hệ thống với thông tin truy cập như sau :</b><br>" 
            content += "<p>username :" + req.body.name + "</p>" 
            content += "<p>Password : " + passgen + "</p>"
            // send mail with defined transport objec
            transporter.sendMail({
              from: '"nguyet.httt.mta" <nguyet.httt.mta@gmail.com>', // sender address
              to: req.body.email, // list of receivers
              subject: "Thông báo thông tin tài khoản hệ thống NTD", // Subject line
              text: "", // plain text body
              html: content // html body
            },(error,info)=>{
                if(error){
                    res.json({status:false, message: error })
                }
             
            });

            res.json(rs)
        }
    } catch (error) {
        console.log(error);
        res.json({ err: error });
    }

});

/* Edit User */
router.put('/', (req, res) => {

});

privateRouteUser(router);

module.exports = router;
