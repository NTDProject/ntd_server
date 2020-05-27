const dbs = require('../../utils/dbs');
const auth = require('../../utils/auth');
const uniqid = require('uniqid');
const nodemailer = require("nodemailer");
/* Authentication */


module.exports = (router) => {
    // auth(router, 'chiendich');

    //get all chiến dịch
    router.get('/getall', async (req, res) => {
        let rs = await dbs.execute('select * from td_dm_giaidoan');
        res.json(rs);
    });
    router.get('/getallminusgiaidoan/:giaidoan', async (req, res) => {
    let sql = 'select * from td_dm_giaidoan where giaidoan not in ("'+ req.params.giaidoan+'")'
        let rs = await dbs.execute(sql);
        res.json(rs)
    });
    router.post('/save', async (req, res) => {
        if(req.body.GiaiDoan == "addPage"){
            let rs = await dbs.execute('INSERT INTO td_dm_giaidoan(Ten_GiaiDoan, Note) VALUES ("' + req.body.Ten_GiaiDoan + '", "' + req.body.Note + '")');
            if(rs.affectedRows > 0){
                res.json({status:true, message: 'Lưu thành công'});
            }
            else{
                res.json({status:false, message: 'Lưu không thành công'});
            }
        }else{
            let rs = await dbs.execute('UPDATE td_dm_giaidoan SET Ten_GiaiDoan = "' + req.body.Ten_GiaiDoan + '", Note = "' + req.body.Note + '" WHERE GiaiDoan = "' + req.body.GiaiDoan +'"');
            if(rs.affectedRows > 0){
                res.json({status:true, message: 'Lưu thành công'});
            }
            else{
                res.json({status:false, message: 'Lưu không thành công'});
            }
        }
    });
    router.post('/delete', async (req, res) => {
        let rs = await dbs.execute('select count(*) tong FROM td_map_ungvien_vitri WHERE giaidoan = "' + req.body.GiaiDoan +'"');
        if(rs[0].tong > 0){
            res.json({status: false, message: "Đã có chiến dịch sử dụng giai đoạn, không được xoá"})
        }else if(req.body.GiaiDoan == 4 || req.body.GiaiDoan == 1 || req.body.GiaiDoan == 9 ){
            res.json({status: false, message: "Không được xóa giai đoạn mặc định"})
        }
        else{
            let rs = await dbs.execute('DELETE FROM td_dm_giaidoan WHERE giaidoan = "' + req.body.GiaiDoan +'"');
            if(rs.affectedRows>0){
                res.json({status: true, message: "Xoá chiến dịch thành công"});
            }
            else{
                res.json({status: false, message: "Xoá chiến dịch không thành công"});  
            }
            
        }
    });
    
};
