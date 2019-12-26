/**
 * Created by Cici on 2018/5/29.
 */
/*资产盘点管理*/
const common = require('../../../util/CommonUtil');
const GLBConfig = require('../../../util/GLBConfig');
const logger = require('../../../util/Logger').createLogger('ERCWeeklyPlanControl');
const model = require('../../../model');
const Sequence = require('../../../util/Sequence');
const FDomain = require('../../../bl/common/FunctionDomainBL');
const task = require('../baseconfig/ERCTaskListControlSRV');
const sequelize = model.sequelize;
const moment = require('moment');

const tb_domain = model.common_domain;
const tb_user = model.common_user;

const tb_longassettakestock = model.erc_longassettakestock;//资产盘点管理列表
const tb_longassettakestockdetail = model.erc_longassettakestockdetail;//资产盘点管理详情
const tb_consumablesdetail = model.erc_consumablesdetail;//低值易耗品列表
const tb_fixedassetscheckdetail = model.erc_fixedassetscheckdetail;//固定资产验收
const tb_amortize = model.erc_amortize;//待摊资产
const tb_common_user = model.common_user;
const tb_uploadfile = model.erc_uploadfile;
const tb_task = model.erc_task;

exports.ERCTakeStockResource = (req, res) => {
    let method = req.query.method;
    if (method === 'init') {
        initData(req, res);
    } else if (method === 'search') {
        searchAct(req, res);
    } else if (method === 'searchDetail') {
        searchDetailAct(req, res);
    } else if (method === 'add') {
        addAct(req, res)
    } else if (method === 'addDetail') {
        addDetailAct(req, res)
    } else if (method === 'remove') {
        removeAct(req, res)
    } else if (method === 'removeDetail') {
        removeDetailAct(req, res)
    } else if (method === 'modify') {
        modifyAct(req, res)
    } else if (method === 'modifyDetail') {
        modifyDetailAct(req, res)
    } else if (method === 'changeGroupAct') {
        changeGroupAct(req, res);
    } else if (method === 'searchAsset') {
        //定资产，待摊资产，低值易耗品查询
        searchAssetAct(req, res);
    }  else if (method === 'modifyAsset') {
        //修改固定资产，待摊资产，低值易耗品
        modifyAssetAct(req, res);
    }  else if (method === 'search_dt') {
        searchDetailTopAct(req, res);
    }  else if (method === 'submit') {
        submitAct(req, res);
    }   else if (method === 'confirm') {
        confirmAct(req, res);
    } else if (method === 'search_lt') {
        searchUserDetailTopAct(req, res);
    }  else {
        common.sendError(res, 'common_01')
    }

}

async function initData(req, res) {
    try {
        let doc = common.docTrim(req.body), user = req.user, returnData = {};
        returnData.TAKES_STOCK_STATUS = GLBConfig.TAKES_STOCK_STATUS;//盘点状态
        returnData.TAKES_STOCK_FLAG = GLBConfig.TAKES_STOCK_FLAG;//盈亏状态
        returnData.scraptype = GLBConfig.SCRAPTYPE;//报废标志
        returnData.userInfo = req.user;

        common.sendData(res, returnData)
        return
    } catch (error) {
        logger.error('ERCConsumablesControlResource-initData:' + err);
        common.sendFault(res, err);
    }
}

