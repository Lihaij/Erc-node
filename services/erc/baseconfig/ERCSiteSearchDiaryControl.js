const fs = require('fs');
const common = require('../../../util/CommonUtil');
const GLBConfig = require('../../../util/GLBConfig');
const logger = require('../../../util/Logger').createLogger('UserSettingSRV');
const model = require('../../../model');

const erc_sitediary = model.erc_sitediary;
const sequelize = model.sequelize;
const tb_uploadfile = model.erc_uploadfile;

exports.ERCSiteSearchDiaryControl = (req, res) => {
    let method = req.query.method
    if (method === 'search') {
        searchDiary(req, res)
    } else {
        common.sendError(res, 'common_01')
    }
}

//装修日记信息查询
async function searchDiary(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let returnData ={};
        let templates=[];
        let replacements = [];
        let api_name = 'ERCSITECONFIGDIARYCONTROL'

        let queryStr = `select * from tbl_erc_site_diary where state = 1 `;
        let result = await common.queryWithCount(sequelize, req, queryStr,replacements);
        returnData.total = result.count;
        returnData.rows =[];
        templates=result.data;

        for(let t of templates){
            let row = JSON.parse(JSON.stringify(t))
            row.content_arr = []
            row.content_arr0 = []
            row.content_arr1 = []
            row.content_arr2 = []
            row.content_arr3 = []
            row.content_arr4 = []
            let ifs = await tb_uploadfile.findAll({
                where: {
                    api_name:api_name,
                    order_id: row.diary_id,
                    srv_id:  row.diary_id,
                    state: GLBConfig.ENABLE
                }
            })
            for(let f of ifs){
                //srv_type 3内容图片 2头像
                if(f.srv_type=='0'){
                    row.content_arr0.push(f)
                }
                else if(f.srv_type=='1'){
                    row.content_arr1.push(f)
                    row.content_arr.push(f)
                }else if(f.srv_type=='2'){
                    row.content_arr2.push(f)
                    row.content_arr.push(f)
                }else if(f.srv_type=='3'){
                    row.content_arr3.push(f)
                    row.content_arr.push(f)
                }
                else if(f.srv_type=='4'){
                    row.content_arr4.push(f)
                    row.content_arr.push(f)
                }
            }
            returnData.rows.push(row)
        }
        return common.sendData(res, returnData);

    } catch (error) {
        return common.sendFault(res, error);
    }
}