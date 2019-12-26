const common = require('../../../util/CommonUtil');
const GLBConfig = require('../../../util/GLBConfig');
const logger = require('../../../util/Logger').createLogger('ERCPPMaster');
const model = require('../../../model');
const Sequence = require('../../../util/Sequence');
const FDomain = require('../../../bl/common/FunctionDomainBL');
const sequelize = model.sequelize;
const moment = require('moment');
const task = require('../baseconfig/ERCTaskListControlSRV');
const fs = require('fs');
const path = require('path');
const iconvLite = require('iconv-lite');
const config = require('../../../config');

const tb_ppmasterptdetail = model.erc_ppmasterptdetail
const tb_ppmaster = model.erc_ppmaster
const tb_ppmasterreceive = model.erc_ppmasterreceive
const tb_ppmovemateriel = model.erc_ppmovemateriel
const tb_productivetask = model.erc_productivetask
const tb_productivetaskdetail = model.erc_productivetaskdetail
const tb_taskallot = model.erc_taskallot
const tb_taskallotuser = model.erc_taskallotuser
const tb_productionprocedure = model.erc_productionprocedure
const tb_userprocedure = model.erc_userprocedure
const tb_productdevice = model.erc_productdevice
const tb_ppmasterdaydevicetemp = model.erc_ppmasterdaydevicetemp
const tb_ppmasterdaydevice = model.erc_ppmasterdaydevice
const tb_materiel = model.erc_materiel
const tb_qualitycheckdetail = model.erc_qualitycheckdetail
const tb_department = model.erc_department
const tbl_delivery = model.erc_delivery

const {
    productionInputStorage,
    productionOutputStorage
} = require('../service/ERCInventoryService');

exports.ERCPPMasterControlResource = (req, res) => {
    let method = req.query.method;
    if (method === 'init') {
        initAct(req, res)
    } else if (method === 'getPPMaster') {
        getPPMaster(req, res)
    } else if (method === 'getPPMasmterDayProductiveTaskDetail') {
        getPPMasmterDayProductiveTaskDetail(req, res)
    } else if (method === 'modifyPTDetail') {
        modifyPTDetail(req, res)
    } else if (method === 'modifyPTState') {
        modifyPTState(req, res)
    } else if (method === 'addReceive') {
        addReceive(req, res)
    } else if (method === 'getPPMasterDayPerson') {
        getPPMasterDayPerson(req, res)
    } else if (method === 'getPPMasterDayDevice') {
        getPPMasterDayDevice(req, res)
    } else if (method === 'getMaterielListByOrder') {
        getMaterielListByOrder(req, res)
    } else if (method === 'submitMoveMateriel') {
        submitMoveMateriel(req, res)
    } else if (method === 'showSearchDate') {
        showSearchDate(req, res)
    } else if (method === 'modifyPPmaster') {
        modifyPPmaster(req, res)
    } else if (method === 'exportData') {
        exportData(req, res)
    } else {
        common.sendError(res, 'common_01')
    }
};
async function initAct(req, res) {
    let returnData = {};
    try {
        returnData.unitInfo = await global.getBaseTypeInfo(req.user.domain_id, 'JLDW'); //单位
        returnData.department = await getDepartment(req);
        common.sendData(res, returnData)
    } catch (error) {
        common.sendFault(res, error);
        return;
    }

}
async function getDepartment(req) {
    try {
        let queryStr = `select * from tbl_erc_department where state=1 and domain_id=? and department_type=0 order by department_id`
        let replacements = [req.user.domain_id]
        let result = await sequelize.query(queryStr, {
            replacements: replacements,
            type: sequelize.QueryTypes.SELECT
        });
        return result
    } catch (error) {
        throw error
    }

}

async function allotPerson(doc, user) {
    try {
        let procedureUser = []
        let userGroup = await tb_userprocedure.findAll({
            attributes: ['user_id'],
            group: 'user_id'
        })
        for (let u of userGroup) {
            procedureUser.push({
                user_id: u.user_id,
                procedures: []
            })
            let userprocedure = await tb_userprocedure.findAll({
                where: {
                    state: 1,
                    user_id: u.user_id
                }
            })
            for (let up of userprocedure) {
                procedureUser[procedureUser.length - 1].procedures.push({
                    procedure_id: up.procedure_id
                })
            }
        }
        console.log(procedureUser)
        // 查询指定日期的日计划
        let ppmasterDay = await tb_ppmaster.findAll({
            where: {
                state: 1,
                ppmaster_date: doc.searchDate
            },
            order: [
                ['ppmaster_id']
            ]
        });
        console.log(ppmasterDay)

        //更新排产计划的分配员工字段
        let proceduresForState = 0
        for (let pd of ppmasterDay) {
            let procedure_user_id = ""
            for (let i = 0; i < procedureUser.length; i++) {
                proceduresForState = 0
                for (pup of procedureUser[i].procedures) {
                    if (pd.ppmaster_procedure_id == pup.procedure_id) {
                        procedure_user_id = procedureUser[i].user_id
                        procedureUser.splice(i, 1)
                        proceduresForState = 1
                        break
                    }
                }
                if (proceduresForState) {
                    break
                }
            }
            pd.ppmaster_user_id = procedure_user_id
            pd.save()
        }
    } catch (error) {
        throw error
    }
}

