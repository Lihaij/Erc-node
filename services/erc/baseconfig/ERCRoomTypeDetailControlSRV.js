const fs = require('fs');
const common = require('../../../util/CommonUtil');
const GLBConfig = require('../../../util/GLBConfig');
const Sequence = require('../../../util/Sequence');
const logger = require('../../../util/Logger').createLogger('ERCRoomTypeDetailControlSRV');
const model = require('../../../model');

const sequelize = model.sequelize;
const tb_roomtype = model.erc_roomtype;
const tb_goacceptance = model.erc_goacceptance;//验收单的表
const tb_consNode = model.erc_goconstructionnode;//施工节点的表
const tb_uploadfile = model.erc_uploadfile;//设计文档的表
const tb_govrinfo = model.erc_govrinfo;//vr效果图表
const tb_goorderroom = model.erc_goorderroom;
const tb_goconstructionnode = model.erc_goconstructionnode;
const tb_goordermateriel = model.erc_goordermateriel;
const tb_common_apidomain = model.common_apidomain;
const tb_process = model.erc_process;

exports.ERCRoomTypeDetailControlResource = (req, res) => {
    let method = req.query.method;
    if (method === 'init'){
        initAct(req,res);
    } else if (method==='get_roomType'){
        getRoomType(req,res)
    } else if (method === 'search_a') {
        searchAcceptanceAct(req, res)
    } else if (method === 'add_a') {
        addAcceptanceAct(req, res)
    } else if (method === 'modify_a') {
        modifyAct(req, res)
    } else if (method === 'delete_a') {
        deleteAct(req, res)
    } else if (method === 'upload_a') {
        uploadAcceptanceAct(req, res)
    } else if (method === 'removeUpload') {
        // removeUploadAct(req, res)
    } else if (method==='upload'){
        uploadAct(req,res)
    } else if (method==='upload_d'){
        uploadDesignAct(req,res)
    } else if (method==='add_f'){
        addFileAct(req,res)
    } else if (method==='search_f'){
        searchFileAct(req,res)
    } else if (method === 'delete_f') {
        deleteFileAct(req, res)
    } else if (method === 'modify_f') {
        modifyFileAct(req, res)
    } else if (method === 'add_v') {
        addVrAct(req, res)
    } else if (method === 'modify_v') {
        modifyVrAct(req, res)
    } else if (method === 'delete_v') {
        deleteVrAct(req, res)
    }  else if (method === 'search_room') {//户型空间列表
        searchRoomAct(req, res)
    } else if (method === 'add_room') {//增加户型空间
        addRoomAct(req, res)
    } else if (method === 'delete_room') {//删除户型空间
        deleteRoomAct(req, res)
    } else if (method === 'search_material') {//户型物料清单
        searchMaterilalAct(req, res)
    } else if (method === 'add_material') {//增加物料
        addMaterialAct(req, res)
    } else if (method === 'delete_material') {//删除物料
        deleteMaterialAct(req, res)
    } else if (method === 'search_mat') {//待选物料列表
        searchMaterialAct(req, res)
    } else if (method === 'modify_material') {//修改户型物料
        modifyMaterialAct(req, res)
    } else if (method==='add_p'){
        addProcessAct(req,res)
    }else if (method==='delete_p'){
        deleteProcessAct(req,res)
    }else if (method==='modify_p'){
        modifyProcessAct(req,res)
    }else if (method==='search_p'){
        searchProcessAct(req,res)
    }else {
        common.sendError(res, 'common_01')
    }
};

async function initAct(req, res) {
    try {
        let doc = common.docTrim(req.body),queryStr='',replacements=[],queryRst;
        let fileTypeInfo = [];
        for (let type of GLBConfig.FILESRVTYPE) {
            if (type.id === '4' || type.id === '5' || type.id === '6') {
                fileTypeInfo.push(type)
            }
        }
        let returnData = {
            houseTypeInfo: GLBConfig.HTYPEINFO,
            fileTypeInfo: fileTypeInfo,
            tfInfo: GLBConfig.TFINFO,
            roomTypeInfo: GLBConfig.ROOMTYPE,
            acceptanceInfo: GLBConfig.ACCEPTANCETYPE,
            unitInfo: await global.getBaseTypeInfo(req.user.domain_id, 'JLDW'),//单位
            materialTypeInfo: GLBConfig.MATERIELTYPE,//物料分类
            materilaCategory: GLBConfig.MATERIELAMTO,//户型物料类型
            materielSourceInfo: GLBConfig.MATERIELSOURCE,//物料来源
            materielProcedure: [], //工序
            roomMaterialinfo: GLBConfig.MATERIELAMTO //是否订制品
        };

        // process
        let process = await tb_process.findAll({
        });
        for (let p of process) {
            // let row = JSON.parse(JSON.stringify(p));
            // row.id = p.process_name;
            // row.text = p.process_name;
            // row.value = p.process_name;
            let elem = {
                id:p.process_name,
                text:p.process_name,
                value:p.process_name
            }
            returnData.materielProcedure.push(elem)
        }

        common.sendData(res, returnData);
    } catch (error) {
        return common.sendFault(res, error);
    }
}

