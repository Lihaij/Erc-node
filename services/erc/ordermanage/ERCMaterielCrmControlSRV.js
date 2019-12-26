const moment = require('moment');
const common = require('../../../util/CommonUtil');
const GLBConfig = require('../../../util/GLBConfig');
const logger = require('../../../util/Logger').createLogger('ERCMaterielCrmControlSRV');
const model = require('../../../model');
const Sequence = require('../../../util/Sequence');

const sequelize = model.sequelize;
const tb_materiel = model.erc_materiel;
const tb_ordermateriel = model.erc_ordermateriel;
const tb_order = model.erc_order;
const tb_templatemateriel = model.erc_templatemateriel;
const tb_checkmessage = model.erc_checkmessage;
const tb_history = model.erc_history;
const tb_orderroom = model.erc_orderroom;
const tb_common_apidomain = model.common_apidomain;
const ERCTaskListControl = require('../baseconfig/ERCTaskListControlSRV')

exports.initAct = async(req, res) => {
    let doc = common.docTrim(req.body);
    let returnData = {};
    returnData.materielSource = GLBConfig.MATERIELSOURCE;//物料来源
    //查询用户staff_type
    if (doc.order_id && doc.user_id) {
        let queryStr = 'select st.staff_type from tbl_common_user ut inner join tbl_erc_staff st on ut.user_id = st.user_id and st.order_id = ? where ut.user_id = ?';

        let replacements = [doc.order_id, doc.user_id];
        let queryRst = await sequelize.query(queryStr, {
            replacements: replacements,
            type: sequelize.QueryTypes.SELECT
        })
        returnData.staffType = queryRst;
    }

    common.sendData(res, returnData);
};
/**订单中的物料列表，信息由模板、订单、物料三者关联而来，关联关系由【生成物料单】操作建立
 * 用户也可在模板的物料单之外添加物料，所添加的物料应从系统已有的物料列表中选择
 **/
exports.addAct = async(req, res) => {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;
        let changeFlag = 0;
        if (doc.change_flag == 1) {
            changeFlag = doc.change_flag
        }

        if(doc.change_type === '2'){ //减项要在物料管理中物料查找是否存在, 否则不允许减项
            let material = await tb_ordermateriel.findOne({
                where: {
                    change_flag: 0,
                    materiel_id: doc.materiel_id,
                    order_id: doc.order_id,
                    room_id: doc.room_id
                }
            });
            if(!material){
                return common.sendError(res, 'materiel_04');
            }
        }

        let orderRoom = await tb_orderroom.findOne({
            where: {
                order_id: doc.order_id,
                room_id: doc.room_id
            }
        });

        if(!orderRoom){
            return common.sendError(res, 'materiel_08');
        }

        let addOM = await tb_ordermateriel.create({
            order_id: doc.order_id,
            materiel_id: doc.materiel_id,
            materiel_amount: 1,
            materiel_batch: doc.materiel_batch,
            purchase_state: 1, //未采购
            change_flag: changeFlag,
            change_type: doc.change_type,
            change_price: doc.change_price,
            change_state: doc.change_state,
            room_id: doc.room_id,
            room_type: orderRoom.room_type
        });

        if (doc.change_flag) {
            let type = '';
            if (doc.change_type == 1) {
                type = '增项';
            } else if (doc.change_type == 2) {
                type = '减项';
            } else if (doc.change_type == 3) {
                type = '漏项';
            }
            await tb_history.create({
                order_id: doc.order_id,
                order_state: 'SIGNED',
                history_event: '变更管理',
                history_content: type,
                operator_name: user.name
            })
        }

        let retData = JSON.parse(JSON.stringify(addOM));
        common.sendData(res, retData);
    } catch (error) {
        common.sendFault(res, error);
    }
};
exports.searchAct = async(req, res) => {
    try {
        let doc = common.docTrim(req.body),
            user = req.user,
            returnData = {};
        let queryStr = `select om.*, m.materiel_id,m.materiel_code,m.materiel_name,m.materiel_format,
            m.materiel_unit,m.materiel_source,m.materiel_type,m.materiel_cost,m.materiel_sale,
            m.materiel_procedure,m.materiel_amto
            from tbl_erc_ordermateriel om left join tbl_erc_materiel m on om.materiel_id = m.materiel_id
            where om.state = ? and om.order_id = ? and om.change_flag = ?`;

        // let queryStr = `select * from tbl_erc_ordermateriel om left join tbl_erc_materiel m on om.materiel_id = m.materiel_id
        // where om.state = ? and m.state = ? and order_id = ? and om.change_flag = ?`;
        let changeFlag = 0;
        if (doc.change_flag == 1) {
            changeFlag = doc.change_flag;
        }
        let replacements = [GLBConfig.ENABLE, doc.order_id, changeFlag];

        if (doc.search_text) {
            queryStr += ' and (m.materiel_code like ? or m.materiel_name like ? or m.materiel_format like ?)'
            let search_text = '%' + doc.search_text + '%';
            replacements.push(search_text);
            replacements.push(search_text);
            replacements.push(search_text);
        }
        if (doc.purchase_state) {
            queryStr += ` and om.purchase_state = ? `;
            replacements.push(doc.purchase_state);
        }
        if (doc.materiel_batch) {
            queryStr += ` and om.materiel_batch = ? `;
            replacements.push(doc.materiel_batch);
        }
        if (doc.room_id) {
            queryStr += ` and om.room_id = ? `;
            replacements.push(doc.room_id);
        }
        if (doc.change_type) {
            queryStr += ` and om.change_type = ? `;
            replacements.push(doc.change_type);
        }
        if (doc.materiel_source){//2集团采购，1属地采购
            queryStr +=' and m.materiel_source = ?';
            replacements.push(doc.materiel_source);
        }
        if (doc.materiel_procedure){//工序
            queryStr +=' and m.materiel_procedure = ?';
            replacements.push(doc.materiel_procedure);
        }
        queryStr+=' order by field(m.materiel_amto,2,1,3),m.materiel_id';
        let result = await common.queryWithCount(sequelize, req, queryStr, replacements);
        returnData.total = result.count;
        returnData.rows = result.data;

        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
    }
};