async function allotDevice(doc, user) {
    try {
        let replacements = [],
            queryStr = ''


        // 日计划设备计算表，日计划查询时，本表保存当时未报修的所有设备，方便计算日计划的设备分配，日计划查询完毕，将该表清空
        queryStr = `delete from tbl_erc_ppmasterdaydevicetemp`
        let delete_result1 = await sequelize.query(queryStr, {
            replacements: [],
            type: sequelize.QueryTypes.DELETE
        });
        queryStr = `delete from tbl_erc_ppmasterdaydevice where ppmaster_date = ?`
        let delete_result2 = await sequelize.query(queryStr, {
            replacements: [doc.searchDate],
            type: sequelize.QueryTypes.DELETE
        });
        // queryStr = `select pd.fixedassetsdetail_id,fd.fixedassets_no,fd.fixedassets_name,
        //     pd.day_capacity,pd.device_level,pd.productdevice_id
        //     from tbl_erc_productdevice pd
        //     left join tbl_erc_fixedassetscheckdetail fd on (pd.fixedassetsdetail_id = fd.fixedassetscheckdetail_id and fd.state=1)
        //     where pd.state=1 and pd.domain_id=?`

        queryStr = `select pd.fixedassetsdetail_id,fd.fixedassets_no,fd.fixedassets_name,
            ppd.day_capacity,pd.device_level,pd.productdevice_id 
            from tbl_erc_productproceduredevice ppd
            left join tbl_erc_productdevice pd on (ppd.productdevice_id = pd.productdevice_id and pd.state=1)
            left join tbl_erc_fixedassetscheckdetail fd on (pd.fixedassetsdetail_id = fd.fixedassetscheckdetail_id and fd.state=1)
            where pd.state=1 and pd.domain_id=?`


        replacements = [user.domain_id]
        let device_result = await sequelize.query(queryStr, {
            replacements: replacements,
            type: sequelize.QueryTypes.SELECT
        });

        for (let dr of device_result) {
            let ppmasterdaydevicetemp = await tb_ppmasterdaydevicetemp.create({
                fixedassetscheckdetail_id: dr.fixedassetsdetail_id, //tbl_erc_fixedassetscheckdetail.fixedassetsdetail_id
                productdevice_id: dr.productdevice_id, //tbl_erc_productdevice.productdevice_id
                fixedassets_no: dr.fixedassets_no, //设备编号
                fixedassets_name: dr.fixedassets_name, //设备名称
                theory_capacity: dr.day_capacity, //理论日产能
                done_capacity: 0, //已分配产能
                surplus_capacity: dr.day_capacity,
                device_level: dr.device_level //1主设备 2辅设备
            })
        }

        // 查询指定日期的日计划
        let ppmasterDay = await tb_ppmaster.findAll({
            where: {
                state: 1,
                ppmaster_date: doc.searchDateDay,
                ppmaster_department_id: doc.department_id
            },
            order: [
                ['ppmaster_id']
            ]
        });

        for (let pd of ppmasterDay) { //   将排产数量分配到设备
            //根据工序，确定该排查计划所需的设备(主)（辅）
            let ppmaster_number_Z = pd.ppmaster_produce_number
            let ppmaster_number_F = pd.ppmaster_produce_number
            replacements = []

            queryStr = `select t.* from tbl_erc_ppmasterdaydevicetemp t,tbl_erc_productproceduredevice pd
                where t.state=1 and pd.state=1 and pd.productdevice_id = t.productdevice_id 
                and pd.productprocedure_id=? and t.device_level=1 and t.theory_capacity<>t.done_capacity 
                order by fixedassetscheckdetail_id`

            replacements = [pd.ppmaster_procedure_id]
            let device_Z = await sequelize.query(queryStr, {
                replacements: replacements,
                type: sequelize.QueryTypes.SELECT
            });

            replacements = []
            queryStr = `select t.* from tbl_erc_ppmasterdaydevicetemp t,tbl_erc_productproceduredevice pd
                where t.state=1 and pd.state=1 and pd.productdevice_id = t.fixedassetscheckdetail_id 
                and pd.productprocedure_id=? and t.device_level=2 and t.theory_capacity<>t.done_capacity 
                order by fixedassetscheckdetail_id`
            replacements = [pd.ppmaster_procedure_id]
            let device_F = await sequelize.query(queryStr, {
                replacements: replacements,
                type: sequelize.QueryTypes.SELECT
            });

            console.log('device_Z', device_Z)
            console.log('device_F', device_F)
            //分配主设备
            for (let dz of device_Z) {
                let allotNumber = 0
                if (ppmaster_number_Z != 0) {
                    if (Number(ppmaster_number_Z) <= Number(dz.theory_capacity) - Number(dz.done_capacity)) {
                        allotNumber = Number(ppmaster_number_Z)
                        dz.done_capacity = Number(dz.done_capacity) + Number(ppmaster_number_Z)
                        ppmaster_number_Z = 0
                    } else {
                        allotNumber = Number(dz.theory_capacity) - Number(dz.done_capacity)
                        ppmaster_number_Z = Number(ppmaster_number_Z) - (Number(dz.theory_capacity) - Number(dz.done_capacity))
                        dz.done_capacity = Number(dz.theory_capacity)
                    }

                    queryStr = `update tbl_erc_ppmasterdaydevicetemp set done_capacity = ? where ppmasterdaydevicetemp_id=?`
                    let update_device_Z = await sequelize.query(queryStr, {
                        replacements: [dz.done_capacity, dz.ppmasterdaydevicetemp_id],
                        type: sequelize.QueryTypes.UPDATE
                    });

                    let ppmasterdaydevice = await tb_ppmasterdaydevice.create({
                        ppmaster_id: pd.ppmaster_id,
                        fixedassetscheckdetail_id: dz.fixedassetscheckdetail_id,
                        fixedassets_no: dz.fixedassets_no,
                        fixedassets_name: dz.fixedassets_name,
                        allot_number: allotNumber,
                        ppmaster_date: doc.searchDate
                    })
                } else {
                    break
                }
            }

            //分配辅设备
            for (let df of device_F) {
                let allotNumber = 0
                if (ppmaster_number_F != 0) {
                    if (Number(ppmaster_number_F) <= Number(df.theory_capacity) - Number(df.done_capacity)) {
                        allotNumber = Number(ppmaster_number_F)
                        df.done_capacity = Number(df.done_capacity) + Number(ppmaster_number_F)
                        ppmaster_number_F = 0
                    } else {
                        allotNumber = Number(df.theory_capacity) - Number(df.done_capacity)
                        ppmaster_number_F = Number(ppmaster_number_F) - (Number(df.theory_capacity) - Number(df.done_capacity))
                        df.done_capacity = Number(df.theory_capacity)
                    }
                    queryStr = `update tbl_erc_ppmasterdaydevicetemp set done_capacity = ? where ppmasterdaydevicetemp_id=?`
                    let update_device_F = await sequelize.query(queryStr, {
                        replacements: [df.done_capacity, df.ppmasterdaydevicetemp_id],
                        type: sequelize.QueryTypes.UPDATE
                    });

                    let ppmasterdaydevice = await tb_ppmasterdaydevice.create({
                        ppmaster_id: pd.ppmaster_id,
                        fixedassetscheckdetail_id: df.fixedassetscheckdetail_id,
                        fixedassets_no: df.fixedassets_no,
                        fixedassets_name: df.fixedassets_name,
                        allot_number: allotNumber,
                        ppmaster_date: doc.searchDate
                    })
                } else {
                    break
                }
            }
        }


    } catch (error) {
        throw error
    }
}
async function getPPMaster(req, res) {
    let returnData = {};
    try {
        let doc = common.docTrim(req.body),
            user = req.user,
            returnData = {
                procedures: [],
                daysArr: []
            },
            replacements = [],
            queryStr = '',
            pelement = [];
        //如果是日计划，
        //更新生产计划的分配员工字段
        //分配设备
        if (doc.searchDateDay) {
            await allotPerson(doc, user)
            await allotDevice(doc, user)
        }
        //表头日期
        replacements = []
        queryStr = `select distinct ppmaster_date from tbl_erc_ppmaster
            where state = 1 and domain_id = ? and ppmaster_department_id = ?
            and ppmaster_date >= DATE_FORMAT(now(),'%Y-%m-%d')`
        replacements.push(user.domain_id)
        replacements.push(doc.department_id)
        //--------日计划-----------
        if (doc.searchDateDay) {
            queryStr += ` and ppmaster_date=?`
            replacements.push(doc.searchDateDay)
        }
        //--------周计划-----------
        if (doc.searchDateWeek) {
            queryStr += ` and ppmaster_date=?`
            replacements.push(doc.searchDateWeek)
        }

        let daysResult = await sequelize.query(queryStr, {
            replacements: replacements,
            type: sequelize.QueryTypes.SELECT
        });
        returnData.daysArr = daysResult

        replacements = []
        queryStr = `select p.department_id,p.procedure_id,d.department_name,p.procedure_name 
            from tbl_erc_productionprocedure p
            left join tbl_erc_department d on (p.department_id = d.department_id)
            where p.state=1 and p.department_id=? and d.domain_id=? and p.domain_id = ?`
        replacements.push(doc.department_id)
        replacements.push(user.domain_id)
        replacements.push(user.domain_id)
        let procedure_result = await sequelize.query(queryStr, {
            replacements: replacements,
            type: sequelize.QueryTypes.SELECT
        });

        for (p of procedure_result) {

            // //工序每天的产能信息
            // replacements = []
            // queryStr = `select ppmaster_date,
            //     ppmaster_theory_capacity_day,
            //     ppmaster_reality_capacity,
            //     ppmaster_m_equipment_capacity,
            //     ppmaster_a_equipment_capacity,
            //     ppmaster_holiday_capacity,
            //     ppmaster_repairs_capacity
            //     from tbl_erc_ppmaster
            //     where state=1 and domain_id=? and ppmaster_department_id=? and ppmaster_procedure_id=?
            //     and ppmaster_date >= DATE_FORMAT(now(),'%Y-%m-%d')
            //     `
            // replacements.push(user.domain_id)
            // replacements.push(doc.department_id)
            // replacements.push(p.procedure_id)
            // //--------日计划-----------
            // if (doc.searchDate) {
            //     queryStr += ` and ppmaster_date=?`
            //     replacements.push(doc.searchDate)
            // }
            // //--------周计划-----------
            // if (doc.searchDateBegin) { //
            //     queryStr += ` and ppmaster_date >= ?`
            //     replacements.push(doc.searchDateBegin)
            // }
            // if (doc.searchDateEnd) {
            //     queryStr += ` and ppmaster_date <= ?`
            //     replacements.push(doc.searchDateEnd)
            // }
            // //--------周计划end-----------
            // queryStr += ` group by ppmaster_date,ppmaster_theory_capacity_day,ppmaster_reality_capacity,
            // ppmaster_m_equipment_capacity,ppmaster_a_equipment_capacity,ppmaster_holiday_capacity,ppmaster_repairs_capacity
            // order by ppmaster_date`
            // let procedure_capacity_result = await sequelize.query(queryStr, {
            //     replacements: replacements,
            //     type: sequelize.QueryTypes.SELECT
            // });
            // let theoryArr = [],
            //     realityArr = [],
            //     mEquipmentArr = [],
            //     aEquipmentArr = [],
            //     holidayArr = [],
            //     repairsArr = []
            // for (let pcr of procedure_capacity_result) {
            //     theoryArr.push({
            //         ppmaster_date: pcr.ppmaster_date,
            //         num: pcr.ppmaster_theory_capacity_day
            //     })
            //     realityArr.push({
            //         ppmaster_date: pcr.ppmaster_date,
            //         num: pcr.ppmaster_reality_capacity
            //     })
            //     mEquipmentArr.push({
            //         ppmaster_date: pcr.ppmaster_date,
            //         num: pcr.ppmaster_m_equipment_capacity
            //     })
            //     aEquipmentArr.push({
            //         ppmaster_date: pcr.ppmaster_date,
            //         num: pcr.ppmaster_a_equipment_capacity
            //     })
            //     holidayArr.push({
            //         ppmaster_date: pcr.ppmaster_date,
            //         num: pcr.ppmaster_holiday_capacity
            //     })
            //     repairsArr.push({
            //         ppmaster_date: pcr.ppmaster_date,
            //         num: pcr.ppmaster_repairs_capacity
            //     })
            // }



            // returnData.procedures.push({
            //     procedures_id: p.procedure_id, //工序id
            //     procedure_name: p.procedure_name, //工序名称
            //     name: p.procedure_name + "-主设备日产能",
            //     num: [...mEquipmentArr]
            // })
            // returnData.procedures.push({
            //     procedures_id: p.procedure_id, //工序id
            //     procedure_name: p.procedure_name, //工序名称
            //     name: p.procedure_name + "-辅设备日产能",
            //     num: [...aEquipmentArr]
            // })
            // returnData.procedures.push({
            //     procedures_id: p.procedure_id, //工序id
            //     procedure_name: p.procedure_name, //工序名称
            //     name: p.procedure_name + "-理论日产能",
            //     num: [...theoryArr]
            // })
            // returnData.procedures.push({
            //     procedures_id: p.procedure_id, //工序id
            //     procedure_name: p.procedure_name, //工序名称
            //     name: p.procedure_name + "-假日影响产能",
            //     num: [...holidayArr]
            // })
            // returnData.procedures.push({
            //     procedures_id: p.procedure_id, //工序id
            //     procedure_name: p.procedure_name, //工序名称
            //     name: p.procedure_name + "-报修影响产能",
            //     num: [...repairsArr]
            // })
            // returnData.procedures.push({
            //     procedures_id: p.procedure_id, //工序id
            //     procedure_name: p.procedure_name, //工序名称
            //     name: p.procedure_name + "-实际日产能",
            //     num: [...realityArr]
            // })

            //工序每天的排产信息
            replacements = [], pelement = []
            queryStr = `select pm.productivetask_code,pt.biz_code from tbl_erc_ppmaster pm
                left join tbl_erc_productivetask pt on (pm.productivetask_code=pt.productivetask_code and pt.state=1)
                where pm.state = 1 and pm.domain_id = ? and pm.ppmaster_department_id = ? and pm.ppmaster_procedure_id = ?
                and pm.ppmaster_date >= DATE_FORMAT(now(),'%Y-%m-%d')
                `
            replacements.push(user.domain_id)
            replacements.push(doc.department_id)
            replacements.push(p.procedure_id)
            //--------日计划-----------
            if (doc.searchDateDay) {
                queryStr += ` and ppmaster_date=?`
                replacements.push(doc.searchDateDay)
            }
            //--------周计划-----------
            if (doc.searchDateWeek) {
                queryStr += ` and ppmaster_date=?`
                replacements.push(doc.searchDateWeek)
            }

            queryStr += ` group by pm.productivetask_code,pt.product_level,pt.biz_code `
            let procedure_task_code_arr = await sequelize.query(queryStr, {
                replacements: replacements,
                type: sequelize.QueryTypes.SELECT
            });

            for (let ptca of procedure_task_code_arr) {

                replacements = []
                queryStr = `select * from tbl_erc_ppmaster
                    where state = 1 and domain_id = ? and ppmaster_department_id = ? and ppmaster_procedure_id = ?
                    and ppmaster_date >= DATE_FORMAT(now(),'%Y-%m-%d') and productivetask_code = ?`
                replacements.push(user.domain_id)
                replacements.push(doc.department_id)
                replacements.push(p.procedure_id)
                replacements.push(ptca.productivetask_code)
                //--------日计划-----------
                if (doc.searchDateDay) {
                    queryStr += ` and ppmaster_date=?`
                    replacements.push(doc.searchDateDay)
                }
                //--------周计划-----------
                if (doc.searchDateWeek) {
                    queryStr += ` and ppmaster_date=?`
                    replacements.push(doc.searchDateWeek)
                }
                queryStr += ` order by ppmaster_date`
                let procedure_task_arr = await sequelize.query(queryStr, {
                    replacements: replacements,
                    type: sequelize.QueryTypes.SELECT
                });

                let taskArrTemp = []

                // for (let pta of procedure_task_arr) {
                //     let ynDay = false
                //     for (let ds of daysResult) {
                //         if (ds.ppmaster_date == pta.ppmaster_date) {
                //             taskArrTemp.push({
                //                 ppmaster_date: pta.ppmaster_date,
                //                 num: pta.ppmaster_produce_number,
                //                 ppmaster_id: pta.ppmaster_id,
                //                 ppmaster_check_materiel_state: pta.ppmaster_check_materiel_state,
                //                 ppmaster_check_device_state: pta.ppmaster_check_device_state,
                //                 ppmaster_check_person_state: pta.ppmaster_check_person_state
                //             })
                //             ynDay = true
                //         }
                //     }
                //     if (!ynDay) {
                //         taskArrTemp.push({
                //             ppmaster_date: ds.ppmaster_date,
                //             num: '',
                //             ppmaster_id: '',
                //             ppmaster_check_materiel_state: '',
                //             ppmaster_check_device_state: '',
                //             ppmaster_check_person_state: ''
                //         })
                //     }
                // }

                for (let ds of daysResult) {
                    let ynDay = false
                    for (let pta of procedure_task_arr) {
                        if (ds.ppmaster_date == pta.ppmaster_date) {
                            taskArrTemp.push({
                                ppmaster_date: pta.ppmaster_date,
                                num: pta.ppmaster_produce_number,
                                theory_num: pta.ppmaster_theory_capacity_day, //该工序理论产能
                                ppmaster_id: pta.ppmaster_id,
                                ppmaster_check_materiel_state: pta.ppmaster_check_materiel_state,
                                ppmaster_check_device_state: pta.ppmaster_check_device_state,
                                ppmaster_check_person_state: pta.ppmaster_check_person_state
                            })
                            ynDay = true
                            break
                        }
                    }
                    if (!ynDay) {
                        taskArrTemp.push({
                            ppmaster_date: ds.ppmaster_date,
                            num: '',
                            ppmaster_id: '',
                            ppmaster_check_materiel_state: '',
                            ppmaster_check_device_state: '',
                            ppmaster_check_person_state: ''
                        })
                    }
                }

                let queryTemp = `select m.materiel_name,m.materiel_code from tbl_erc_productivetask p,tbl_erc_materiel m 
                    where p.state=1 and m.state=1 and p.materiel_id=m.materiel_id and productivetask_code='${ptca.productivetask_code}'`
                let tempRes = await sequelize.query(queryTemp, {
                    replacements: [],
                    type: sequelize.QueryTypes.SELECT
                });
                pelement.push({
                    procedures_id: p.procedure_id, //工序id
                    procedure_name: p.procedure_name, //工序名称
                    name: ptca.productivetask_code,
                    biz_code: ptca.biz_code,
                    materiel_name: tempRes[0].materiel_name,
                    materiel_code: tempRes[0].materiel_code,
                    num: [...taskArrTemp]
                })
            } //生产任务单对应的排产计划结束
            logger.info(pelement)
            //根据taskArrTemp的起始时间，将procedures排序
            for (let pe of pelement) {
                // pe.num = pe.num.sort(compare('ppmaster_date'))
                for (penum of pe.num) {
                    if (penum.num != '') {
                        pe.pmaster_date_min = penum.ppmaster_date
                        break
                    }
                }
            }
            logger.info(pelement)
            pelement = pelement.sort(compare('pmaster_date_min'))
            returnData.procedures = returnData.procedures.concat(pelement)
        } //工序结束

        logger.info(returnData)
        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
        return;
    }

}

