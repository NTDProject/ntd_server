const dbs = require('../../utils/dbs');
const auth = require('../../utils/auth');
const uniqid = require('uniqid');
const nodemailer = require("nodemailer");


/* Authentication */


module.exports = (router) => {
    // auth(router, 'chiendich');

    //get all chiến dịch
    router.get('/', async (req, res) => {
        let rs = await dbs.execute('select u.ungvien_id,u.tenungvien,u.email,c.chiendich_id,c.ten_chiendich,v.vitri_id,v.ten_vitri,d.giaidoan,d.ten_giaidoan from td_ungvien u, td_dm_vitri v, td_chiendich c, (select DISTINCT vitri_id, chiendich_id, ungvien_id, giaidoan  from td_map_ungvien_vitri where status = 1) m, td_dm_giaidoan d where u.ungvien_id=m.ungvien_id and v.vitri_id=m.vitri_id and c.chiendich_id=m.chiendich_id and d.giaidoan = m.giaidoan');
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
        let sql ='DELETE FROM td_map_ungvien_vitri WHERE ungvien_id = "' + req.body.ungvien_id + '" and chiendich_id =  "' + req.body.chiendich_id + '" and vitri_id = "' + req.body.vitri_id +'"'
        let rs= await dbs.execute(sql)
        if(rs.affectedRows > 0){
            return res.json({status: true, message: 'Xoá ứng viên khỏi chiến dịch thành công'})
        }
        else{
            return res.json({status: false, message: 'Xoá ứng viên khỏi chiến dịch không thành công'})
        }
    });


    router.post('/history', async (req, res) => {
        let sql ='select m.status, m.note,g.giaidoan, g.ten_giaidoan, DATE_FORMAT(m.createdate, "%d/%m/%Y") createdate from td_dm_giaidoan g, td_map_ungvien_vitri m where g.giaidoan = m.giaidoan and m.chiendich_id = "' + req.body.chienDichID + '" and m.ungvien_id ="' + req.body.ungVienID +'" and m.vitri_id = "' + req.body.viTriID +'"'
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
            let sql = 'Update td_ungvien set tenungvien = "'+req.body.ten_ungvien+'", email = "'+ req.body.email+'" where ungvien_id = "'+req.body.ungvien_id+'"'
            let rs = await dbs.execute(sql);
            if(rs.affectedRows > 0){
                res.json({status:true, message: "Lưu thành công"})
            }
            else{
                res.json({status:false, message: "Lưu không thành công"})
            }
        
        
    });

    router.post('/saveUvVtCd', async (req, res) => {
        let id = uniqid()
        if(req.body.ungvien_id == "addPage"){
            let sql = 'INSERT INTO td_ungvien (ungvien_id, tenungvien, email) VALUES ("'+id+'","'+req.body.ten_ungvien+'","'+req.body.email+'")'
            console.log(sql)
            let rs1 = await dbs.execute(sql);
            if(rs1.affectedRows > 0){
                req.body.ListViTri.map( async v => {
                    let sql3 = 'INSERT INTO td_map_ungvien_vitri(ungvien_id, vitri_id, chiendich_id, giaidoan, status, createdate) VALUES ("' + id +'","'+v.vitri_id+'","'+req.body.chiendich_id+'", 1, 1, now())'
                    let rs2 = await dbs.execute(sql3);
                    if(rs2.affectedRows == 0){
                        await dbs.execute(sql2);
                        res.json({status:false, message: "Lưu vị trí sai"})
                    }
                })
            }
            else{
                res.json({status:false, message: "Lưu ứng viên sai"})
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
                    let sql7 = 'INSERT INTO td_map_ungvien_vitri(ungvien_id, vitri_id, chiendich_id, giaidoan, status, createdate ) VALUES ("' + req.body.ungvien_id+'","'+v.vitri_id+'","'+req.body.chiendich_id+'", 1, 1, now())'
                    let rs7 = await dbs.execute(sql7);
                    if(rs7.affectedRows == 0){
                        res.json({status:false, message: "Lưu vi trí sai"})
                    }
                    }
                })
            }
            else{
                res.json({status:false, message: "Lưu ứng viên sai"})
            }
        }
        res.json({status:true, message: "Lưu thành công"})
    });
   

    router.post('/tranfer', async (req, res) => {
        // create reusable transporter object using the default SMTP transport
        
        let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: 'tdhoang96',
              pass: 'giongnhuid0'
            }
        });

        let sql1 = 'update td_map_ungvien_vitri set status = "'+ 0 +'", note = "'+ req.body.note +'" where ungvien_id = "'+req.body.ungvien_id+'" and vitri_id = "'+req.body.vitri_id+'" and chiendich_id = "'+req.body.chiendich_id+'" and status = "'+1+'"'
        let sql2 = 'INSERT INTO td_map_ungvien_vitri(ungvien_id, vitri_id, chiendich_id, GiaiDoan, Status, CreateDate) VALUES ("'+req.body.ungvien_id+'", "'+ req.body.vitri_id+'", "'+ req.body.chiendich_id +'", "'+ req.body.giaidoansau_id+'", "'+ 1 +'", now())' 
        await dbs.execute(sql1);
        await dbs.execute(sql2);

        let content = "";
        if(req.body.giaidoansau_id == 9){
            content = "<b>Bạn đã dừng lại tại giai đoạn" + req.body.ten_giaidoan + " của chiến dịch " +  req.body.ten_chiendich + "</b><br>" 
            content += "<p>Hẹn gặp lại bạn trong các chiến dịch tuyển dụng khác. Chân thành cảm ơn bạn ! </p> "
        }else {
            content = "<b>Bạn đã vượt qua giai đoạn " + req.body.ten_giaidoan + " của chiến dịch " +  req.body.ten_chiendich + "</b><br>" 
            content += "<p>Hẹn gặp lại bạn trong " + req.body.giaidoansau + ", chi tiết như sau :</p> "
            content += "<p> thời gian: " + req.body.ngayhen + "</p>"
            content += "<p> địa điểm: " + req.body.diadiemhen + "</p>"
        }
        // send mail with defined transport objec
        transporter.sendMail({
          from: '"tdhoang96" <tdhoang96@gmail.com>', // sender address
          to: req.body.email, // list of receivers
          subject: "Thông báo tuyển dụng", // Subject line
          text: "Hello world?", // plain text body
          html: content // html body
        },(error,info)=>{
            if(error){
                res.json({status:false, message: error })
            }
         
        });
        res.json({status:true, message: "thanh cong"})
    });
   
};
