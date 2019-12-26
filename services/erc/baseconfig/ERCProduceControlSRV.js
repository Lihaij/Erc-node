const moment = require('moment');
const common = require('../../../util/CommonUtil');
const GLBConfig = require('../../../util/GLBConfig');
const logger = require('../../../util/Logger').createLogger('ProduceControlSRV');
const model = require('../../../model');
const Sequence = require('../../../util/Sequence');

const FDomain = require('../../../bl/common/FunctionDomainBL');

const sequelize = model.sequelize;
const tb_produce = model.erc_produce;
const tb_produceprocess = model.erc_produceprocess;
const tb_producemateriel = model.erc_producemateriel;
const tb_common_apidomain = model.common_apidomain;
const tb_uploadfile = model.erc_uploadfile;
const tb_acceptance = model.erc_produceacceptance;
const tb_process = model.erc_process;

exports.ERCProduceControlResource = (req, res) => {
    let method = req.query.method;
    if (method === 'searchProduce') {
        searchProduce(req, res)
    } else if (method === 'searchSupplierProduce') {
        searchSupplierProduce(req, res)
    }else if (method==='init'){
        initAct(req,res)
    }else if (method==='deleteProduce'){
        deleteProduce(req,res)
    }else if (method==='searchProcess'){
        searchProcess(req,res)
    }else if (method==='deleteProcess'){
        deleteProcess(req,res)
    }else if (method==='addProcess'){
        addProcess(req,res)
    }else if (method==='getMateriel'){
        getMateriel(req,res)
    }else if (method==='addProduce'){
        addProduce(req,res)
    }else if (method==='modifyProcess'){
        modifyProcess(req,res)
    }else if (method==='getProcess'){
        getProcess(req,res)
    }else if (method==='deleteProcessMateriel'){
        deleteProcessMateriel(req,res)
    }else if (method==='addProcessMateriel'){
        addProcessMateriel(req,res)
    }else if (method==='searchProcessMateriel'){
        searchProcessMateriel(req,res)
    }else if (method==='modifyProcessMateriel'){
        modifyProcessMateriel(req,res)
    } else if (method === 'search_acceptance') {
        searchAcceptanceAct(req, res)
    } else if (method === 'add_acceptance') {
        addAcceptanceAct(req, res)
    } else if (method === 'modify_acceptance') {
        modifyAcceptanceAct(req, res)
    } else if (method === 'delete_acceptance') {
        deleteAcceptanceAct(req, res)
    } else if (method === 'upload') {
        uploadAct(req, res)
    } else {
        common.sendError(res, 'common_01');
    }
};