function compare(property) {
    return function (a, b) {
        if (a.num != '' && b.num != '') {
            var value1 = a[property];
            var value2 = b[property];
            // return moment(value1) - moment(value2);
            return moment(value1).isAfter(moment(value2));
        }
    }
}

async function getMaterielListByOrder(req, res) {
    const {
        body,
        user
    } = req;

    try {
        const {
            domain_id
        } = user;
        const {
            ppmaster_id,
            ppmasterptdetail_id,
            productivetask_id,
            materiel_id
        } = body;

        const productiveTask = await tb_productivetask.findOne({
            where: {
                productivetask_id
            },
            attributes: ['order_id']
        });

        if (!productiveTask || !productiveTask.order_id) {
            return common.sendError(res, 'order_01');
        }

        const queryStr =
            `select
                s.order_id, s.safe_amount, s.current_amount, s.store_price
                , m.materiel_id, m.materiel_code, m.materiel_name
                from tbl_erc_stockmap s
                left join tbl_erc_materiel
                m on (s.materiel_id = m.materiel_id and m.state = 1)
                where true
                and s.state = 1
                and s.is_idle_stock = 0
                and s.order_id != ?
                and m.materiel_id = ?
                and s.domain_id = ?`;

        /*const queryStr =
            `select
                s.order_id, s.safe_amount, s.current_amount, s.store_price
                , m.materiel_id, m.materiel_code, m.materiel_name
                , if(pmm.moved_number is null, 0, pmm.moved_number) as moved_number
                from tbl_erc_stockmap s
                left join tbl_erc_materiel
                m on (s.materiel_id = m.materiel_id and m.state = 1)
                left join tbl_erc_ppmovemateriel pmm
                on s.order_id = pmm.order_id
                where true
                and s.state = 1
                and s.is_idle_stock = 0
                and s.order_id != ?
                and m.materiel_id = ?
                and s.domain_id = ?
                and pmm.ppmaster_id = ?
                and pmm.ppmasterptdetail_id = ?`;*/

        const result = await common.simpleSelect(sequelize, queryStr, [productiveTask.order_id, materiel_id, domain_id]);
        common.sendData(res, result);
    } catch (error) {
        common.sendFault(res, error);
    }
}

