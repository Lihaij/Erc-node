const fs = require('fs');
const common = require('../../../util/CommonUtil');
const GLBConfig = require('../../../util/GLBConfig');
const Sequence = require('../../../util/Sequence');
const logger = require('../../../util/Logger').createLogger('ERCSupplierControlSRV');
const model = require('../../../model');
const zoweedb = require('../../../zowee/zedb');

// tables
const sequelize = model.sequelize
const tb_materiel = model.erc_materiel;

exports.ERCMaterielSyncControlResource = (req, res) => {
    let method = req.query.method
    if (method === 'sync') {
        syncAct(req, res);
    } else {
        common.sendError(res, 'common_01');
    }
};

// 造易同步物料接口
async function syncAct(req, res) {
    let dbconn = await zoweedb.getConnection()
    try {
        let user = req.user;

        let materiels = await tb_materiel.findAll({
            where: {
                domain_id: user.domain_id
            }
        })

        if (materiels.length > 0) {
            await dbconn.execute(`delete from TUS_OBJECT`)

            for (let m of materiels) {
                await dbconn.execute(`INSERT INTO TUS_OBJECT (CODE, TITLE, MATERIALTYPE, SPECIFICATION, FORMULA, SPECIFICATIONUNIT, MEASUREMENTUNIT, CUSTOMIZED, SX, SZ ,SY, WASTAGE, CONVERSION, INTPART, REMARK)
                                      VALUES (:code, :title, :materialtype, :specification, :formula, :specificationunit, :measurementunit, :customized, :sx, :sz, :sy, :wastage, :conversion, :intpart, :remark)`,
                    [m.materiel_code, m.materiel_name, m.materiel_type, m.materiel_format, m.materiel_formula, m.materiel_formatunit, m.materiel_unit, m.materiel_amto, m.materiel_x, m.materiel_y, m.materiel_z, (m.materiel_loss + ''), m.materiel_conversion, m.materiel_intpart, m.materiel_describe])
            }
        }

        await dbconn.commit()
        dbconn.close()
        common.sendData(res);
    } catch (error) {
        dbconn.close()
        logger.error(error)
        common.sendError(res, 'common_01')
    }
}
