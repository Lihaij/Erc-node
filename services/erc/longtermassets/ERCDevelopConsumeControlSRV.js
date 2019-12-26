
const common = require('../../../util/CommonUtil');
const GLBConfig = require('../../../util/GLBConfig');
const logger = require('../../../util/Logger').createLogger('ERCDevelopConsumeControlSRV');
const model = require('../../../model');
const Sequence = require('../../../util/Sequence');

const moment = require('moment');
const sequelize = model.sequelize;


// 研发项目材料耗用接口
exports.ERCDevelopConsumeControlResource = (req, res) => {
    let method = req.query.method;
    if (method==='searchDevelopConsume'){
        searchDevelopConsume(req,res)
    } else if (method==='searchDevelopConsumeDetail'){
        searchDevelopConsumeDetail(req,res)
    } else {
        common.sendError(res, 'common_01')
    }
};

//查询研发项目材料耗用列表
async function searchDevelopConsume(req,res){
    try {
        let doc = common.docTrim(req.body), user = req.user, returnData = {},replacements=[];
        let queryStr = `select c.*,a.develop_code,a.develop_name,u.name as consume_creator,u1.name as consume_examine
            from tbl_erc_developconsume c
            left join tbl_erc_develop a on (c.develop_id=a.develop_id and a.state=1)
            left join tbl_common_user u on (c.consume_creator=u.user_id and u.state=1)
            left join tbl_common_user u1 on (c.consume_examine=u1.user_id and u1.state=1)
            where c.state = 1 and a.state=1 and a.domain_id = ?`;
        replacements.push(user.domain_id);

        if (doc.search_text) {
            queryStr += ` and consume_code like ?  `;
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
//查询研发项目材料耗用明细
async function searchDevelopConsumeDetail(req,res){
    try {
        let doc = common.docTrim(req.body), user = req.user, returnData = {},replacements=[];
        let queryStr = `select d.*,s.subscribe_name,s.subscribe_format,s.subscribe_unit,d.consumedetail_number*d.consumedetail_price as consumedetail_money   
            from tbl_erc_developconsumedetail d 
            left join tbl_erc_developconsume c on (d.developconsume_id=c.developconsume_id and c.state=1) 
            left join tbl_erc_developsubscribe s on (d.developsubscribe_id=s.developsubscribe_id and s.state=1) 
            where d.state = 1  and c.developconsume_id = ?`;
        replacements.push(doc.developconsume_id);
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
            rtemp.consumedetail_money = rtemp.consumedetail_money?rtemp.consumedetail_money:0;
            rtemp.consumedetail_money = rtemp.consumedetail_money.toFixed(2);
            returnData.rows.push(rtemp)
        }
        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
    }
}
