const dbs = require('../../utils/dbs');
const auth = require('../../utils/auth');
const uniqid = require('uniqid');
const nodemailer = require("nodemailer");
/* Authentication */


module.exports = (router) => {
    // auth(router, 'chiendich');

    //get all chiến dịch
    router.get('/getall', async (req, res) => {
        let rs = await dbs.execute('select * from td_dm_vitri');
        res.json(rs);
    });

    router.post('/save', async (req, res) => {
        if(req.body.vitri_id == "addPage"){
            let rs = await dbs.execute('INSERT INTO td_dm_vitri(ten_vitri, mota) VALUES ("' + req.body.ten_vitri + '", "' + req.body.mota + '")');
            if(rs.affectedRows > 0){
                res.json({status:true, message: 'Lưu thành công'});
            }
            else{
                res.json({status:false, message: 'Lưu không thành công'});
            }
        }else{
            let rs = await dbs.execute('UPDATE td_dm_vitri SET ten_vitri = "' + req.body.ten_vitri + '", mota = "' + req.body.mota + '" WHERE vitri_id = "' + req.body.vitri_id +'"');
            if(rs.affectedRows > 0){
                res.json({status:true, message: 'Lưu thành công'});
            }
            else{
                res.json({status:false, message: 'Lưu không thành công'});
            }
        }
    });
    router.post('/delete', async (req, res) => {
        let rs = await dbs.execute('select count(*) tong FROM td_map_chiendich_vitri WHERE vitri_id = "' + req.body.vitri_id +'"');
        if(rs[0].tong > 0){
            res.json({status: false, message: "Đã có chiến dịch sử dụng vị trí, không được xoá"})
        }
        else{
            let rs = await dbs.execute('DELETE FROM td_dm_vitri WHERE vitri_id = "' + req.body.vitri_id +'"');
            if(rs.affectedRows>0){
                res.json({status: true, message: "Xoá chiến dịch thành công"});
            }
            else{
                res.json({status: false, message: "Xoá chiến dịch không thành công"});  
            }
            
        }
    });
    
};