async function submitMoveMateriel(req, res) {
    const {
        body,
        user
    } = req;

    try {
        const {
            domain_id
        } = user;
        const {
            ppmaster_id,
            ppmasterptdetail_id,
            order_id,
            materiel_id,
            moved_number,
            ppmovemateriel_date,
            ppmovemateriel_user_id,
            ppmovemateriel_phone
        } = body;

        await tb_taskallot.findOne({
            where: {
                state: GLBConfig.ENABLE,
                taskallot_name: '挪料任务'
            }
        });

        const ppmovemateriel_code = await Sequence.genMoveMaterielID(domain_id);
        const ppmovemateriel = await tb_ppmovemateriel.create({
            ppmovemateriel_code,
            domain_id,
            ppmaster_id, //生产计划
            ppmasterptdetail_id, //生生产计划的投料ID产计划
            order_id,
            materiel_id,
            moved_number, //挪料数量
            ppmovemateriel_date, //日期
            ppmovemateriel_user_id, //指派人
            ppmovemateriel_phone, //指派人电话
            ppmovemateriel_state: 0
        });

        const taskName = '挪料任务';
        const taskDescription = '  挪料任务';
        const groupId = common.getUUIDByTime(30);
        const taskResult = await task.createTask(user, taskName, 95, ppmovemateriel_user_id, ppmovemateriel.ppmovemateriel_id, taskDescription, '', groupId);
        if (!taskResult) {
            return common.sendError(res, 'task_01');
        } else {
            common.sendData(res, ppmovemateriel);
        }
    } catch (error) {
        common.sendFault(res, error);
    }
}