async function queryMaterialList(doc, room_id) {
    try {
        let returnData = {};
        let queryStr = `select om.*, m.materiel_id,m.materiel_code,m.materiel_name,m.materiel_format,
            m.materiel_unit,m.materiel_source,m.materiel_type,m.materiel_cost,m.materiel_sale,
            m.materiel_procedure,m.materiel_amto
            from tbl_erc_ordermateriel om left join tbl_erc_materiel m on om.materiel_id = m.materiel_id
            where om.state = ? and m.state = ? and order_id = ? and om.change_flag = ?`;

        // let queryStr = `select * from tbl_erc_ordermateriel om left join tbl_erc_materiel m on om.materiel_id = m.materiel_id
        // where om.state = ? and m.state = ? and order_id = ? and om.change_flag = ?`;
        let changeFlag = 0;
        if (doc.change_flag == 1) {
            changeFlag = doc.change_flag;
        }
        let replacements = [GLBConfig.ENABLE, GLBConfig.ENABLE, doc.order_id, changeFlag];

        if (doc.search_text) {
            queryStr += ' and (m.materiel_code like ? or m.materiel_name like ? or m.materiel_format like ?)'
            let search_text = '%' + doc.search_text + '%';
            replacements.push(search_text);
            replacements.push(search_text);
            replacements.push(search_text);
        }
        if (doc.purchase_state) {
            queryStr += ` and om.purchase_state = ? `;
            replacements.push(doc.purchase_state);
        }
        if (doc.materiel_batch) {
            queryStr += ` and om.materiel_batch = ? `;
            replacements.push(doc.materiel_batch);
        }
        if (room_id) {
            queryStr += ` and om.room_id = ? `;
            replacements.push(room_id);
        }
        if (doc.change_type) {
            queryStr += ` and om.change_type = ? `;
            replacements.push(doc.change_type);
        }
        if (doc.materiel_source){//2集团采购，1属地采购
            queryStr +=' and m.materiel_source = ?';
            replacements.push(doc.materiel_source);
        }
        if (doc.materiel_procedure){//工序
            queryStr +=' and m.materiel_procedure = ?';
            replacements.push(doc.materiel_procedure);
        }
        queryStr+=' order by m.materiel_code '
        let result = await common.queryWithDocCount(sequelize, doc, queryStr, replacements);
        returnData.total = result.count;
        returnData.rows = result.data;

        return {
            success: true,
            data: returnData
        };
    } catch (error) {
        return {
            success: false,
            data: error
        };
    }
}

