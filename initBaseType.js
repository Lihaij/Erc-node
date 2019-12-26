const logger = require('./util/Logger').createLogger('ERCPurchaseControlSRV');
const model = require('./model');
const Sequence = require('./util/Sequence');
const sequelize = model.sequelize;
const moment = require('moment');
const fs = require('fs');

const tb_basetypedetail = model.erc_basetypedetail;
const tb_basetype = model.erc_basetype;
const tb_domain = model.common_domain;


async function addBaseDetail(code, insertArr, domain_id) {
    let result, queryStr, baseTypeId, baseTypeCode, replacements = []

    queryStr = `select * from tbl_erc_basetype where basetype_code=?`
    replacements.push(code)
    result = await sequelize.query(queryStr, {
        replacements: replacements,
        type: sequelize.QueryTypes.SELECT
    });
    baseTypeId = result[0].basetype_id
    baseTypeCode = result[0].basetype_code

    for (let i = 0; i < insertArr.length; i++) {
        let addDetail = await tb_basetypedetail.create({
            basetype_id: baseTypeId,
            domain_id: domain_id,
            typedetail_no: i,
            typedetail_code: baseTypeCode + ':' + insertArr[i],
            typedetail_name: insertArr[i]
        })
    }
}
async function init() {
    try {
        let insertArr = []

        tb_basetypedetail.destroy({
            where: {
                // '$or': [{
                //         domain_id: ''
                //     },
                //     {
                //         domain_id: null
                //     }
                // ]
                state: 1
            }
        })
        tb_basetype.destroy({
            where: {
                // basetype_id: {
                //     '$lt': 100,
                // }
                state: 1
            }
        })

        let insertDate = [{
                basetype_id: 2,
                basetype_code: 'HBZJLX',
                basetype_name: '货币类型'
            },
            {
                basetype_id: 7,
                basetype_code: 'YFZGXC',
                basetype_name: '应付职工薪酬'
            },
            {
                basetype_id: 8,
                basetype_code: 'YJSF',
                basetype_name: '应交税费'
            },
            {
                basetype_id: 10,
                basetype_code: 'LRFP',
                basetype_name: '利润分配'
            },
            {
                basetype_id: 11,
                basetype_code: 'QTYWSR',
                basetype_name: '其他业务收入'
            },
            {
                basetype_id: 12,
                basetype_code: 'YYWSR',
                basetype_name: '营业外收入'
            },
            {
                basetype_id: 13,
                basetype_code: 'QTYWCB',
                basetype_name: '其它业务成本'
            },
            {
                basetype_id: 14,
                basetype_code: 'YYSJJFJ',
                basetype_name: '营业税金及附加'
            },
            {
                basetype_id: 15,
                basetype_code: 'QYZZSLX',
                basetype_name: '企业增值税类型'
            },
            {
                basetype_id: 16,
                basetype_code: 'QYSDSLX',
                basetype_name: '企业所得税类型'
            },
            {
                basetype_id: 17,
                basetype_code: 'QYXZ',
                basetype_name: '企业性质'
            },
            {
                basetype_id: 18,
                basetype_code: 'YHZHFL',
                basetype_name: '银行账号分类'
            },
            {
                basetype_id: 19,
                basetype_code: 'HJFL',
                basetype_name: '核价分类'
            },
            {
                basetype_id: 20,
                basetype_code: 'WLZTFL',
                basetype_name: '物料状态分类'
            },
            {
                basetype_id: 21,
                basetype_code: 'WLLYFL',
                basetype_name: '物料来源分类'
            },
            {
                basetype_id: 22,
                basetype_code: 'WLGLMSFL',
                basetype_name: '物料管理模式分类'
            },
            {
                basetype_id: 23,
                basetype_code: 'FPLX',
                basetype_name: '发票类型'
            },
            {
                basetype_id: 24,
                basetype_code: 'FYLKMXT',
                basetype_name: '费用类科目形态'
            },
            {
                basetype_id: 25,
                basetype_code: 'BFBZ',
                basetype_name: '报废标志'
            },
            {
                basetype_id: 26,
                basetype_code: 'CQZCXSFL',
                basetype_name: '长期资产形式分类'
            },
            {
                basetype_id: 27,
                basetype_code: 'CQZCXZFL',
                basetype_name: '长期资产性质分类'
            },
            {
                basetype_id: 28,
                basetype_code: 'JSFS',
                basetype_name: '结算方式'
            },
            {
                basetype_id: 29,
                basetype_code: 'XL',
                basetype_name: '学历'
            },
            {
                basetype_id: 30,
                basetype_code: 'JCFS',
                basetype_name: '计酬方式'
            },
            {
                basetype_id: 31,
                basetype_code: 'ZSJDFYBXMS',
                basetype_name: '住宿接待费用报销模式'
            },
            {
                basetype_id: 32,
                basetype_code: 'GSPCFYBSMS',
                basetype_name: '公司派车费用报销模式'
            },
            {
                basetype_id: 33,
                basetype_code: 'GGJTGJFL',
                basetype_name: '公共交通工具分类'
            },
            {
                basetype_id: 34,
                basetype_code: 'JQFL',
                basetype_name: '假期分类'
            },
            {
                basetype_id: 35,
                basetype_code: 'HYZK',
                basetype_name: '婚姻状况'
            },
            {
                basetype_id: 36,
                basetype_code: 'CWFY',
                basetype_name: '财务费用'
            },
            {
                basetype_id: 37,
                basetype_code: 'JGQYXDDJ',
                basetype_name: '价格启用选定单据'
            },
            {
                basetype_id: 38,
                basetype_code: 'CKFL',
                basetype_name: '仓库分类'
            },
            {
                basetype_id: 39,
                basetype_code: 'FYLKMLX',
                basetype_name: '费用类科目类型'
            },
            {
                basetype_id: 40,
                basetype_code: 'SKLX',
                basetype_name: '收款类型'
            },
            {
                basetype_id: 100,
                basetype_code: 'JLDW',
                basetype_name: '计量单位'
            },
            {
                basetype_id: 101,
                basetype_code: 'HBLX',
                basetype_name: '货币类型'
            },
            {
                basetype_id: 103,
                basetype_code: 'GRSYSL',
                basetype_name: '购入适用税率'
            },
            {
                basetype_id: 104,
                basetype_code: 'XSSYSL',
                basetype_name: '销售适用税率'
            },
            {
                basetype_id: 105,
                basetype_code: 'FYLKMMXXM',
                basetype_name: '费用类科目明细项目'
            },
            {
                basetype_id: 106,
                basetype_code: 'SCGXFL',
                basetype_name: '生产工序分类'
            },
            {
                basetype_id: 107,
                basetype_code: 'GYSLB',
                basetype_name: '供应商类别'
            },
            {
                basetype_id: 108,
                basetype_code: 'KHLB',
                basetype_name: '客户类别'
            }
            ,
            {
                basetype_id: 201,
                basetype_code: 'DALX',
                basetype_name: '档案类型'
            }
            ,
            {
                basetype_id: 202,
                basetype_code: 'CGFL',
                basetype_name: '采购分类'
            }
        ];
        let addBaseType = await tb_basetype.bulkCreate(insertDate);

        //*************其他货币资金********************
        insertArr = ['外埠存款', '银行汇票存款', '银行本票存款', '信用卡存款', '信用卡保证金', '存出投资款']
        await addBaseDetail('HBZJLX', insertArr, '')

        //**************应付职工薪酬********************
        insertArr = ['工资', '奖金', '津贴', '补贴', '职工福利', '社会保险金', '住房公积金', '工会经费', '职工教育经费', '解除职工劳动关系补偿', '非货币性福利', '其他']
        await addBaseDetail('YFZGXC', insertArr, '')

        //**************应交税费********************
        insertArr = ['应交增值税(进项税额)', '应交增值税(销项税额)', '应交增值税(进项税额转出)', '应交增值税(出口退税)', '应交增值税(已交税金)', '应交增值税(出口抵减内销产品应纳税额)', '应交增值税(转出多交增值税)', '应交增值税(转出未交增值税)', '应交增值税(减免税款)', '应交增值税(销项税额抵减)', '应交消费税', '应交所得税', '应交资源税', '应交土地增值税', '应交城市维护建设税', '应交房产税', '应交土地使用税', '应交个人所得税', '应交车船税', '教育费用附加', '矿产资源补偿费用', '其他']
        await addBaseDetail('YJSF', insertArr, '')

        //**************应交税费********************
        insertArr = ['消费税', '城市维护建设税', '资源税', '教育费用附加', '房产税', '土地使用税', '车船使用税', '印花税', '矿产资源补偿费']
        await addBaseDetail('YYSJJFJ', insertArr, '')

        //**************利润分配********************
        insertArr = ['未分配利润']
        await addBaseDetail('LRFP', insertArr, '')

        //**************企业增值税类型********************
        insertArr = ['小规模纳税人', '一般纳税人']
        await addBaseDetail('QYZZSLX', insertArr, '')

        //**************企业所得税类型********************
        insertArr = ['查账征收', '核定征收']
        await addBaseDetail('QYSDSLX', insertArr, '')

        //**************企业性质********************
        insertArr = ['生产企业', '贸易企业', '服务行业']
        await addBaseDetail('QYXZ', insertArr, '')

        //**************银行账号分类********************
        insertArr = ['对公', '对私']
        await addBaseDetail('YHZHFL', insertArr, '')

        //**************核价分类********************
        insertArr = ['比价法', '核价法']
        await addBaseDetail('HJFL', insertArr, '')

        //**************物料状态分类********************
        insertArr = ['品牌成品', '客户成品', '半成品', '原材料', '消耗性材料', '修配用配件', '边余废料', '不常用物料']
        await addBaseDetail('WLZTFL', insertArr, '')

        //**************物料来源分类********************
        insertArr = ['自制', '外购', '受托加工', '外发加工']
        await addBaseDetail('WLLYFL', insertArr, '')

        //**************物料管理模式分类********************
        insertArr = ['按单管理', '安全库存']
        await addBaseDetail('WLGLMSFL', insertArr, '')

        //**************发票类型********************
        insertArr = ['增值税专用发票', '普通发票', '出口发票', '无票申报', '不申报']
        await addBaseDetail('FPLX', insertArr, ''), ''

        //**************费用类科目形态********************
        insertArr = ['变动费用', '固定费用']
        await addBaseDetail('FYLKMXT', insertArr, '')

        //**************报废标志********************
        insertArr = ['是', '否']
        await addBaseDetail('BFBZ', insertArr, '')

        //**************长期资产形式分类********************
        insertArr = ['房屋', '建筑物', '飞机', '火车', '轮船', '机器', '机械和其他生产设备', '与生产经营活动有关的器具', '工具', '家具', '飞机', '火车', '轮船以外的运输工具', '电子设备']
        await addBaseDetail('CQZCXSFL', insertArr, '')

        //**************长期资产性质分类********************
        insertArr = ['生产性', '非生产性']
        await addBaseDetail('CQZCXZFL', insertArr, '')

        //**************结算方式********************
        insertArr = ['预付后款到发货结算', '月结结算', '单笔结算']
        await addBaseDetail('JSFS', insertArr, '')

        //**************学历********************
        insertArr = ['初中及以下高中', '中专', '大专', '本科', '研究生', '愽士', '愽士后']
        await addBaseDetail('XL', insertArr, '')

        //**************计酬方式********************
        insertArr = ['月薪制', '月薪加提成制', '计件制', '年薪制']
        await addBaseDetail('JCFS', insertArr, '')

        //**************住宿接待费用报销模式********************
        insertArr = ['汇总月结管理', '个人自行报销']
        await addBaseDetail('ZSJDFYBXMS', insertArr, '')

        //**************公司派车费用报销模式********************
        insertArr = ['汇总月结管理', '个人自行报销']
        await addBaseDetail('GSPCFYBSMS', insertArr, '')

        //**************公共交通工具分类********************
        insertArr = ['飞机', '高铁', '火车', '汽车', '自驾车']
        await addBaseDetail('GGJTGJFL', insertArr, '')

        //**************假期分类********************
        insertArr = ['事假', '病假', '婚假', '丧假', '公休假', '工伤假', '产假', '陪产假', '特殊事项有薪假']
        await addBaseDetail('JQFL', insertArr, '')

        //**************婚姻状况********************
        insertArr = ['已婚', '未婚']
        await addBaseDetail('HYZK', insertArr, '')

        //**************财务费用********************
        insertArr = ['贷款利息', '金融机构费用', '存款利息', '汇兑损益']
        await addBaseDetail('CWFY', insertArr, '')

        //**************价格启用选定单据********************
        insertArr = ['销售订单', '销售出库单', '采购订单', '外购入库单']
        await addBaseDetail('JGQYXDDJ', insertArr, '')

        //**************仓库分类********************
        insertArr = ['成品仓', '半成品仓', '原材料仓', '辅料仓', '废料仓', '不良品仓']
        await addBaseDetail('CKFL', insertArr, '')

        //**************费用类科目类型********************
        insertArr = ['变动性费用', '固定性费用']
        await addBaseDetail('FYLKMLX', insertArr, '')

        //**************收款类型********************
        insertArr = ['政府补助', '退税款', '捐赠款', '供应商退款', '借款', '对外投资款', '投资收益', '处置长期资产款项', '银行借款', '投资者的投资款']
        await addBaseDetail('SKLX', insertArr, '')

        let domain = await tb_domain.findAll({
            where: {
                state: 1
            }
        })

        for (let d of domain) {
            //**************计量单位********************
            insertArr = ['个', '张', 'PCS', '吨', '千克', '克']
            await addBaseDetail('JLDW', insertArr, d.domain_id)

            //**************货币类型********************
            insertArr = ['人民币', '美元', '欧元', '港币', '日元', '台币', '韩元']
            await addBaseDetail('HBLX', insertArr, d.domain_id)

            //**************购入适用税率********************
            insertArr = ['16%', '13%', '10%', '6%', '3%']
            await addBaseDetail('GRSYSL', insertArr, d.domain_id)

            //**************销售适用税率********************
            insertArr = ['16%', '13%', '10%', '6%', '3%']
            await addBaseDetail('XSSYSL', insertArr, d.domain_id)

            //**************费用类科目明细项目********************
            insertArr = ['工资支出', '社保支出', '房租支出', '水费支出', '电费支出', '福利支出', '差旅费用', '接待费用', '物料消耗支出', '资产折旧', '资产摊销', '维修费']
            await addBaseDetail('FYLKMMXXM', insertArr, d.domain_id)

        }


        // let result;
        // let queryArr = [
        //     'tbl_nca_alldemand','tbl_nca_netdemand','tbl_nca_purchaseorder','tbl_nca_purchasedetail',
        //     'tbl_nca_stockitem','tbl_nca_stockmap','tbl_nca_inventoryaccount','tbl_nca_inventoryorder',
        //     'tbl_nca_qualitycheckdetail','tbl_nca_qualitycheck','tbl_nca_otherstockorder','tbl_nca_stockapply',
        //     'tbl_nca_order','tbl_nca_ordermateriel'
        // ];
        // for(q of queryArr){
        //     let qyerySql = 'delete from ' + q;
        //     console.log(qyerySql);
        //     result = await sequelize.query(qyerySql, {replacements: [], type: sequelize.QueryTypes.DELETE});
        // }

        // let replacements=[],writeStr = '';
        // let qyerySql1 = `select table_name from information_schema.tables
        //     where table_schema='ncadata' and table_type='base table';`
        // let tableName = await sequelize.query(qyerySql1, {replacements: [], type: sequelize.QueryTypes.SELECT});
        //
        // for(let t of tableName){
        //     // console.log(t)
        //     let qyerySql2 =`show create table ${t.table_name}` ;
        //     let sqlddl = await sequelize.query(qyerySql2, {replacements: [], type: sequelize.QueryTypes.SELECT});
        //     writeStr +=JSON.stringify(sqlddl[0]) + '/n'
        //
        // }
        // fs.writeFileSync('message.txt',writeStr);

        process.exit();
    } catch (error) {
        console.log(error);
        process.exit();
    }
}

init();
