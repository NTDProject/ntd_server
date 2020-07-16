const dbs = require('../../utils/dbs');
const auth = require('../../utils/auth');
const uniqid = require('uniqid');
const nodemailer = require("nodemailer");
/* Authentication */


module.exports = (router) => {
    // auth(router, 'chiendich');
    //get all nhóm quyền
    router.get('/', async (req, res) => {
        let rs = await dbs.execute('SELECT * FROM td_group ');
        res.json(rs);
    });

    router.get('/:group_id', async (req, res) => {
        let sql1 = ""
        let sql2 = ""
        if(req.params.group_id == "addPage"){
            sql1 = 'SELECT "addPage" group_id, "" group_name FROM td_group'
            sql2 = 'select p.path_id,p.title,p.href, 0 dem from td_path p'
        }else{
            sql1 = 'SELECT * FROM td_group where group_id = "' +  req.params.group_id + '"'
            sql2 = 'select p.path_id,p.title,p.href, count(m.path_id) dem from td_path p left join (select * from td_map_group_path where group_id = "' +  req.params.group_id + '")m on p.path_id = m.path_id group by m.group_id,p.path_id,p.title,p.href'
        }
        let rs1 = await dbs.execute(sql1);
        let rs2 = await dbs.execute(sql2);
        let rs = {}
        rs.GroupInfor = rs1[0]
        rs.ListPath = rs2
        res.json(rs)
    });

    //update chiến dịch
    router.post('/save', async (req, res) => {
        console.log(req.body)
        if(req.body.group_id == "addPage")
        {
            let sql = 'INSERT INTO td_group(group_name) VALUES ("'+req.body.group_name+'")'
            let rs1 = await dbs.execute(sql);
            if(rs1.affectedRows > 0){
                req.body.ListPath.map(p => {
                    if(p.dem > 0){
                        sql2 = 'INSERT INTO td_map_group_path(group_id, path_id) VALUES ("'+rs1.insertId+'","'+p.path_id+'")'
                        let rs2 =  dbs.execute(sql2);
                        if(rs2.affectedRows < 1){
                            res.json({status: false, message:"Luu sai path"})
                        }                        
                    }
                })
            }
            else{
                res.json({status: false, message:"Luu nhom quyen sai"})
            }
            
        }
        else{
            let sql5 = 'UPDATE td_group SET group_name = "'+req.body.group_name+'" WHERE group_id = "'+req.body.group_id+'"'
            let rs5 = await dbs.execute(sql5);
                let sql600 = 'delete FROM td_map_group_path WHERE group_id = "' + req.body.group_id + '"'
                let rs600 = await dbs.execute(sql600);
                if(rs600.affectedRows > 0){
                req.body.ListPath.map(p => {
                    if(p.dem > 0){
                        let sql7 = 'INSERT INTO td_map_group_path(group_id, path_id) VALUES ("'+req.body.group_id+'","'+p.path_id+'")'
                        let rs7 =  dbs.execute(sql7);
                        if(rs7.affectedRows = 0){
                            res.json({status: false, message:"luu path sai"})
                        }
                    }
                })
            }
        }
        
        res.json({status:true, message:"luu thanh cong"});
    });

    //xoá chiến dịch
    router.post('/delete', async (req, res) => {
        let rs = await dbs.execute('select count(*) tong FROM td_user WHERE group_id = "' + req.body.group_id +'"');
        if(rs[0].tong > 0){
            res.json({status: false, message: "Không được xoá nhóm quyền đã có người sử dụng"})
        }
        else{
            let rs = await dbs.execute('DELETE FROM td_map_group_path WHERE group_id = "' + req.body.group_id +'"');
            let rs12 = await dbs.execute('DELETE FROM td_group WHERE group_id = "' + req.body.group_id +'"');

            if(rs12.affectedRows<1){
                res.json({status: false, message: "Xoá nhóm quyền không thành công"});  
            }
            else if(rs.affectedRows<1){
                res.json({status: false, message: "Xoá nhóm quyền không thành công"});  
            }
            else{
                res.json({status: true, message: "Xoá nhóm quyềnthành công"});
            }
            
        }
    });

};