async function searchAct(req, res) {
    try {
        let doc = common.docTrim(req.body), user = req.user, returnData = {};

        let queryStr = 'select b.*,c.name from tbl_common_domain a ' +
            'left join tbl_erc_longassettakestock b on a.domain_id = b.domain_id ' +
            'left join tbl_common_user c on b.take_stock_confirm_id = c.user_id ' +
            'where b.domain_id = ? and b.state = ? and b.user_id = ?';
        let replacements = [user.domain_id, GLBConfig.ENABLE, user.user_id];

        if (doc.search_text) {
            queryStr += 'and (b.take_stock_no like ? or c.name like ?)';
            replacements.push('%' + doc.search_text + '%');
            replacements.push('%' + doc.search_text + '%');
        }

        let result = await common.queryWithCount(sequelize, req, queryStr, replacements);

        returnData.total = result.count;
        returnData.rows = [];

        for (var i of result.data) {
            let temy = JSON.parse(JSON.stringify(i));
            temy.created_at = i.created_at ? moment(i.created_at).format("YYYY-MM-DD HH:mm") : null;
            temy.release_time = i.release_time ? moment(i.release_time).format("YYYY-MM-DD HH:mm") : null;
            temy.take_stock_confirm_time = i.take_stock_confirm_time ? moment(i.take_stock_confirm_time).format("YYYY-MM-DD HH:mm") : null;
            returnData.rows.push(temy);
        }

        common.sendData(res, returnData);

    } catch (err) {
        logger.error('ERCTakeStockSRV-searchAct:' + err);
        common.sendFault(res, err);
    }
}

async function searchDetailAct(req, res) {
    try {
        let doc = common.docTrim(req.body), user = req.user, returnData = {};

        let queryStr = 'select a.*,t.name,t.p_usergroup_id,t.user_id,pt.position_name,dt.department_name ' +
            'from tbl_erc_longassettakestockdetail a ' +
            'left join tbl_common_user t on a.take_stock_people_id = t.user_id ' +
            'left join tbl_erc_customer ct on ct.user_id = a.take_stock_people_id ' +
            'left join tbl_erc_custorgstructure ot on a.take_stock_people_id = ot.user_id and ot.state=1 ' +
            'left join tbl_erc_department dt on ot.department_id = dt.department_id and dt.state=1 ' +
            'left join tbl_erc_position pt on ot.position_id = pt.position_id and pt.state=1 ' +
            'where a.domain_id = ? and a.state = ? and a.take_stock_parent_no = ?';

        let replacements = [user.domain_id, GLBConfig.ENABLE,doc.take_stock_parent_no];

        if (doc.search_text) {
            queryStr += 'and (a.take_stock_people_id like ? or t.name like ?)';
            replacements.push('%' + doc.search_text + '%');
            replacements.push('%' + doc.search_text + '%');
        }

        let result = await common.queryWithCount(sequelize, req, queryStr, replacements);

        returnData.total = result.count;
        returnData.rows = [];

        for (var i of result.data) {
            let temy = JSON.parse(JSON.stringify(i));
            temy.created_at = i.created_at ? moment(i.created_at).format("YYYY-MM-DD HH:mm") : null;
            returnData.rows.push(temy);
        }

        common.sendData(res, returnData);

    } catch (err) {
        logger.error('ERCTakeStockSRV-searchAct:' + err);
        common.sendFault(res, err);
    }
}

async function addAct(req, res) {
    try {
        let doc = common.docTrim(req.body), user = req.user, take_stock_no = '';

        if (!doc.take_stock_confirm_id) {
            common.sendError(res, 'takestock_01');
            return
        }

        take_stock_no = await Sequence.getTakeStockNo()
        let addData = await tb_longassettakestock.create({
            take_stock_no: take_stock_no,
            domain_id: user.domain_id,
            user_id: user.user_id,
            user_name: user.name,
            take_stock_confirm_id: doc.take_stock_confirm_id,//指派人ID
            take_stock_status: GLBConfig.TAKES_STOCK_STATUS[0].value
        })

        common.sendData(res, take_stock_no);
        return

    } catch (err) {
        logger.error('ERCTakeStockSRV-addAct:' + err);
        common.sendFault(res, err);
    }
}

