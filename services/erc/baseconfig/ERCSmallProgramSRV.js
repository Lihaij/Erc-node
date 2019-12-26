/**
 * Created by BaiBin on 2018/3/16.
 */
const common = require('../../../util/CommonUtil');
const GLBConfig = require('../../../util/GLBConfig');
const logger = require('../../../util/Logger').createLogger('ERCSmallProgramSRV');
const model = require('../../../model');
const Sequence = require('../../../util/Sequence');

const tb_decorateinfo = model.erc_decorateinfo;
const tb_uploadfile = model.erc_uploadfile;
const tb_usercollection = model.erc_usercollection;


const sequelize = model.sequelize;

exports.SmallProgramResource = (req, res) => {
    let method = req.query.method;
    if (method === 'init') {
        initAct(req, res)
    } else if (method === 'search') {
        searchAct(req, res)
    } else if (method === 'add') {
        addAct(req, res);
    } else if (method === 'delete') {
        deleteAct(req, res);
    }  else if (method === 'modify') {
        modifyAct(req, res);
    } else if (method === 'upload') {
        uploadAct(req, res)
    }  else if (method === 'save_title_img') {
        saveTitleImgAct(req, res)
    }  else if (method === 'save_file') {
        saveFileAct(req, res)
    }  else if (method === 'remove_file') {
        removeFileAct(req, res)
    }  else if (method === 'get_img') {
        getImgAct(req, res)
    }  else {
        common.sendError(res, 'common_01')
    }
};

async function initAct(req,res){

    try {
        let returnData = {},
            user = req.user;
        returnData.decorateType = GLBConfig.DECORATETYPE
        returnData.saleType = GLBConfig.SALETYPE
        common.sendData(res, returnData)
    } catch (error) {
        common.sendFault(res, error);
        return;
    }

}

let searchAct = async(req, res)=> {
    try {
        let doc = common.docTrim(req.body)
        let user = req.user
        let returnData = {};
        let queryStr = `select d.*, u.file_url from tbl_erc_decorateinfo d
        left join tbl_erc_uploadfile u on d.decorate_img_id = u.file_id
         where d.state = ? `;
        let replacements = [GLBConfig.ENABLE]

        if (user.domain_id) {
            queryStr+=` and d.domain_id = ? `;
            replacements.push(user.domain_id);
        }
        if(doc.search_text){
            queryStr+=` and (d.decorate_title like ? ) `;
            replacements.push('%'+doc.search_text+'%');
        }
        if (doc.decorate_type) {
            queryStr+=` and d.decorate_type = ? `;
            replacements.push(doc.decorate_type);
        }
        let result = await common.queryWithCount(sequelize, req, queryStr, replacements);
        returnData.total = result.count;
        returnData.rows = [];

        for (let r of result.data) {
            let arr = await tb_usercollection.findAll({
                where: {
                    decorate_id: r.decorate_id,
                    state: 1
                }
            })
            r.count = arr.length;
            let rj = JSON.parse(JSON.stringify(r));
            // rj.created_at = r.created_at ? r.created_at.Format("yyyy-MM-dd"): null;
            returnData.rows.push(rj);
        }
        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
    }
};

let addAct = async(req, res)=> {
    try {
        let doc = common.docTrim(req.body),user = req.user;

        let addRow = await tb_decorateinfo.create({
            decorate_title: doc.decorate_title,
            decorate_url: doc.decorate_url,
            decorate_description: doc.decorate_description,
            decorate_create_id: user.user_id,
            decorate_create_name: user.username,
            decorate_type: doc.decorate_type,
            mark: doc.mark,
            is_sale: doc.is_sale,
            domain_id: user.domain_id
        });

        if (doc.url) {
            let fileUrl = await common.fileMove(doc.url, 'upload')
            let api_name = common.getApiName(req.path)

            // srv_type 1='标题图片' 2='banner图片' 3='描述图片'
            let addFile = await tb_uploadfile.create({
                api_name: api_name,
                file_name: doc.name,
                file_url: fileUrl,
                file_type: doc.type,
                srv_id: addRow.decorate_id,
                file_creator: user.name,
                user_id: user.user_id,
                srv_type: '1'
            });

            addRow.decorate_img_id = addFile.file_id;
            await addRow.save();
        }

        let retData = JSON.parse(JSON.stringify(addRow));
        common.sendData(res, retData);
    } catch (error) {
        common.sendFault(res, error);
    }
};

