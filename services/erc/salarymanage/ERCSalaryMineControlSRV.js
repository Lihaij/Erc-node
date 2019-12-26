const common = require('../../../util/CommonUtil');
const logger = require('../../../util/Logger').createLogger('ERCSalaryMineControlSRV');
const model = require('../../../model');
const GLBConfig = require('../../../util/GLBConfig');
const sequelize = model.sequelize;
const moment = require('moment')

const tb_customer = model.erc_customer
const tb_customercontract = model.erc_customercontract
const tb_company = model.erc_company

exports.ERCSalaryMineControlResource = async (req, res) => {
    let method = req.query.method;
    if (method === 'getSalaryMine') {
        await getSalaryMine(req, res);
    } else if (method === 'init') {
        initAct(req, res)
    } else {
        common.sendError(res, 'common_01')
    }
};
async function initAct(req, res) {
    try {
        let returnData = {};
        returnData.contractInfo = GLBConfig.SALARYTYPE; //薪资类型
        common.sendData(res, returnData)
    } catch (error) {
        common.sendFault(res, error);
        return
    }
}
async function getSalaryMine(req, res) {
    try {
        const {
            body,
            user
        } = req;
        let returnData = {},
            queryStr = ""
        //薪酬制度
        let customer = await tb_customer.findOne({
            attributes: ['user_form'],
            where: {
                state: 1,
                user_id: user.user_id
            }
        })
        //基础工资 能力工资 绩效工资 工资总额
        let customercontract = await tb_customercontract.findOne({
            attributes: ['base_salary', 'capacity_salary', 'performance_salary', 'total_salary'],
            where: {
                state: 1,
                user_id: user.user_id
            }
        })
        //计件保底工资
        let company = await tb_company.findOne({
            attributes: ['company_piece_amount', 'company_dayoff_type'],
            where: {
                state: 1,
                domain_id: user.domain_id
            }
        })
        // TODO 考勤
        let work_days = 10

        let total_salary_provision = 0, //本月累计计提薪资
            total_salary_piece = 0, //本月累计计件薪资
            total_salary_other = 0, //本月累计额外薪资
            total_salary_apply = 0, //本月累计申请薪资总额
            total_salary = 0 //本月累计薪资总额

        //获取本月累计额外薪资
        queryStr = `select sum(salaryotherdetail_money) as sum_salaryotherdetail_money 
            from tbl_erc_salaryotherdetail 
            where state=1 and user_id = '${user.user_id}'
            and created_at>='${moment().startOf('month').format("YYYY-MM-DD HH:mm:ss")}'
            and created_at<='${moment().endOf('month').format("YYYY-MM-DD HH:mm:ss")}'`
        let otherMoneyResult = await sequelize.query(queryStr, {
            replacements: [],
            type: sequelize.QueryTypes.SELECT
        });
        total_salary_other = Number(otherMoneyResult[0].sum_salaryotherdetail_money)

        //获取本月累计申请薪资总额
        queryStr = `select sum(salaryapply_money) as sum_salaryapply_money 
            from tbl_erc_salaryapply 
            where state=1 and user_id = '${user.user_id}'
            and created_at>='${moment().startOf('month').format("YYYY-MM-DD HH:mm:ss")}'
            and created_at<='${moment().endOf('month').format("YYYY-MM-DD HH:mm:ss")}'
            and salaryapply_state = 1`
        let applyMoneyResult = await sequelize.query(queryStr, {
            replacements: [],
            type: sequelize.QueryTypes.SELECT
        });
        total_salary_apply = Number(applyMoneyResult[0].sum_salaryapply_money)


        if (customer.user_form != 3) { //针对对月薪，计算本月累计计提薪资
            let work_days_theory = 0, //理论工作天数
                salary_day = 0 //每天计提工资

            if (company.company_dayoff_type == 0) { //单休
                work_days_theory = moment().daysInMonth() - 4
            } else if (company.company_dayoff_type == 0) { //双休
                work_days_theory = moment().daysInMonth() - 8
            } else { //不休
                work_days_theory = moment().daysInMonth()
            }
            salary_day = parseInt(Number(customercontract.total_salary / 100) / Number(work_days_theory))

            //如果当月考勤天数==理论工作天数，累计计提工作=工资总额
            if (Number(work_days_theory) == Number(work_days)) {
                total_salary_provision = customercontract.total_salary / 100
            } else {
                total_salary_provision = Number(work_days) * Number(salary_day)
            }

            //薪资总额=本月累计计提薪资 + 额外薪资 + 申请薪资
            total_salary = Number(total_salary_provision) + Number(total_salary_other) + Number(total_salary_apply)
        } else { //针对计件员工，计算本月累计计件薪资
            let beginTime = moment().startOf('month').format("YYYY-MM-DD"),
                endTime = moment().format("YYYY-MM-DD")
            queryStr = `select 
                sum(p.ppmaster_produce_number * pp.procedure_cost) as sum_ppmaster_produce_money
                from tbl_erc_ppmaster p
                left join tbl_erc_productionprocedure pp on (p.ppmaster_procedure_id = pp.procedure_id and pp.state = 1)
                where p.state=1 and p.ppmaster_user_id = '${user.user_id}' and ppmaster_date => '${beginTime}' and ppmaster_date <= '${endTime}'`
            let ppmasterResult = await sequelize.query(queryStr, {
                replacements: [],
                type: sequelize.QueryTypes.SELECT
            });
            total_salary_piece = ppmasterResult[0].sum_ppmaster_produce_money
            //薪资总额=本月累计计件薪资 + 额外薪资 + 申请薪资
            total_salary = Number(total_salary_provision) + Number(total_salary_other) + Number(total_salary_apply)
        }



        returnData.rows = [{
            user_id: user.user_id,
            user_form: customer.user_form, //薪酬制度(年薪制，月薪制，计件...)
            base_salary: customercontract.base_salary / 100, //基础工资
            capacity_salary: customercontract.capacity_salary / 100, //能力工资
            performance_salary: customercontract.performance_salary / 100, //绩效工资
            total_salary: customercontract.total_salary / 100, //工资总额
            company_piece_amount: customer.user_form != 3 ? 0 : company.company_piece_amount, //计件保底工资
            work_days, //当月出勤天数
            total_salary_provision, //本月累计计提薪资
            total_salary_piece, //本月累计计件薪资
            total_salary_other, //本月累计额外薪资
            total_salary //本月累计薪资总额
        }]
        returnData.total = 1
        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
    }
}