async function addDetailAct(req, res) {
    try {
        let doc = common.docTrim(req.body), user = req.user, take_stock_no = '';

        if (!doc.take_stock_people_id) {
            common.sendError(res, 'takestock_03');
            return
        }
        let longassettakestockdetail = await tb_longassettakestockdetail.findOne({
            where: {
                take_stock_parent_no: doc.take_stock_parent_no,
                state: GLBConfig.ENABLE,
                take_stock_people_id: doc.take_stock_people_id
            }
        });
        if (longassettakestockdetail) {
            common.sendError(res, 'takestock_05');
            return
        }

        let addData = await tb_longassettakestockdetail.create({
            take_stock_parent_no: doc.take_stock_parent_no,
            domain_id: user.domain_id,
            user_id: user.user_id,
            take_stock_people_id: doc.take_stock_people_id,
            take_stock_detail_status: GLBConfig.TAKES_STOCK_STATUS[0].value
        })

        common.sendData(res, take_stock_no);
        return

    } catch (err) {
        logger.error('ERCTakeStockSRV-addAct:' + err);
        common.sendFault(res, err);
    }
}


async function modifyAct(req, res) {
    try {
        let doc = common.docTrim(req.body), user = req.user;

        let consumable = await tb_longassettakestock.findOne({
            where: {
                take_stock_id: doc.take_stock_id
            }
        })

        if (consumable) {
            consumable.take_stock_confirm_id = doc.take_stock_confirm_id;
            await consumable.save();
            common.sendData(res, consumable);
            return
        } else {
            common.sendError(res, 'takestock_02');
            return
        }

    } catch (error) {
        logger.error('ERCTakeStockSRV-modifyAct' + error);
        common.sendFault(res, error)
    }
}

async function modifyDetailAct(req, res) {
    try {
        let doc = common.docTrim(req.body), user = req.user;

        let consumable = await tb_longassettakestockdetail.findOne({
            where: {
                take_stock_detail_id: doc.take_stock_detail_id
            }
        })

        if (consumable) {
            consumable.take_stock_people_id = doc.take_stock_people_id;
            await consumable.save();
            common.sendData(res, consumable);
            return
        } else {
            common.sendError(res, 'takestock_02');
            return
        }

    } catch (error) {
        logger.error('ERCTakeStockSRV-modifyAct' + error);
        common.sendFault(res, error)
    }
}

async function removeAct(req, res) {
    try {
        let doc = common.docTrim(req.body), user = req.user;

        let consumables = await tb_longassettakestock.findOne({
            where: {
                take_stock_id: doc.take_stock_id
            }
        })

        if (consumables) {
            consumables.state = GLBConfig.DISABLE;
            await consumables.save();
            common.sendData(res, consumables);
            return
        } else {
            common.sendError(res, 'takestock_02');
            return
        }
    } catch (err) {
        logger.error('ERCTakeStockSRV-removeAct' + error);
        common.sendFault(res, err);
    }
}

async function removeDetailAct(req, res) {
    try {
        let doc = common.docTrim(req.body), user = req.user;

        let takestock = await tb_longassettakestockdetail.findOne({
            where: {
                take_stock_detail_id: doc.take_stock_detail_id
            }
        })

        if (takestock) {
            takestock.state = GLBConfig.DISABLE;
            await takestock.save();
            common.sendData(res, takestock);
            return
        } else {
            common.sendError(res, 'takestock_02');
            return
        }
    } catch (err) {
        logger.error('ERCTakeStockSRV-removeAct' + error);
        common.sendFault(res, err);
    }
}


async function changeGroupAct(req, res) {
    try {
        let doc = common.docTrim(req.body),
            user = req.user,
            returnData = {};

        let u = doc.users[0]

        let meeting = await tb_user.findOne({
            where: {
                domain_id: u.domain_id,
                user_id: u.user_id
            }
        });
        returnData.userId = meeting.user_id;
        returnData.userName = meeting.name;

        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
        return
    }
}

