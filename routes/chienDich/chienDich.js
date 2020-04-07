const dbs = require('../../utils/dbs');
const auth = require('../../utils/auth');
const uniqid = require('uniqid');
const nodemailer = require("nodemailer");
/* Authentication */


module.exports = (router) => {
    // auth(router, 'chiendich');

    //get all chiến dịch
    router.get('/', async (req, res) => {
        let rs = await dbs.execute('select * from td_chiendich');
        res.json(rs);
    });

    router.get('/:chiendich_id', async (req, res) => {
        let sql = ''
        let sql2 = 'select c.ten_chiendich,c.mota,DATE_FORMAT(c.ngay_batdau, "%Y-%m-%d") ngay_batdau, DATE_FORMAT(c.ngay_ketthuc, "%Y-%m-%d") ngay_ketthuc,g.giaidoan giaidoanhientai_id, g.ten_giaidoan giaidoanhientai, (select h.ten_giaidoan from td_dm_giaidoan h where c.giaidoan+1 = h.giaidoan) giaidoansau, (select h.giaidoan from td_dm_giaidoan h where c.giaidoan+1 = h.giaidoan) giaidoansau_id from td_chiendich c, td_dm_giaidoan g where c.giaidoan = g.giaidoan and chiendich_id = "' + req.params.chiendich_id + '"'
        let rs = {};
        if(req.params.chiendich_id == 'addPage'){
            sql = 'select v.vitri_id, v.ten_vitri, v.mota, 0 soluong from td_dm_vitri v'
            
        }
        else{
            sql = 'select v.vitri_id, v.ten_vitri, v.mota, CASE WHEN sum(m.soluong) is null then 0 else sum(m.soluong) end soluong from td_dm_vitri v LEFT JOIN td_map_chiendich_vitri m on v.vitri_id = m.vitri_id and m.chiendich_id = "' + req.params.chiendich_id + '" GROUP by v.vitri_id, v.ten_vitri, v.mota'
            
        }

        console.log(sql)
        let rs2 = await dbs.execute(sql);
        if(req.params.chiendich_id == 'addPage'){
            rs.ten_chiendich = ''
            rs.ngay_batdau = (new Date()).getFullYear() + "-" + ((new Date()).getMonth() +1) + "-" + ((new Date()).getDate())
            rs.ngay_ketthuc = (new Date()).getFullYear() + "-" + ((new Date()).getMonth() +1) + "-" + ((new Date()).getDate())
            rs.mota = ''
            rs.giaidoanhientai = ""
            rs.giaidoansau = ""
            rs.giaidoanhientai_id  = ""
            rs.giaidoansau_id = ""
        }
        else{
            rs3 = await dbs.execute(sql2);
            rs = rs3[0]
        }
        rs.ListViTri = rs2
        res.json(rs);
    });

    router.post('/checkSave', async (req, res) => {
        await req.body.ListViTri.map( async v => {
            let sql10 = 'select count(*) as checkvitri from td_map_ungvien_vitri where vitri_id="'+v.vitri_id+'" and chiendich_id = "'+req.body.chiendich_id+'"'
            let rs10 = await dbs.execute(sql10)
            if(rs10[0].checkvitri > 0 && v.soluong == 0){
                res.json({status:false , message:"xxx"})
            }
        })
        res.json({status:true , message:"xxxx"})
    })



    //update chiến dịch
    router.post('/save', async (req, res) => {
        let id = uniqid()
         
        if(req.body.chiendich_id == "addPage")
        {
            
            let sql3 = 'delete FROM td_chiendich WHERE chiendich_id = "' + id + '"'
            let sql4 = 'delete FROM td_map_chiendich_vitri WHERE chiendich_id = "' + id + '"'
            let sql = 'INSERT INTO td_chiendich(chiendich_id, ten_chiendich, ngay_batdau, ngay_ketthuc, trangthai, mota) VALUES ("'+id+ '", "' +req.body.ten_chiendich+'", DATE("'+ (req.body.ngay_batdau) +'")+1, DATE("'+ (req.body.ngay_ketthuc)+'")+1, "'+req.body.trangthai+'", "'+req.body.mota + '" )'
            let rs1 = await dbs.execute(sql);
            if(rs1.affectedRows > 0){
                req.body.ListViTri.map(v => {
                    if(v.soluong > 0){
                        sql2 = 'INSERT INTO td_map_chiendich_vitri (chiendich_id, vitri_id, soluong) VALUES ("'+ id +'","'+v.vitri_id+'","'+v.soluong+'")'
                        let rs2 =  dbs.execute(sql2);
                        if(rs2.affectedRows = 0){
                            
                             dbs.execute(sql3);
                             dbs.execute(sql4);
                            res.json({status: false, message:"Luu vi tri sai"})
                        }
                    }
                })
            }
            else{
                 dbs.execute(sql3);
                 dbs.execute(sql4);
                res.json({status: false, message:"Luu chien dich sai"})
            }
            
        }
        else{

 
            let sql5 = 'UPDATE td_chiendich SET ten_chiendich="'+req.body.ten_chiendich+'",ngay_batdau= DATE("'+(req.body.ngay_batdau)+'")+1,ngay_ketthuc=DATE("'+(req.body.ngay_ketthuc)+'")+1,trangthai="'+req.body.trangthai+'",mota="'+req.body.mota+'" WHERE chiendich_id ="'+req.body.chiendich_id +'"'
            let rs5 = await dbs.execute(sql5);

            if(rs5.affectedRows > 0){
                let sql6 = 'delete FROM td_map_chiendich_vitri WHERE chiendich_id = "' + req.body.chiendich_id + '"'
                await dbs.execute(sql6);
                req.body.ListViTri.map(v => {
                    if(v.soluong != 0){
                        let sql7 = 'INSERT INTO td_map_chiendich_vitri (chiendich_id, vitri_id, soluong) VALUES ("'+ req.body.chiendich_id +'","'+v.vitri_id+'","'+v.soluong+'")'
                        console.log(sql7)
                        let rs7 =  dbs.execute(sql7);
                        if(rs7.affectedRows = 0){
                            res.json({status: false, message:"luu vi tri sai"})
                        }
                    }
                })
            }
            else{
                res.json({status: false, message:"Luu chien dich sai"})
            }
            
        }
        
        res.json({status:true, message:"luu thanh cong"});
    });

    router.post('/add',  (req, res) => {
        let sql = ''
        req.body.ungvien.map( async u => {
            sql = 'INSERT INTO td_map_ungvien_vitri (ungvien_id, vitri_id, chiendich_id) VALUES ("'+ u.ungvien_id+'","'+req.body.vitri_id+'","'+req.body.chiendich_id+'")'
            let rs = await dbs.execute(sql)
            if(rs.affectedRows == 0){
                res.json({status: false, message: 'lưu lỗi'})
            }
        })
        res.json({status: true, message: 'lưu thành công'})

        
    })

    //xoá chiến dịch
    router.delete('/delete', async (req, res) => {
        let rs = await dbs.execute('DELETE FROM td_chiendich WHERE chiendich_id = "' + req.body.chiendich_id +'"');
        res.json(rs);
    });

    router.post('/tranfer', async (req, res) => {
        // create reusable transporter object using the default SMTP transport
        let sql = 'update td_chiendich set giaidoan = "' + req.body.giaidoansau_id +'" where chiendich_id = "' + req.body.chiendich_id + '"'
        let rs1 = await dbs.execute(sql);
        if (rs1.affectedRows == 0){
            res.json({status:false, message: error })
        }

        let mail = ''
        await req.body.UngVien.map(async u => {
            if(mail == ''){
                mail += u.email
            }else{
                mail = mail + ',' + u.email
            }
            let sql2 = 'INSERT INTO td_map_ungvien_vitri (ungvien_id, vitri_id, chiendich_id, GiaiDoan, Status) VALUES ("' + u.ungvien_id +'", "' + u.vitri_id + '", "' + req.body.chiendich_id + '", "' + req.body.giaidoansau_id + '", "1" )'
            await dbs.execute(sql2);
        })
        let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: 'tdhoang96',
              pass: 'giongnhuid0'
            }
        });

        let content = "<b>Bạn đã vượt qua " + req.body.giaidoanhientai + " của " +  req.body.ten_chiendich + "</b><br>" 
        content += "<p>Hẹn gặp lại bạn trong " + req.body.giaidoansau + " của " + req.body.ten_chiendich + " chi tiết như sau :</p> "
        content += "<p> thời gian: " + req.body.ngayhen + "</p>"
        content += "<p> địa điểm: " + req.body.diadiemhen + "</p>"
        // send mail with defined transport objec
        transporter.sendMail({
          from: '"tdhoang96" <tdhoang96@gmail.com>', // sender address
          to: mail, // list of receivers
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