async function getPPMasmterDayProductiveTaskDetail(req, res) {
    try {
        let doc = common.docTrim(req.body),
            user = req.user,
            returnData = {},
            replacements = [],
            queryStr = ''

        queryStr = `
            select ptd.ppmasterptdetail_id,ptd.ppmaster_id,ptd.productivetask_id,ptd.taskdetaildesign_number,ptd.reality_number,
                m.materiel_format,m.materiel_unit,m.materiel_code,m.materiel_name,m.materiel_id 
                from tbl_erc_ppmasterptdetail ptd
                left join tbl_erc_materiel m on (ptd.materiel_id = m.materiel_id and m.state=1) 
                where ptd.ppmaster_id=?`
        replacements = [doc.ppmaster_id]
        let result = await common.queryWithCount(sequelize, req, queryStr, replacements);
        returnData.total = result.count;
        returnData.rows = result.data;
        common.sendData(res, returnData);
        return result
    } catch (error) {
        throw error
    }
}

async function modifyPTDetail(req, res) {
    try {
        let doc = common.docTrim(req.body)
        let user = req.user
        let ppmasterptdetail = await tb_ppmasterptdetail.findOne({
            where: {
                ppmasterptdetail_id: doc.old.ppmasterptdetail_id
            }
        })
        if (ppmasterptdetail) {
            ppmasterptdetail.reality_number = doc.new.reality_number
            await ppmasterptdetail.save();

            common.sendData(res, ppmasterptdetail)
        } else {
            common.sendError(res, 'group_02')
            return
        }
    } catch (error) {
        common.sendFault(res, error)
    }
}

