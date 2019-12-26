/**
 * Created by shuang.liu on 18/5/5.
 */
const common = require('../../../util/CommonUtil');
const GLBConfig = require('../../../util/GLBConfig');
const Sequence = require('../../../util/Sequence');
const logger = require('../../../util/Logger').createLogger('ERCDepartmentControlSRV');
const model = require('../../../model');
const moment = require('moment');


const sequelize = model.sequelize;
const tb_department = model.erc_department;
const tb_user = model.common_user;
const tb_usergroup = model.common_usergroup;
const tb_position = model.erc_position;
const tb_procedure = model.erc_productionprocedure
const tb_departmentprocedure = model.erc_departmentprocedure
//行政办公管理->部门管理接口
exports.ERCDepartmentControlResource = (req, res) => {
    let method = req.query.method
    if (method === 'init') {
        initAct(req, res);
    } else if (method === 'search') {
        searchAct(req, res)
    } else if (method === 'add') {
        addAct(req, res)
    } else if (method === 'modify') {
        modifyAct(req, res)
    } else if (method === 'delete') {
        deleteAct(req, res)
    } else if (method === 'changeGroup') {
        changeGroupAct(req, res)
    } else if (method === 'getProcedureOne') {
        getProcedureOne(req, res)
    } else {
        common.sendError(res, 'common_01')
    }
}
async function getProcedure(req, res) {
    try {
        let user = req.user;
        let procedure = await tb_procedure.findAll({
            where: {
                state: 1,
                domain_id: user.domain_id
            }
        })

        let returnData = []
        for (let p of procedure) {
            returnData.push({
                id: p.procedure_id,
                value: p.procedure_id,
                text: p.procedure_name
            })
        }
        return returnData
    } catch (error) {
        common.sendFault(res, error);
        return
    }
}
async function initAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;
        let returnData = {};

        returnData.userInfo = req.user;
        returnData.userState = GLBConfig.USERSTATE; //用户状态
        returnData.departType = GLBConfig.DEPARTTYPE; //用户状态
        returnData.procedure = await getProcedure(req, res)

        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
        return
    }
}

