const fs = require('fs');
const common = require('../../../util/CommonUtil');
const GLBConfig = require('../../../util/GLBConfig');
const logger = require('../../../util/Logger').createLogger('UserSettingSRV');
const model = require('../../../model');

const tb_sitecase = model.erc_sitecase;
const sequelize = model.sequelize;
const tb_uploadfile = model.erc_uploadfile;

exports.ERCSiteSearchCaseControl = (req, res) => {
    let method = req.query.method
    if (method === 'search') {
        searchCase(req, res)
    } else {
        common.sendError(res, 'common_01')
    }
}
/*

async function searchCase(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;
        let returnData = [];

        let templates = await tb_sitecase.findAll({
            where: {
                state: GLBConfig.ENABLE
            }
        });
        for(let t of templates) {
            let row = JSON.parse(JSON.stringify(t))
            row.files = []
            let ifs = await tb_uploadfile.findAll({
                where: {
                    order_id: row.case_id,
                    srv_id:  row.case_id,
                    state: GLBConfig.ENABLE
                }
            })
            for(let f of ifs){
                row.files.push(f)
            }
            returnData.push(row)
        }
        common.sendData(res, returnData);

    } catch (error) {
        common.sendFault(res, error);
    }
}
*/
//获取商城案例维护信息
async function searchCase(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;
        let returnData = {};
        let replacements = [];
        let api_name = 'ERCSITECONFIGCASECONTROL'
        let queryStr = `select * from tbl_erc_sitecase where state = 1 `;
        let result = await common.queryWithCount(sequelize, req, queryStr,replacements);
        returnData.total = result.count;
        returnData.rows = result.data;
        for(let i=0;i<returnData.rows.length;i++){
            returnData.rows[i].files =[];
            let ifs = await tb_uploadfile.findAll({
                where: {
                    api_name:api_name,
                    order_id: returnData.rows[i].case_id,
                    srv_id: returnData.rows[i].case_id,
                    state: GLBConfig.ENABLE
                }
            })
            for (let a of ifs) {
                returnData.rows[i].files.push(a)
            }
        }

        return common.sendData(res, returnData);
    } catch (error) {
        return common.sendFault(res, error);
    }
}
