const dbs = require('../../utils/dbs');
const auth = require('../../utils/auth');
const uniqid = require('uniqid');


/* Authentication */


module.exports = (router) => {
    // auth(router, 'chiendich');

    //get all chiến dịch
    router.get('/', async (req, res) => {
        let rs = await dbs.execute('select u.*, c.ten_chiendich from td_ungvien u, td_chiendich c, td_map_ungvien_vitri where c.chiendich_id = m.chiendich_id and m.ungvien_id = u.ungvien_id');
        res.json(rs);
    });

    router.get('/getDetailUngVien/:ungvien_id/:chiendich_id', async (req, res) => {
        let rs ={}
        let rs3 = []
        if(req.params.ungvien_id =="addPage"){
            rs.tenungvien = "",
            rs.email = ""
            rs3 = await dbs.execute('select v.*, 0 checkapp from td_dm_vitri v, td_map_chiendich_vitri m  where m.vitri_id = v.vitri_id and m.chiendich_id ="' + req.params.chiendich_id + '"')
        }
        else{
            let rs2 = await dbs.execute('select u.* from td_ungvien u, td_map_ungvien_vitri m where m.ungvien_id = u.ungvien_id and u.ungvien_id = "'+ req.params.ungvien_id+'" and m.chiendich_id = "'+ req.params.chiendich_id +'"')
            rs = rs2[0]
            rs3 = await dbs.execute('select x.*, case when (x.vitri_id in (select vitri_id from td_map_ungvien_vitri where chiendich_id ="'+ req.params.chiendich_id + '" and ungvien_id = "'+req.params.ungvien_id+'")) then 1 else 0 end checkapp from (select v.* from td_dm_vitri v, td_map_chiendich_vitri m where m.vitri_id = v.vitri_id and m.chiendich_id ="'+ req.params.chiendich_id + '")x')
        }
        rs.ListViTri = rs3
        res.json(rs);
    });

    router.get('/getUngVienByViTriChienDich/:chiendich_id', async (req, res) => {
        let rs ={};
        let sql ='select distinct * from td_ungvien where ungvien_id not in (select distinct ungvien_id from td_map_ungvien_vitri where chiendich_id ="' + req.params.chiendich_id + '")'
        let rs1 = await dbs.execute(sql)
        rs.ungvien = rs1
        let sql2  = 'select v.* from td_dm_vitri v, td_map_chiendich_vitri m where v.vitri_id = m.vitri_id and m.chiendich_id = "' + req.params.chiendich_id + '"'
        let rs2 = await dbs.execute(sql2)
        rs.vitri = rs2
        res.json(rs);
    });

    router.post('/deleteUngVienOfChienDich/', async (req, res) => {
        let sql ='DELETE FROM td_map_ungvien_vitri WHERE ungvien_id = "' + req.body.ungvien_id + '" and chiendich_id =  "' + req.body.chiendich_id + '"'
        let rs= await dbs.execute(sql)
        if(rs.affectedRows > 0){
            return res.json({status: true, message: 'Xoá ứng viên khỏi chiến dịch thành công'})
        }
        else{
            return res.json({status: false, message: 'Xoá ứng viên khỏi chiến dịch không thành công'})
        }
    });


    router.post('/history', async (req, res) => {
        let sql ='select case when m.status = 1 then "được tham gia" else "Không được tham gia" end Status, m.note, g.ten_giaidoan from td_dm_giaidoan g, td_map_ungvien_vitri m where g.giaidoan = m.giaidoan and m.chiendich_id = "' + req.body.chienDichID + '" and m.ungvien_id ="' + req.body.ungVienID +'" and m.vitri_id = "' + req.body.viTriID +'"'
        console.log(sql)
        let rs = await dbs.execute(sql)
        res.json(rs);
    });


    router.get('/getUngVienByChienDich/:chiendich_id', async (req, res) => {
        let sql = 'select DISTINCT u.*  from td_ungvien u, td_map_ungvien_vitri m  where m.ungvien_id = u.ungvien_id and  m.chiendich_id = "'+ req.params.chiendich_id +'"'   
        rs = await dbs.execute(sql);
        res.json(rs);
    });

    router.get('/getAllUngVienAndViTriByChienDich/:chiendich_id', async (req, res) => {
        let result =  {}
        let sql = 'select u.*,v.vitri_id, v.ten_vitri, 0 pass, "" note from td_chiendich c, td_ungvien u, td_map_ungvien_vitri m, td_dm_vitri v WHERE m.status =1 and  c.chiendich_id = m.chiendich_id and c.giaidoan = m.giaidoan and u.ungvien_id = m.ungvien_id and m.vitri_id = v.vitri_id and m.chiendich_id ="'+ req.params.chiendich_id +'"'   
        console.log(sql)
        let rs = await dbs.execute(sql);
        result.chiendich = await rs 
        let sql2 = 'select * from td_dm_giaidoan where giaidoan not in (select distinct giaidoan from td_map_ungvien_vitri where chiendich_id ="'+ req.params.chiendich_id +'")'
        let rs2 = await dbs.execute(sql2);
        result.giaidoan = await rs2
        
        res.json(result);
    });

    router.post('/save', async (req, res) => {
        let id = uniqid()
        if(req.body.ungvien_id == "addPage"){
            let sql = 'INSERT INTO td_ungvien (ungvien_id, tenungvien, email) VALUES ("'+id+'","'+req.body.ten_ungvien+'","'+req.body.email+'")'
            console.log(sql)
            let rs1 = await dbs.execute(sql);
            if(rs1.affectedRows > 0){
                req.body.ListViTri.map( async v => {
                    let sql3 = 'INSERT INTO td_map_ungvien_vitri(ungvien_id, vitri_id, chiendich_id, giaidoan, status) VALUES ("' + id +'","'+v.vitri_id+'","'+req.body.chiendich_id+'", 1, 1)'
                    let rs2 = await dbs.execute(sql3);
                    if(rs2.affectedRows == 0){
                        await dbs.execute(sql2);
                        res.json({status:false, message: "luu vi tri sai"})
                    }
                })
            }
            else{
                res.json({status:false, message: "luu ung vien sai"})
            }
        }else{
            let sql5 = 'update td_ungvien set  tenungvien = "' + req.body.ten_ungvien + '", email = "' + req.body.email +'" where ungvien_id = "'+req.body.ungvien_id+'"'
            let rs5 = await dbs.execute(sql5);
            if(rs5.affectedRows > 0){
                let sql6 = 'delete from td_map_ungvien_vitri where ungvien_id = "' + req.body.ungvien_id + '" and chiendich_id = "' + req.body.chiendich_id + '"'
                await dbs.execute(sql6);
                req.body.ListViTri.map( async v => {
                    if(v.checkapp > 0){
                    console.log(v.checkapp)
                    let sql7 = 'INSERT INTO td_map_ungvien_vitri(ungvien_id, vitri_id, chiendich_id, giaidoan, status ) VALUES ("' + req.body.ungvien_id+'","'+v.vitri_id+'","'+req.body.chiendich_id+'", 1, 1)'
                    let rs7 = await dbs.execute(sql7);
                    if(rs7.affectedRows == 0){
                        res.json({status:false, message: "luu vi tri sai"})
                    }
                    }
                })
            }
            else{
                res.json({status:false, message: "luu ung vien sai"})
            }
        }
        res.json({status:true, message: "luu thanh cong"})
    });
   
};