//户型查询
async function getRoomType(req,res) {
    try {
        let doc = common.docTrim(req.body);

        let roomType = await tb_roomtype.findOne({
            where: {
                roomtype_id: doc.roomtype_id,
                state: GLBConfig.ENABLE
            }
        });

        let returnData = JSON.parse(JSON.stringify(roomType));

        let gonodes = await tb_goconstructionnode.findAll({
            where: {
                roomtype_id: doc.roomtype_id,
                state: GLBConfig.ENABLE
            }
        });

        returnData.nodesInfo = [];
        for (let g of gonodes) {
            let result = JSON.parse(JSON.stringify(g));
            returnData.nodesInfo.push({
                id: result.gonode_id,
                text: result.gonode_name,
                value:result.gonode_name
            });
        }

        // rooms
        let rooms = await tb_goorderroom.findAll({
            where: {
                roomtype_id: doc.roomtype_id
            }
        });
        returnData.roomsInfo = [];
        for (let r of rooms) {
            let row = JSON.parse(JSON.stringify(r));
            row.id = r.goroom_id;
            row.text = r.goroom_name;
            returnData.roomsInfo.push(row)
        }

        return common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
        return
    }
}

//查询用户户型
let searchAcceptanceAct = async(req, res)=> {
    try {
        let doc = common.docTrim(req.body), user = req.user, returnData = {},replacements=[];
        // let queryStr = `select acc.* from tbl_erc_goacceptance acc left join tbl_erc_goorderroom goo on (acc.goroom_type = goo.goroom_id and goo.state=1) where acc.state=1 `;
        let queryStr = `select acc.* from 
            tbl_erc_goacceptance acc ,tbl_erc_goorderroom goo 
            where acc.goroom_id = goo.goroom_id 
            and goo.state=1 and acc.state=1 and acc.roomtype_id=?`;
        replacements.push(doc.roomtype_id);

        if (doc.gonode_id != null) {
            queryStr += ` and acc.gonode_id = ? `;
            replacements.push(doc.gonode_id)
        }
        if(doc.goroom_id){
            queryStr += ' and acc.goroom_id = ?';
            replacements.push(doc.goroom_id);
        }
        let result = await common.queryWithCount(sequelize, req, queryStr, replacements);
        returnData.total = result.count;

        let acceptances = [];
        let api_name = common.getApiName(req.path);
        for (let a of result.data) {
            let aj = JSON.parse(JSON.stringify(a));
            aj.images = [];
            let ifs = await tb_uploadfile.findAll({
                where: {
                    api_name: api_name,
                    srv_id: aj.goacceptance_id,
                    state: GLBConfig.ENABLE,
                    user_id: null
                }
            });
            for (let i of ifs) {
                aj.images.push(i)
            }
            acceptances.push(aj)
        }
        returnData.rows = acceptances;
        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
    }
};