async function modifyPTState(req, res) {
    try {
        let doc = common.docTrim(req.body)
        let user = req.user,
            queryStr = "",
            replacements = [],
            materielState = "",
            personState = "",
            deviceState = ""

        if (doc.modifyType == 0) { //投料检查
            queryStr = `select if(sumTaskdetaildesignNumber<>sumRealityNumber,0,1) as checkMaterielState
                from (select 
                    sum(taskdetaildesign_number) as sumTaskdetaildesignNumber,
                    sum(reality_number) as sumRealityNumber 
                    from tbl_erc_ppmasterptdetail
                    where state=1 and ppmaster_id=?) 
                as a`
            replacements = [doc.ppmaster_id]
            let materielResult = await sequelize.query(queryStr, {
                replacements: replacements,
                type: sequelize.QueryTypes.SELECT
            });
            if (materielResult[0].checkMaterielState == 0) {
                materielState = 1
            } else {
                materielState = 2
            }

            await tb_ppmaster.update({
                ppmaster_check_materiel_state: materielState
            }, {
                where: {
                    ppmaster_id: doc.ppmaster_id
                }
            });

        } else if (doc.modifyType == 2) { //人员检查
            queryStr = `select * from tbl_erc_ppmaster where state=1 and ppmaster_id=?`
            replacements = [doc.ppmaster_id]
            let personResult = await sequelize.query(queryStr, {
                replacements: replacements,
                type: sequelize.QueryTypes.SELECT
            });
            if (personResult[0].ppmaster_user_id) {
                personState = 2
            } else {
                personState = 1
            }
            await tb_ppmaster.update({
                ppmaster_check_person_state: personState
            }, {
                where: {
                    ppmaster_id: doc.ppmaster_id
                }
            });
        } else if (doc.modifyType == 1) { //设备检查
            replacements = [doc.ppmaster_id]
            queryStr = `select ppmaster_produce_number from tbl_erc_ppmaster where state=1 and ppmaster_id=?`
            let ppmasterResult = await sequelize.query(queryStr, {
                replacements: replacements,
                type: sequelize.QueryTypes.SELECT
            });
            queryStr = `select sum(allot_number) as sumAllotNumber from tbl_erc_ppmasterdaydevice where state=1 and ppmaster_id=?`
            let deviceResult = await sequelize.query(queryStr, {
                replacements: replacements,
                type: sequelize.QueryTypes.SELECT
            });

            if (ppmasterResult[0].ppmaster_produce_number != Number(deviceResult[0].sumAllotNumber) / 2) {
                deviceState = 1
            } else {
                deviceState = 2
            }

            await tb_ppmaster.update({
                ppmaster_check_device_state: deviceState
            }, {
                where: {
                    ppmaster_id: doc.ppmaster_id
                }
            });
        }

        common.sendData(res, {})
    } catch (error) {
        common.sendFault(res, error)
    }
}


async function getPPMasterDayPerson(req, res) {
    try {
        let doc = common.docTrim(req.body)
        let user = req.user,
            queryStr = "",
            replacements = [],
            returnData = {}

        queryStr = `select p.*,u.username,pp.procedure_name,pp.procedure_code from tbl_erc_ppmaster p 
            left join tbl_common_user u on (p.ppmaster_user_id = u.user_id and u.state=1)
            left join tbl_erc_productionprocedure pp on (p.ppmaster_procedure_id = pp.procedure_id and pp.state=1)
            where p.ppmaster_id = ?`
        replacements = [doc.ppmaster_id]
        let result = await common.queryWithCount(sequelize, req, queryStr, replacements);
        returnData.total = result.count;
        returnData.rows = result.data;
        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error)
    }
}
async function getPPMasterDayDevice(req, res) {
    try {
        let doc = common.docTrim(req.body)
        let user = req.user,
            queryStr = "",
            replacements = [],
            returnData = {}

        queryStr = `select * from tbl_erc_ppmasterdaydevice where state=1 and ppmaster_id=?`
        replacements = [doc.ppmaster_id]
        let result = await common.queryWithCount(sequelize, req, queryStr, replacements);
        returnData.total = result.count;
        returnData.rows = result.data;
        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error)
    }
}
async function addReceive(req, res) {
    try {
        let doc = common.docTrim(req.body),
            user = req.user

        //校验是否分配任务处理人员
        let taskallot = await tb_taskallot.findOne({
            where: {
                state: GLBConfig.ENABLE,
                taskallot_name: '跟线生产任务'
            }
        });



        let GXTZ = await Sequence.genProductReceiveID(user.domain_id);
        let ppmasterreceive = await tb_ppmasterreceive.create({
            domain_id: user.domain_id,
            ppmaster_id: doc.ppmaster_id, //生产计划
            ppmasterptdetail_id: doc.ppmasterptdetail_id, //生生产计划的投料ID产计划
            materiel_id: doc.materiel_id,
            ppmasterreceive_code: GXTZ,
            ppmasterreceive_lack_number: doc.ppmasterreceive_lack_number, //缺少数量
            ppmasterreceive_number: doc.ppmasterreceive_number, //跟线数量
            ppmasterreceive_date: doc.ppmasterreceive_date, //日期
            ppmasterreceive_user_id: doc.ppmasterreceive_user_id, //指派人
            ppmasterreceive_phone: doc.ppmasterreceive_phone, //指派人电话
            ppmasterreceive_state: 0
        })

        let taskName = '跟线生产任务';
        let taskDescription = '  跟线生产任务';
        let groupId = common.getUUIDByTime(30);
        let taskResult = await task.createTask(user, taskName, 94, doc.ppmasterreceive_user_id, ppmasterreceive.ppmasterreceive_id, taskDescription, '', groupId);
        if (!taskResult) {
            return common.sendError(res, 'task_01');
        } else {
            common.sendData(res, ppmasterreceive);
        }

    } catch (error) {
        common.sendFault(res, error);
    }
}

async function modifyState(req, ppmasterreceive_id) {
    await sequelize.transaction(async transaction => {
        const masterReview = await tb_ppmasterreceive.findOne({
            where: {
                ppmasterreceive_id
            }
        });

        if (!masterReview) {
            throw new Error('ppmasterreceive missing');
        }

        masterReview.ppmasterreceive_state = 1;
        await masterReview.save({ transaction });

        const masterDetail = await tb_ppmasterptdetail.findOne({
            where: {
                ppmasterptdetail_id: masterReview.ppmasterptdetail_id
            }
        });

        if (!masterDetail) {
            throw new Error('ppmasterptdetail missing');
        }

        const productiveTask = await tb_productivetask.findOne({
            where: {
                productivetask_id: masterDetail.productivetask_id
            }
        });

        if (!productiveTask) {
            throw new Error('productivetask missing');
        }

        const { user } = req;
        const {
            productivetask_id,
            domain_id,
            outsource_sign,
            order_id
        } = productiveTask;
        const production_type = {
            1: 5,
            3: 7
        } [outsource_sign];
        const params = {
            user,
            production_type,
            domain_id,
            productivetask_id,
            order_id,
            warehouse_id: 0,
            warehouse_zone_id: 0
        };

        const materiel = await tb_productivetask.findOne({
            where: {
                state: 1,
                productivetask_id: productivetask_id
            }
        });
        params.materiel_id = materiel.materiel_id;
        await productionInputStorage(params, parseInt(masterReview.ppmasterreceive_lack_number), transaction);
        await productionOutputStorage(params, parseInt(masterReview.ppmasterreceive_lack_number), transaction);
    });
}

