/**
 * Created by shuang.liu on 18/6/4.
 */
const common = require('../../../util/CommonUtil');
const GLBConfig = require('../../../util/GLBConfig');
const Sequence = require('../../../util/Sequence');
const logger = require('../../../util/Logger').createLogger('ERCAssetRetirementControlSRV');
const model = require('../../../model');
const task = require('../baseconfig/ERCTaskListControlSRV');
const moment = require('moment');

const sequelize = model.sequelize;
const tb_longassetsscrap = model.erc_longassetsscrap;
const tb_longassetsscrapdetail = model.erc_longassetsscrapdetail;
const tb_taskallot = model.erc_taskallot;
const tb_taskallotuser = model.erc_taskallotuser;
const tb_amortize = model.erc_amortize;
const tb_consumablesdetail = model.erc_consumablesdetail;
const tb_fixedassetscheckdetail = model.erc_fixedassetscheckdetail;
const tb_department = model.erc_department;

exports.ERCAssetRetirementControlResource = (req, res) => {
    let method = req.query.method
    if (method === 'init') {
        initAct(req, res);
    } else if (method === 'search_s') {
        searchScrapAct(req, res)
    } else if (method === 'add_s') {
        addScrapAct(req, res)
    } else if (method === 'search_d') {
        searchScrapDetailAct(req, res)
    } else if (method === 'add_d') {
        addScrapDetailAct(req, res)
    } else if (method === 'modify_d') {
        modifyScrapDetailAct(req, res)
    } else if (method === 'delete_d') {
        deleteScrapDetailAct(req, res)
    } else if (method === 'search_a') {
        searchAssetAct(req, res)
    } else if (method === 'submit') {
        submitAct(req, res)
    } else if (method === 'search_adt') {
        searchAssetDetailTopAct(req, res)
    } else if (method === 'add_db') {
        addScrapBeforeDetailAct(req, res)
    } else if (method === 'submit_d') {
        submitDetailAct(req, res)
    } else {
        common.sendError(res, 'common_01')
    }
}
//初始化审批状态，固定资产分类，归属部门
async function initAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;
        let returnData = {};
        returnData.purchstate = GLBConfig.STOCKORDERSTATE;//审批状态
        returnData.fixedassetstype = GLBConfig.FIXEDASSETS;//固定资产分类
        returnData.departmentInfo = [];//归属部门
        let userGroup = await tb_department.findAll({
            where: {
                domain_id: user.domain_id,
                department_state: 1
            }
        });
        for(let u of userGroup){
            returnData.departmentInfo.push({
                id:u.department_id,
                value:u.department_name,
                text:u.department_name
            })
        }
        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
        return
    }
}
//查看固定资产报废申请单，待摊资产报废申请单，低值易耗品报废申请单
async function searchScrapAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let returnData = {};
        let user = req.user;
        let replacements =[user.domain_id];

        let queryStr='select t.*,ut.`name` as user_name,ut2.`name` as scrap_checker_name from tbl_erc_longassetsscrap t ' +
            'left join tbl_common_user ut on t.user_id = ut.user_id ' +
            'left join tbl_common_user ut2 on t.scrap_checker_id = ut2.user_id ' +
            'where t.state=1 and t.domain_id=? ';
        if (doc.scrap_type){
            queryStr += ' and t.scrap_type=? ';
            replacements.push(doc.scrap_type);
        }
        if (doc.search_text){
            queryStr += ' and (t.longassetsscrap_no like ? or ut.`name` like ?) ';
            let search_text = '%'+doc.search_text+'%';
            replacements.push(search_text);
            replacements.push(search_text);
        }

        queryStr += ' order by t.created_at desc';

        let result = await common.queryWithCount(sequelize, req, queryStr, replacements);

        returnData.total = result.count;
        returnData.rows = [];
        for (let r of result.data) {
            let result = JSON.parse(JSON.stringify(r));
            result.created_at = r.created_at ? moment(r.created_at).format("YYYY-MM-DD") : null;
            result.scrap_check_date = r.scrap_check_date ? moment(r.scrap_check_date).format("YYYY-MM-DD") : null;
            returnData.rows.push(result)
        }

        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
        return
    }
}
//新增待摊资产报废申请单，待摊资产报废申请单，低值易耗品报废申请单
async function addScrapAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;
        let longassetsscrap_no = await Sequence.genLongAssetsScrapNo();
        let addScrap= await tb_longassetsscrap.create({
            longassetsscrap_no: longassetsscrap_no,
            domain_id: user.domain_id,
            user_id: user.user_id,
            scrap_type:doc.scrap_type
        });
        common.sendData(res, addScrap)
    } catch (error) {
        common.sendFault(res, error);
        return;
    }
}
//查看固定资产报废申请单详情，待摊资产报废申请单详情，低值易耗品报废申请单详情
async function searchScrapDetailAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let returnData = {};
        let user = req.user;
        let replacements =[doc.longassetsscrap_id];
        let queryStr='';

        if(doc.scrap_type==1){
            //固定资产
            queryStr='select *, de.department_name from tbl_erc_longassetsscrapdetail t  ' +
                'left join tbl_erc_fixedassetscheckdetail cd on t.fixedasset_id = cd.fixedassetscheckdetail_id ' +
                'left join tbl_erc_department de on de.department_id = cd.department_id ' +
                'where t.state=1 and t.longassetsscrap_id=? ';

            if (doc.search_text){
                queryStr += ' and (cd.fixedassets_no like ? or cd.fixedassets_name like ?) ';
                let search_text = '%'+doc.search_text+'%';
                replacements.push(search_text);
                replacements.push(search_text);
            }

            queryStr += ' order by t.created_at desc';
        }else if(doc.scrap_type==2){
            //待摊资产
            queryStr='select *, de.department_name from tbl_erc_longassetsscrapdetail t  ' +
                'left join tbl_erc_amortize cd on t.fixedasset_id = cd.amortize_id ' +
                'left join tbl_erc_department de on de.department_id = cd.amortize_departmant_id ' +
                'where t.state=1 and t.longassetsscrap_id=? ';

            if (doc.search_text){
                queryStr += ' and (cd.amortize_code like ? or cd.amortize_name like ?) ';
                let search_text = '%'+doc.search_text+'%';
                replacements.push(search_text);
                replacements.push(search_text);
            }

            queryStr += ' order by t.created_at desc';

        }else if(doc.scrap_type==3){
            //低值易耗品
            queryStr='select *, de.department_name from tbl_erc_longassetsscrapdetail t  ' +
                'left join tbl_erc_consumablesdetail cd on t.fixedasset_id = cd.consumables_detail_id ' +
                'left join tbl_erc_department de on de.department_id = cd.department_id ' +
                'where t.state=1 and t.longassetsscrap_id=? ';

            if (doc.search_text){
                queryStr += ' and (cd.consumables_detail_code like ? or cd.consumables_name like ?) ';
                let search_text = '%'+doc.search_text+'%';
                replacements.push(search_text);
                replacements.push(search_text);
            }

            queryStr += ' order by t.created_at desc';
        }


        let result = await common.queryWithCount(sequelize, req, queryStr, replacements);

        returnData.total = result.count;
        returnData.rows = [];

        for (let r of result.data) {
            let result = JSON.parse(JSON.stringify(r));
            result.return_price = (r.return_price/100);
            result.expend_price = (r.expend_price/100);
            returnData.rows.push(result)
        }

        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
        return
    }
}
//增加资产报废单详情
async function addScrapDetailAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        for(let d of doc){
            let longassetsscrapdetail = await tb_longassetsscrapdetail.findOne({
                where: {
                    longassetsscrap_id: d.longassetsscrap_id,
                    fixedasset_id: d.fixedasset_id,
                    state: 1
                }
            });
            if (longassetsscrapdetail) {
                longassetsscrapdetail.return_price = Number(longassetsscrapdetail.return_price)+Number(d.return_price)
                longassetsscrapdetail.expend_price = Number(longassetsscrapdetail.expend_price)+Number(d.expend_price)
                await longassetsscrapdetail.save()
            } else {
                let addScrapDetail= await tb_longassetsscrapdetail.create({
                    longassetsscrap_id: d.longassetsscrap_id,
                    fixedasset_id: d.fixedasset_id,
                    return_price: d.return_price,
                    expend_price:d.expend_price
                });
            }
        }
        common.sendData(res, addScrapDetailAct)
    } catch (error) {
        common.sendFault(res, error);
        return;
    }
}
//修改资产报废单详情
async function modifyScrapDetailAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let modScrapDetail = await tb_longassetsscrapdetail.findOne({
            where: {
                longassetsscrapdetail_id: doc.old.longassetsscrapdetail_id
            }
        });
        let longassetsscrap = await tb_longassetsscrap.findOne({
            where: {
                longassetsscrap_id: doc.old.longassetsscrap_id
            }
        });
        if (longassetsscrap.scrap_state == 1 || longassetsscrap.scrap_state == 3) {
            common.sendError(res, 'fixedassetsscrap_04');
            return
        }
        if (modScrapDetail) {
            modScrapDetail.return_price = doc.new.return_price*100;
            modScrapDetail.expend_price = doc.new.expend_price*100;

            await modScrapDetail.save();
            modScrapDetail.return_price = (modScrapDetail.return_price/100);
            modScrapDetail.expend_price = (modScrapDetail.expend_price/100);
            common.sendData(res, modScrapDetail);
        } else {
            common.sendError(res, 'fixedassetsscrap_01');
            return
        }

    } catch (error) {
        common.sendFault(res, error)
        return
    }
}
//删除资产报废单详情
async function deleteScrapDetailAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let modScrapDetail = await tb_longassetsscrapdetail.findOne({
            where: {
                longassetsscrapdetail_id: doc.longassetsscrapdetail_id
            }
        });
        let longassetsscrap = await tb_longassetsscrap.findOne({
            where: {
                longassetsscrap_id: modScrapDetail.longassetsscrap_id
            }
        });
        if (modScrapDetail) {
            if (longassetsscrap.scrap_type == 1) {
                //固定
                let fixedassetscheckdetail = await tb_fixedassetscheckdetail.findOne({
                    where: {
                        fixedassetscheckdetail_id: modScrapDetail.fixedasset_id
                    }
                });

                if (fixedassetscheckdetail) {
                    fixedassetscheckdetail.scrap_flag = 1;

                    await fixedassetscheckdetail.save();
                } else {
                    common.sendError(res, 'fixedassetsscrap_01');
                    return
                }
            } else if (longassetsscrap.scrap_type == 2) {
                //待摊
                let amortize = await tb_amortize.findOne({
                    where: {
                        amortize_id: modScrapDetail.fixedasset_id
                    }
                });

                if (amortize) {
                    amortize.scrap_flag = 1;

                    await amortize.save();
                } else {
                    common.sendError(res, 'fixedassetsscrap_01');
                    return
                }
            } else {
                //低值
                let consumablesdetail = await tb_consumablesdetail.findOne({
                    where: {
                        consumables_detail_id: modScrapDetail.fixedasset_id
                    }
                });

                if (consumablesdetail) {
                    consumablesdetail.scrap_flag = 1;

                    await consumablesdetail.save();
                } else {
                    common.sendError(res, 'fixedassetsscrap_01');
                    return
                }
            }
            modScrapDetail.state = GLBConfig.DISABLE;

            await modScrapDetail.save();

            common.sendData(res, modScrapDetail);
        } else {
            common.sendError(res, 'fixedassetsscrap_01');
            return
        }

    } catch (error) {
        common.sendFault(res, error)
        return
    }
}
//查看资产报废管理申请单详情
async function searchAssetAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;
        let returnData = {};
        let replacements =[user.domain_id];
        let queryStr='';

        if(doc.scrap_type==1){
            //固定资产
            queryStr='select * from tbl_erc_fixedassetscheckdetail t  ' +
                'inner join tbl_erc_fixedassetscheck tt on (t.fixedassetscheck_id = tt.fixedassetscheck_id and tt.check_state=3 and tt.state=1)' +
                'where t.state=1 and t.scrap_flag=1 and tt.domain_id = ? ';
            // queryStr += ' order by t.created_at';
            if (doc.matNameOrCodeOrFormat) {
                queryStr += ' and (t.fixedassets_no like ? or t.fixedassets_name like ?)';
                replacements.push('%' + doc.matNameOrCodeOrFormat + '%');
                replacements.push('%' + doc.matNameOrCodeOrFormat + '%');
            }
            if (doc.department_id){
                queryStr += ' and t.department_id = ?'
                replacements.push(doc.department_id)
            }
        }else if(doc.scrap_type==2){
            //待摊资产
            queryStr='select * from tbl_erc_amortize t  ' +
                'where t.state=1 and t.scrap_flag=1 and t.amortize_check_state = 2 and t.domain_id = ? ';
            // queryStr += ' order by t.created_at';
            if (doc.matNameOrCodeOrFormat) {
                queryStr += ' and (t.amortize_code like ? or t.amortize_name like ?)';
                replacements.push('%' + doc.matNameOrCodeOrFormat + '%');
                replacements.push('%' + doc.matNameOrCodeOrFormat + '%');
            }
            if (doc.amortize_departmant_id){
                queryStr += ' and t.amortize_departmant_id = ?'
                replacements.push(doc.amortize_departmant_id)
            }
        }else if(doc.scrap_type==3){
            //低值易耗品
            queryStr='select * from tbl_erc_consumablesdetail t  ' +
                'where t.state=1 and t.scrap_flag=1 and t.consumables_detail_type_id = 2 and consumables_detail_status = 3 and t.domain_id = ? ';
            // queryStr += ' order by t.created_at';
            if (doc.matNameOrCodeOrFormat) {
                queryStr += ' and (t.consumables_detail_code like ? or t.consumables_name like ?)';
                replacements.push('%' + doc.matNameOrCodeOrFormat + '%');
                replacements.push('%' + doc.matNameOrCodeOrFormat + '%');
            }
            if (doc.department_id){
                queryStr += ' and t.department_id = ?'
                replacements.push(doc.department_id)
            }
        }

        let result = await common.queryWithCount(sequelize, req, queryStr, replacements);

        returnData.total = result.count;
        // returnData.rows = result.data;
        returnData.rows = [];
        for (let r of result.data) {
            let result = JSON.parse(JSON.stringify(r));
            result.return_price = r.return_price ? r.return_price : 0;
            result.expend_price = r.expend_price ? r.expend_price : 0;
            returnData.rows.push(result)
        }
        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
        return
    }
}
//提交资产报废管理申请单详情
async function submitAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;
        //校验是否分配任务处理人员
        let taskallot = await tb_taskallot.findOne({
            where:{
                state:GLBConfig.ENABLE,
                taskallot_name:'资产报废审批任务'
            }
        });
        let taskallotuser = await tb_taskallotuser.findOne({
            where:{
                state:GLBConfig.ENABLE,
                domain_id: user.domain_id,
                taskallot_id:taskallot.taskallot_id
            }
        });
        let longassetsscrapdetail = await tb_longassetsscrapdetail.findOne({
            where:{
                longassetsscrap_id: doc.longassetsscrap_id,
                state: GLBConfig.ENABLE
            }
        });
        if (!longassetsscrapdetail) {
            return common.sendError(res, 'fixedassetscheck_04');
        } else {
            if (!taskallotuser) {
                return common.sendError(res, 'fixedassetsscrap_03');
            }else{
                let taskName = '资产报废审批任务';
                let taskDescription = doc.longassetsscrap_no + '  资产报废审批任务';
                let groupId = common.getUUIDByTime(30);
                // user, taskName, taskType, taskPerformer, taskReviewCode, taskDescription, reviewId, taskGroup
                let taskResult = await task.createTask(user,taskName,39,taskallotuser.user_id,doc.longassetsscrap_id,taskDescription,'',groupId);
                if(!taskResult){
                    return common.sendError(res, 'task_01');
                }else{
                    let longassetsscrap = await tb_longassetsscrap.findOne({
                        where: {
                            longassetsscrap_id: doc.longassetsscrap_id,
                            state: GLBConfig.ENABLE
                        }
                    });
                    if(longassetsscrap){
                        longassetsscrap.scrap_state=1;
                        await longassetsscrap.save()
                    }
                    common.sendData(res, longassetsscrap);
                }
            }
        }
    } catch (error) {
        common.sendFault(res, error)
        return
    }
}
//查看资产报废管理申请单状态
async function searchAssetDetailTopAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;
        let longassetsscrap = await tb_longassetsscrap.findOne({
            where: {
                longassetsscrap_id: doc.longassetsscrap_id
            }
        });

        common.sendData(res, longassetsscrap);
    } catch (error) {
        common.sendFault(res, error);
        return
    }
}
//增加资产报废单详情
async function addScrapBeforeDetailAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        for(let d of doc){
            let longassetsscrapdetail = await tb_longassetsscrapdetail.findOne({
                where: {
                    longassetsscrap_id: d.longassetsscrap_id,
                    fixedasset_id: d.fixedasset_id,
                    state: 1
                }
            });
            if (longassetsscrapdetail) {
                common.sendError(res, 'fixedassetsscrap_02');
                return
            } else {
                let addScrapDetail= await tb_longassetsscrapdetail.create({
                    longassetsscrap_id: d.longassetsscrap_id,
                    fixedasset_id: d.fixedasset_id,
                    return_price: 0,
                    expend_price: 0
                });
            }
        }
        common.sendData(res, addScrapBeforeDetailAct)
    } catch (error) {
        common.sendFault(res, error);
        return;
    }
}
//生成资产报废单
async function submitDetailAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;
        //校验是否分配任务处理人员
        let taskallot = await tb_taskallot.findOne({
            where:{
                state:GLBConfig.ENABLE,
                taskallot_name:'资产报废审批任务'
            }
        });
        let taskallotuser = await tb_taskallotuser.findOne({
            where:{
                state:GLBConfig.ENABLE,
                domain_id: user.domain_id,
                taskallot_id:taskallot.taskallot_id
            }
        });
        if (!taskallotuser) {
            return common.sendError(res, 'fixedassetsscrap_03');
        }
        //增加资产报废申请单
        let longassetsscrap_no = await Sequence.genLongAssetsScrapNo();
        let addScrap= await tb_longassetsscrap.create({
            longassetsscrap_no: longassetsscrap_no,
            domain_id: user.domain_id,
            user_id: user.user_id,
            scrap_type:doc.scrap_type,
            scrap_state:1
        });

        if (addScrap) {
            if (doc.scrap_type == 1) {
                //增加资产报废详情
                for(let d of doc.checkDetailFixed){
                    let longassetsscrapdetail = await tb_longassetsscrapdetail.findOne({
                        where: {
                            longassetsscrap_id: addScrap.longassetsscrap_id,
                            fixedasset_id: d.fixedassetscheckdetail_id,
                            state: 1
                        }
                    });
                    if (longassetsscrapdetail) {
                        common.sendError(res, 'fixedassetsscrap_02');
                        return
                    } else {
                        let return_price = 0,expend_price = 0, longassetsscrap_remark='';
                        if(d.return_price !='' && typeof(d.return_price) !='undefined'&& d.return_price !=null){
                            return_price = d.return_price*100
                        }
                        if(d.expend_price !='' && typeof(d.expend_price) !='undefined'&& d.expend_price !=null){
                            expend_price = d.expend_price*100
                        }
                        if(d.longassetsscrap_remark !='' && typeof(d.longassetsscrap_remark) !='undefined'&& d.longassetsscrap_remark !=null){
                            longassetsscrap_remark = d.longassetsscrap_remark
                        }
                        let addScrapDetail= await tb_longassetsscrapdetail.create({
                            longassetsscrap_id: addScrap.longassetsscrap_id,
                            fixedasset_id: d.fixedassetscheckdetail_id,
                            return_price: return_price,
                            expend_price: expend_price,
                            longassetsscrap_remark: longassetsscrap_remark
                        });
                        await tb_fixedassetscheckdetail.update({
                            scrap_flag:0
                        }, {
                            where: {
                                fixedassetscheckdetail_id:d.fixedassetscheckdetail_id
                            }
                        });
                    }
                }
            } else if (doc.scrap_type == 2) {
                //增加资产报废详情
                for(let d of doc.checkDetailDeferred){
                    let longassetsscrapdetail = await tb_longassetsscrapdetail.findOne({
                        where: {
                            longassetsscrap_id: addScrap.longassetsscrap_id,
                            fixedasset_id: d.amortize_id,
                            state: 1
                        }
                    });
                    if (longassetsscrapdetail) {
                        common.sendError(res, 'fixedassetsscrap_02');
                        return
                    } else {
                        let return_price = 0,expend_price = 0,longassetsscrap_remark='';
                        if(d.return_price !='' && typeof(d.return_price) !='undefined'&& d.return_price !=null){
                            return_price = d.return_price*100
                        }
                        if(d.expend_price !='' && typeof(d.expend_price) !='undefined'&& d.expend_price !=null){
                            expend_price = d.expend_price*100
                        }
                        if(d.longassetsscrap_remark !='' && typeof(d.longassetsscrap_remark) !='undefined'&& d.longassetsscrap_remark !=null){
                            longassetsscrap_remark = d.longassetsscrap_remark
                        }
                        let addScrapDetail= await tb_longassetsscrapdetail.create({
                            longassetsscrap_id: addScrap.longassetsscrap_id,
                            fixedasset_id: d.amortize_id,
                            return_price: return_price,
                            expend_price: expend_price,
                            longassetsscrap_remark: longassetsscrap_remark
                        });
                        await tb_amortize.update({
                            scrap_flag:0
                        }, {
                            where: {
                                amortize_id:d.amortize_id
                            }
                        });
                    }
                }
            } else if (doc.scrap_type == 3) {
                //增加资产报废详情
                for(let d of doc.checkDetailValue){
                    let longassetsscrapdetail = await tb_longassetsscrapdetail.findOne({
                        where: {
                            longassetsscrap_id: addScrap.longassetsscrap_id,
                            fixedasset_id: d.consumables_detail_id,
                            state: 1
                        }
                    });
                    if (longassetsscrapdetail) {
                        common.sendError(res, 'fixedassetsscrap_02');
                        return
                    } else {
                        let return_price = 0,expend_price = 0,longassetsscrap_remark='';
                        if(d.return_price !='' && typeof(d.return_price) !='undefined'&& d.return_price !=null){
                            return_price = d.return_price*100
                        }
                        if(d.expend_price !='' && typeof(d.expend_price) !='undefined'&& d.expend_price !=null){
                            expend_price = d.expend_price*100
                        }
                        if(d.longassetsscrap_remark !='' && typeof(d.longassetsscrap_remark) !='undefined'&& d.longassetsscrap_remark !=null){
                            longassetsscrap_remark = d.longassetsscrap_remark
                        }
                        let addScrapDetail= await tb_longassetsscrapdetail.create({
                            longassetsscrap_id: addScrap.longassetsscrap_id,
                            fixedasset_id: d.consumables_detail_id,
                            return_price: return_price,
                            expend_price: expend_price,
                            longassetsscrap_remark: longassetsscrap_remark
                        });
                        await tb_consumablesdetail.update({
                            scrap_flag:0
                        }, {
                            where: {
                                consumables_detail_id:d.consumables_detail_id
                            }
                        });
                    }
                }
            }

            let longassetsscrapdetail = await tb_longassetsscrapdetail.findOne({
                where:{
                    longassetsscrap_id: addScrap.longassetsscrap_id,
                    state: GLBConfig.ENABLE
                }
            });
            if (!longassetsscrapdetail) {
                return common.sendError(res, 'fixedassetscheck_05');
            } else {
                let taskName = '资产报废审批任务';
                let taskDescription = addScrap.longassetsscrap_no + '  资产报废审批任务';
                let groupId = common.getUUIDByTime(30);
                // user, taskName, taskType, taskPerformer, taskReviewCode, taskDescription, reviewId, taskGroup
                let taskResult = await task.createTask(user,taskName,39,taskallotuser.user_id,addScrap.longassetsscrap_id,taskDescription,'',groupId);
                if(!taskResult){
                    return common.sendError(res, 'task_01');
                }else{
                    let longassetsscrap = await tb_longassetsscrap.findOne({
                        where: {
                            longassetsscrap_id: addScrap.longassetsscrap_id,
                            state: GLBConfig.ENABLE
                        }
                    });
                    if(longassetsscrap){
                        longassetsscrap.scrap_state=1;
                        await longassetsscrap.save()
                    }
                    common.sendData(res, longassetsscrap);
                }
            }
        } else {
            return common.sendError(res, 'fixedassetsscrap_05');
        }
    } catch (error) {
        common.sendFault(res, error)
        return
    }
}
//修改资产报废单状态
async function modifyScrapState(applyState,description,longassetsscrap_id,applyApprover){
    // let user = req.user;
    await tb_longassetsscrap.update({
        scrap_state:applyState,
        scrap_check_date:new Date(),
        scrap_checker_id:applyApprover,
        scrap_refuse_remark:description
    }, {
        where: {
            longassetsscrap_id:longassetsscrap_id
        }
    });

    //更新相关资产表状态
    let scrap= await tb_longassetsscrap.findOne({
        where: {
            longassetsscrap_id: longassetsscrap_id
        }
    });

    if(applyState==3){
        if(scrap.scrap_type==1){
            //固定资产
            let replacements=[longassetsscrap_id];
            let queryStr='select * from tbl_erc_longassetsscrapdetail t  ' +
                'left join tbl_erc_fixedassetscheckdetail cd on t.fixedasset_id = cd.fixedassetscheckdetail_id ' +
                'where t.state=1 and t.longassetsscrap_id=? ';

            let result = await common.simpleSelect(sequelize, queryStr, replacements);
            if(result){
                for(var i=0;i<result.length;i++){
                    await tb_fixedassetscheckdetail.update({
                        scrap_flag:0
                    }, {
                        where: {
                            fixedassetscheckdetail_id:result[i].fixedasset_id
                        }
                    });
                }
            }
        }else if(scrap.scrap_type==2){
            //待摊资产
            let replacements=[longassetsscrap_id];
            let queryStr='select * from tbl_erc_longassetsscrapdetail t  ' +
                'left join tbl_erc_amortize cd on t.fixedasset_id = cd.amortize_id ' +
                'where t.state=1 and t.longassetsscrap_id=? ';

            let result = await common.simpleSelect(sequelize, queryStr, replacements);
            if(result){
                for(var i=0;i<result.length;i++){
                    await tb_amortize.update({
                        scrap_flag:0
                    }, {
                        where: {
                            amortize_id:result[i].fixedasset_id
                        }
                    });
                }
            }

        }else if(scrap.scrap_type==3){
            //低值易耗品
            let replacements=[longassetsscrap_id];
            let queryStr='select * from tbl_erc_longassetsscrapdetail t  ' +
                'left join tbl_erc_consumablesdetail cd on t.fixedasset_id = cd.consumables_detail_id ' +
                'where t.state=1 and t.longassetsscrap_id=? ';

            let result = await common.simpleSelect(sequelize, queryStr, replacements);
            if(result){
                for(var i=0;i<result.length;i++){
                    await tb_consumablesdetail.update({
                        scrap_flag:0
                    }, {
                        where: {
                            consumables_detail_id:result[i].fixedasset_id
                        }
                    });
                }
            }
        }
    } else {

    }
}

exports.modifyScrapState = modifyScrapState;