async function searchAssetAct(req, res) {
    try {
        let doc = common.docTrim(req.body), user = req.user;
        let returnData = {};
        let replacements =[];
        let queryStr='';

        let takestock = await tb_longassettakestockdetail.findOne({
            where: {
                take_stock_detail_id: doc.take_stock_detail_id
            }
        })

        if (takestock) {
            if(doc.scrap_type==1){
                //固定资产
                queryStr='select * from tbl_erc_fixedassetscheckdetail t  ' +
                    'inner join tbl_erc_fixedassetscheck tt on (t.fixedassetscheck_id = tt.fixedassetscheck_id and tt.check_state=3 and tt.state=1)' +
                    'left join tbl_erc_department dt on t.department_id = dt.department_id and dt.state=1 ' +
                    'where t.state=1 and t.scrap_flag = 1  and tt.domain_id = ? ';
                // queryStr += ' order by t.created_at';
                replacements.push(user.domain_id);
                if (doc.search_text) {
                    queryStr += ' and (t.fixedassets_no like ? or t.fixedassets_name like ?) ';
                    replacements.push('%' + doc.search_text + '%');
                    replacements.push('%' + doc.search_text + '%');
                }
                if(takestock.take_stock_people_id){
                    queryStr += ' and t.user_id = ? ';
                    replacements.push(takestock.take_stock_people_id);

                }

                let resultF = await common.queryWithCount(sequelize, req, queryStr, replacements);

                returnData.total = resultF.count;
                returnData.rows = [];

                for (var i of resultF.data) {
                    var row = JSON.parse(JSON.stringify(i));
                    row.files = [];
                    let f = await tb_uploadfile.findAll({
                        where: {
                            order_id: row.fixedassetscheckdetail_id,
                            srv_id: row.fixedassetscheckdetail_id,
                            srv_type:row.fixedassetscheckdetail_id,
                            state: GLBConfig.ENABLE
                        }
                    })
                    if (f.length > 0) {
                        row.files = f;
                    }
                    returnData.rows.push(row);
                }
                common.sendData(res, returnData);
                return

            }else if(doc.scrap_type==2){
                //待摊资产
                queryStr= `select a.*,d.department_name,
                    u1.name as amortize_manager,u2.name as amortize_creator,u3.name as amortize_acceptor,u4.name as amortize_examine   
                    from tbl_erc_amortize a 
                    left join tbl_erc_department d on (a.amortize_departmant_id = d.department_id and d.state = 1)
                    left join tbl_common_user u1 on (a.amortize_manager = u1.user_id and u1.state=1)
                    left join tbl_common_user u2 on (a.amortize_creator = u2.user_id and u2.state=1)
                    left join tbl_common_user u3 on (a.amortize_acceptor = u3.user_id and u3.state=1)
                    left join tbl_common_user u4 on (a.amortize_examine = u4.user_id and u4.state=1)
                    where a.state=1 and a.amortize_check_state = 2 and a.scrap_flag = 1 and a.domain_id = ? `;

                // queryStr += ' order by t.created_at';
                replacements.push(user.domain_id);
                if (doc.search_text) {
                    queryStr += ' and (a.amortize_code like ? or a.amortize_name like ?)';
                    replacements.push('%' + doc.search_text + '%');
                    replacements.push('%' + doc.search_text + '%');
                }
                if(takestock.take_stock_people_id){
                    queryStr += ' and a.amortize_manager = ? ';
                    replacements.push(takestock.take_stock_people_id);

                }

                let resultA = await common.queryWithCount(sequelize, req, queryStr, replacements);

                returnData.total = resultA.count;
                returnData.rows = resultA.data;

                common.sendData(res, returnData);
                return

            }else if(doc.scrap_type==3) {
                //低值易耗品
                queryStr = 'select t.*,dt.department_id,dt.department_name from tbl_erc_consumablesdetail t ' +
                    'left join tbl_erc_custorgstructure ot on t.consumables_administrator_id = ot.user_id and ot.state=1 ' +
                    'left join tbl_erc_department dt on t.department_id = dt.department_id and dt.state=1 ' +
                    'where t.domain_id = ? and t.state = ? and t.consumables_detail_type_id = ? ' +
                    'and t.consumables_detail_status = ? and t.scrap_flag = ?';
                replacements.push(user.domain_id);
                replacements.push(GLBConfig.ENABLE);
                replacements.push(GLBConfig.LOW_VALUE_ACCEPTANCE_TYPE[1].value);
                replacements.push(GLBConfig.LOW_VALUE_STATUS[3].value);
                replacements.push(GLBConfig.SCRAPTYPE[1].value);
                if (doc.search_text) {
                    queryStr += ' and (t.consumables_detail_code like ? or t.consumables_name like ?)';
                    replacements.push('%' + doc.search_text + '%');
                    replacements.push('%' + doc.search_text + '%');
                }
                if (takestock.take_stock_people_id) {
                    queryStr += ' and t.consumables_administrator_id = ? ';
                    replacements.push(takestock.take_stock_people_id);
                }

                let resultC = await common.queryWithCount(sequelize, req, queryStr, replacements);

                returnData.total = resultC.count;
                returnData.rows = [];


                for (var i of resultC.data) {
                    var row = JSON.parse(JSON.stringify(i));
                    row.files = [];
                    let f = await tb_uploadfile.findAll({
                        where: {
                            order_id: row.consumables_detail_id,
                            srv_id: row.consumables_detail_id,
                            srv_type: row.consumables_detail_id,
                            state: GLBConfig.ENABLE
                        }
                    })
                    if (f.length > 0) {
                        row.files = f;
                    }
                    returnData.rows.push(row);
                }
                common.sendData(res, returnData);
                return

            }

        } else {
            common.sendError(res, 'takestock_02');
            return
        }

    } catch (error) {
        common.sendFault(res, error);
        return
    }
}



