
const common = require('../../../util/CommonUtil');
const GLBConfig = require('../../../util/GLBConfig');
const logger = require('../../../util/Logger').createLogger('ERCAmortizeDetailControlSRV');
const model = require('../../../model');
const Sequence = require('../../../util/Sequence');

const moment = require('moment');
const sequelize = model.sequelize;



exports.ERCAmortizeConsumeControlResource = (req, res) => {
    let method = req.query.method;
    if (method==='searchConsume'){
        searchConsume(req,res)
    } else if (method==='searchConsumeDetail'){
        searchConsumeDetail(req,res)
    } else {
        common.sendError(res, 'common_01')
    }
};


//待摊资产材料耗用
async function searchConsume(req,res){
    try {
        let doc = common.docTrim(req.body), user = req.user, returnData = {},replacements=[];
        let queryStr = `select c.*,a.amortize_code,a.amortize_name,u.name as consume_creator,u1.name as consume_examine
            from tbl_erc_amortizeconsume c
            left join tbl_erc_amortize a on (c.amortize_id=a.amortize_id and a.state=1)
            left join tbl_common_user u on (c.consume_creator=u.user_id and u.state=1)
            left join tbl_common_user u1 on (c.consume_examine=u1.user_id and u.state=1)
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
async function searchConsumeDetail(req,res){
    try {
        let doc = common.docTrim(req.body), user = req.user, returnData = {},replacements=[];
        let queryStr = `select d.*,s.subscribe_name,s.subscribe_format,s.subscribe_unit,d.consumedetail_number*d.consumedetail_price as consumedetail_money   
            from tbl_erc_amortizeconsumedetail d 
            left join tbl_erc_amortizeconsume c on (d.amortizeconsume_id=c.amortizeconsume_id and c.state=1) 
            left join tbl_erc_amortizesubscribe s on (d.amortizesubscribe_id=s.amortizesubscribe_id and s.state=1) 
            where d.state = 1  and c.amortizeconsume_id = ?`;
        replacements.push(doc.amortizeconsume_id);
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