// 初始化基础数据
async function initAct(req,res){
    let returnData = {},
        user = req.user;

    await FDomain.getDomainListInit(req, returnData);
    returnData.domainTypeInfo = GLBConfig.DOMAINTYPE; //单位
    returnData.unitInfo = await global.getBaseTypeInfo(req.user.domain_id, 'JLDW'); //单位
    returnData.materielSource = GLBConfig.MATERIELSOURCE; //物料来源
    returnData.materielManage = GLBConfig.MATERIELMANAGE; //管理模式
    returnData.statusInfo = GLBConfig.STATUSINFO //生效状态
    returnData.materielType = GLBConfig.MATERIELTYPE;//物料分类
    returnData.batchInfo = GLBConfig.BATCHINFO;//批次
    returnData.materielProcedure = [];//工序
    returnData.materielAmto = GLBConfig.MATERIELAMTO;//是否是定制品
    returnData.roomTypeInfo= GLBConfig.ROOMTYPE,//空间类型
    returnData.trueFalseInfo= GLBConfig.TFINFO,//是否显示
    returnData.acceptanceInfo= GLBConfig.ACCEPTANCETYPE//验收上传实例类型

    // process
    let process = await tb_process.findAll({
    });
    for (let p of process) {
        let row = JSON.parse(JSON.stringify(p));
        row.id = p.process_name;
        row.text = p.process_name;
        returnData.materielProcedure.push(row)
    }

    common.sendData(res, returnData)
}
// 查询产品列表
async function searchProduce(req,res){
    try {
        let doc = common.docTrim(req.body),
            user = req.user,
            replacements = [],
            returnData = {};
        let queryStr = 'select m.*,p.produce_id,p.domain_id as prodoceDomainId  from tbl_erc_produce p,tbl_erc_materiel m ' +
            'where p.state=1 and m.state=1 and p.materiel_id=m.materiel_id and p.domain_id'+ await FDomain.getDomainListStr(req) ;
        if (doc.domain_id) {
            queryStr += ' and p.domain_id = ?';
            replacements.push(doc.domain_id);
        }
        if(doc.search_text){
            queryStr+=' and (materiel_code like ? or materiel_name like ?)';
            replacements.push('%'+doc.search_text+'%');
            replacements.push('%'+doc.search_text+'%');
        }
        queryStr+=' order by m.domain_id,m.materiel_code';
        let result = await common.queryWithCount(sequelize, req, queryStr, replacements);
        returnData.total = result.count;
        returnData.rows = result.data;
        common.sendData(res, returnData);
    } catch (error) {
        return common.sendFault(res, error);
    }
}
// 查询产品列表
async function searchSupplierProduce(req,res){
    try {
        let doc = common.docTrim(req.body),
            user = req.user,
            replacements = [],
            returnData = {};
        let queryStr =
            `select m.*, p.domain_id, p.produce_id,p.domain_id as prodoceDomainId
                from tbl_erc_produce p
                left join tbl_erc_materiel m
                on p.materiel_id = m.materiel_id
                left join tbl_common_domain d
                on p.domain_id = d.domain_id
                where p.state = 1 and m.state = 1`;
        if (doc.domain_type) {
            queryStr += ' and d.domain_type = ?';
            replacements.push(doc.domain_type);
        }
        if(doc.search_text){
            queryStr+=' and (materiel_code like ? or materiel_name like ?)';
            replacements.push('%'+doc.search_text+'%');
            replacements.push('%'+doc.search_text+'%');
        }
        queryStr+=' order by m.domain_id,m.materiel_code';
        let result = await common.queryWithCount(sequelize, req, queryStr, replacements);
        returnData.total = result.count;
        returnData.rows = result.data;
        common.sendData(res, returnData);
    } catch (error) {
        return common.sendFault(res, error);
    }
}
// 删除商品
async function deleteProduce (req,res){
    try {

        let doc = common.docTrim(req.body),
            user = req.user;

        let deleteProduce = await tb_produce.findOne({
            where: {
                domain_id: user.domain_id,
                produce_id: doc.produce_id
            }
        });

        if (deleteProduce) {
            deleteProduce.state =  GLBConfig.DISABLE;
            await deleteProduce.save()
        } else {
            common.sendError(res, 'produce_01');
            return
        }
        common.sendData(res, deleteProduce);

    } catch (error) {
        return common.sendFault(res, error);
    }
}
// 查询物料列表
async function getMateriel(req,res){
    try {
        let doc = common.docTrim(req.body),returnData = {},replacements = [];

        let user = req.user,api_name = 'ERCMATERIELCONTROL',dlist = [];

        dlist.push(user.domain_id);
        let resultApi = await tb_common_apidomain.findAll({
            where: {
                api_name: api_name,
                domain_id: user.domain_id,
                state: GLBConfig.ENABLE,
                effect_state:GLBConfig.ENABLE
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

        if(doc.tableName=='purduceDetail'){
            queryStr+=' and materiel_id<>(select materiel_id from tbl_erc_produce where produce_id=?)'
            replacements.push(doc.produce_id);
        }
        if (doc.matNameOrCodeOrFormat) {
            queryStr += ' and (materiel_name like ? or materiel_code like ? or materiel_format like ?)';
            replacements.push('%' + doc.matNameOrCodeOrFormat + '%');
            replacements.push('%' + doc.matNameOrCodeOrFormat + '%');
            replacements.push('%' + doc.matNameOrCodeOrFormat + '%');
        }
        queryStr += ' order by m.domain_id,materiel_id';
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
// 增加产品
async function addProduce(req,res){
    try {
        let doc = common.docTrim(req.body),
            user = req.user,
            replacements = [],addProduce;
        for(let m of doc.searchedRow){
            let produce = await tb_produce.findOne({
                where:{
                    domain_id:user.domain_id,
                    state:GLBConfig.ENABLE,
                    materiel_id:m.materiel_id
                }
            });
            if(!produce){
                addProduce = await tb_produce.create({
                    materiel_id: m.materiel_id,
                    domain_id:user.domain_id
                });
            }
        }
        common.sendData(res, addProduce);
    } catch (error) {
        common.sendFault(res, error);
        return;
    }
}

// 查询产品工序
async function searchProcess(req,res){
    try {
        let doc = common.docTrim(req.body),
            user = req.user,
            replacements = [],
            returnData = {};
        let queryStr = 'select * from tbl_erc_produceprocess where state=1 and produce_id=?' ;
        replacements.push(doc.produce_id);
        if(doc.search_textP){
            queryStr+=' and process_name like ? ';
            replacements.push('%'+doc.search_textP+'%');
        }
        let result = await common.queryWithCount(sequelize, req, queryStr, replacements);
        returnData.total = result.count;
        returnData.rows = result.data;
        common.sendData(res, returnData);
    } catch (error) {
        return common.sendFault(res, error);
    }
}
// 产出产品工序
async function deleteProcess(req,res){
    try {

        let doc = common.docTrim(req.body),
            user = req.user;

        let deleteProcess = await tb_produceprocess.findOne({
            where: {
                produceprocess_id:doc.produceprocess_id
            }
        });

        if (deleteProcess) {
            deleteProcess.state =  GLBConfig.DISABLE;
            await deleteProcess.save()
        } else {
            common.sendError(res, 'produce_01');
            return
        }
        common.sendData(res, deleteProcess);

    } catch (error) {
        return common.sendFault(res, error);
    }
}
// 增加产品工序
async function addProcess(req,res){
    try {
        let doc = common.docTrim(req.body),
            user = req.user,
            replacements = [];

        let process = await tb_produceprocess.findOne({
            where: {
                produce_id: doc.produce_id,
                process_name: doc.process_name,
                state:GLBConfig.ENABLE
            }
        });

        if (process) {
            common.sendError(res, 'produce_02');
            return
        }
        let addProcess = await tb_produceprocess.create({
            produce_id: doc.produce_id,
            process_name: doc.process_name,
            process_duration: doc.process_duration,
            process_level: doc.process_level,
            process_description: doc.process_description
        });
        common.sendData(res, addProcess);

    } catch (error) {
        common.sendFault(res, error);
        return;
    }
}
// 修改产品工序
async function modifyProcess(req,res){
    try {
        let doc = common.docTrim(req.body),
            user = req.user;

        let modifyProcess = await tb_produceprocess.findOne({
            where: {
                produceprocess_id: doc.old.produceprocess_id
            }
        });

        if (modifyProcess) {
            modifyProcess.process_name=doc.new.process_name;
            modifyProcess.process_duration=doc.new.process_duration;
            modifyProcess.process_level=doc.new.process_level;
            modifyProcess.process_description=doc.new.process_description;
            await modifyProcess.save()
        } else {
            common.sendError(res, 'produce_03');
            return
        }

        common.sendData(res, modifyProcess);
    } catch (error) {
        return common.sendFault(res, error);
    }
}

// 查询工序字典
async function getProcess(req,res){
    try {
        let doc = common.docTrim(req.body),
            user = req.user,
            replacements = [],
            returnData ={};
        let queryStr = `select * from tbl_erc_produceprocess where state=1 and produce_id=?` ;
        replacements.push(doc.produce_id);
        queryStr+=' order by process_level';
        let result=await sequelize.query(queryStr, {replacements: replacements, type: sequelize.QueryTypes.SELECT});
        returnData.produceProcess=[];
        for(let r of result){
            returnData.produceProcess.push({
                id:r.produceprocess_id,
                value:r.produceprocess_id,
                text:r.process_name
            })
        }
        common.sendData(res, returnData);
    } catch (error) {
        return common.sendFault(res, error);
    }
}
// 删除产品下的物料
async function deleteProcessMateriel(req,res) {
    try {
        let doc = common.docTrim(req.body),
            user = req.user;
        let deleteProcessMateriel = await tb_producemateriel.findOne({
            where: {
                producemateriel_id:doc.producemateriel_id
            }
        });
        if (deleteProcessMateriel) {
            deleteProcessMateriel.state =  GLBConfig.DISABLE;
            await deleteProcessMateriel.save()
        } else {
            common.sendError(res, 'produce_01');
            return
        }
        common.sendData(res, deleteProcessMateriel);

    } catch (error) {
        return common.sendFault(res, error);
    }
}
// 增加产品物料
async function addProcessMateriel(req,res){
    try {
        let doc = common.docTrim(req.body),
            user = req.user,
            replacements = [],addProcessMateriel;
        for(let m of doc.searchedRow){
            let processMateriel = await tb_producemateriel.findOne({
                where:{
                    produce_id:doc.produce_id,
                    materiel_id:m.materiel_id,
                    state:GLBConfig.ENABLE
                }
            });
            if(!processMateriel){
                addProcessMateriel = await tb_producemateriel.create({
                    produce_id: doc.produce_id,
                    materiel_id: m.materiel_id
                });
            }
        }
        common.sendData(res, addProcessMateriel);
    } catch (error) {
        common.sendFault(res, error);
        return;
    }
}
// 查询产品物料
async function searchProcessMateriel(req,res){
    try {
        let doc = common.docTrim(req.body),
            user = req.user,
            replacements = [],
            returnData = {};
        let queryStr = `select m.*,pm.produceprocess_id,pm.producemateriel_id    
            from tbl_erc_producemateriel pm 
            left join tbl_erc_materiel m on (pm.materiel_id=m.materiel_id and m.state=1 )
            left join tbl_erc_produceprocess pp on (pm.produceprocess_id=pp.produceprocess_id and pp.state=1) 
            where pm.state=1 and pm.produce_id=?` ;
        replacements.push(doc.produce_id);
        if(doc.search_textM){
            queryStr+=' and (m.materiel_code like ? or m.materiel_name like ?)';
            replacements.push('%'+doc.search_textM+'%');
            replacements.push('%'+doc.search_textM+'%');
        }
        let result = await common.queryWithCount(sequelize, req, queryStr, replacements);
        returnData.total = result.count;
        returnData.rows = result.data;
        common.sendData(res, returnData);
    } catch (error) {
        return common.sendFault(res, error);
    }
}
// 修改产品物料
async function modifyProcessMateriel(req,res){
    try {
        let doc = common.docTrim(req.body),
            user = req.user;

        let modifyProcessMateriel = await tb_producemateriel.findOne({
            where: {
                producemateriel_id: doc.old.producemateriel_id
            }
        });

        if (modifyProcessMateriel) {
            modifyProcessMateriel.produceprocess_id=doc.new.produceprocess_id
            await modifyProcessMateriel.save()
        } else {
            common.sendError(res, 'produce_04');
            return
        }

        common.sendData(res, modifyProcessMateriel);
    } catch (error) {
        return common.sendFault(res, error);
    }
}

// 查询验收项
async function searchAcceptanceAct(req, res){
    try {
        let doc = common.docTrim(req.body), user = req.user, returnData = {},replacements=[];
        let queryStr = `select pa.*,pp.process_name 
            from tbl_erc_produceacceptance pa 
            left join tbl_erc_produceprocess pp on (pa.produceprocess_id=pp.produceprocess_id and pp.state=1) 
            where pa.state=1 and pa.produce_id=?`;
        replacements.push(doc.produce_id);
        if(doc.search_textA){
            queryStr+=' and (acceptance_name like ? or acceptance_index like ?)';
            replacements.push('%' + doc.search_textA + '%');
            replacements.push('%' + doc.search_textA + '%');
        }
        let result = await common.queryWithCount(sequelize, req, queryStr, replacements);
        returnData.total = result.count;
        let acceptances = [];
        let api_name = common.getApiName(req.path);
        for (let a of result.data) {
            let aj = JSON.parse(JSON.stringify(a));
            aj.created_time = a.created_at.Format("yyyy-MM-dd");
            aj.images = [];
            let ifs = await tb_uploadfile.findAll({
                where: {
                    api_name: api_name,
                    srv_id: aj.produceacceptance_id,
                    state: GLBConfig.ENABLE
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
// 增加验收项
async function addAcceptanceAct (req, res) {
    try {
        let doc = common.docTrim(req.body);
        let create = await tb_acceptance.create({
            produce_id: doc.produce_id,
            acceptance_index: doc.acceptance_index,
            produceprocess_id: doc.produceprocess_id,
            room_type: doc.room_type,
            acceptance_name: doc.acceptance_name,
            is_hidden: doc.is_hidden,
            technological_require: doc.technological_require,
            evidence_require: doc.evidence_require,
            upload_format: doc.upload_format
        });

        for (let image of doc.images){
            let addFile = await tb_uploadfile.create({
                api_name: common.getApiName(req.path),
                file_name: image.file_name,
                file_url: image.file_url,
                file_type: image.file_type,
                file_visible: '1',
                state: GLBConfig.ENABLE,
                srv_id: create.produceacceptance_id
            });
        }

        let retData = JSON.parse(JSON.stringify(create));
        common.sendData(res, retData);
    } catch (error) {
        common.sendFault(res, error);
    }
};
// 修改验收项
async function modifyAcceptanceAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let modify = await tb_acceptance.findOne({
            where: {
                produceacceptance_id: doc.old.produceacceptance_id
            }
        });
        if (modify) {
            modify.acceptance_index = doc.new.acceptance_index;
            modify.produceprocess_id = doc.new.produceprocess_id;
            modify.room_type = doc.new.room_type;
            modify.acceptance_name = doc.new.acceptance_name;
            modify.is_hidden = doc.new.is_hidden;
            modify.technological_require = doc.new.technological_require;
            modify.evidence_require = doc.new.evidence_require;
            modify.upload_format = doc.new.upload_format;
            for (let image of doc.new.images){//增加新上传图片
                let findFine = await tb_uploadfile.findOne({
                    where: {
                        api_name: common.getApiName(req.path),
                        file_url: image.file_url,
                        srv_id:modify.produceacceptance_id
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
                        srv_id: modify.produceacceptance_id
                    });
                }
            }
            let findAll = await tb_uploadfile.findAll({
                where: {
                    api_name: common.getApiName(req.path),
                    srv_id:modify.produceacceptance_id,
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
// 删除验收项
async function deleteAcceptanceAct(req, res){
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;

        let del= await tb_acceptance.findOne({
            where: {
                produceacceptance_id: doc.produceacceptance_id,
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
// 上传
async function uploadAct (req, res) {
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