async function modifyAssetAct(req,res){
    try{
        let doc = common.docTrim(req.body);
        let returnData = {};
        let replacements =[];
        let queryStr='';
        let modify_id= '';
        
        if(doc.old.fixedassetscheckdetail_id!=null){
            modify_id = doc.old.fixedassetscheckdetail_id
            //固定资产
            let f_data = await tb_fixedassetscheckdetail.findOne({
                where:{
                    fixedassetscheckdetail_id:modify_id,
                    state:GLBConfig.ENABLE
                }
            })

            if(f_data){
                f_data.take_stock_flag=doc.new.take_stock_flag;
                f_data.take_stock_description=doc.new.take_stock_description;
                await f_data.save();
                return  common.sendData(res, f_data);
            }else {
                return common.sendError(res, 'takestock_04');
            }
        }else if(doc.old.amortize_id!=null){
            //待摊资产
            modify_id = doc.old.amortize_id
            let a_data = await tb_amortize.findOne({
                where:{
                    amortize_id:modify_id,
                    state:GLBConfig.ENABLE
                }
            })

            if(a_data){
                a_data.take_stock_flag=doc.new.take_stock_flag;
                a_data.take_stock_description=doc.new.take_stock_description;
                await a_data.save();
                return  common.sendData(res, a_data);
            }else {
                return  common.sendError(res, 'takestock_04');
            }
        }else if(doc.old.consumables_detail_id!=null){
            //低值易耗品
            modify_id = doc.old.consumables_detail_id
            let c_data = await tb_consumablesdetail.findOne({
                where:{
                    consumables_detail_id:modify_id,
                    state:GLBConfig.ENABLE
                }
            })

            if(c_data){
                c_data.take_stock_flag=doc.new.take_stock_flag;
                c_data.take_stock_description=doc.new.take_stock_description;
                await c_data.save();
                return  common.sendData(res, c_data);
            }else {
                return common.sendError(res, 'takestock_04');
            }
        }

    }catch(error){
        common.sendFault(res, error);
        return
    }
}

async function searchDetailTopAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;
        let longassettakestock = await tb_longassettakestock.findOne({
            where: {
                take_stock_no: doc.take_stock_no
            }
        });

        common.sendData(res, longassettakestock);
    } catch (error) {
        common.sendFault(res, error);
        return
    }
}


