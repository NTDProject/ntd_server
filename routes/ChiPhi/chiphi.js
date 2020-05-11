const dbs = require('../../utils/dbs');
const auth = require('../../utils/auth');
const uniqid = require('uniqid');


/* Authentication */


module.exports = (router) => {
    // auth(router, 'chiendich');

    //get all chiến dịch
    router.get('/getByChienDich/:chiendich_id', async (req, res) => {
        let rs = await dbs.execute('select id, c.chiendich_id, c.ten_chiendich, m.noidung, m.sotien, DATE_FORMAT(m.create, "%d-%m-%Y") createdate, m.note, m.create from td_chiendich c, td_map_chiendich_chiphi m where c.chiendich_id = m.chiendich_id and c.chiendich_id = "' + req.params.chiendich_id +'"');
        res.json(rs);
    });

    router.post('/deleteChiPhiOfChienDich/', async (req, res) => {
        console.log(req.body)
        let sql ='DELETE FROM td_map_chiendich_chiphi WHERE id = "' + req.body.id + '" and chiendich_id =  "' + req.body.chiendich_id + '"'
        let rs= await dbs.execute(sql)
        if(rs.affectedRows > 0){
            return res.json({status: true, message: 'Xoá chi phí khỏi chiến dịch thành công'})
        }
        else{
            return res.json({status: false, message: 'Xoá chi phí khỏi chiến dịch không thành công'})
        }
    });


    router.post('/save', async (req, res) => {
        let id = uniqid()
        
        if(req.body.id == "addPage"){
            let sql = 'INSERT INTO td_map_chiendich_chiphi(id, chiendich_id, noidung, sotien, note, `create`) VALUES ("'+id+'", "'+ req.body.chiendich_id + '", "' + req.body.noidung +'", "' + req.body.sotien +'", "' + req.body.note +'", STR_TO_DATE("'+ (req.body.create) +'", "%d/%m/%Y"))'
            console.log(sql)
            let rs = await dbs.execute(sql)
            if(rs.affectedRows > 0){
                res.json({status:true, message: 'Lưu thành công'});
            }
            else{
                res.json({status:false, message: 'Lưu không thành công'});
            }
        }else{
            let sql = 'Update td_map_chiendich_chiphi set noidung = "' + req.body.noidung + '", sotien = "' + req.body.sotien + '", note = "' + req.body.note +'", `create` = STR_TO_DATE("'+ (req.body.create) +'", "%d/%m/%Y") where chiendich_id = "' +  req.body.chiendich_id + '" and id = "' + req.body.id  +'"'
            console.log(sql)
            let rs = await dbs.execute(sql)
            if(rs.affectedRows > 0){
                res.json({status:true, message: 'Lưu thành công'});
            }
            else{
                res.json({status:false, message: 'Lưu không thành công'});
            }
        }
       
    });
};
