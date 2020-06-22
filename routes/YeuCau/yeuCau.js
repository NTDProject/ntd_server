const dbs = require('../../utils/dbs');
const auth = require('../../utils/auth');
const uniqid = require('uniqid');
const nodemailer = require("nodemailer");
/* Authentication */


module.exports = (router) => {
    // auth(router, 'chiendich');

    //get all chiến dịch
    router.get('/getall', async (req, res) => {
        let rs = await dbs.execute('select * from td_dm_yeucau');
        res.json(rs);
    });

    router.post('/save', async (req, res) => {
        if(req.body.GiaiDoan == "addPage"){
            let rs = await dbs.execute('INSERT INTO td_dm_yeucau(nd_yeucau, mo_ta) VALUES ("' + req.body.Ten_GiaiDoan + '", "' + req.body.Note + '")');
            if(rs.affectedRows > 0){
                res.json({status:true, message: 'Lưu thành công'});
            }
            else{
                res.json({status:false, message: 'Lưu không thành công'});
            }
        }else{
            let rs = await dbs.execute('UPDATE td_dm_yeucau SET nd_yeucau = "' + req.body.Ten_GiaiDoan + '", mo_ta = "' + req.body.Note + '" WHERE yeucau_id = "' + req.body.GiaiDoan +'"');
            if(rs.affectedRows > 0){
                res.json({status:true, message: 'Lưu thành công'});
            }
            else{
                res.json({status:false, message: 'Lưu không thành công'});
            }
        }
    });
    router.post('/delete', async (req, res) => {
        // let rs = await dbs.execute('select count(*) tong FROM td_map_ungvien_vitri WHERE giaidoan = "' + req.body.GiaiDoan +'"');
        // if(rs[0].tong > 0){
        //     res.json({status: false, message: "Đã có chiến dịch sử dụng giai đoạn, không được xoá"})
        // }
        // else{
            let rs = await dbs.execute('DELETE FROM td_dm_yeucau WHERE yeucau_id = "' + req.body.GiaiDoan +'"');
            if(rs.affectedRows>0){
                res.json({status: true, message: "Xoá yêu cầu thành công"});
            }
            else{
                res.json({status: false, message: "Xoá yêu cầu không thành công"});  
            }
            
        // }
    });
    
};