async function showSearchDate(req, res) {
    // pItem
    // materiel_code: "03.04.217001"
    // materiel_name: "217-2铝管"
    // name: "SCRW68201907050458"
    // num: [{ppmaster_date: "2019-07-05", num: 36000, ppmaster_id: 2426, ppmaster_check_materiel_state: 0,…},…]
    // pmaster_date_min: "2019-07-05"
    // procedure_name: "涂处理剂"
    // procedures_id: 260

    // pnItem
    // num: 36000
    // theory_num: 39000
    // ppmaster_check_device_state: 0
    // ppmaster_check_materiel_state: 0
    // ppmaster_check_person_state: 0
    // ppmaster_date: "2019-07-05"
    // ppmaster_id: 2426
    try {
        let doc = common.docTrim(req.body),
            user = req.user,
            returnData = [];

        // let queryStr = `
        //     SELECT
        //         pp.department_id, d.department_name,pp.procedure_id ,pp.procedure_name,
        //         sum(if(ppd.device_level=1,ppd.day_capacity,0)) as sumDayCapacityZ,
        //         sum(if(ppd.device_level=2,ppd.day_capacity,0)) as sumDayCapacityF
        //     FROM
        //         tbl_erc_productproceduredevice ppd
        //         LEFT JOIN tbl_erc_productionprocedure pp ON (ppd.productprocedure_id = pp.procedure_id AND pp.state = 1)
        //         LEFT JOIN tbl_erc_department d ON (pp.department_id = d.department_id AND d.state = 1)
        //     WHERE
        //         ppd.state = 1 AND ppd.domain_id =${user.domain_id} and productprocedure_id = ${doc.procedures_id}
        //     GROUP BY
        //         pp.department_id, d.department_name,pp.procedure_id ,pp.procedure_name`

        // let DPtheoryNumAll = await sequelize.query(queryStr, {
        //     replacements: [],
        //     type: sequelize.QueryTypes.SELECT
        // });

        // for (let d of DPtheoryNumAll) {
        //     if (d.sumDayCapacityZ == 0 && d.sumDayCapacityF == 0) {
        //         d.sumDayCapacityTheory = 0
        //     } else {
        //         if (d.sumDayCapacityZ == 0) {
        //             d.sumDayCapacityTheory = d.sumDayCapacityF
        //         } else if (d.sumDayCapacityF == 0) {
        //             d.sumDayCapacityTheory = d.sumDayCapacityZ
        //         } else {
        //             d.sumDayCapacityTheory = d.sumDayCapacityZ <= d.sumDayCapacityF ? d.sumDayCapacityZ : d.sumDayCapacityF
        //         }
        //     }
        // }
        // logger.info('DPtheoryNumAll', DPtheoryNumAll)
        let department = await tb_department.findOne({
            where: {
                state: 1,
                department_id: doc.department_id
            }
        })

        let capacity_reality_day = 0,
            capacity_reality_day_all = 0,
            capacity_surplus_day = 0,
            capacity_surplus_dat_all = 0,
            // sumDayCapacityTheory = DPtheoryNumAll.length > 0 ? DPtheoryNumAll[0].sumDayCapacityTheory : 0
            sumDayCapacityTheory = doc.theory_num

        let offsetDays = Math.abs(Number(doc.srearch_days))
        for (let i = 1; i <= offsetDays; i++) {
            //日期
            let show_date = ''
            if (Number(doc.srearch_days) < 0) {
                show_date = moment(doc.srearch_begin_date).subtract(Number(i), "days").format("YYYY-MM-DD")
            } else {
                show_date = moment(doc.srearch_begin_date).add(Number(i), "days").format("YYYY-MM-DD")
            }

            //工作时长的实际产能、全天的实际产能
            capacity_reality_day = sumDayCapacityTheory
            capacity_reality_day_all = parseInt(Number(capacity_reality_day) / Number(department.work_time) * 24)

            let getWeekDay = moment(show_date).format('d')
            if (department.vacation_type == 1) { //单休
                if (getWeekDay == 0) {
                    capacity_reality_day = 0
                    capacity_reality_day_all = 0
                }
            } else if (department.vacation_type == 2) { //双休
                if (getWeekDay == 6 || getWeekDay == 0) {
                    capacity_reality_day = 0
                    capacity_reality_day_all = 0
                }
            }

            // 剩余产能
            let ppmaster_produce_number_sum = await tb_ppmaster.sum('ppmaster_produce_number', {
                where: {
                    state: 1,
                    ppmaster_date: show_date,
                    domain_id: user.domain_id,
                    ppmaster_procedure_id: doc.procedures_id
                }
            })
            ppmaster_produce_number_sum = ppmaster_produce_number_sum ? ppmaster_produce_number_sum : 0
            capacity_surplus_day = Number(capacity_reality_day) - Number(ppmaster_produce_number_sum) >= 0 ? Number(capacity_reality_day) - Number(ppmaster_produce_number_sum) : 0
            capacity_surplus_dat_all = Number(capacity_reality_day_all) - Number(ppmaster_produce_number_sum) >= 0 ? Number(capacity_reality_day_all) - Number(ppmaster_produce_number_sum) : 0

            //交货日期
            let queryStr = `select min(delivery_date) as min_delivery_date from tbl_erc_delivery d 
                left join tbl_erc_productivetask p on (d.order_id=p.order_id and p.state=1 )
                where d.state=1 and p.productivetask_code='${doc.productivetask_code}'`
            let delivery = await sequelize.query(queryStr, {
                replacements: [],
                type: sequelize.QueryTypes.SELECT
            });
            let delivery_date = delivery.length > 0 ? moment(delivery[0].min_delivery_date).format('YYYY-MM-DD') : ''

            returnData.push({
                show_date, //日期
                capacity_reality_day, //实际日产能
                capacity_reality_day_all, //24小时日产能
                capacity_surplus_day, //实际日产能剩余
                capacity_surplus_dat_all, //24小时日产能剩余
                delivery_date //交货日期
            })
        }

        if (Number(doc.srearch_days) < 0) {
            returnData.sort(function (a, b) {
                return a.show_date > b.show_date ? 1 : -1
            });
        }
        logger.info(returnData)
        common.sendData(res, returnData);

    } catch (error) {
        common.sendFault(res, error);
        return;
    }
}
async function modifyPPmaster(req, res) {
    try {
        let doc = common.docTrim(req.body),
            user = req.user,
            returnData = [],
            replacements = [],
            queryStr = '';
        //将当前的产品计划数量减掉
        queryStr = `update tbl_erc_ppmaster set ppmaster_produce_number=ppmaster_produce_number - ? where ppmaster_id=?`
        let modPPmaster = await sequelize.query(queryStr, {
            replacements: [doc.changeNum, doc.ppmaster_id],
            type: sequelize.QueryTypes.UPDATE
        });

        let ppmaster = await tb_ppmaster.findOne({
            where: {
                state: 1,
                ppmaster_department_id: doc.ppmaster_department_id,
                ppmaster_procedure_id: doc.ppmaster_procedure_id,
                productivetask_code: doc.productivetask_code,
                ppmaster_date: doc.changeDate
            }
        })

        if (ppmaster) {
            ppmaster.ppmaster_produce_number = Number(ppmaster.ppmaster_produce_number) + Number(doc.changeNum)
            ppmaster.save()
        } else {
            //新增产品计划
            queryStr = `insert into tbl_erc_ppmaster 
                (domain_id,ppmaster_date,ppmaster_department_id,ppmaster_procedure_id,ppmaster_procedure_level,ppmaster_m_equipment_capacity,ppmaster_a_equipment_capacity,ppmaster_work_duration,
                ppmaster_theory_capacity_day,ppmaster_holiday_capacity,ppmaster_repairs_capacity,ppmaster_reality_capacity,productivetask_code,ppmaster_produce_number,ppmaster_residue_number,
                ppmaster_check_materiel_state,ppmaster_check_device_state,ppmaster_check_person_state,ppmaster_user_id,ppmaster_order_id,ppmaster_materiel_id,state,version,created_at,updated_at) 
                select domain_id,?,ppmaster_department_id,ppmaster_procedure_id,ppmaster_procedure_level,ppmaster_m_equipment_capacity,ppmaster_a_equipment_capacity,ppmaster_work_duration,
                ppmaster_theory_capacity_day,ppmaster_holiday_capacity,ppmaster_repairs_capacity,ppmaster_reality_capacity,productivetask_code,?,ppmaster_residue_number,
                ppmaster_check_materiel_state,ppmaster_check_device_state,ppmaster_check_person_state,ppmaster_user_id,ppmaster_order_id,ppmaster_materiel_id,1,0,now(),now() from tbl_erc_ppmaster where ppmaster_id = ?`
            let addPPmaster = await sequelize.query(queryStr, {
                replacements: [doc.changeDate, doc.changeNum, doc.ppmaster_id],
                type: sequelize.QueryTypes.UPDATE
            });
        }


        common.sendData(res, {});
    } catch (error) {
        common.sendFault(res, error);
        return;
    }
}