async function submitAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;
        //校验是否分配任务处理人员

        let longassettakestock = await tb_longassettakestock.findOne({
            where: {
                take_stock_no: doc.take_stock_no,
                state: GLBConfig.ENABLE
            }
        });
        if (!longassettakestock) {
            return common.sendError(res, 'takestock_04');
        } else {
            longassettakestock.release_time=new Date();
            longassettakestock.save();
            //提交盘点
            let taskName = '盘点审批任务';
            let taskDescription = doc.take_stock_no + '  盘点审批任务';
            let groupId = common.getUUIDByTime(30);
            // user, taskName, taskType, taskPerformer, taskReviewCode, taskDescription, reviewId, taskGroup
            let taskResult = await task.createTask(user, taskName, 43, longassettakestock.take_stock_confirm_id, longassettakestock.take_stock_no, taskDescription, '', groupId);
            if (!taskResult) {
                return common.sendError(res, 'task_01');
            } else {
                longassettakestock.take_stock_status = GLBConfig.TAKES_STOCK_STATUS[1].value;
                await longassettakestock.save();
                let longassettakestockdetail = await tb_longassettakestockdetail.findAll({
                    where: {
                        take_stock_parent_no: doc.take_stock_no,
                        state: GLBConfig.ENABLE
                    }
                });

                for (let l of longassettakestockdetail) {
                    l.take_stock_detail_status = GLBConfig.TAKES_STOCK_STATUS[1].value;
                    await l.save();
                }
                common.sendData(res, longassettakestock);
            }
        }
    } catch (error) {
        common.sendFault(res, error)
        return
    }
}


async function confirmAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;

        let longassettakestock = await tb_longassettakestock.findOne({
            where: {
                take_stock_no: doc.take_stock_no,
                state: GLBConfig.ENABLE
            }
        });

        if (longassettakestock) {
            //盘点完成
            longassettakestock.take_stock_status = GLBConfig.TAKES_STOCK_STATUS[2].value;
            longassettakestock.take_stock_confirm_time=new Date();
            await longassettakestock.save();
            let longassettakestockdetail = await tb_longassettakestockdetail.findAll({
                where: {
                    take_stock_parent_no: doc.take_stock_no,
                    state: GLBConfig.ENABLE
                }
            });
            for (let l of longassettakestockdetail) {
                l.take_stock_detail_status = GLBConfig.TAKES_STOCK_STATUS[2].value;
                await l.save();
            }
            let taskName = '盘点完成消息通知';
            let taskDescription = doc.take_stock_no + '  盘点完成消息通知';
            let groupId = common.getUUIDByTime(30);
            // user, taskName, taskType, taskPerformer, taskReviewCode, taskDescription, reviewId, taskGroup
            let taskResult = await task.createTask(user, taskName, 44, longassettakestock.user_id, longassettakestock.take_stock_no, taskDescription, '', groupId);
            if (!taskResult) {
                return common.sendError(res, 'task_01');
            } else {
                //任务完成
                let task = await tb_task.findOne({
                    where: {
                        task_id: doc.task_id,
                        state: GLBConfig.ENABLE
                    }
                });

                if (task) {
                    task.task_state = '3';
                    await task.save();
                    common.sendData(res, longassettakestock);
                } else {
                    return common.sendError(res, 'task_01');
                }
                return common.sendError(res, 'task_01');
            }

        } else {
            common.sendError(res, 'takestock_02');
            return
        }

    } catch (error) {
        common.sendFault(res, error)
        return
    }
}

async function searchUserDetailTopAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;
        let longassettakestockdetail = await tb_longassettakestockdetail.findOne({
            where: {
                take_stock_parent_no: doc.take_stock_parent_no
            }
        });

        common.sendData(res, longassettakestockdetail);
    } catch (error) {
        common.sendFault(res, error);
        return
    }
}