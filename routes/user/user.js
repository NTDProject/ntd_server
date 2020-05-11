const dbs = require('../../utils/dbs');
const auth = require('../../utils/auth');
const { check, validationResult, body } = require('express-validator');
const bcrypt = require('bcrypt');
/* Authentication */


module.exports = (router) => {
    // auth(router, 'user');

    router.get('/', async (req, res) => {
        let rs = await dbs.execute('select * from td_user');
        res.json(rs);
    });

    router.post('/changpass', [
        check('pass', 'Mật khẩu cũ là trường bắt buộc').notEmpty(),
        check('newpass', 'Mật khẩu mới là trường bắt buộc').notEmpty(),
        check('renewpass', 'Nhập lại mật khẩu mới là trường bắt buộc').notEmpty(),
      
    ], async (req, res) => {
        console.log(req.body)
        try {
            // Check Errors
            const errors = validationResult(req);

            if (!errors.isEmpty()) {            
                res.json({ errors: errors.array() });
            } else {
                const saltRounds = 10;
                let salt = bcrypt.genSaltSync(saltRounds);
                let passencode = bcrypt.hashSync(req.body.pass, salt);
                let newpassencode = bcrypt.hashSync(req.body.newpass, salt);
                let user = await dbs.execute('select *  from td_user where username = ? ', [req.body.username])
                let rs1  = bcrypt.compareSync(req.body.pass, user[0].password); 
                if (!rs1) {
                    res.json({ errors: [{msg:'Sai mật khẩu cũ'}] });
                }
                else  if(req.body.newpass != req.body.renewpass){
                    res.json({ errors: [{msg:'Nhập lại mật khẩu mới không khớp'}] });
                }else{
                    let sql = `update td_user set password = ? where username = ?`;       
                    let bind = [newpassencode, req.body.username];
                    let rs = await dbs.execute(sql, bind);
                    res.json(rs)
                }
            }
        } catch (error) {
            console.log(error);
            res.json({ err: error });
        }
    
    });
};
