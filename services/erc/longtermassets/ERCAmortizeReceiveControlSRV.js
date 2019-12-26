
const common = require('../../../util/CommonUtil');
const GLBConfig = require('../../../util/GLBConfig');
const logger = require('../../../util/Logger').createLogger('ERCAmortizeDetailControlSRV');
const model = require('../../../model');
const Sequence = require('../../../util/Sequence');

const moment = require('moment');
const sequelize = model.sequelize;


// 待摊资产收料单接口
exports.ERCAmortizeReceiveControlResource = (req, res) => {
    let method = req.query.method;
    if (method==='searchReceive'){
        searchReceive(req,res)
    } else if (method==='searchReceiveDetail'){
        searchReceiveDetail(req,res)
    } else {
        common.sendError(res, 'common_01')
    }
};


//查询待摊资产收料单列表
async function searchReceive(req,res){
    try {
        let doc = common.docTrim(req.body), user = req.user, returnData = {},replacements=[];
        let queryStr = `select r.*,a.amortize_code,a.amortize_name,u.name  
            from tbl_erc_amortizereceive r
            left join tbl_erc_amortize a on (r.amortize_id=a.amortize_id and a.state=1)
            left join tbl_common_user u on (r.receive_creator=u.user_id and u.state=1)
            where r.state = 1 and a.state=1 and r.amortize_id=a.amortize_id and a.domain_id = ?`;
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
//查询待摊资产收料单明细
async function searchReceiveDetail(req,res){
    try {
        let doc = common.docTrim(req.body), user = req.user, returnData = {},replacements=[];
        let queryStr = `select d.*,s.subscribe_name,s.subscribe_format,s.subscribe_unit,
            d.receivedetail_number*d.receivedetail_price as receivedetail_money,
            p.supplier_name 
            from tbl_erc_amortizereceivedetail d 
            left join tbl_erc_amortizesubscribe s on (d.amortizesubscribe_id=s.amortizesubscribe_id and s.state=1) 
            left join tbl_erc_amortizereceive r on (d.amortizereceive_id=r.amortizereceive_id and r.state=1)
            left join tbl_erc_supplier p on (d.receivesupplier_name = p.supplier_id and p.state = 1)
            where d.state = 1  and r.amortizereceive_id = ?`;
        replacements.push(doc.amortizereceive_id);
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