async function getProcedureOne(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;
        let returnData = [];

        let queryStr = `select pp.* from tbl_erc_departmentprocedure dp
            left join tbl_erc_productionprocedure pp on (dp.procedure_id = pp.procedure_id) 
            where dp.state=1 and dp.department_id = ?`
        let replacements = [doc.department_id]
        let resultPP = await sequelize.query(queryStr, {
            replacements: replacements,
            type: sequelize.QueryTypes.SELECT
        });

        for (let p of resultPP) {
            returnData.push(p.procedure_id)
        }
        common.sendData(res, returnData);

    } catch (error) {
        common.sendFault(res, error);
        return
    }
}
//查询部门列表
async function searchAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;
        let returnData = {};
        let replacements = [user.domain_id];
        let queryStr =
            `select
                t.*, pt.department_name as p_department_name
                from tbl_erc_department t
                left join tbl_erc_department pt
                on t.p_department_id = pt.department_id
                where t.state=1
                and t.domain_id=?`;

        if (doc.search_text) {
            queryStr += ' and (t.department_id like ? or t.department_name like ?) ';
            let search_text = '%' + doc.search_text + '%';
            replacements.push(search_text);
            replacements.push(search_text);
        }
        if (doc.type == 1) {
            //按工号排序
            queryStr += ' order by t.department_id';
        } else {
            queryStr += ' order by t.department_level,t.department_id';

        }

        let result = await common.queryWithCount(sequelize, req, queryStr, replacements);
        returnData.total = result.count;
        returnData.rows = [];
        for (let r of result.data) {
            let result = JSON.parse(JSON.stringify(r));
            result.mrp_begin_time = r.mrp_begin_time ? moment(r.mrp_begin_time).format("YYYY-MM-DD") : null;
            returnData.rows.push(result)
        }

        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
        return
    }
}
//增加部门
async function addAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;
        let aDepartment = await tb_department.findOne({
            where: {
                domain_id: user.domain_id,
                department_name: doc.department_name,
                state: 1
            }
        });

        if (doc.p_department_id == null) {
            if (doc.department_level != 1) {
                common.sendError(res, 'department_05');
                return
            }
        } else if (doc.department_level == 1) {
            if (doc.p_department_id != null) {
                common.sendError(res, 'department_06');
                return
            }
        }

        if (aDepartment) {
            common.sendError(res, 'department_02');
            return
        } else {
            let department_id = await Sequence.genDepartmentID();
            let addDepartment = await tb_department.create({
                department_id: department_id,
                domain_id: user.domain_id,
                department_name: doc.department_name,
                p_department_id: doc.p_department_id,
                department_level: doc.department_level,
                department_plan_num: doc.department_plan_num,
                department_type: doc.department_type,
                department_state: 1,
                mrp_begin_time: doc.mrp_begin_time

            });
            if (doc.department_procedure) {
                for (let dp of doc.department_procedure) {
                    let addDepartment = await tb_departmentprocedure.create({
                        department_id: department_id,
                        procedure_id: dp
                    });
                }
            }
            common.sendData(res, addDepartment)
        }

    } catch (error) {
        common.sendFault(res, error);
        return;
    }
}
//修改部门
async function modifyAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;
        let modDept = await tb_department.findOne({
            where: {
                department_id: doc.old.department_id
            }
        });
        let position = await tb_position.findOne({
            where: {
                department_id: doc.old.department_id,
                state: 1
            }
        });
        if (doc.new.department_state == 0) {
            if (position) {
                common.sendError(res, 'department_08');
                return
            }
        }
        if (modDept) {
            let aDepartment = await tb_department.findOne({
                where: {
                    domain_id: user.domain_id,
                    department_name: doc.new.department_name,
                    state: 1
                }
            });

            let aDepartment2 = await tb_department.findOne({
                where: {
                    domain_id: user.domain_id,
                    department_id: doc.new.p_department_id,
                    state: 1
                }
            });

            if (doc.new.p_department_id == null) {
                if (doc.new.department_level != 1) {
                    common.sendError(res, 'department_05');
                    return
                }
            } else if (doc.new.department_level == 1) {
                if (doc.new.p_department_id != null) {
                    common.sendError(res, 'department_06');
                    return
                }
            }
            if (aDepartment2 != null) {
                if (doc.new.p_department_id == modDept.department_id || modDept.department_level < aDepartment2.department_level) {
                    common.sendError(res, 'department_07');
                    return
                }
            } else {
                if (doc.new.p_department_id == modDept.department_id) {
                    common.sendError(res, 'department_07');
                    return
                }
            }


            if (doc.new.department_name && doc.old.department_name != doc.new.department_name && aDepartment) {
                common.sendError(res, 'department_02');
                return
            } else {
                modDept.department_name = doc.new.department_name;
                modDept.p_department_id = doc.new.p_department_id;
                modDept.department_level = doc.new.department_level;
                modDept.department_plan_num = doc.new.department_plan_num;
                modDept.department_state = doc.new.department_state;
                modDept.department_type = doc.new.department_type;
                modDept.mrp_begin_time= doc.new.mrp_begin_time;
            }

            await modDept.save();

            if (doc.new.department_procedure) {
                tb_departmentprocedure.destroy({
                    where: {
                        department_id: doc.old.department_id
                    }
                })


                for (let dp of doc.new.department_procedure) {
                    let addDepartment = await tb_departmentprocedure.create({
                        department_id: doc.old.department_id,
                        procedure_id: dp
                    });
                }
            }


            common.sendData(res, modDept);
        } else {
            common.sendError(res, 'department_01');
            return
        }
    } catch (error) {
        common.sendFault(res, error)
        return null
    }
}
//删除部门
async function deleteAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let modDept = await tb_department.findOne({
            where: {
                department_id: doc.old.department_id
            }
        });
        if (modDept) {
            modDept.state = GLBConfig.DISABLE;
            await modDept.save();

            common.sendData(res, modDept);
        } else {
            common.sendError(res, 'department_01');
            return
        }
    } catch (error) {
        common.sendFault(res, error)
        return
    }
}
//修改上级部门名称
async function changeGroupAct(req, res) {
    try {
        let doc = common.docTrim(req.body),
            user = req.user,
            returnData = {};

        if (doc.users[0]) {
            let u = doc.users[0]
            let userGroup = await tb_department.findOne({
                where: {
                    domain_id: user.domain_id,
                    department_id: u.department_id
                }
            });

            returnData.userDepartmentId = userGroup.department_id;
            returnData.userDepartmentName = userGroup.department_name;

        } else {
            returnData.userDepartmentId = null;
        }

        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
        return
    }
}
