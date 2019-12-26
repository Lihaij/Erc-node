const common = require('../../../util/CommonUtil');
const GLBConfig = require('../../../util/GLBConfig');
const logger = require('../../../util/Logger').createLogger('ERCStaffControlSRV');
const model = require('../../../model');
const Sequence = require('../../../util/Sequence');

const sequelize = model.sequelize;
const tb_staff = model.erc_staff;
const tb_user = model.common_user;;
const tb_order = model.erc_order;

// 查询订单服务团队人员信息
exports.searchAct = async(req, res) => {
    try {
        let doc = common.docTrim(req.body), user = req.user, returnData = {};
        let queryStr = `select s.*,u.name from tbl_erc_staff s,tbl_common_user u
        where s.state = ? and s.order_id = ? and u.user_id = s.user_id `;
        let replacements = [GLBConfig.ENABLE, doc.order_id];
        let queryRst = await sequelize.query(queryStr, {
            replacements: replacements,
            type: sequelize.QueryTypes.SELECT
        })
        common.sendData(res, queryRst);
    } catch (error) {
        common.sendFault(res, error);
    }
};

// 删除订单服务团队人员信息
exports.deleteAct = async(req, res) => {
    try {
        let doc = common.docTrim(req.body);
        await common.transaction(async function (t) {
            let delStaff = await tb_staff.findOne({
                where: {
                    user_id: doc.user_id,
                    order_id: doc.order_id,
                    staff_type: doc.staff_type,
                    state: GLBConfig.ENABLE
                }
            });
            if (delStaff) {
                await delStaff.destroy({transaction: t});
                let theOrder = await tb_order.findOne({
                    where: {
                        order_id: doc.order_id
                    }, transaction: t
                });
                if (doc.staff_type == GLBConfig.TYPE_STAFF[0].value) {
                    theOrder.order_supervision = null;
                    await theOrder.save({transaction: t});
                }
                if (doc.staff_type == GLBConfig.TYPE_STAFF[1].value) {
                    theOrder.order_foreman = null;
                    await theOrder.save({transaction: t});
                }
                if (doc.staff_type == GLBConfig.TYPE_STAFF[3].value) {
                    theOrder.designer_id = null;
                    await theOrder.save({transaction: t});
                }
                return common.sendData(res);
            } else {
                return common.sendError(res, 'staff_01');
            }
        });
    } catch (error) {
        return common.sendFault(res, error);
    }
};
