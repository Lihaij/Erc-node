const common = require('../../../util/CommonUtil');
const GLBConfig = require('../../../util/GLBConfig');
const logger = require('../../../util/Logger').createLogger('ERCDailyPlanControl');
const model = require('../../../model');
const Sequence = require('../../../util/Sequence');
const FDomain = require('../../../bl/common/FunctionDomainBL');
const sequelize = model.sequelize;
const moment = require('moment');
const task = require('../baseconfig/ERCTaskListControlSRV');

const tb_domain = model.common_domain;
const tb_user = model.common_user;
const tb_productivetask = model.erc_productivetask;
const tbl_product_plan_execute = model.erc_product_plan_execute
exports.ERCProductPlanExecuteControlResource = (req, res) => {
    let method = req.query.method;
    if (method === 'init') {
        initAct(req, res)
    } else if (method === 'getPlanExecute') {
        getPlanExecute(req, res)
    } else {
        common.sendError(res, 'common_01')
    }
};
async function initAct(req, res) {
    let returnData = {};
    try {
        returnData.productivetaskstate = GLBConfig.PRODUCTIVETASKSTATE;
        common.sendData(res, returnData)
    } catch (error) {
        common.sendFault(res, error);
        return;
    }

}
const getPlanExecute = async (req, res) => {
    try {
        let doc = common.docTrim(req.body),
            user = req.user,
            returnData = {},
            replacements = [],
            queryStr = '',
            result = [];

        /*根据stock_out_state(出库状态)，stock_in_state(入库状态)
        修改productivetask_state(生产任务单状态)，这步操作为了方便生产任务单查询*/
        queryStr = `select * from tbl_erc_productivetask where state=1 and productivetask_state is null`;
        result = await sequelize.query(queryStr, {
            replacements: [],
            type: sequelize.QueryTypes.SELECT
        });
        if (result && result.length > 0) {
            for (let r of result) {
                if (r.stock_in_state == 3) { //完全入库==生产完成
                    let update = await tb_productivetask.update({
                        productivetask_state: 3,
                    }, {
                        where: {
                            productivetask_id: r.productivetask_id
                        }
                    });
                } else if (r.stock_in_state == 2) { //部分入库 == 生产中
                    let update = await tb_productivetask.update({
                        productivetask_state: 2,
                    }, {
                        where: {
                            productivetask_id: r.productivetask_id
                        }
                    });
                } else { //入库新纪录
                    if (r.stock_out_state == 2 || r.stock_out_state == 3) { //部分入库 == 生产中
                        let update = await tb_productivetask.update({
                            productivetask_state: 2,
                        }, {
                            where: {
                                productivetask_id: r.productivetask_id
                            }
                        });
                    } else { //未生产
                        let update = await tb_productivetask.update({
                            productivetask_state: 1,
                        }, {
                            where: {
                                productivetask_id: r.productivetask_id
                            }
                        });
                    }
                }
            }
        }

        /*
         *   生产任务单分为"最终的产品product_level=1"和"投料产品product_level<>1"，对应的车间有不同取值
         *   productivetask_state  1未生产，2生产中，3生产完成
         *   产品编码,产品名称,生产任务单号,销售订单号,工序名称,生产车间,开始日期,结束日期,施工状态
         */
        replacements = [];
        queryStr = `select 
            m1.materiel_code as m1_materiel_code,m1.materiel_name as m1_materiel_name,m1.materiel_id as m1_materiel_id,
            m2.materiel_code as m2_materiel_code,m2.materiel_name as m2_materiel_name,m2.materiel_id as m2_materiel_id,
            pt.order_id,pt.productivetask_code,pt.productivetask_state,pp.workshop_id,ed.department_name,
            pt.product_level,ppd.procedure_name,ppp.priority,pt.productivetask_id,pp.product_id,pt.taskdesign_number 
            from tbl_erc_productivetask pt
            left join tbl_erc_productplan pp 
                on (pt.product_id=pp.product_id and pp.state=1)
            left join tbl_erc_materiel m1 
                on (pp.materiel_id=m1.materiel_id and m1.state=1)
            left join tbl_erc_materiel m2 
                on (pt.materiel_id=m2.materiel_id and m2.state=1)
            left join tbl_erc_productplanprocedure ppp 
                on (pt.product_id=ppp.product_plan_id and ppp.rlt_materiel_code = pt.materiel_id and ppp.state=1 )
            left join tbl_erc_productionprocedure ppd 
                on (ppp.procedure_id = ppd.procedure_id and ppd.state=1)
	        left join tbl_erc_department ed
                on (ed.department_id = pp.workshop_id and ed.state=1)
            where pt.state=1  and pt.productivetask_state <> 3 and pt.product_level=1  
            union all 
            select 
            m1.materiel_code as m1_materiel_code,m1.materiel_name as m1_materiel_name,m1.materiel_id as m1_materiel_id,
            m2.materiel_code as m2_materiel_code,m2.materiel_name as m2_materiel_name,m2.materiel_id as m2_materiel_id,
            pt.order_id,pt.productivetask_code,pt.productivetask_state,pd.workshop_id,ed.department_name,
            pt.product_level,ppd.procedure_name,ppp.priority,pt.productivetask_id,pp.product_id,pt.taskdesign_number 
            from tbl_erc_productivetask pt
            left join tbl_erc_productplan pp 
                on (pt.product_id=pp.product_id and pp.state=1)
            left join tbl_erc_productplandetail pd
                on (pt.product_id=pd.product_plan_id and pd.src_materiel_id=pt.materiel_id and pd.state=1)
            left join tbl_erc_materiel m1 
                on (pp.materiel_id=m1.materiel_id and m1.state=1)
            left join tbl_erc_materiel m2 
                on (pt.materiel_id=m2.materiel_id and m2.state=1)
            left join tbl_erc_productplanprocedure ppp 
                on (pt.product_id=ppp.product_plan_id and ppp.rlt_materiel_code = pt.materiel_id and ppp.state=1 )
            left join tbl_erc_productionprocedure ppd 
                on (ppp.procedure_id = ppd.procedure_id and ppd.state=1)
	        left join tbl_erc_department ed
                on (ed.department_id = pd.workshop_id and ed.state=1)
            where pt.state=1  and pt.productivetask_state <> 3 and pt.product_level<>1`;

        result = await sequelize.query(queryStr, {
            replacements: replacements,
            type: sequelize.QueryTypes.SELECT
        });

        /*
         * 将生产任务单按最终的产品和订单号整理，[[1,2,3],[1,3,4],[1,2,5]]，每个二维数组是一个生产任务单,
         * 第0个元素是最终的产品，从订单评审的交货日期确定开始日期，投料的生产日期即可顺序向下推算*/
        let prodArr = [],
            oneTempArr = [];
        for (let r of result) {
            if (r.product_level == 1) {
                oneTempArr.push(r)
            }
        }
        for (let o of oneTempArr) {
            let tempArr = []
            tempArr.push(o)
            for (let r of result) {
                if (r.m1_materiel_code == o.m1_materiel_code && r.order_id == o.order_id && r.product_level != 1) {
                    tempArr.push(r)
                }
            }
            tempArr.sort(function (a, b) {
                if (a.product_level < b.product_level) return -1;
                if (a.product_level > b.product_level) return 1;
                return 0;
            });
            prodArr.push(tempArr)
        }

        logger.info(prodArr);

        /*计算开始、结束日期
         * 最终产品:
         * 结束日期=订单评审交货日期的前一天
         * 开始日期=结束日期-日产能*数量
         * 日产能=工序->生产设备->最小日产能*/
        for (let pd of prodArr) {
            var prod_end_date = ''
            for (let i = 0; i < pd.length; i++) {
                if (pd[i].product_level == 1) { //最终产品的开始begin_data、结束日期end_date
                    replacements = [];
                    queryStr = `select min(delivery_date) as min_deliver_date
                    from tbl_erc_deliveryitem di,tbl_erc_delivery d 
                    where di.state=1 and d.state=1 and di.delivery_id=d.delivery_id 
                    and d.order_id=? and di.materiel_id=?`;
                    replacements.push(pd[i].order_id);
                    replacements.push(pd[i].m2_materiel_id);
                    result = await sequelize.query(queryStr, {
                        replacements: replacements,
                        type: sequelize.QueryTypes.SELECT
                    });
                    if (result && result.length > 0) {
                        replacements = [];
                        pd[i].end_date = moment(result[0].min_deliver_date).subtract(1, "days").format("YYYY-MM-DD"); //结束日期
                        pd[i].prod_end_date = pd[i].end_date;
                        prod_end_date = pd[i].end_date;
                        queryStr = `select min(d.day_capacity) as min_day_capacity
                        from 
                        tbl_erc_productplanprocedure a,tbl_erc_productionprocedure b,
                        tbl_erc_productproceduredevice c, tbl_erc_productdevice d 
                        where 
                        a.procedure_id = b.procedure_id 
                        and b.procedure_id = c.productprocedure_id 
                        and c.productdevice_id = d.fixedassetsdetail_id
                        and a.state=1 and b.state=1 and c.state=1 and d.state=1 
                        and a.product_plan_id=? and rlt_materiel_code=?                                          
                        `
                        replacements.push(pd[i].product_id)
                        replacements.push(pd[i].m2_materiel_id)
                        result = await sequelize.query(queryStr, {
                            replacements: replacements,
                            type: sequelize.QueryTypes.SELECT
                        });
                        if (result && result.length > 0) {
                            if (Number(result[0].min_day_capacity) > 0) {
                                pd[i].begin_date = moment(pd[i].end_date).subtract(Math.ceil(Number(pd[i].taskdesign_number) / Number(result[0].min_day_capacity)), "days").format("YYYY-MM-DD")
                            } else {
                                pd[i].begin_date = ''
                            }

                            console.log('pd[i].begin_date -- if ', i)
                            console.log('pd[i].begin_date -- if ', pd[i].begin_date)
                        }
                    } else {
                        continue
                    }
                } else {
                    pd[i].prod_end_date = prod_end_date;
                    if (pd[i - 1].begin_date != "") {
                        pd[i].end_date = moment(pd[i - 1].begin_date).subtract(1, "days").format("YYYY-MM-DD")
                    } else {
                        pd[i].end_date = ""
                    }

                    replacements = [];
                    queryStr = `select min(d.day_capacity) as min_day_capacity
                    from 
                    tbl_erc_productplanprocedure a,tbl_erc_productionprocedure b,
                    tbl_erc_productproceduredevice c, tbl_erc_productdevice d 
                    where 
                    a.procedure_id = b.procedure_id 
                    and b.procedure_id = c.productprocedure_id 
                    and c.productdevice_id = d.fixedassetsdetail_id
                    and a.state=1 and b.state=1 and c.state=1 and d.state=1 
                    and a.product_plan_id=? and rlt_materiel_code=?` //查询产能
                    replacements.push(pd[i].product_id)
                    replacements.push(pd[i].m2_materiel_id)
                    result = await sequelize.query(queryStr, {
                        replacements: replacements,
                        type: sequelize.QueryTypes.SELECT
                    });
                    if (result && result.length > 0) {
                        if (Number(result[0].min_day_capacity) > 0 && pd[i - 1].begin_date != '') {
                            pd[i].begin_date = moment(pd[i].end_date).subtract(Math.ceil(Number(pd[i].taskdesign_number) / Number(result[0].min_day_capacity)), "days").format("YYYY-MM-DD")
                        } else {
                            pd[i].begin_date = ""
                        }

                        console.log('pd[i].begin_date -- else ', i)
                        console.log('pd[i].begin_date -- else ', pd[i].begin_date)
                    } else {
                        continue
                    }
                }
            }
        }

        logger.info(prodArr);
        /*保存临时表，排序，每次查询通过UUID区分*/
        let UUID = common.getUUIDByTime(30);
        for (let pa of prodArr) {
            for (let p of pa) {

                let product_plan_execute = await tbl_product_plan_execute.create({
                    m1_materiel_code: p.m1_materiel_code,
                    m1_materiel_name: p.m1_materiel_name,
                    m1_materiel_id: p.m1_materiel_id,
                    m2_materiel_code: p.m2_materiel_code,
                    m2_materiel_name: p.m2_materiel_name,
                    m2_materiel_id: p.m2_materiel_id,
                    order_id: p.order_id,
                    productivetask_code: p.productivetask_code,
                    productivetask_state: p.productivetask_state,
                    workshop_id: p.workshop_id,
                    department_name: p.department_name,
                    product_level: p.product_level,
                    procedure_name: p.procedure_name,
                    priority: p.priority,
                    productivetask_id: p.productivetask_id,
                    product_id: p.product_id,
                    taskdesign_number: p.taskdesign_number,
                    end_date: p.end_date,
                    begin_date: p.begin_date,
                    prod_end_date: p.prod_end_date,
                    UUID: UUID
                })
            }
        }

        replacements = [];
        queryStr = `select * from tbl_erc_product_plan_execute where UUID=?`;
        replacements.push(UUID);
        if (doc.search_text) {
            queryStr += ` and (order_id like ? or productivetask_code like ? ) `;
            replacements.push('%' + doc.search_text + '%')
            replacements.push('%' + doc.search_text + '%')
        }
        if (doc.beginDate) {
            queryStr += ' and begin_date=?';
            replacements.push(doc.beginDate)
        }
        if (doc.endDate) {
            queryStr += ' and end_date=?';
            replacements.push(doc.endDate)
        }

        queryStr += ' order by prod_end_date,end_date';
        result = await common.queryWithGroupByCount(sequelize, req, queryStr, replacements);
        returnData.total = result.count;
        returnData.rows = result.data;

        queryStr = `delete from tbl_erc_product_plan_execute where UUID=?`;
        result = await sequelize.query(queryStr, {
            replacements: replacements,
            type: sequelize.QueryTypes.DELETE
        });

        common.sendData(res, returnData);

    } catch (error) {
        common.sendFault(res, error);
    }
}