let saveTitleImgAct = async(req, res)=> {
    try {
        let doc = common.docTrim(req.body),user = req.user;
        let fileUrl = await common.fileMove(doc.url, 'upload')
        let api_name = common.getApiName(req.path)
        // srv_type 1='标题图片' 2='banner图片' 3='描述图片'
        let addFile = await tb_uploadfile.create({
            api_name: api_name,
            file_name: doc.name,
            file_url: fileUrl,
            file_type: doc.type,
            srv_id: doc.decorate_id,
            file_creator: user.name,
            user_id: user.user_id,
            srv_type: '1'
        });

        let decorate = await tb_decorateinfo.findOne({
            where: {
                decorate_id: doc.decorate_id
            }
        })
        if (decorate) {
            let oldFileId = decorate.decorate_img_id;
            decorate.decorate_img_id = addFile.file_id
            await decorate.save()

            //删除原来的老图片
            let uf = await tb_uploadfile.findOne({
                where: {
                    file_id: oldFileId,
                    state: GLBConfig.ENABLE
                }
            })
            if (uf) {
                uf.state = GLBConfig.DISABLE
                await uf.save();
            }
        }

        let retData = JSON.parse(JSON.stringify(decorate));
        common.sendData(res, retData);
    } catch (error) {
        common.sendFault(res, error);
    }
};

let saveFileAct = async(req, res)=> {
    try {
        let doc = common.docTrim(req.body),user = req.user;
        let fileUrl = await common.fileMove(doc.url, 'upload')
        let api_name = common.getApiName(req.path)
        // srv_type 1='标题图片' 2='banner图片' 3='描述图片'
        let addFile = await tb_uploadfile.create({
            api_name: api_name,
            file_name: doc.name,
            file_url: fileUrl,
            file_type: doc.type,
            srv_id: doc.decorate_id,
            file_creator: user.name,
            user_id: user.user_id,
            srv_type: doc.srv_type,
            file_content: doc.file_content
        });
        common.sendData(res, addFile);
    } catch (error) {
        common.sendFault(res, error);
    }
};

let removeFileAct = async(req, res)=> {
    try {
        let doc = common.docTrim(req.body)

        let file = await tb_uploadfile.findOne({
            where: {
                file_id: doc.file_id,
                state: 1
            }
        });
        if (file) {
            file.state = 0
            await file.save();
        }
        common.sendData(res, file);
    } catch (error) {
        common.sendFault(res, error);
    }
};

let getImgAct = async(req, res)=> {
    try {
        let doc = common.docTrim(req.body),user = req.user;
        let api_name = common.getApiName(req.path)
        let files = await tb_uploadfile.findAll({
            where: {
                srv_id: doc.decorate_id,
                api_name: api_name,
                state: GLBConfig.ENABLE
            }
        });
        let bannerArr = [];
        let desImgArr = [];
        for (let file of files) {
            if (file.srv_type === '2') {
                bannerArr.push(file)
            } else if (file.srv_type === '3'){
                desImgArr.push(file)
            }
        }
        let retData = {bannerArr:bannerArr,desImgArr:desImgArr}
        common.sendData(res, retData);
    } catch (error) {
        common.sendFault(res, error);
    }
};

let deleteAct = async(req, res)=> {
    try {
        let doc = common.docTrim(req.body);
        let decorate = await tb_decorateinfo.findOne({
            where:{
                decorate_id: doc.decorate_id,
                state: GLBConfig.ENABLE
            }
        })
        if (decorate) {
            decorate.state = 0;
            await decorate.save();
        }

        //删除图片
        let file = await tb_uploadfile.findOne({
            where:{
                file_id: decorate.decorate_img_id,
                state: GLBConfig.ENABLE
            }
        })
        if (file) {
            file.state = 0;
            await file.save();
        }

        common.sendData(res, decorate);
    } catch (error) {
        common.sendFault(res, error);
    }
};

let modifyAct = async(req, res)=> {
    try {
        let doc = common.docTrim(req.body);
        let decorate = await tb_decorateinfo.findOne({
            where:{
                decorate_id: doc.new.decorate_id,
                state: GLBConfig.ENABLE
            }
        });
        if (decorate) {
            decorate.decorate_title = doc.new.decorate_title;
            decorate.decorate_description = doc.new.decorate_description;
            decorate.decorate_url = doc.new.decorate_url;
            decorate.is_sale = doc.new.is_sale;
            decorate.mark = doc.new.mark;
            await decorate.save();
        }
        common.sendData(res, decorate);
    } catch (error) {
        common.sendFault(res, error);
    }
};

let uploadAct = async (req, res) => {
    try {
        let fileInfo = await common.fileSave(req)
        common.sendData(res, fileInfo)
    } catch (error) {
        common.sendFault(res, error)
    }
};