//新增户型
let addAcceptanceAct = async(req, res)=> {
    try {
        let doc = common.docTrim(req.body);
        let goorderroom = await tb_goorderroom.findOne({
            where: {
                goroom_id: doc.goroom_id,
                state: GLBConfig.ENABLE
            }
        });

        let create = await tb_goacceptance.create({
            goacceptance_index: doc.goacceptance_index,
            gonode_id: doc.gonode_id,
            goroom_id: doc.goroom_id,
            goroom_type: goorderroom.goroom_type,
            goacceptance_name: doc.goacceptance_name,
            gois_hidden: doc.gois_hidden,
            gotechnological_require: doc.gotechnological_require,
            goevidence_require: doc.goevidence_require,
            goupload_format: doc.goupload_format,
            roomtype_id: doc.roomtype_id
        });

        for (let image of doc.images){
            let addFile = await tb_uploadfile.create({
                api_name: common.getApiName(req.path),
                file_name: image.file_name,
                file_url: image.file_url,
                file_type: image.file_type,
                file_visible: '1',
                state: GLBConfig.ENABLE,
                srv_id: create.goacceptance_id
            });
        }

        let retData = JSON.parse(JSON.stringify(create));
        common.sendData(res, retData);
    } catch (error) {
        common.sendFault(res, error);
    }
};
//修改户型
let modifyAct = async(req, res)=> {
    try {
        let doc = common.docTrim(req.body);
        let modify = await tb_goacceptance.findOne({
            where: {
                goacceptance_id: doc.old.goacceptance_id
            }
        });
        let goorderroom = await tb_goorderroom.findOne({
            where: {
                goroom_id: doc.new.goroom_id
            }
        });
        if (modify) {
            modify.roomtype_id = doc.roomtype_id
            modify.goacceptance_index = doc.new.goacceptance_index;
            modify.gonode_id = doc.new.gonode_id;
            modify.goroom_id = doc.new.goroom_id;
            modify.goroom_type = goorderroom.goroom_type;
            modify.goacceptance_name = doc.new.goacceptance_name;
            modify.gois_hidden = doc.new.gois_hidden;
            modify.gotechnological_require = doc.new.gotechnological_require;
            modify.goevidence_require = doc.new.goevidence_require;
            modify.goupload_format = doc.new.goupload_format;
            for (let image of doc.new.images){//增加新上传图片
                let findFine = await tb_uploadfile.findOne({
                    where: {
                        api_name: common.getApiName(req.path),
                        file_url: image.file_url,
                        srv_id:modify.goacceptance_id
                    }
                });
                if(!findFine){
                    let addFile = await tb_uploadfile.create({
                        api_name: common.getApiName(req.path),
                        file_name: image.file_name,
                        file_url: image.file_url,
                        file_type: image.file_type,
                        file_visible: '1',
                        state: GLBConfig.ENABLE,
                        srv_id: modify.goacceptance_id
                    });
                }
            }
            let findAll = await tb_uploadfile.findAll({
                where: {
                    api_name: common.getApiName(req.path),
                    srv_id:modify.goacceptance_id,
                    state: GLBConfig.ENABLE
                }
            });

            for(let file of findAll){//去除删掉的图片
                let isfind = false;
                for(let image of doc.new.images){
                    if(image.file_url === file.file_url){
                        isfind = true;
                        break
                    }
                }
                if(!isfind){
                    file.state = GLBConfig.DISABLE;
                    await file.save();
                }
            }

            await modify.save();
        } else {
            common.sendError(res, 'acceptance_01');
            return
        }
        return common.sendData(res, modify);
    } catch (error) {
        common.sendFault(res, error);
        return null
    }
};
//删除户型
let deleteAct = async(req, res)=> {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;

        let del= await tb_goacceptance.findOne({
            where: {
                goacceptance_id: doc.goacceptance_id,
                state: GLBConfig.ENABLE
            }
        });

        if (del) {
            del.state = GLBConfig.DISABLE;
            await del.save();
            return common.sendData(res);
        } else {
            return common.sendError(res, 'acceptance_01');

        }
    } catch (error) {
        return common.sendFault(res, error);
    }
};

let uploadAcceptanceAct = async(req, res) => {
    try {
        let fileInfo = await common.fileSave(req);
        let fileUrl = await common.fileMove(fileInfo.url, 'upload');
        fileInfo.url = fileUrl;
        common.sendData(res, fileInfo);
    } catch (error) {
        common.sendFault(res, error);
        return
    }
};
async function uploadAct (req, res){
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

async function uploadDesignAct (req, res){
    try {
        let fileInfo = await common.fileSave(req);
        common.sendData(res, fileInfo)
    } catch (error) {
        common.sendFault(res, error)
        return
    }
}
//上传附件
async function addFileAct(req, res){
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;
        let fileUrl = await common.fileMove(doc.file_url, 'upload')
        let addFile = await tb_uploadfile.create({
            api_name: common.getApiName(req.path),
            srv_id: doc.srv_id,
            user_id: user.user_id,
            file_name: doc.file_name,
            file_url: fileUrl,
            file_type: doc.file_type,
            srv_type: doc.srv_type,
            file_visible: doc.file_visible,
            file_creator: user.name,
            file_content: doc.file_content
        });
        let retData = JSON.parse(JSON.stringify(addFile));
        retData.created_time = addFile.created_at.Format("yyyy-MM-dd");
        common.sendData(res, retData);
    } catch (error) {
        common.sendFault(res, error);
    }
}