exports.searchArrayAct = async(req, res) => {
    let doc = common.docTrim(req.body);
    let resultArray = [];
    for (let i = 0; i < doc.room_ids.length; i++) {
        let result = await queryMaterialList(doc, doc.room_ids[i]);
        if (result.success) {
            resultArray.push({
                id: doc.room_ids[i],
                name: doc.room_names[i],
                data: result.data
            });
        }
    }

    common.sendData(res, resultArray);
};
// 查询物料
exports.searchMat = async(req, res) => {
    try {
        let doc = common.docTrim(req.body),returnData = {},replacements = [];

        let user = req.user,api_name = 'ERCMATERIELCONTROL',dlist = [];

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
            where m.state=1 and m.materiel_source in (1,2,3) and m.domain_id ` + queryInStr;

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
// 修改订单物料
exports.modifyAct = async(req, res) => {
    try {
        let doc = common.docTrim(req.body),user = req.user;
        let modiMateriel = await tb_ordermateriel.findOne({
            where: {
                ordermateriel_id: doc.old.ordermateriel_id
            }
        });

        let room = await tb_orderroom.findOne({
            where: {
                order_id: doc.new.order_id,
                room_id: doc.new.room_id
            }
        });

        let sameRoomType = await tb_ordermateriel.findOne({
            where: {
                order_id: doc.new.order_id,
                materiel_id: doc.new.materiel_id,
                room_id: doc.new.room_id
            }
        });

        if (doc.new.change_type==2 &&(sameRoomType.materiel_amount <doc.new.materiel_amount || doc.new.materiel_amount<=0) ){
            common.sendError(res, 'change_modify');
            return
        }

        if (sameRoomType && sameRoomType.ordermateriel_id != doc.new.ordermateriel_id && doc.new.change_flag != 1) {
            common.sendError(res, 'template_material_01');
            return
        }

        if (modiMateriel) {
            modiMateriel.room_id = doc.new.room_id;
            modiMateriel.materiel_amount = doc.new.materiel_amount;
            modiMateriel.materiel_batch = doc.new.materiel_batch;
            modiMateriel.materiel_state = doc.new.purchase_state;
            modiMateriel.purchase_code = doc.new.purchase_code;
            modiMateriel.purchase_id = doc.new.purchase_id;
            modiMateriel.change_price = doc.new.change_price;
            modiMateriel.change_state = doc.new.change_state;
            modiMateriel.room_type = room.room_type;
            modiMateriel.ordermateriel_remark = doc.new.ordermateriel_remark;
            await modiMateriel.save()
        } else {
            common.sendError(res, 'materiel_01');
            return
        }

        let materiel = await tb_materiel.findOne({
            where: {
                materiel_id: doc.new.materiel_id
            }
        });

        if(materiel){
            materiel.materiel_cost = doc.new.materiel_cost;
            await materiel.save()
        }

        if(doc.new.change_flag == 1 && doc.new.change_state == 1 && doc.new.task_performer) {
            let groupID = common.getUUIDByTime(30);
            ERCTaskListControl.createTask(user, '物料变更审核'+materiel.materiel_code, '8', doc.new.task_performer,
                modiMateriel.order_id, doc.new.task_description, modiMateriel.ordermateriel_id ,groupID)
        }

        let retData = JSON.parse(JSON.stringify(modiMateriel));
        common.sendData(res, retData);

    } catch (error) {
        common.sendFault(res, error);
        return null
    }
};

exports.changeStateAct = async(req, res) => {
    try {
        let doc = common.docTrim(req.body);
        let modiMateriel = await tb_ordermateriel.findOne({
            where: {
                ordermateriel_id: doc.ordermateriel_id
            }
        });
        if (modiMateriel) {
            modiMateriel.change_state = doc.change_state;
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
};
// 删除订单物料
exports.deleteAct = async(req, res) => {
    try {
        let doc = common.docTrim(req.body);
        let delMateriel = await tb_ordermateriel.findOne({
            where: {
                ordermateriel_id: doc.ordermateriel_id,
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
// check物料增加与减少的逻辑
exports.checkAct = async(req, res) => {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;

        let materiel = await tb_ordermateriel.findOne({
            where: {
                ordermateriel_id: doc.ordermateriel_id
            }
        });

        if (!materiel) {
            return common.sendError(res, 'materiel_01')
        }

        let addCm = await tb_checkmessage.create({
            check_message: doc.check_message,
            check_state: doc.check_state,
            operater_id: doc.checker_id,
            operater_name: doc.checker_name,
            check_owner: doc.check_owner,
            check_type: doc.check_type,
            ordermateriel_id: doc.ordermateriel_id
        });
        let retData = JSON.parse(JSON.stringify(addCm));
        retData.created_time = moment(addCm.created_at).format("YYYY-MM-DD HH:mm")

        if (doc.check_state === '1') //驳回 CHECKSTATEINFO
        {
            materiel.change_state = '3'
            await materiel.save()

        } else if (doc.check_state === '2') { //通过
            materiel.change_state = '2'
            await materiel.save();

            let om = await tb_ordermateriel.findOne({
                where: {
                    change_flag: 0,
                    materiel_id: materiel.materiel_id,
                    order_id: materiel.order_id,
                    room_id: materiel.room_id
                }
            });

            if(materiel.change_type === '2'){ //减项时，materiel_amount减到0时，删除此物料
                if(om){
                    if(om.materiel_amount - materiel.materiel_amount <= 0){
                        await tb_ordermateriel.destroy({
                            where: {
                                ordermateriel_id: om.ordermateriel_id
                            }
                        })
                    }
                }
            } else {
                if(om){
                    if(materiel.materiel_amount >0){
                        om.materiel_amount = om.materiel_amount + materiel.materiel_amount;
                        await om.save();
                    }
                } else {
                    if(materiel.materiel_amount >0){
                        await tb_ordermateriel.create({
                            order_id: materiel.order_id,
                            materiel_id: materiel.materiel_id,
                            materiel_amount: materiel.materiel_amount,
                            materiel_batch: materiel.materiel_batch,
                            purchase_state: 1, //未采购
                            change_flag: 0,
                            room_id: materiel.room_id,
                            room_type: materiel.room_type
                        })
                    }
                }
            }
        }

        common.sendData(res, retData);
    } catch (error) {
        common.sendFault(res, error);
    }
}
// 查询历史
exports.searchChangeHistoryAct = async(req, res) => {
    try {
        let doc = common.docTrim(req.body);
        let returnData = [];
        let queryStr = 'select * from tbl_erc_checkmessage t where t.check_type = "CHANGE" and t.ordermateriel_id = ? order by t.created_at desc';

        let replacements = [doc.ordermateriel_id];

        let queryRst = await sequelize.query(queryStr, {
            replacements: replacements,
            type: sequelize.QueryTypes.SELECT
        })

        for (let r of queryRst) {
            let result = JSON.parse(JSON.stringify(r));
            result.create_date = r.created_at.Format("yyyy-MM-dd");
            if (result.check_state == 2) {
                result.check_state = '通过'
            } else if (result.check_state == 1) {
                result.check_state = '驳回'
            }
            returnData.push(result)
        }
        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
    }
};
// 发送任务
exports.reviewMaterialTask = async(user, reviewState, orderMaterialId, taskRemark) => {
    let materiel = await tb_ordermateriel.findOne({
        where: {
            ordermateriel_id: orderMaterialId
        }
    });

    let addCm = await tb_checkmessage.create({
        check_message: taskRemark,
        check_state: '1',
        operater_id: user.user_id,
        operater_name: user.name,
        check_owner: '0',
        check_type: 'CHANGE',
        ordermateriel_id: orderMaterialId
    });

    if (reviewState === '1') //驳回 CHECKSTATEINFO
    {
        materiel.change_state = '3';
        await materiel.save()

    } else if (reviewState === '2') { //通过
        materiel.change_state = '2';
        await materiel.save();

        let om = await tb_ordermateriel.findOne({
            where: {
                change_flag: 0,
                materiel_id: materiel.materiel_id,
                order_id: materiel.order_id,
                room_id: materiel.room_id
            }
        });

        if(materiel.change_type === '2'){ //减项时，materiel_amount减到0时，删除此物料
            if(om){
                if(om.materiel_amount - materiel.materiel_amount <= 0){
                    await tb_ordermateriel.destroy({
                        where: {
                            ordermateriel_id: om.ordermateriel_id
                        }
                    })
                }
            }
        } else {
            if(om){
                if(materiel.materiel_amount >0){
                    om.materiel_amount = om.materiel_amount + materiel.materiel_amount;
                    await om.save();
                }
            } else {
                if(materiel.materiel_amount >0){
                    await tb_ordermateriel.create({
                        order_id: materiel.order_id,
                        materiel_id: materiel.materiel_id,
                        materiel_amount: materiel.materiel_amount,
                        materiel_batch: materiel.materiel_batch,
                        purchase_state: 1, //未采购
                        change_flag: 0,
                        room_id: materiel.room_id,
                        room_type: materiel.room_type
                    })
                }
            }
        }
    }
};
