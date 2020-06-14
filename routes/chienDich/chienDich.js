const dbs = require('../../utils/dbs');
const auth = require('../../utils/auth');
const uniqid = require('uniqid');
const nodemailer = require("nodemailer");
/* Authentication */


module.exports = (router) => {
    // auth(router, 'chiendich');

    //get all chiến dịch
    router.get('/', async (req, res) => {
        let rs = await dbs.execute('SELECT chiendich_id,ten_chiendich,DATE_FORMAT(ngay_batdau, "%d-%m-%Y") ngay_batdau,DATE_FORMAT(ngay_ketthuc, "%d-%m-%Y") ngay_ketthuc,GiaiDoan,trangthai,mota FROM td_chiendich ');
        res.json(rs);
    });

    router.get('/:chiendich_id', async (req, res) => {
        let sql = ''
        let sql2 = 'select c.ten_chiendich,c.mota,DATE_FORMAT(c.ngay_batdau, "%Y-%m-%d") ngay_batdau, DATE_FORMAT(c.ngay_ketthuc, "%Y-%m-%d") ngay_ketthuc,g.giaidoan giaidoanhientai_id, g.ten_giaidoan giaidoanhientai, (select h.ten_giaidoan from td_dm_giaidoan h where c.giaidoan+1 = h.giaidoan) giaidoansau, (select h.giaidoan from td_dm_giaidoan h where c.giaidoan+1 = h.giaidoan) giaidoansau_id from td_chiendich c, td_dm_giaidoan g where c.giaidoan = g.giaidoan and chiendich_id = "' + req.params.chiendich_id + '"'
        let sql3 = 'select u.ungvien_id,u.tenungvien,u.email,c.chiendich_id,c.ten_chiendich,v.vitri_id,v.ten_vitri,d.giaidoan,d.ten_giaidoan from td_ungvien u, td_dm_vitri v, td_chiendich c, (select DISTINCT vitri_id, chiendich_id, ungvien_id, giaidoan  from td_map_ungvien_vitri where status = 1) m, td_dm_giaidoan d where u.ungvien_id=m.ungvien_id and v.vitri_id=m.vitri_id and c.chiendich_id=m.chiendich_id and d.giaidoan = m.giaidoan and m.chiendich_id = "' + req.params.chiendich_id + '"'
        var rs = {};
        if(req.params.chiendich_id == 'addPage'){
            sql = 'select v.vitri_id, v.ten_vitri, v.mota, 0 soluong from td_dm_vitri v'
        }
        else{
            sql = 'select v.vitri_id, v.ten_vitri, v.mota, CASE WHEN sum(m.soluong) is null then 0 else sum(m.soluong) end soluong from td_dm_vitri v LEFT JOIN td_map_chiendich_vitri m on v.vitri_id = m.vitri_id and m.chiendich_id = "' + req.params.chiendich_id + '" GROUP by v.vitri_id, v.ten_vitri, v.mota'
            
        }
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
            let rs3 = await dbs.execute(sql2);
            rs.ten_chiendich = rs3[0].ten_chiendich
            rs.ngay_batdau = rs3[0].ngay_batdau
            rs.ngay_ketthuc = rs3[0].ngay_ketthuc
            rs.mota = rs3[0].mota
            rs.giaidoanhientai = rs3[0].giaidoanhientai
            rs.giaidoansau = rs3[0].giaidoansau
            rs.giaidoanhientai_id  = rs3[0].giaidoanhientai_id
            rs.giaidoansau_id = rs3[0].giaidoansau_id
        }
        if(req.params.chiendich_id == 'addPage'){
            rs.ListUV = []
        }
        else{
            let rs4 = await dbs.execute(sql3);
            rs.ListUV = rs4
        }
        rs.ListViTri = rs2
        res.json(rs);
    });

    router.post('/checkSave', async (req, res) => {
        res.json({status:true , message:"xxxx"})
    })



    //update chiến dịch
    router.post('/save', async (req, res) => {
        let id = uniqid()
         console.log(req.body.ngay_batdau)
         console.log(req.body.ngay_ketthuc)
        if(req.body.chiendich_id == "addPage")
        {
            
            let sql3 = 'delete FROM td_chiendich WHERE chiendich_id = "' + id + '"'
            let sql4 = 'delete FROM td_map_chiendich_vitri WHERE chiendich_id = "' + id + '"'
            let sql = 'INSERT INTO td_chiendich(chiendich_id, ten_chiendich, ngay_batdau, ngay_ketthuc, trangthai, mota, giaidoan) VALUES ("'+id+ '", "' +req.body.ten_chiendich+'", STR_TO_DATE("'+ (req.body.ngay_batdau) +'", "%d/%m/%Y"), STR_TO_DATE("'+ (req.body.ngay_ketthuc)+'", "%d/%m/%Y"), "'+req.body.trangthai+'", "'+req.body.mota + '", "1" )'
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

 
            let sql5 = 'UPDATE td_chiendich SET ten_chiendich="'+req.body.ten_chiendich+'",ngay_batdau= STR_TO_DATE("'+ (req.body.ngay_batdau) +'", "%d/%m/%Y"),ngay_ketthuc=STR_TO_DATE("'+ (req.body.ngay_ketthuc)+'", "%d/%m/%Y"),trangthai="'+req.body.trangthai+'",mota="'+req.body.mota+'" WHERE chiendich_id ="'+req.body.chiendich_id +'"'
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
            sql = 'INSERT INTO td_map_ungvien_vitri (ungvien_id, vitri_id, chiendich_id, giaidoan, status, createdate) VALUES ("'+ u.ungvien_id+'","'+req.body.vitri_id+'","'+req.body.chiendich_id+'", "1","1",now())'
            let rs = await dbs.execute(sql)
            if(rs.affectedRows == 0){
                res.json({status: false, message: 'lưu lỗi'})
            }
        })
        res.json({status: true, message: 'lưu thành công'})

        
    })

    //xoá chiến dịch
    router.post('/delete', async (req, res) => {
        let rs = await dbs.execute('select count(*) tong FROM td_map_ungvien_vitri WHERE chiendich_id = "' + req.body.chiendich_id +'"');
        if(rs[0].tong > 0){
            res.json({status: false, message: "Không được xoá chiến dịch đã có ứng viên tham gia"})
        }
        else{
            let rs = await dbs.execute('DELETE FROM td_chiendich WHERE chiendich_id = "' + req.body.chiendich_id +'"');
            if(rs.affectedRows>0){
                res.json({status: true, message: "Xoá chiến dịch thành công"});
            }
            else{
                res.json({status: false, message: "Xoá chiến dịch không thành công"});  
            }
            
        }
    });

   

        router.get('/chung/analysis/', async (req, res) => {
            result = {}
            let sql = 'select (select count(*) from td_chiendich) as sumChienDich, (select count(*) from td_ungvien) as sumUngVien, (select count(distinct ungvien_id) from td_map_ungvien_vitri where giaidoan = 0 and status = 1) as pass, (SELECT count(distinct ungvien_id) FROM `td_map_ungvien_vitri` m, td_chiendich c WHERE c.chiendich_id = m. chiendich_id and c.giaidoan != 0 and m.status = 1) process from dual'
            let rs = await dbs.execute(sql);
            
            let sql1 = 'select ten_vitri from td_dm_vitri order by vitri_id'
            let rs1 = await dbs.execute(sql1);
            let listVT = []
            const promises1 = rs1.map( a => {
                listVT.push(a.ten_vitri)
            })
            
            let sql2 = 'select v.vitri_id, v.ten_vitri, case when sum(m.soluong) is null then 0 else sum(m.soluong) end soluong from td_dm_vitri v left JOIN td_map_chiendich_vitri m on m.vitri_id=v.vitri_id group by v.vitri_id, v.ten_vitri order by v.vitri_id'
            let rs2 = await dbs.execute(sql2);
            let listVTNC=[]
            const promises2 = rs2.map( b => {
                listVTNC.push(b.soluong)
            })
            
            let sql3 = 'select v.vitri_id, case when sum(m.status) is null then 0 else sum(m.status) end soluong from td_dm_vitri v left join td_map_ungvien_vitri m on m.vitri_id = v.vitri_id and giaidoan = 0 and status = 1 group by vitri_id'
            let rs3 = await dbs.execute(sql3);
            let listVTTT=[]
            const promises3 = rs3.map( c => {
                listVTTT.push(c.soluong)
            })
            await Promise.all(promises3,promises2,promises1)
            result= await rs[0]
            result.listVT =  listVT
            result.listVTTT =  listVTTT
            result.listVTNC =  listVTNC
            
            
            res.json(result);
        });
    
};
