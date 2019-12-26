
const common = require('../../../util/CommonUtil');
const GLBConfig = require('../../../util/GLBConfig');
const logger = require('../../../util/Logger').createLogger('ERCDevelopReceiveControlSRV');
const model = require('../../../model');
const Sequence = require('../../../util/Sequence');

const moment = require('moment');
const sequelize = model.sequelize;


// 研发项目收料单接口
exports.ERCDevelopReceiveControlResource = (req, res) => {
    let method = req.query.method;
    if(method==='searchDevelopReceive'){
        searchDevelopReceive(req,res)
    } else if (method==='searchDevelopReceiveDetail'){
        searchDevelopReceiveDetail(req,res)
    } else {
        common.sendError(res, 'common_01')
    }
};

// 研发项目收料列表
async function searchDevelopReceive(req,res){
    try {
        let doc = common.docTrim(req.body), user = req.user, returnData = {},replacements=[];
        let queryStr = `select r.*,a.develop_code,a.develop_name,u.name  
            from tbl_erc_developreceive r
            left join tbl_erc_develop a on (r.develop_id=a.develop_id and a.state=1)
            left join tbl_common_user u on (r.receive_creator=u.user_id and u.state=1)
            where r.state = 1 and a.state=1 and r.develop_id=a.develop_id and a.domain_id = ?`;
        replacements.push(user.domain_id);

        if (doc.search_text) {
            queryStr += ` and receive_code like ?  `;
            let search_text = `%${doc.search_text}%`;
            replacements.push(search_text);
        }
        let result = await common.queryWithCount(sequelize, req, queryStr, replacements);
        returnData.total = result.count;
        returnData.rows=[];
        for(let r of result.data){
            let rtemp = JSON.parse(JSON.stringify(r));
            rtemp.created_at = rtemp.created_at ? moment(rtemp.created_at).format("YYYY-MM-DD") : null;
            rtemp.updated_at = rtemp.updated_at ? moment(rtemp.updated_at).format("YYYY-MM-DD") : null;
            returnData.rows.push(rtemp)
        }
        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
    }
}
// 研发项目收料明细
async function searchDevelopReceiveDetail(req,res){
    try {
        let doc = common.docTrim(req.body), user = req.user, returnData = {},replacements=[];
        let queryStr = `select d.*,s.subscribe_name,s.subscribe_format,s.subscribe_unit,
            d.receivedetail_number*d.receivedetail_price as receivedetail_money,
            p.supplier_name
            from tbl_erc_developreceivedetail d 
            left join tbl_erc_developsubscribe s on (d.developsubscribe_id=s.developsubscribe_id and s.state=1) 
            left join tbl_erc_developreceive r on (d.developreceive_id=r.developreceive_id and r.state=1)
            left join tbl_erc_supplier p on (d.receivesupplier_name = p.supplier_id and p.state = 1)
            where d.state = 1  and r.developreceive_id = ?`;
        replacements.push(doc.developreceive_id);
        if (doc.search_text) {
            queryStr += ` and subscribe_name like ?  `;
            let search_text = `%${doc.search_text}%`;
            replacements.push(search_text);
        }
        let result = await common.queryWithCount(sequelize, req, queryStr, replacements);
        returnData.total = result.count;
        returnData.rows=[];
        for(let r of result.data){
            let rtemp = JSON.parse(JSON.stringify(r));
            rtemp.created_at = rtemp.created_at ? moment(rtemp.created_at).format("YYYY-MM-DD") : null;
            rtemp.updated_at = rtemp.updated_at ? moment(rtemp.updated_at).format("YYYY-MM-DD") : null;
            returnData.rows.push(rtemp)
        }
        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
    }
}