// daysArr:[
//     {ppmaster_date: "2019-07-12"},
//     {ppmaster_date: "2019-07-13"}
// ]
// procedures:[
//     {
//         materiel_code: "03.05.217001"
//         materiel_name: "TN-217显影辊半成品"
//         name: "SCRW69201907080314"
//         num: [{ppmaster_date: "2019-07-12", num: 39011, theory_num: 39000, ppmaster_id: 1944,…},…]
//         pmaster_date_min: "2019-07-12"
//         procedure_name: "涂处理剂"
//         procedures_id: 311
//     },
//     {
//         materiel_code: "03.05.217001"
//         materiel_name: "TN-217显影辊半成品"
//         name: "SCRW69201907080314"
//         num: [{ppmaster_date: "2019-07-12", num: 30000, theory_num: 30000, ppmaster_id: 1939,…},…]
//         pmaster_date_min: "2019-07-12"
//         procedure_name: "套管"
//         procedures_id: 314
//     }
// ]

// num: 30000
// ppmaster_check_device_state: 0
// ppmaster_check_materiel_state: 0
// ppmaster_check_person_state: 0
// ppmaster_date: "2019-07-12"
// ppmaster_id: 1939
// theory_num: 30000


async function exportData(req, res) {
    try {
        let doc = common.docTrim(req.body);

        //表格头部
        let str = '生产任务单号,工序,物料编码,物料名称,'
        for (let d of doc.ppmaster.daysArr) {
            str += d.ppmaster_date + ','
        }
        str = str.substr(0, str.length - 1)
        str += '\r'

        for (p of doc.ppmaster.procedures) {
            str += p.name + ',' + p.procedure_name + ',' + p.materiel_code + ',' + p.materiel_name + ','
            for (pn of p.num) {
                str += pn.num + ','
            }
            str = str.substr(0, str.length - 1)
            str += '\r'
        }
        logger.info(str)
        let filename = doc.department.department_name + '.csv';
        let tempfile = path.join(__dirname, '../../../' + config.uploadOptions.uploadDir + '/' + filename);
        let csvBuffer = iconvLite.encode(str, 'gb2312');
        fs.writeFile(tempfile, csvBuffer, function (err) {
            if (err) throw err;
            common.sendData(res, config.tmpUrlBase + filename);
        });
    } catch (error) {
        common.sendFault(res, error);
    }
}

exports.modifyStateForMoveMateriel = async function (req, ppmovemateriel_id) {
    try {
        const movemateriel = await tb_ppmovemateriel.findOne({
            ppmovemateriel_id
        });

        if (movemateriel) {
            movemateriel.ppmovemateriel_state = 1;
            await movemateriel.save();

            const {
                ppmasterptdetail_id,
                order_id,
                materiel_id,
                moved_number
            } = movemateriel;

            const materielData = await tb_materiel.findOne({
                where: {
                    materiel_id
                }
            });

            if (materielData) {
                const {
                    materiel_source
                } = materielData;
                if (materiel_source === '1' || materiel_source === '3') {
                    const ppmasterPtDetail = await tb_ppmasterptdetail.findOne({
                        where: {
                            ppmasterptdetail_id
                        }
                    });

                    if (ppmasterPtDetail) {
                        const {
                            productivetask_id
                        } = ppmasterPtDetail;
                        const productiveTask = await tb_productivetask.findOne({
                            where: {
                                productivetask_id
                            }
                        });

                        if (productiveTask) {
                            productiveTask.taskdesign_number += moved_number;
                            productiveTask.stock_in_state = 2;
                            await productiveTask.save();
                        }
                    }
                } else if (materiel_source === '2') {
                    const qualityCheckDetail = await tb_qualitycheckdetail.findOne({
                        where: {
                            order_id,
                            materiel_id
                        }
                    });

                    if (qualityCheckDetail) {
                        qualityCheckDetail.qualified_number += moved_number;
                        await qualityCheckDetail.save();
                    }
                }
            }
        }
    } catch (error) {
        throw error
    }
};

exports.modifyState = modifyState