//获取附件信息
async function searchFileAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let returnData = {};
        let files = await tb_uploadfile.findAll({
            where: {
                api_name: common.getApiName(req.path),
                srv_id: doc.roomtype_id,
                state: GLBConfig.ENABLE,
                user_id: {
                    $ne: null
                }
            }
        });

        let vrs = await tb_govrinfo.findAll({
            where: {
                roomtype_id: doc.roomtype_id,
                state: GLBConfig.ENABLE
            }
        });

        returnData.files = [];
        for (let f of files) {
            let fj = JSON.parse(JSON.stringify(f));
            fj.created_time = f.created_at.Format("yyyy-MM-dd");
            returnData.files.push(fj)
        }

        returnData.vrs = [];
        for (let v of vrs) {
            let vj = JSON.parse(JSON.stringify(v));
            vj.created_time = v.created_at.Format("yyyy-MM-dd");
            returnData.vrs.push(vj)
        }

        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
    }
}
//删除附件
async function deleteFileAct(req, res){
    try {
        let doc = common.docTrim(req.body);
        let delFile = await tb_uploadfile.findOne({
            where: {
                file_id: doc.file_id,
                state: GLBConfig.ENABLE
            }
        });
        if (delFile) {
            delFile.state = GLBConfig.DISABLE;
            await delFile.save();
            return common.sendData(res);
        } else {
            return common.sendError(res, 'design_01');
        }
    } catch (error) {
        return common.sendFault(res, error);
    }
}
//修改附件
let modifyFileAct = async(req, res) => {
    try {
        let doc = common.docTrim(req.body);
        let modifyFile = await tb_uploadfile.findOne({
            where: {
                file_id: doc.old.file_id
            }
        });
        if (modifyFile) {
            modifyFile.file_content = doc.new.file_content;
            modifyFile.file_visible = doc.new.file_visible;
            await modifyFile.save()
        } else {
            common.sendError(res, 'file_01');
            return
        }
        let retData = JSON.parse(JSON.stringify(modifyFile));
        common.sendData(res, retData);
    } catch (error) {
        common.sendFault(res, error)
    }
};

//增加用户vr效果图
let addVrAct = async(req, res) => {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;

        let addVr = await tb_govrinfo.create({
            roomtype_id: doc.roomtype_id,
            govr_name: doc.govr_name,
            govr_url: doc.govr_url,
            govr_creator: user.name
        });
        let retData = JSON.parse(JSON.stringify(addVr));
        retData.created_time = addVr.created_at.Format("yyyy-MM-dd");
        common.sendData(res, retData);
    } catch (error) {
        common.sendFault(res, error);
    }
};
//修改用户vr效果图
let modifyVrAct = async(req, res) => {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;
        let modiVr = await tb_govrinfo.findOne({
            where: {
                govr_id: doc.old.govr_id
            }
        });
        if (modiVr) {
            modiVr.govr_name = doc.new.govr_name;
            modiVr.govr_url = doc.new.govr_url;
            modiVr.govr_creator = user.name;
            await modiVr.save()
        } else {
            common.sendError(res, 'vr_01');
            return
        }
        let retData = JSON.parse(JSON.stringify(modiVr));
        common.sendData(res, retData);

    } catch (error) {
        common.sendFault(res, error);
        return null
    }
};
//删除用户vr效果图
let deleteVrAct = async(req, res) => {
    try {
        let doc = common.docTrim(req.body);
        let delVr = await tb_govrinfo.findOne({
            where: {
                govr_id: doc.govr_id,
                state: GLBConfig.ENABLE
            }
        });
        if (delVr) {
            delVr.state = GLBConfig.DISABLE;
            await delVr.save();
            return common.sendData(res);
        } else {
            return common.sendError(res, 'vr_01');
        }
    } catch (error) {
        return common.sendFault(res, error);
    }
};

//查询户型空间
async function searchRoomAct(req, res) {
    try{
        let doc = common.docTrim(req.body);
        let rooms = await tb_goorderroom.findAll({
            where: {
                roomtype_id: doc.roomtype_id
            }
        });
        common.sendData(res, rooms);
    } catch (error) {
        common.sendFault(res, error);
    }
}

