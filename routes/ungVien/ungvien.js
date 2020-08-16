const dbs = require('../../utils/dbs');
const auth = require('../../utils/auth');
const uniqid = require('uniqid');
const nodemailer = require("nodemailer");


/* Authentication */


module.exports = (router) => {
    // auth(router, 'chiendich');

    //get all chiến dịch
    router.get('/', async (req, res) => {
        let rs = await dbs.execute('select u.ungvien_id,u.tenungvien,u.email,u.sdt,DATE_FORMAT(u.ngaysinh, "%Y-%m-%d") ngaysinh,u.gioitinh,u.truong,u.trinhdo,(case when u.trinhdo = 1 then "Đại học" when u.trinhdo = 2 then "Cao Đẳng" when u.trinhdo = 2 then "Trung cấp" else "" end) trinhdoStr,u.quequan,u.noiohientai,c.chiendich_id,c.ten_chiendich,v.vitri_id,v.ten_vitri,d.giaidoan,d.ten_giaidoan, (case when d.giaidoan = 4 then "Pass" when d.giaidoan = 9 then "False" else "Process" end) trangthai  from td_ungvien u, td_dm_vitri v, td_chiendich c, (select DISTINCT vitri_id, chiendich_id, ungvien_id, giaidoan  from td_map_ungvien_vitri where status = 1) m, td_dm_giaidoan d where u.ungvien_id=m.ungvien_id and v.vitri_id=m.vitri_id and c.chiendich_id=m.chiendich_id and d.giaidoan = m.giaidoan');
        res.json(rs);
    });

    router.get('/getDetailUngVien/:ungvien_id/:chiendich_id', async (req, res) => {
        let rs ={}
        let rs3 = []
        if(req.params.ungvien_id =="addPage"){
            rs.tenungvien = "",
            rs.email = ""
            rs3 = await dbs.execute('select a.*, case when b.dem is null then 0 else b.dem end dem from (select v.*, 0 checkapp, m.soluong from td_dm_vitri v, td_map_chiendich_vitri m where m.vitri_id = v.vitri_id and m.chiendich_id ="' + req.params.chiendich_id + '")a left join(select chiendich_id, vitri_id, count(ungvien_id) dem from td_map_ungvien_vitri where giaidoan = 4 and chiendich_id ="' + req.params.chiendich_id + '")b on a.vitri_id = b.vitri_id')
        }
        else{
            let rs2 = await dbs.execute('select u.* from td_ungvien u, td_map_ungvien_vitri m where m.ungvien_id = u.ungvien_id and u.ungvien_id = "'+ req.params.ungvien_id+'" and m.chiendich_id = "'+ req.params.chiendich_id +'"')
            rs = rs2[0]
            rs3 = await dbs.execute('select x.*, case when (x.vitri_id in (select vitri_id from td_map_ungvien_vitri where chiendich_id ="'+ req.params.chiendich_id + '" and ungvien_id = "'+req.params.ungvien_id+'")) then 1 else 0 end checkapp from (select v.* from td_dm_vitri v, td_map_chiendich_vitri m where m.vitri_id = v.vitri_id and m.chiendich_id ="'+ req.params.chiendich_id + '")x')
        }
        rs.ListViTri = rs3
        const asyncRes = await Promise.all(rs3.map(async (vt,index) => {
            let sql100 = 'select m.ungvien_id, m.chiendich_id, m.vitri_id, m.yeucau_id, y.nd_yeucau, 1 checkYC from td_map_ungvien_chiendich_vitri_yeucau m, td_dm_yeucau y where y.yeucau_id = m.yeucau_id and ungvien_id = "'+req.params.ungvien_id+'" and chiendich_id = "'+req.params.chiendich_id +'" and vitri_id = "'+vt.vitri_id+'" union select "'+req.params.ungvien_id+'" ungvien_id, m2.chiendich_id, m2.vitri_id, m2.yeucau_id, y.nd_yeucau, 0 checkYC from td_map_chiendich_vitri_yeucau m2, td_dm_yeucau y where y.yeucau_id = m2.yeucau_id and chiendich_id = "'+req.params.chiendich_id+'" and vitri_id = "'+vt.vitri_id+'" and m2.yeucau_id not in(select yeucau_id from td_map_ungvien_chiendich_vitri_yeucau where ungvien_id = "'+req.params.ungvien_id+'" and chiendich_id = "'+req.params.chiendich_id+'" and vitri_id = "'+vt.vitri_id+'")'
            rs3[index].yeucau =  await dbs.execute(sql100);
        }));
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

    router.post('/getUngVienByViTriChienDichYeuCau', async (req, res) => {
        let sql = ''
        if(req.body.yeucau.length < 1){
            sql ='select u.ungvien_id,u.tenungvien,u.email,c.chiendich_id,c.ten_chiendich,v.vitri_id,v.ten_vitri,d.giaidoan,d.ten_giaidoan, (case when d.giaidoan = 4 then "Pass" when d.giaidoan = 9 then "False" else "Process" end) trangthai from td_ungvien u, td_dm_vitri v, td_chiendich c, (select DISTINCT vitri_id, chiendich_id, ungvien_id, giaidoan  from td_map_ungvien_vitri where status = 1) m, td_dm_giaidoan d where u.ungvien_id=m.ungvien_id and v.vitri_id=m.vitri_id and c.chiendich_id=m.chiendich_id and d.giaidoan = m.giaidoan and m.chiendich_id = "' + req.body.chiendich_id + '" and m.vitri_id = "'+req.body.vitri_id+'" minus select u.ungvien_id,u.tenungvien,u.email,c.chiendich_id,c.ten_chiendich,v.vitri_id,v.ten_vitri,d.giaidoan,d.ten_giaidoan, (case when d.giaidoan = 4 then "Pass" when d.giaidoan = 9 then "False" else "Process" end) trangthai from td_ungvien u, td_dm_vitri v, td_chiendich c, (select DISTINCT  ungvien_id, giaidoan  from td_map_ungvien_vitri where status = 1 and chiendich_id = "'+req.body.chiendich_id+'" and vitri_id = "'+req.body.vitri_id+'") m,td_map_ungvien_chiendich_vitri_yeucau m2, td_dm_giaidoan d where m.ungvien_id = m2.ungvien_id and u.ungvien_id=m2.ungvien_id and v.vitri_id=m2.vitri_id and c.chiendich_id=m2.chiendich_id and d.giaidoan = m.giaidoan and m2.chiendich_id = "' + req.body.chiendich_id + '" and m2.vitri_id = "'+req.body.vitri_id+'" and m2.yeucau_id = "'
        }else {
            sql ='select u.ungvien_id,u.tenungvien,u.email,c.chiendich_id,c.ten_chiendich,v.vitri_id,v.ten_vitri,d.giaidoan,d.ten_giaidoan, (case when d.giaidoan = 4 then "Pass" when d.giaidoan = 9 then "False" else "Process" end) trangthai from td_ungvien u, td_dm_vitri v, td_chiendich c, (select DISTINCT  ungvien_id, giaidoan  from td_map_ungvien_vitri where status = 1 and chiendich_id = "'+req.body.chiendich_id+'" and vitri_id = "'+req.body.vitri_id+'") m,td_map_ungvien_chiendich_vitri_yeucau m2, td_dm_giaidoan d where m.ungvien_id = m2.ungvien_id and u.ungvien_id=m2.ungvien_id and v.vitri_id=m2.vitri_id and c.chiendich_id=m2.chiendich_id and d.giaidoan = m.giaidoan and m2.chiendich_id = "' + req.body.chiendich_id + '" and m2.vitri_id = "'+req.body.vitri_id+'" and m2.yeucau_id = "'+req.body.yeucau[0]+'"'
            req.body.yeucau.map(yc => {
                if(yc !== req.body.yeucau[0]){
                    sql = sql + ' INTERSECT select u.ungvien_id,u.tenungvien,u.email,c.chiendich_id,c.ten_chiendich,v.vitri_id,v.ten_vitri,d.giaidoan,d.ten_giaidoan, (case when d.giaidoan = 4 then "Pass" when d.giaidoan = 9 then "False" else "Process" end) trangthai from td_ungvien u, td_dm_vitri v, td_chiendich c, (select DISTINCT  ungvien_id,giaidoan  from td_map_ungvien_vitri where status = 1 and chiendich_id = "'+req.body.chiendich_id+'" and vitri_id = "'+req.body.vitri_id+'") m,td_map_ungvien_chiendich_vitri_yeucau m2, td_dm_giaidoan d where m.ungvien_id = m2.ungvien_id and u.ungvien_id=m2.ungvien_id and v.vitri_id=m2.vitri_id and c.chiendich_id=m2.chiendich_id and d.giaidoan = m.giaidoan and m2.chiendich_id = "' + req.body.chiendich_id + '" and m2.vitri_id = "'+req.body.vitri_id+'" and m2.yeucau_id = "'+yc+'"'
                }
            })
            
        }
        console.log(sql)
        let rs= await dbs.execute(sql)
        
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
        let sql100 = 'select m.ungvien_id, m.chiendich_id, m.vitri_id, m.yeucau_id, y.nd_yeucau, 1 checkYC from td_map_ungvien_chiendich_vitri_yeucau m, td_dm_yeucau y where y.yeucau_id = m.yeucau_id and ungvien_id = "'+req.body.ungVienID+'" and chiendich_id = "'+req.body.chienDichID +'" and vitri_id = "'+req.body.viTriID+'" union select "'+req.body.ungVienID+'" ungvien_id, m2.chiendich_id, m2.vitri_id, m2.yeucau_id, y.nd_yeucau, 0 checkYC from td_map_chiendich_vitri_yeucau m2, td_dm_yeucau y where y.yeucau_id = m2.yeucau_id and chiendich_id = "'+req.body.chienDichID+'" and vitri_id = "'+req.body.viTriID+'" and m2.yeucau_id not in(select yeucau_id from td_map_ungvien_chiendich_vitri_yeucau where ungvien_id = "'+req.body.ungVienID+'" and chiendich_id = "'+req.body.chienDichID+'" and vitri_id = "'+req.body.viTriID+'")'
        let sql ='select m.status, m.note,g.giaidoan, g.ten_giaidoan,m.diem, DATE_FORMAT(m.createdate, "%d/%m/%Y") createdate, case when m.AppointmentDate = null then "" else DATE_FORMAT(m.AppointmentDate, "%d/%m/%Y") end AppointmentDate from td_dm_giaidoan g, td_map_ungvien_vitri m where g.giaidoan = m.giaidoan and m.chiendich_id = "' + req.body.chienDichID + '" and m.ungvien_id ="' + req.body.ungVienID +'" and m.vitri_id = "' + req.body.viTriID +'"'
        let sql200 = 'select a.*, case when b.dem is null then 0 else b.dem end dem from (select v.*, 0 checkapp, m.soluong from td_dm_vitri v, td_map_chiendich_vitri m where m.vitri_id = v.vitri_id and m.chiendich_id ="'+req.body.chienDichID +'")a left join(select chiendich_id, vitri_id, count(ungvien_id) dem from td_map_ungvien_vitri where giaidoan = 4 and chiendich_id ="'+req.body.chienDichID +'")b on a.vitri_id = b.vitri_id where a.vitri_id ="' + req.body.viTriID +'"'
        let rs ={}
        let rs200 = await dbs.execute(sql200);
        console.log(rs200[0])
        rs.ls= await dbs.execute(sql)
        rs.yc= await dbs.execute(sql100);
        rs.viTriMax = rs200[0];
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
        let sql = 'update td_ungvien set  tenungvien = "' + req.body.ten_ungvien + '", email = "' + req.body.email + '", sdt = "'+ req.body.sdt+ '", ngaysinh = STR_TO_DATE("'+req.body.ngaysinh+'", "%d/%m/%Y"), truong = "'+ req.body.truong+ '", trinhdo = "'+ req.body.trinhdo+ '", gioitinh = "'+ req.body.gioitinh+ '", quequan = "'+ req.body.quequan+ '", noiohientai = "'+ req.body.noiohientai +'"  where ungvien_id = "'+req.body.ungvien_id+'"'
        let sql2 = 'DELETE FROM td_map_ungvien_chiendich_vitri_yeucau WHERE chiendich_id = "' + req.body.chiendich_id + '" and vitri_id = "'+req.body.vitri_id+'" and ungvien_id ="'+req.body.ungvien_id+'"'
            console.log(sql2)
            await dbs.execute(sql2);
            let rs = await dbs.execute(sql);
            req.body.yc.map(y => {
                let sql3 = 'INSERT INTO td_map_ungvien_chiendich_vitri_yeucau(ungvien_id, chiendich_id, vitri_id, yeucau_id) VALUES ("'+req.body.ungvien_id+'","'+req.body.chiendich_id+'","'+req.body.vitri_id+'","'+y.yeucau_id+'")'
                dbs.execute(sql3);
            })
            if(rs.affectedRows > 0){
                res.json({status:true, message: "Lưu thành công"})
            }
            else{
                res.json({status:false, message: "Lưu không thành công"})
            }
        
        
    });

    router.post('/saveUvVtCd', async (req, res) => {
        let id = await dbs.getNextID("td_ungvien", "ungvien_id")
        console.log(req.body)
        if(req.body.ungvien_id == "addPage"){
            let sql = 'INSERT INTO td_ungvien (ungvien_id, tenungvien, email, sdt, ngaysinh, truong, trinhdo, gioitinh, quequan, noiohientai) VALUES ("'+id+'","'+req.body.ten_ungvien+'","'+req.body.email+'","'+req.body.sdt+'", STR_TO_DATE("'+req.body.ngaysinh+'", "%d/%m/%Y"), "'+req.body.truong+'", "'+req.body.trinhdo+'", "'+req.body.gioitinh+'", "'+req.body.quequan+'", "'+req.body.noiohientai+'")'
            console.log(sql)
            let rs1 = await dbs.execute(sql);
            if(rs1.affectedRows > 0){
                req.body.ListViTri.map( async v => {
                    if(v.checkapp>0){
                    let sql3 = 'INSERT INTO td_map_ungvien_vitri(ungvien_id, vitri_id, chiendich_id, giaidoan, status, createdate) VALUES ("' + id +'","'+v.vitri_id+'","'+req.body.chiendich_id+'", 1, 1, now())'
                    let rs2 = await dbs.execute(sql3);
                    if(rs2.affectedRows == 0){
                        await dbs.execute(sql2);
                        res.json({status:false, message: "Lưu vị trí sai"})
                    }
                    v.yeucau.map(y => {
                        if(y.checkYC > 0){
                        let sql300 = 'INSERT INTO td_map_ungvien_chiendich_vitri_yeucau(ungvien_id, chiendich_id, vitri_id, yeucau_id) VALUES ("'+id+'","'+req.body.chiendich_id+'","'+v.vitri_id+'","'+y.yeucau_id+'")'
                        let rs200 =  dbs.execute(sql300);
                        }
                    })
                }
                })
            
            }
            else{
                res.json({status:false, message: "Lưu ứng viên sai"})
            }
        }else{
            let sql5 = 'update td_ungvien set  tenungvien = "' + req.body.ten_ungvien + '", email = "' + req.body.email + '", sdt = "'+ req.body.sdt+ '", ngaysinh = STR_TO_DATE("'+req.body.ngaysinh+'", "%d/%m/%Y"), truong = "'+ req.body.truong+ '", trinhdo = "'+ req.body.trinhdo+ '", gioitinh = "'+ req.body.gioitinh+ '", quequan = "'+ req.body.quequan+ '", noiohientai = "'+ req.body.noiohientai +'"  where ungvien_id = "'+req.body.ungvien_id+'"'
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
        let giaidoansau_id = req.body.giaidoansau_id
        let ngayhen = null
        if(req.body.giaidoan  == 13 && req.body.diem < 8){
            giaidoansau_id = 9
        }
        if(req.body.ngayhen){
            ngayhen = 'STR_TO_DATE("'+ (req.body.ngayhen) +'", "%d/%m/%Y")'
        }
        let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: 'nguyet.httt.mta',
              pass: 'nguyetnga'
            //   user: 'tdhoang96',
            //   pass: 'giongnhuid0'
            }
        });

    

        let sql1 = 'update td_map_ungvien_vitri set status = "'+ 0 +'", note = "'+ req.body.note +'", diem = "'+ req.body.diem +'" where ungvien_id = "'+req.body.ungvien_id+'" and vitri_id = "'+req.body.vitri_id+'" and chiendich_id = "'+req.body.chiendich_id+'" and status = "'+1+'"'
        let sql2 = 'INSERT INTO td_map_ungvien_vitri(ungvien_id, vitri_id, chiendich_id, GiaiDoan, Status, CreateDate, AppointmentDate) VALUES ("'+req.body.ungvien_id+'", "'+ req.body.vitri_id+'", "'+ req.body.chiendich_id +'", "'+ giaidoansau_id+'", "'+ 1 +'", now(), '+ngayhen+')' 
        console.log(sql2)
        await dbs.execute(sql1);
        await dbs.execute(sql2);

        let content = "";
        if(giaidoansau_id == 9){
            content = "<b>Bạn đã dừng lại tại giai đoạn" + req.body.ten_giaidoan + " của chiến dịch " +  req.body.ten_chiendich + "</b><br>" 
            content += "<p>Hẹn gặp lại bạn trong các chiến dịch tuyển dụng khác. Chân thành cảm ơn bạn ! </p> "
        }else {
            content = "<b>Bạn đã vượt qua giai đoạn " + req.body.ten_giaidoan + " của chiến dịch " +  req.body.ten_chiendich + "</b><br>" 
            content += "<p>Hẹn gặp lại bạn, chi tiết như sau :</p> "
            content += "<p> thời gian: " + req.body.ngayhen + "</p>"
            content += "<p> địa điểm: " + req.body.diadiemhen + "</p>"
        }
        // send mail with defined transport objec
        transporter.sendMail({
          from: '"nguyet.httt.mta" <nguyet.httt.mta@gmail.com>', // sender address
        //   from: '"tdhoang96" <tdhoang96@gmail.com>', // sender address
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
