const fs = require('fs');
const common = require('../../../util/CommonUtil');
const GLBConfig = require('../../../util/GLBConfig');
const logger = require('../../../util/Logger').createLogger('UserSettingSRV');
const model = require('../../../model');

const tb_sitecase = model.erc_sitecase;
const sequelize = model.sequelize;
const tb_uploadfile = model.erc_uploadfile;

exports.ERCSiteConfigCaseControl = (req, res) => {
    let method = req.query.method
    if (method === 'addCase') {
        addCase(req, res);
    } else if (method === 'search') {
        searchCase(req, res)
    } else if (method === 'delete') {
        deleteCase(req, res)
    } else if (method === 'modify') {
        modifyCase(req, res)
    } else if (method === 'upload') {
        uploadImg(req, res)
    } else if (method === 'delete_img') {
        deleteImg(req, res)
    }  else if (method === 'modify_img') {
        modifyImg(req, res)
    }  else {
        common.sendError(res, 'common_01')
    }
}

//新增商城案例
async function addCase(req, res) {
    try{
        let doc = common.docTrim(req.body);
        let user = req.user;
        let temyCase = await tb_sitecase.create({
            case_title: doc.case_title,
            case_subtitle: doc.case_subtitle,
            case_content: doc.case_content
        });
        let imgArr=doc.img_arr;
        let api_name = common.getApiName(req.path)
        temyCase.files=[];
        for(let i=0;i<imgArr.length;i++){
            let addFile = await tb_uploadfile.create({
                api_name: api_name,
                order_id: temyCase.case_id,
                file_name: imgArr[i].file_name,
                file_url: imgArr[i].file_url,
                file_type: imgArr[i].file_type,
                srv_id: temyCase.case_id,
                srv_type: '3',
                file_creator: user.name,
                user_id: user.user_id
            });

        }
        let retData = JSON.parse(JSON.stringify(temyCase));
        return common.sendData(res, retData);
    }catch(error){
        return common.sendFault(res, error);
    }
}
//查询上传案例
async function searchCase(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;
        let returnData = {};
        let replacements = [];
        let api_name = common.getApiName(req.path)
        let queryStr = `select * from tbl_erc_sitecase where state = 1 `;
        let result = await common.queryWithCount(sequelize, req, queryStr,replacements);
        returnData.total = result.count;
        returnData.rows = result.data;
        for(let i=0;i<returnData.rows.length;i++){
            returnData.rows[i].files =[];
            let ifs = await tb_uploadfile.findAll({
                where: {
                    api_name: api_name,
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
//删除上传案例
async function deleteCase(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;

        let delWh = await tb_sitecase.findOne({
            where: {
                case_id: doc.case_id,
                state: GLBConfig.ENABLE
            }
        });

        if (delWh) {
            delWh.state = GLBConfig.DISABLE;
            await delWh.save();

            return common.sendData(res);
        } else {
            return common.sendError(res, 'site_case_01');

        }
    } catch (error) {
        return common.sendFault(res, error);
    }
}
//修改商城案例
async function modifyCase(req, res) {
    try {
        let doc = common.docTrim(req.body)
        let user = req.user;

        let modicase = await tb_sitecase.findOne({
            where: {
                case_id: doc.old.case_id,
                state: GLBConfig.ENABLE
            }
        });

        if (modicase) {
            modicase.case_title = doc.new.case_title;
            modicase.case_subtitle = doc.new.case_subtitle;
            modicase.case_content = doc.new.case_content;
            await modicase.save();
            common.sendData(res, modicase)
            return
        } else {
            common.sendError(res, 'site_case_01')
            return
        }
    } catch (error) {
        common.sendFault(res, error)
        return null
    }
}
//上传图片
async function uploadImg (req, res){
    try {
        let fileInfo = await common.fileSave(req);
        let fileUrl = await common.fileMove(fileInfo.url, 'upload');
        fileInfo.url = fileUrl;
        common.sendData(res, fileInfo)
    } catch (error) {
        common.sendFault(res, error)
        return
    }
}
//删除图片
async function deleteImg(req, res) {
    try {
        let doc = common.docTrim(req.body);

        let uploadfiles = await tb_uploadfile.findAll({
            where: {
                file_id: {
                    $in: doc.fileIds
                },
                state: GLBConfig.ENABLE
            }
        });
        for (let file of uploadfiles) {
            file.state = GLBConfig.DISABLE
            await file.save();
        }

        common.sendData(res);
    } catch (error) {
        common.sendFault(res, error);
        return
    }
}
//修改图片
async function modifyImg (req, res){
    try {
        let doc = common.docTrim(req.body)
        let api_name = common.getApiName(req.path)
        let user = req.user;
        let case_id=doc.old.case_id;

        if(doc.old.files.length>0){
            let modicase = await tb_uploadfile.findOne({
                where: {
                    api_name:api_name,
                    order_id:case_id,
                    file_name:doc.old.files[0].file_name,
                    file_url:doc.old.files[0].file_url,
                    srv_id:case_id,
                    srv_type:'3',
                    user_id:user.user_id,
                    file_creator:user.name,
                    state: GLBConfig.ENABLE
                }
            });

            if (modicase) {
                modicase.file_name = doc.new.files[1].name;
                modicase.file_url = doc.new.files[1].url;
                modicase.file_type= doc.new.files[1].type;
                let newArray=doc.new;
                newArray.files=[];
                newArray.files.push(modicase);
                common.sendData(res, newArray);
                return
            } else {
                common.sendError(res, 'site_case_02')
                return
            }
        }else {
            let addFile = await tb_uploadfile.create({
                api_name: api_name,
                order_id:  case_id,
                file_name: doc.new.files[0].name,
                file_url: doc.new.files[0].url,
                file_type: doc.new.files[0].type,
                srv_id: case_id,
                srv_type: '3',
                file_creator: user.name,
                user_id: user.user_id
            });
            let newArray=doc.new;
            newArray.files=[];
            newArray.files.push(addFile);
            common.sendData(res, newArray);
            return
        }
    } catch (error) {
        common.sendFault(res, error)
        return null
    }
}