//新增户型空间
async function addRoomAct(req, res){
    try {
        let doc = common.docTrim(req.body);

        let room = await tb_goorderroom.findOne({
            where: {
                roomtype_id: doc.roomtype_id,
                goroom_type: doc.goroom_type,
                goroom_name: doc.goroom_name
            }
        });

        if(room) {
            return common.sendError(res, 'orderdetail_05')
        }

        let orderroom = await tb_goorderroom.create({
            roomtype_id: doc.roomtype_id,
            goroom_type: doc.goroom_type,
            goroom_name: doc.goroom_name
        });
        common.sendData(res, orderroom);
    } catch (error) {
        common.sendFault(res, error);
    }
}

//删除户型空间
async function deleteRoomAct(req, res){
    try {
        let doc = common.docTrim(req.body);
        await tb_goorderroom.destroy({
            where: {
                goroom_id: doc.goroom_id
            }
        });
        common.sendData(res);
    } catch (error) {
        common.sendFault(res, error);
    }
}

//查询户型物料信息
async function searchMaterilalAct(req, res){
    try {
        let doc = common.docTrim(req.body);
        let returnData = {};
        let queryStr = `select gom.*, m.materiel_id,m.materiel_code,m.materiel_name,m.materiel_format,
        m.materiel_unit,m.materiel_type,m.materiel_cost,m.materiel_source,m.materiel_procedure,gom.gomateriel_amount 
        from tbl_erc_goordermateriel gom left join tbl_erc_materiel m on gom.gomateriel_id = m.materiel_id
        where gom.state = ? and m.state = ? and roomtype_id = ?`;

        let replacements = [GLBConfig.ENABLE, GLBConfig.ENABLE, doc.roomtype_id];
        if(doc.gomateriel_type){
            queryStr += ' and gomateriel_type = ?';
            replacements.push(doc.gomateriel_type);
        }
        if(doc.goroom_id){
            queryStr += ' and goroom_id = ?';
            replacements.push(doc.goroom_id);
        }

        let result = await common.queryWithCount(sequelize, req, queryStr, replacements);
        returnData.total = result.count;
        returnData.rows = result.data;
        common.sendData(res,returnData);
    } catch (error) {
        common.sendFault(res, error);
    }
}

//新增户型物料
async function addMaterialAct(req, res){
    try {
        let doc = common.docTrim(req.body);
        let add = await tb_goordermateriel.create({
            roomtype_id: doc.roomtype_id,
            goroom_id: doc.goroom_id,
            gomateriel_id: doc.gomateriel_id,
            gomateriel_amount: 1,
            gomateriel_batch: doc.gomateriel_batch,
            goroom_type: doc.goroom_type,
            gomateriel_type: doc.gomateriel_type
        });
        common.sendData(res, add);
    } catch (error) {
        common.sendFault(res, error);
    }
}

//删除户型物流信息
async function deleteMaterialAct(req, res){
    try {
        let doc = common.docTrim(req.body);
        let delMateriel = await tb_goordermateriel.findOne({
            where: {
                goordermateriel_id: doc.goordermateriel_id,
                state: GLBConfig.ENABLE
            }
        });
        if (delMateriel) {
            delMateriel.state = GLBConfig.DISABLE;
            await delMateriel.save();
            return common.sendData(res);
        } else {
            return common.sendError(res, 'materiel_01');
        }
    } catch (error) {
        return common.sendFault(res, error);
    }
}

//查询物料信息
async function searchMaterialAct(req, res) {
    try {
        let doc = common.docTrim(req.body),returnData = {},replacements = [];

        let user = req.user,api_name = 'MATERIELCONTROL',dlist = [];

        dlist.push(user.domain_id);

        let resultApi = await tb_common_apidomain.findAll({
            where: {
                api_name: api_name,
                domain_id: user.domain_id,
                state: GLBConfig.ENABLE
            }
        });

        for(let r of resultApi) {
            dlist.push(r.follow_domain_id)
        }

        let queryInStr= ' in (' + dlist.join(",") + ')';
        let queryStr = `select m.*,d.domain_name 
            from tbl_erc_materiel m 
            left join tbl_common_domain d on (m.domain_id=d.domain_id and d.state=1) 
            where m.state=1 and m.domain_id ` + queryInStr;
        // if (doc.materiel_state) {
        //     queryStr += ' and materiel_state = ?';
        //     replacements.push(doc.materiel_state);
        // }
        //
        // if (doc.materiel_source){//2集团采购，1属地采购
        //     queryStr +=' and materiel_source = ?';
        //     replacements.push(doc.materiel_source);
        // }

        if (doc.matNameOrCodeOrFormat) {
            queryStr += ' and (materiel_name like ? or materiel_code like ? or materiel_format like ?)';
            replacements.push('%' + doc.matNameOrCodeOrFormat + '%');
            replacements.push('%' + doc.matNameOrCodeOrFormat + '%');
            replacements.push('%' + doc.matNameOrCodeOrFormat + '%');
        }
        queryStr += ' order by materiel_id';
        let result = await common.queryWithCount(sequelize, req, queryStr, replacements);

        returnData.total = result.count;
        returnData.rows = [];
        for (let r of result.data) {
            let result = JSON.parse(JSON.stringify(r));
            result.create_date = r.created_at.Format("yyyy-MM-dd");
            returnData.rows.push(result)
        }
        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
        return
    }
}

