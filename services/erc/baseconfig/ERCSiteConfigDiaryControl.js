const fs = require('fs');
const common = require('../../../util/CommonUtil');
const GLBConfig = require('../../../util/GLBConfig');
const logger = require('../../../util/Logger').createLogger('UserSettingSRV');
const model = require('../../../model');

const erc_sitediary = model.erc_sitediary;
const sequelize = model.sequelize;
const tb_uploadfile = model.erc_uploadfile;

exports.ERCSiteConfigDiaryControl = (req, res) => {
    let method = req.query.method
    if (method === 'add') {
        addDiary(req, res);
    } else if (method === 'search') {
        searchDiary(req, res)
    } else if (method === 'delete') {
        deleteDiary(req, res)
    } else if (method === 'modify') {
        modifyDiary(req, res)
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
//创建装修日记
async function addDiary(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;
        let content_arr=doc.content_arr;
        let temyCase = await erc_sitediary.create({
            diary_title: doc.diary_title,
            diary_subtitle: doc.diary_subtitle,
            diary_content: doc.diary_content,
            diary_selected:doc.diary_selected
        });
        let api_name = common.getApiName(req.path)
        temyCase.content_arr=[];
        for(let c in content_arr){
            if(content_arr[c]!=null){
                let addFile = await tb_uploadfile.create({
                    api_name: api_name,
                    order_id: temyCase.diary_id,
                    file_name: content_arr[c].file_name,
                    file_url: content_arr[c].file_url,
                    file_type: content_arr[c].file_type,
                    srv_id: temyCase.diary_id,
                    srv_type: content_arr[c].srv_type,
                    file_creator: user.name,
                    user_id: user.user_id
                });
            }
        }
        let retData = JSON.parse(JSON.stringify(temyCase));
        return common.sendData(res, retData);
    } catch (error) {
        return common.sendFault(res, error);
    }
}
//查询装修日记
async function searchDiary(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let returnData ={};
        let templates=[];
        let replacements = [];
        let api_name = common.getApiName(req.path)

        let queryStr = `select * from tbl_erc_site_diary where state = 1 `;
        let result = await common.queryWithCount(sequelize, req, queryStr,replacements);
        returnData.total = result.count;
        returnData.rows =[];
        templates=result.data;

        for(let t of templates){
            let row = JSON.parse(JSON.stringify(t))
            row.content_arr0 = []
            row.content_arr1 = []
            row.content_arr2 = []
            row.content_arr3 = []
            row.content_arr4 = []
            let ifs = await tb_uploadfile.findAll({
                where: {
                    api_name: api_name,
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
                }else if(f.srv_type=='2'){
                    row.content_arr2.push(f)
                }else if(f.srv_type=='3'){
                    row.content_arr3.push(f)
                }
                else if(f.srv_type=='4'){
                    row.content_arr4.push(f)
                }
            }
            returnData.rows.push(row)
        }
        return common.sendData(res, returnData);
    } catch (error) {
        return common.sendFault(res, error);
    }
}
//删除装修日记
async function deleteDiary(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;

        let delWh = await erc_sitediary.findOne({
            where: {
                diary_id: doc.diary_id,
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
//修改装修日记
async function modifyDiary(req, res) {
    try {
        let doc = common.docTrim(req.body)
        let user = req.user
        let diary_id=doc.diary_id
        let content_arr=doc.content_arr
        let api_name = common.getApiName(req.path)

        let modicase = await erc_sitediary.findOne({
            where: {
                diary_id: diary_id,
                state: GLBConfig.ENABLE
            }
        });

        if (modicase) {
            modicase.diary_title = doc.diary_title;
            modicase.diary_subtitle = doc.diary_subtitle;
            modicase.diary_content = doc.diary_content;
            modicase.diary_selected = doc.diary_selected;
            await modicase.save();

            for(let c of content_arr){
                if(c!=null){
                    let template = await tb_uploadfile.findOne({
                        where:{
                            api_name: api_name,
                            order_id: diary_id,
                            srv_id: diary_id,
                            file_creator: user.name,
                            user_id: user.user_id,
                            srv_type: c.srv_type,
                            state: GLBConfig.ENABLE
                        }
                    });
                    if(template){
                        template.file_name = c.file_name;
                        template.file_url = c.file_url;
                        template.file_type =c.file_type;
                        await template.save();
                    }else{
                        let addFile = await tb_uploadfile.create({
                            api_name: api_name,
                            order_id: diary_id,
                            file_name: c.file_name,
                            file_url: c.file_url,
                            file_type: c.file_type,
                            srv_id: diary_id,
                            srv_type: c.srv_type,
                            file_creator: user.name,
                            user_id: user.user_id
                        });
                    }
                }
            }
            common.sendData(res, modicase)
            return
        } else {
            common.sendError(res, 'site_diary_01')
            return
        }
    } catch (error) {
        common.sendFault(res, error)
        return
    }
}
//上传图片
async function uploadImg (req, res){
    try {
        let fileInfo = await common.fileSave(req);
        let fileUrl = await common.fileMove(fileInfo.url, 'upload');
        fileInfo.url = fileUrl;
        let returnData={
            file_url:fileInfo.url,
            file_name:fileInfo.name,
            file_type:fileInfo.type,
        }
        common.sendData(res, returnData)
    } catch (error) {
        common.sendFault(res, error)
        return
    }
}
//删除图片
async function deleteImg(req, res) {
    try {
        let doc = common.docTrim(req.body);
        await common.fileRemove(doc.file_url)

        let uploadfiles = await tb_uploadfile.findOne({
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
        let diary_id=doc.old.diary_id;
        let imgType=doc.type;

        if(doc.old.files.length>0){
            let modicase = await tb_uploadfile.findOne({
                where: {
                    api_name:api_name,
                    order_id:diary_id,
                    file_name:doc.old.files[0].file_name,
                    file_url:doc.old.files[0].file_url,
                    srv_id:diary_id,
                    srv_type:imgType,
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
                order_id:  diary_id,
                file_name: doc.new.files[0].name,
                file_url: doc.new.files[0].url,
                file_type: doc.new.files[0].type,
                srv_id: diary_id,
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