//修改物料信息
async function modifyMaterialAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let modiMateriel = await tb_goordermateriel.findOne({
            where: {
                goordermateriel_id: doc.old.goordermateriel_id
            }
        });
        if (modiMateriel) {
            modiMateriel.goroom_id = doc.new.goroom_id;
            modiMateriel.gomateriel_amount = doc.new.gomateriel_amount;
            modiMateriel.gomateriel_batch = doc.new.gomateriel_batch;
            await modiMateriel.save()
        } else {
            common.sendError(res, 'materiel_01');
            return
        }

        let retData = JSON.parse(JSON.stringify(modiMateriel));
        common.sendData(res, retData);

    } catch (error) {
        common.sendFault(res, error);
        return null
    }
}

//增加户型施工节点
async function addProcessAct(req,res){
    try {
        let doc = common.docTrim(req.body);
        let addCons = await tb_goconstructionnode.create({
            roomtype_id: doc.roomtype_id,
            gonode_name: doc.gonode_name,
            // gostart_day: doc.gostart_day,
            // goend_day: doc.goend_day,
            // gonode_index: doc.gonode_index,
            gonode_duration:doc.gonode_duration,//时长
            gonode_description: doc.gonode_description,//描述
            gonode_level: doc.gonode_level//级别
        });
        let retData = JSON.parse(JSON.stringify(addCons));
        common.sendData(res, retData);
    } catch (error) {
        common.sendFault(res, error);
    }
}

//删除户型施工节点
async function deleteProcessAct(req,res){
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;

        let delNode = await tb_goconstructionnode.findOne({
            where: {
                gonode_id: doc.gonode_id,
                state: GLBConfig.ENABLE
            }
        });



        if (delNode) {
            delNode.state = GLBConfig.DISABLE;
            await delNode.save();
            return common.sendData(res);
        } else {
            return common.sendError(res, 'constructionNode_01');

        }
    } catch (error) {
        return common.sendFault(res, error);
    }
}

//修改户型施工节点
async function modifyProcessAct(req, res){
    try {
        let doc = common.docTrim(req.body);
        let modNode = await tb_goconstructionnode.findOne({
            where: {
                gonode_id: doc.old.gonode_id
            }
        });
        if (modNode) {
            modNode.gonode_name = doc.new.gonode_name;
            // modNode.gostart_day = doc.new.gostart_day;
            // modNode.goend_day = doc.new.goend_day;
            // modNode.gonode_index = doc.new.gonode_index;
            modNode.gonode_duration=doc.new.gonode_duration;//时长
            modNode.gonode_description=doc.new.gonode_description;//描述
            modNode.gonode_level=doc.new.gonode_level;//级别
            modNode.gonode_description = doc.new.gonode_description;
            await modNode.save();
        } else {
            common.sendError(res, 'constructionNode_01');
            return
        }
        return common.sendData(res, modNode);
    } catch (error) {
        common.sendFault(res, error);
        return null
    }
}

//查询户型施工节点
async function searchProcessAct(req, res){
    try {
        let doc = common.docTrim(req.body), user = req.user, returnData = {},replacements=[];
        let queryStr = 'select * from tbl_erc_goconstructionnode where state=1';
        if(doc.roomtype_id){
            queryStr+=' and roomtype_id=?';
            replacements.push(doc.roomtype_id)
        }
        if(doc.gonode_id){
            queryStr+=' and gonode_id=?';
            replacements.push(doc.gonode_id)
        }

        queryStr += ' order by gonode_index' ;
        let result = await common.queryWithCount(sequelize, req, queryStr, replacements);
        returnData.total = result.count;
        returnData.rows = result.data;
        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
    }
}
