module.exports = {
    INITPASSWORD: '123456',
    REDISKEY: {
        AUTH: 'REDISKEYAUTH',
        SMS: 'REDISKEYSMS'
    },
    MTYPE_ROOT: '00',
    MTYPE_LEAF: '01',
    MTYPEINFO: [{
        'id': '00',
        'value': '00',
        'text': '目录'
    }, {
        'id': '01',
        'value': '01',
        'text': '菜单'
    }],
    NODETYPEINFO: [{
            'id': '00',
            'text': '根'
        },
        {
            'id': '01',
            'text': '叶子'
        }
    ],
    MGROUPINFO: [{
            'id': '00',
            'value': '00',
            'text': '全部'
        },
        {
            'id': '01',
            'value': '01',
            'text': '总部'
        },
        {
            'id': '02',
            'value': '02',
            'text': '门店'
        },
        {
            'id': '03',
            'value': '03',
            'text': '供应商'
        },
        {
            'id': '04',
            'value': '04',
            'text': '集团客户'
        }

    ],
    TYPE_ADMINISTRATOR: '00',
    TYPE_OPERATOR: '01',
    TYPE_CUSTOMER: '30', //业主
    TYPE_WORKER: '31', //工人
    TYPE_FOREMAN: '32', //工长
    TYPE_SUPERVISION: '33', //监理
    TYPE_SUPPLIER: '35', //供应商
    AUTH: '1',
    NOAUTH: '0',
    AUTHINFO: [{
            'id': '1',
            'value': '1',
            'text': '需要授权'
        },
        {
            'id': '0',
            'value': '0',
            'text': '无需授权'
        }
    ],
    ENABLE: '1',
    DISABLE: '0',
    STATUSINFO: [{
            'id': '1',
            'value': '1',
            'text': '有效'
        },
        {
            'id': '0',
            'value': '0',
            'text': '无效'
        }
    ],
    TRUE: '1',
    FALSE: '0',
    TFINFO: [{
            'id': '1',
            'value': '1',
            'text': '是'
        },
        {
            'id': '0',
            'value': '0',
            'text': '否'
        }
    ],
    // for NAC
    DOMAINTYPE: [{ // 域类型
            'id': '0',
            'text': 'admin'
        },
        {
            'id': '1',
            'text': '机构'
        },
        {
            'id': '2',
            'text': '总公司'
        },
        {
            'id': '3',
            'text': '分公司'
        },
        {
            'id': '4',
            'text': '子公司'
        }
    ],
    DOMAINKIND: [{ //  域种类,细分
            'id': '0',
            'text': '荣精装'
        },
        {
            'id': '1',
            'text': '乐精装'
        },
        {
            'id': '2',
            'text': '住宅集成'
        },
        {
            'id': '3',
            'text': '易装家'
        }
    ],
    MATERIELMANAGE: [ //管理模式
        {
            'id': '1',
            'value': '1',
            'text': '安全库存管理'
        },
        {
            'id': '2',
            'value': '2',
            'text': '销售订单管理'
        },
    ],
    MATERIELSOURCE: [{ //物料分类
            'id': '1',
            'value': '1',
            'text': '自制'
        },
        {
            'id': '2',
            'value': '2',
            'text': '外购'
        },
        {
            'id': '3',
            'value': '3',
            'text': '委外加工'
        },
        {
            'id': '4',
            'value': '4',
            'text': '受托加工'
        }
    ],
    MATERIELSOURCEKIND: [{ //来源分类
            'id': '1',
            'value': '1',
            'text': '自制'
        },
        {
            'id': '2',
            'value': '2',
            'text': '外购'
        },
        {
            'id': '3',
            'value': '3',
            'text': '委外加工'
        },
        {
            'id': '4',
            'value': '4',
            'text': '客户来料加工'
        }
    ],
    MATERIELPROCEDURE: [{ //工序
            'id': '1',
            'value': '1',
            'text': '建筑结构改造'
        },
        {
            'id': '2',
            'value': '2',
            'text': '水电布线'
        },
        {
            'id': '3',
            'value': '3',
            'text': '防水工程'
        },
        {
            'id': '4',
            'value': '4',
            'text': '瓷砖铺装'
        },
        {
            'id': '5',
            'value': '5',
            'text': '木工制作'
        },
        {
            'id': '6',
            'value': '6',
            'text': '木质油漆'
        },
        {
            'id': '7',
            'value': '7',
            'text': '墙面涂饰'
        },
        {
            'id': '8',
            'value': '8',
            'text': '地板铺装'
        },
        {
            'id': '9',
            'value': '9',
            'text': '水电安装'
        },
        {
            'id': '10',
            'value': '10',
            'text': '设备安装'
        },
        {
            'id': '11',
            'value': '11',
            'text': '污染治理'
        },
        {
            'id': '12',
            'value': '12',
            'text': '卫生清洁'
        }
    ],
    MATERIELAMTO: [{ //制品分类
            'id': '1',
            'value': '1',
            'text': '品牌商品'
        },
        {
            'id': '2',
            'value': '2',
            'text': '定制商品'
        },
        {
            'id': '3',
            'value': '3',
            'text': '贴牌商品'
        }
    ],
    FORMULA: [{ //算料公式
            'id': '0',
            'value': '0',
            'text': '数量：按0计数'
        },
        {
            'id': '-1',
            'value': '-1',
            'text': '数量：按单位累加计数{例如:电器(台)}'
        },
        {
            'id': '-2',
            'value': '-2',
            'text': '数量：按1计数{例如:衣柜/橱柜(套)}'
        },
        {
            'id': '-3',
            'value': '-3',
            'text': '长度：平面周长[(x+z)*2 mm]/单位转换率[单位mm]{例如:吊顶灯带(m)}'
        },
        {
            'id': '-4',
            'value': '-4',
            'text': '长度：立面周长[(x+y)*2 mm]/单位转换率[单位mm]{例如:电视墙灯带(m)}'
        },
        {
            'id': '-5',
            'value': '-5',
            'text': '数量：(1+损耗率)*平面面积[x*z mm²]/单位面积(x*z mm²){例如:地砖(块)}'
        },
        {
            'id': '-6',
            'value': '-6',
            'text': '数量：(1+损耗率)*立面面积[x*y mm²]/单位面积(x*z mm²){例如:墙砖(块)}'
        },
        {
            'id': '-7',
            'value': '-7',
            'text': '数量：(1+损耗率)*平面周长[(x+z)*2 mm]/(规格宽度[z mm]/使用宽度[z mm]){例如:波打线(块)}'
        },
        {
            'id': '-8',
            'value': '-8',
            'text': '数量：(1+损耗率)*立面周长[(x+y)*2 mm]/(规格宽度[z mm]/使用宽度[z mm]){例如:}'
        },
        {
            'id': '-9',
            'value': '-9',
            'text': '面积：(1+损耗率)*平面面积[x*z mm²]/单位转换率[单位mm²]{例如:木地板(m²)}'
        },
        {
            'id': '-10',
            'value': '-10',
            'text': '面积：(1+损耗率)*立面面积[x*y mm²]/单位转换率[单位mm²]{例如:墙纸(m²)}'
        },
        {
            'id': '-11',
            'value': '-11',
            'text': '面积：(1+损耗率)*侧面面积[y*z mm²]/单位转换率[单位mm²]{例如:}'
        },
        {
            'id': '-12',
            'value': '-12',
            'text': '面积：(1+损耗率)*(立面面积[x*y mm²]+侧面面积[y*z mm²])/单位转换率[单位mm²]{例如:L型淋浴房(m²)}'
        },
        {
            'id': '-13',
            'value': '-13',
            'text': '数量：(1+损耗率)*平面周长[(x+z)*2 mm]/单位长度[x mm]/单位转换率[单位mm]{例如:踢脚线(m)}'
        },
        {
            'id': '-14',
            'value': '-14',
            'text': '数量：(1+损耗率)*立面周长[(x+y)*2 mm]/单位长度[x mm]{例如:背景墙压线(条)}'
        },
        {
            'id': '-15',
            'value': '-15',
            'text': '长度：平面长度[x mm]/单位转换率[单位mm]{例如:窗帘(m)}'
        }
    ],
    HTYPEINFO: [{ // 房屋类型
            'id': '1',
            'value': '1',
            'text': '一室一厅'
        },
        {
            'id': '2',
            'value': '2',
            'text': '二室一厅'
        },
        {
            'id': '3',
            'value': '3',
            'text': '三室一厅'
        },
        {
            'id': '4',
            'value': '4',
            'text': '三室二厅'
        },
        {
            'id': '5',
            'value': '5',
            'text': '四室二厅'
        },
        {
            'id': '11',
            'value': '11',
            'text': '两房两卫'
        },
        {
            'id': '12',
            'value': '12',
            'text': '三房三卫'
        },
        {
            'id': '13',
            'value': '13',
            'text': '四房四卫'
        },
        {
            'id': '6',
            'value': '6',
            'text': '复式'
        },
        {
            'id': '7',
            'value': '7',
            'text': '单身公寓'
        },
        {
            'id': '8',
            'value': '8',
            'text': '别墅'
        },
        {
            'id': '9',
            'value': '9',
            'text': '工装'
        },
        {
            'id': '10',
            'value': '10',
            'text': '其他'
        }
    ],
    PROJECTTYPE: [{ //工程类型
            'id': '1',
            'value': '1',
            'text': '毛胚房'
        },
        {
            'id': '2',
            'value': '2',
            'text': '旧房改造'
        },
        {
            'id': '3',
            'value': '3',
            'text': '精装'
        },
        {
            'id': '4',
            'value': '4',
            'text': '商铺'
        },
        {
            'id': '5',
            'value': '5',
            'text': '自建房'
        },
        {
            'id': '6',
            'value': '6',
            'text': '别墅'
        }
    ],
    OTYPEINFO: [{
            'id': '1',
            'value': '1',
            'text': '装修订单'
        },
        {
            'id': '7',
            'value': '7',
            'text': '团体订单'
        },
        {
            'id': '8',
            'value': '8',
            'text': '采购订单'
        }
    ],
    APSTATEINFO: [{
            'id': '1',
            'value': '1',
            'text': '未受理'
        },
        {
            'id': '2',
            'value': '2',
            'text': '已受理'
        },
        {
            'id': '3',
            'value': '3',
            'text': '取消'
        }
    ],
    CLEVELINFO: [{
            'id': '1',
            'value': '1',
            'text': '意向用户'
        },
        {
            'id': '2',
            'value': '2',
            'text': '成交用户'
        },
        {
            'id': '3',
            'value': '3',
            'text': '潜在用户'
        }
    ],
    CTYPEINFO: [{
            'id': '1',
            'value': '1',
            'text': '个人用户'
        },
        {
            'id': '2',
            'value': '2',
            'text': '企业用户'
        }
    ],
    CSTATEINFO: [{
            'id': '0',
            'value': '0',
            'text': '不合作'
        },
        {
            'id': '1',
            'value': '1',
            'text': '合作'
        }
    ],
    CONTACTTYPE: [{ //联系记录-类型
            'id': '1',
            'value': '1',
            'text': '初次联系'
        },
        {
            'id': '2',
            'value': '2',
            'text': '后续跟进'
        }
    ],
    CONTACTWAY: [{ //联系方式
            'id': '1',
            'value': '1',
            'text': '面谈'
        },
        {
            'id': '2',
            'value': '2',
            'text': '电话'
        },
        {
            'id': '3',
            'value': '3',
            'text': '微信'
        },
        {
            'id': '4',
            'value': '4',
            'text': '其它'
        }
    ],
    PURCHASESTATE: [ //（物料）采购状态
        {
            'id': '1',
            'value': '1',
            'text': '未采购'
        },
        {
            'id': '2',
            'value': '2',
            'text': '集团采购'
        },
        {
            'id': '3',
            'value': '3',
            'text': '属地购'
        }
    ],
    ROOMTYPE: [ //空间类型
        {
            'id': '1',
            'value': '主卧',
            'text': '主卧'
        },
        {
            'id': '10',
            'value': '次卧',
            'text': '次卧'
        },
        {
            'id': '11',
            'value': '儿童房',
            'text': '儿童房'
        },
        {
            'id': '12',
            'value': '书房',
            'text': '书房'
        },
        {
            'id': '2',
            'value': '客厅',
            'text': '客厅'
        },
        {
            'id': '13',
            'value': '餐厅',
            'text': '餐厅'
        },
        {
            'id': '14',
            'value': '门厅',
            'text': '门厅'
        },
        {
            'id': '15',
            'value': '玄关',
            'text': '玄关'
        },
        {
            'id': '3',
            'value': '卫生间',
            'text': '卫生间'
        },
        {
            'id': '4',
            'value': '阳台',
            'text': '阳台'
        },
        {
            'id': '17',
            'value': '露台',
            'text': '露台'
        },
        {
            'id': '5',
            'value': '厨房',
            'text': '厨房'
        },
        {
            'id': '16',
            'value': '客餐厅',
            'text': '客餐厅'
        },
        {
            'id': '6',
            'value': '走廊',
            'text': '走廊'
        },
        {
            'id': '7',
            'value': '衣帽间',
            'text': '衣帽间'
        },
        {
            'id': '8',
            'value': '储物间',
            'text': '储物间'
        },
        {
            'id': '9',
            'value': '入户花园',
            'text': '入户花园'
        },
        {
            'id': '17',
            'value': '多功能室',
            'text': '多功能室'
        },
        {
            'id': '18',
            'value': '影视间',
            'text': '影视间'
        },
        {
            'id': '19',
            'value': '步入式衣柜',
            'text': '步入式衣柜'
        },
        {
            'id': '20',
            'value': '未定义',
            'text': '未定义'
        }
    ],
    ORDERSTATEINFO: [ // 订单状态列表
        {
            'id': 'NEW',
            'value': 'NEW',
            'text': '新建'
        },
        {
            'id': 'DESIGNING',
            'value': 'DESIGNING',
            'text': '设计中'
        },
        {
            'id': 'CHECKING',
            'value': 'CHECKING',
            'text': '审核中'
        },
        {
            'id': 'SIGNED',
            'value': 'SIGNED',
            'text': '签约中'
        },
        {
            'id': 'REVIEWING',
            'value': 'REVIEWING',
            'text': '评审中'
        },
        {
            'id': 'WORKING',
            'value': 'WORKING',
            'text': '施工中'
        },
        {
            'id': 'FINISHI',
            'value': 'FINISHI',
            'text': '已完成'
        },
        {
            'id': 'CANCELLED',
            'value': 'CANCELLED',
            'text': '取消'
        },
        {
            'id': 'PAYED',
            'value': 'PAYED',
            'text': '已付款'
        },
        {
            'id': 'SHIPPED',
            'value': 'SHIPPED',
            'text': '发货中'
        }
    ],
    PRODUCTIVETASKSTATE: [ //生产任务状态
        {
            'id': '1',
            'value': '1',
            'text': '未生产'
        },
        {
            'id': '2',
            'value': '2',
            'text': '生产中'
        },
        {
            'id': '3',
            'value': '3',
            'text': '生产完成'
        }
    ],

    ACCEPTANCESTATEINFO: [ //验收状态列表
        {
            'id': 'NEW',
            'value': '未开始',
            'text': '未开始'
        },
        {
            'id': 'CHECKING',
            'value': '验收中',
            'text': '验收中'
        },
        {
            'id': 'REJECTED',
            'value': '驳回',
            'text': '驳回'
        },
        {
            'id': 'APPROVED',
            'value': 'APPROVED',
            'text': '通过'
        }
    ],
    TYPE_STAFF: [ //员工角色
        {
            'id': '1',
            'value': '1',
            'text': '监理'
        },
        {
            'id': '2',
            'value': '2',
            'text': '工长'
        },
        {
            'id': '3',
            'value': '3',
            'text': '工人'
        },
        {
            'id': '4',
            'value': '4',
            'text': '设计师'
        },
        {
            'id': '5',
            'value': '5',
            'text': '设计审核'
        },
        {
            'id': '6',
            'value': '6',
            'text': '物料审核'
        },
        {
            'id': '7',
            'value': '7',
            'text': '价格审核'
        },
        {
            'id': '8',
            'value': '8',
            'text': '变更审核'
        },
        {
            'id': '9',
            'value': '9',
            'text': '销售'
        }
    ],
    CHECKFLOWINFO: [{
            'id': 'DEGSIGN',
            'value': 'DEGSIGN',
            'text': '设计审核'
        },
        {
            'id': 'PRICE',
            'value': 'PRICE',
            'text': '报价审核'
        },
    ],
    CHECKSTATEINFO: [{
            'id': '0',
            'value': '0',
            'text': '未审核'
        },
        {
            'id': '1',
            'value': '1',
            'text': '驳回'
        },
        {
            'id': '2',
            'value': '2',
            'text': '通过'
        }
    ],
    CHECKOWNERINFO: [{
            'id': '0',
            'value': '0',
            'text': '内部'
        },
        {
            'id': '1',
            'value': '1',
            'text': '客户'
        }
    ],
    AUTHTYPEINFO: [{
            'id': '0',
            'value': '0',
            'text': '门店面谈'
        },
        {
            'id': '1',
            'value': '1',
            'text': '电话通知'
        }
    ],
    MATERIELTYPE: [ //物料分类
        {
            'id': '0',
            'value': '0',
            'text': '其他'
        },
        {
            'id': '1',
            'value': '1',
            'text': '装修主材'
        },
        {
            'id': '2',
            'value': '2',
            'text': '装修辅材'
        },
        {
            'id': '3',
            'value': '3',
            'text': '定制家居'
        },
        {
            'id': '4',
            'value': '4',
            'text': '移动家居'
        },
        {
            'id': '5',
            'value': '5',
            'text': '软装饰品'
        },
        {
            'id': '6',
            'value': '6',
            'text': '广告物料'
        },
        {
            'id': '7',
            'value': '7',
            'text': '厨卫电器'
        },
        {
            'id': '8',
            'value': '8',
            'text': '家用电器'
        },
        {
            'id': '9',
            'value': '9',
            'text': '智能家居'
        },
        {
            'id': '10',
            'value': '10',
            'text': '套餐'
        }
    ],
    BATCHINFO: [{
            'id': '1',
            'value': '1',
            'text': '1'
        },
        {
            'id': '2',
            'value': '2',
            'text': '2'
        },
        {
            'id': '3',
            'value': '3',
            'text': '3'
        }
    ],
    PROJECTORDER: [{
        'id': '1',
        'value': '1',
        'text': '销售订单'
    },
        {
            'id': '2',
            'value': '2',
            'text': '施工项编号'
        },
    ],
    BUSINESSCUSTOMER: [{
        'id': '1',
        'value': '1',
        'text': 'A'
    },
        {
            'id': '2',
            'value': '2',
            'text': 'B'
        },
        {
            'id': '3',
            'value': '3',
            'text': 'C'
        },
        {
            'id': '4',
            'value': '4',
            'text': 'D'
        }
    ],
    UNITINFO: [{
            'id': '1',
            'value': '1',
            'text': '个'
        },
        {
            'id': '2',
            'value': '2',
            'text': '包'
        },
        {
            'id': '3',
            'value': '3',
            'text': '米'
        },
        {
            'id': '4',
            'value': '4',
            'text': '桶'
        },
        {
            'id': '5',
            'value': '5',
            'text': '组'
        },
        {
            'id': '6',
            'value': '6',
            'text': '台'
        },
        {
            'id': '7',
            'value': '7',
            'text': '元'
        },
        {
            'id': '8',
            'value': '8',
            'text': '套'
        },
        {
            'id': '9',
            'value': '9',
            'text': '本'
        },
        {
            'id': '10',
            'value': '10',
            'text': '张'
        },
        {
            'id': '11',
            'value': '11',
            'text': '份'
        },
        {
            'id': '12',
            'value': '12',
            'text': '幅'
        },
        {
            'id': '13',
            'value': '13',
            'text': '公斤'
        },
        {
            'id': '14',
            'value': '14',
            'text': '卷'
        },
        {
            'id': '15',
            'value': '15',
            'text': '片'
        },
        {
            'id': '16',
            'value': '16',
            'text': '条'
        },
        {
            'id': '17',
            'value': '17',
            'text': '盏'
        },
        {
            'id': '18',
            'value': '18',
            'text': '支'
        },
        {
            'id': '19',
            'value': '19',
            'text': '平方米'
        },
        {
            'id': '20',
            'value': '20',
            'text': 'PCS'
        }
    ],
    MATEUSESTATE: [{
            'id': '0',
            'value': '0',
            'text': '停用'
        },
        {
            'id': '1',
            'value': '1',
            'text': '使用'
        }
    ],
    PRODUCECLIENTSTATE: [{
        'id': '1',
        'value': '1',
        'text': '有效'
    },
        {
            'id': '2',
            'value': '2',
            'text': '无效'
        }
    ],
    SETTLEMENTWAY: [{
        'id': '1',
        'value': '1',
        'text': '现金结算'
    },
        {
            'id': '2',
            'value': '2',
            'text': '转账结算'
        }
    ],
    PURCHASELISTSTATE: [ //采购单状态
        {
            'id': '1',
            'value': '1',
            'text': '新建'
        },
        {
            'id': '2',
            'value': '2',
            'text': '部分采购'
        },
        {
            'id': '3',
            'value': '3',
            'text': '已完成'
        }
    ],
    MATERIELCONVERSION: [ //计算单位转换
        {
            'id': '0',
            'value': '0',
            'text': '无需转换'
        },
        {
            'id': '1',
            'value': '1',
            'text': '厘米'
        },
        {
            'id': '2',
            'value': '2',
            'text': '米'
        },
        {
            'id': '3',
            'value': '3',
            'text': '平方米'
        }
    ],
    MATERIELINTPART: [ //是否取整
        {
            'id': '1',
            'value': '1',
            'text': '是'
        },
        {
            'id': '2',
            'value': '2',
            'text': '否'
        }
    ],
    SRMPURCHASESTATE: [ //供应商采购单状态
        {
            'id': '1',
            'value': '1',
            'text': '已接单'
        },
        {
            'id': '2',
            'value': '2',
            'text': '备货中'
        },
        {
            'id': '3',
            'value': '3',
            'text': '已发货'
        },
        {
            'id': '4',
            'value': '4',
            'text': '已收货'
        }
    ],
    PAYTYPE: [ //付款方式
        {
            'id': '1',
            'value': '1',
            'text': '现金刷卡'
        },
        {
            'id': '2',
            'value': '2',
            'text': '银行转账'
        },
        {
            'id': '3',
            'value': '3',
            'text': '信用卡'
        },
        {
            'id': '4',
            'value': '4',
            'text': '微信支付'
        },
        {
            'id': '5',
            'value': '5',
            'text': '支付宝'
        }
    ],
    RECEIVABLESTYPE: [ //收款类型
        {
            'id': '1',
            'value': '1',
            'text': '订金'
        },
        {
            'id': '2',
            'value': '2',
            'text': '预付款'
        },
        {
            'id': '3',
            'value': '3',
            'text': '进度款'
        },
        {
            'id': '4',
            'value': '4',
            'text': '尾款'
        },
        {
            'id': '5',
            'value': '5',
            'text': '增项款'
        },
        {
            'id': '6',
            'value': '6',
            'text': '减项款'
        },
        {
            'id': '7',
            'value': '7',
            'text': '其它'
        }
    ],
    UPDATEREASON: [ //工期修改原因
        {
            'id': '1',
            'value': '1',
            'text': '付款延时'
        },
        {
            'id': '2',
            'value': '2',
            'text': '物业延时'
        },
        {
            'id': '3',
            'value': '3',
            'text': '户主延时'
        },
        {
            'id': '4',
            'value': '4',
            'text': '物流延时'
        },
        {
            'id': '5',
            'value': '5',
            'text': '施工延时'
        },
        {
            'id': '6',
            'value': '6',
            'text': '提前完成节点'
        },
        {
            'id': '7',
            'value': '7',
            'text': '其它'
        }
    ],
    CUSTOMERSOURCE: [ //客户来源
        {
            'id': '1',
            'value': '1',
            'text': 'APP'
        },
        {
            'id': '2',
            'value': '2',
            'text': '总部导入'
        },
        {
            'id': '3',
            'value': '3',
            'text': '门店录入'
        },
        {
            'id': '4',
            'value': '4',
            'text': '客户预约'
        }
    ],
    GENDERTYPE: [ //性别
        {
            'id': '1',
            'value': '1',
            'text': '男'
        },
        {
            'id': '2',
            'value': '2',
            'text': '女'
        }
    ],
    TASKSTATE: [{
            'id': '1',
            'value': '1',
            'text': '未开工'
        },
        {
            'id': '2',
            'value': '2',
            'text': '施工中'
        },
        {
            'id': '3',
            'value': '3',
            'text': '节点完成'
        }
    ],
    ISTATEINFO: [{
            'id': '1',
            'value': '1',
            'text': '未受理'
        },
        {
            'id': '2',
            'value': '2',
            'text': '已受理'
        }
    ],
    SMSTYPE: [{
            'id': '1',
            'value': 'register',
            'text': '注册'
        },
        {
            'id': '2',
            'value': 'reset_password',
            'text': '重置密码'
        }
    ],
    FILESRVTYPE: [ //文件业务类型
        {
            'id': '1',
            'value': '1',
            'text': '设计文档'
        },
        {
            'id': '2',
            'value': '2',
            'text': '合同文档'
        },
        {
            'id': '3',
            'value': '3',
            'text': '内部审核'
        },
        {
            'id': '4',
            'value': '4',
            'text': '户型图'
        },
        {
            'id': '5',
            'value': '5',
            'text': '全局设计图'
        },
        {
            'id': '6',
            'value': '6',
            'text': '效果图'
        },

        {
            'id': '7',
            'value': '7',
            'text': '待摊资产照片'
        }
    ],
    GROUPTYPE: [{
            'id': '01',
            'value': '01',
            'text': '操作员'
        },
        {
            'id': '33',
            'value': '33',
            'text': '监理'
        }
    ],
    WORKLOGTYPE: [{
            'id': '1',
            'value': '1',
            'text': '工作日志'
        },
        {
            'id': '2',
            'value': '2',
            'text': '驳回理由'
        }
    ],
    CHANGETYPE: [ //物料变更类型
        {
            'id': '1',
            'value': '1',
            'text': '增项'
        },
        {
            'id': '2',
            'value': '2',
            'text': '减项'
        },
        {
            'id': '3',
            'value': '3',
            'text': '漏项'
        }
    ],
    CHANGESTATE: [ //变更状态
        {
            'id': '0',
            'value': '0',
            'text': '待提交'
        },
        {
            'id': '1',
            'value': '1',
            'text': '审核中'
        },
        {
            'id': '2',
            'value': '2',
            'text': '已通过'
        },
        {
            'id': '3',
            'value': '3',
            'text': '已驳回'
        }
    ],
    ACCEPTANCETYPE: [ //验收上传实例类型
        {
            'id': '1',
            'value': '照片',
            'text': '照片'
        }
    ],
    FLOWSOURCE: [ //流量来源
        {
            'id': '1',
            'value': '1',
            'text': '客户推荐'
        },
        {
            'id': '2',
            'value': '2',
            'text': '自然进店'
        },
        {
            'id': '3',
            'value': '3',
            'text': '网络推广'
        },
        {
            'id': '4',
            'value': '4',
            'text': '户外广告'
        },
        {
            'id': '5',
            'value': '5',
            'text': '地推'
        },
        {
            'id': '6',
            'value': '6',
            'text': '电销'
        },
        {
            'id': '7',
            'value': '7',
            'text': '其他'
        }
    ],
    ROOMMATERIALINFO: [ //户型物料类型
        {
            'id': 1,
            'value': 1,
            'text': '标准品'
        },
        {
            'id': 2,
            'value': 2,
            'text': '定制品'
        }
    ],
    MATERIALORDERSTATUS: [ //采购单状态
        {
            'id': '1',
            'value': '1',
            'text': '待提交'
        },
        {
            'id': '2',
            'value': '2',
            'text': '已提交'
        },
        {
            'id': '3',
            'value': '3',
            'text': '新建'
        },
        {
            'id': '4',
            'value': '4',
            'text': '备货中'
        },
        {
            'id': '5',
            'value': '5',
            'text': '已发货'
        },
        {
            'id': '6',
            'value': '6',
            'text': '已收货'
        }
    ],
    WAREHOUSETYPE: [ //仓库类型
        {
            'id': '1',
            'value': '1',
            'text': '中转仓'
        },
        {
            'id': '2',
            'value': '2',
            'text': '储备仓'
        },
        {
            'id': '3',
            'value': '3',
            'text': '其他仓'
        }
    ],
    STORETYPE: [ //仓储类型
        [{
                'id': '0',
                'value': '0',
                'text': '全部'
            },
            {
                'id': '1',
                'value': '1',
                'text': '待入库'
            },
            {
                'id': '2',
                'value': '2',
                'text': '开始入库'
            },
            {
                'id': '3',
                'value': '3',
                'text': '入库已满'
            }
        ],
        [{
                'id': '0',
                'value': '0',
                'text': '全部'
            },
            {
                'id': '1',
                'value': '1',
                'text': '新纪录'
            },
            {
                'id': '2',
                'value': '2',
                'text': '部分出库'
            },
            {
                'id': '3',
                'value': '3',
                'text': '完成出库'
            }
        ]
    ],
    STORETYPE2: [ //仓储类型
        [{
            'id': '0',
            'value': '0',
            'text': '全部'
        },
            {
                'id': '1',
                'value': '1',
                'text': '待入库'
            },
            {
                'id': '2',
                'value': '2',
                'text': '开始入库'
            },
            {
                'id': '3',
                'value': '3',
                'text': '入库已满'
            }
        ],
        [{
            'id': '0',
            'value': '0',
            'text': '全部'
        },
            {
                'id': '1',
                'value': '1',
                'text': '待出库'
            },
            {
                'id': '2',
                'value': '2',
                'text': '开始出库'
            },
            {
                'id': '3',
                'value': '3',
                'text': '完成出库'
            }
        ]
    ],
    WAREHOUSESTATE: [ //仓库状态
        {
            'id': '0',
            'value': '0',
            'text': '不可用'
        },
        {
            'id': '1',
            'value': '1',
            'text': '可用'
        }
    ],
    PURCHASEAPPLYSTATE: [{
            'id': '0',
            'value': '0',
            'text': '待提交'
        },
        {
            'id': '1',
            'value': '1',
            'text': '已提交'
        },
        {
            'id': '2',
            'value': '2',
            'text': '通过'
        },
        {
            'id': '3',
            'value': '3',
            'text': '拒绝'
        }
    ],
    PURCHASEORDERSTATE: [{
        'id': '0',
        'value': '0',
        'text': '未审核'
    },
    {
        'id': '1',
        'value': '1',
        'text': '拒绝'
    },
    {
        'id': '2',
        'value': '2',
        'text': '通过'
    }

],
    PURCHASEAPPLYORDERTYPE:[{
            'id': '1',
            'value': '1',
            'text': '销售订单'
        },
        {
            'id': '2',
            'value': '2',
            'text': '项目施工编号'
        }
    ],
    PLANSTATE: [{
            'id': '0',
            'value': '0',
            'text': '新计划'
        },
        {
            'id': '1',
            'value': '1',
            'text': '已指派'
        },
        {
            'id': '2',
            'value': '2',
            'text': '通过'
        },
        {
            'id': '3',
            'value': '3',
            'text': '拒绝'
        }
    ],
    INVENTORYOPERATETYPE: [ //出入库类型
        {
            'id': '1',
            'value': '1',
            'text': '采购入库'
        },
        {
            'id': '2',
            'value': '2',
            'text': '销售出库'
        },
        {
            'id': '3',
            'value': '3',
            'text': '其他入库'
        },
        {
            'id': '4',
            'value': '4',
            'text': '其他出库'
        },
        {
            'id': '5',
            'value': '5',
            'text': '产品入库'
        },
        {
            'id': '6',
            'value': '6',
            'text': '生产领料'
        },
        {
            'id': '7',
            'value': '7',
            'text': '委外入库'
        },
        {
            'id': '8',
            'value': '8',
            'text': '委外出库'
        }
    ],
    AGEFORM: [{
            'id': '1',
            'value': '1',
            'text': '20-30岁'
        },
        {
            'id': '2',
            'value': '2',
            'text': '30-40岁'
        },
        {
            'id': '3',
            'value': '3',
            'text': '40-50岁'
        },
        {
            'id': '4',
            'value': '4',
            'text': '50-60岁'
        },
        {
            'id': '5',
            'value': '5',
            'text': '60岁以上'
        }
    ],
    ORDERREQUIRETYPE: [
        // {
        //     'id': '1',
        //     'value': '1',
        //     'text': '设计文档要求'
        // },
        // {
        //     'id': '2',
        //     'value': '2',
        //     'text': '3D效果要求'
        // },
        // {
        //     'id': '3',
        //     'value': '3',
        //     'text': '内部审核要求'
        // },
        {
            'id': '4',
            'value': '4',
            'text': '订单评审要求'
        },
        {
            'id': '5',
            'value': '5',
            'text': '产品规划评审要求'
        },
    ],
    INVENTORYCHECKSTATE: [{
            'id': '1',
            'value': '1',
            'text': '新任务'
        },
        {
            'id': '2',
            'value': '2',
            'text': '待审批'
        },
        {
            'id': '3',
            'value': '3',
            'text': '完成'
        }
    ],
    TASKPRORITY: [ //任务优先级
        {
            'id': '1',
            'value': '1',
            'text': '高'
        },
        {
            'id': '2',
            'value': '2',
            'text': '中'
        },
        {
            'id': '3',
            'value': '3',
            'text': '低'
        }
    ],
    TASKTYPE: [ //任务类型
        {
            'id': '1',
            'value': '1',
            'text': '人工派发任务'
        },
        {
            'id': '2',
            'value': '2',
            'text': '采购申请'
        },
        {
            'id': '3',
            'value': '3',
            'text': '内部审核'
        },
        {
            'id': '4',
            'value': '4',
            'text': '生产计划'
        },
        {
            'id': '5',
            'value': '5',
            'text': '订单评审'
        },
        {
            'id': '6',
            'value': '6',
            'text': '订单验收'
        },
        {
            'id': '7',
            'value': '7',
            'text': '物料审核'
        },
        {
            'id': '8',
            'value': '8',
            'text': '物料变更'
        },
        {
            'id': '9',
            'value': '9',
            'text': '报废审核'
        },
        {
            'id': '10',
            'value': '10',
            'text': '入库申请'
        },
        {
            'id': '11',
            'value': '11',
            'text': '出库申请'
        },
        {
            'id': '12',
            'value': '12',
            'text': '预算审核'
        },
        {
            'id': '13',
            'value': '13',
            'text': '决算审核'
        },
        {
            'id': '14',
            'value': '14',
            'text': '公告通知'
        },
        {
            'id': '15',
            'value': '15',
            'text': '招录任务'
        },
        {
            'id': '16',
            'value': '16',
            'text': '退货任务'
        },
        {
            'id': '17',
            'value': '17',
            'text': '闲置库存申请'
        },
        {
            'id': '18',
            'value': '18',
            'text': '会议通知'
        },
        {
            'id': '19',
            'value': '19',
            'text': '会议跟进事项'
        },
        {
            'id': '20',
            'value': '20',
            'text': '会议通知'
        },
        {
            'id': '21',
            'value': '21',
            'text': '会议通知'
        },
        {
            'id': '22',
            'value': '22',
            'text': '出差、用车接待申请通知'
        },
        {
            'id': '23',
            'value': '23',
            'text': '会议通知'
        },
        {
            'id': '24',
            'value': '24',
            'text': '交通接待报销申请通知'
        },
        {
            'id': '25',
            'value': '25',
            'text': '文控管理'
        },
        {
            'id': '26',
            'value': '26',
            'text': '文件发布通知'
        },
        {
            'id': '27',
            'value': '27',
            'text': '请假管理'
        },
        {
            'id': '28',
            'value': '28',
            'text': '资金支出管理通知'
        },
        {
            'id': '29',
            'value': '29',
            'text': '固定资产申购'
        },
        {
            'id': '30',
            'value': '30',
            'text': '固定资产验收'
        },
        {
            'id': '31',
            'value': '31',
            'text': '固定资产维修'
        },
        {
            'id': '32',
            'value': '32',
            'text': '新增待摊资产项目'
        },
        {
            'id': '33',
            'value': '33',
            'text': '待摊资产构建预算'
        },
        {
            'id': '34',
            'value': '34',
            'text': '待摊资产材料申购'
        },
        {
            'id': '35',
            'value': '35',
            'text': '待摊资产材料收料'
        },
        {
            'id': '36',
            'value': '36',
            'text': '待摊资产人工结算'
        },
        {
            'id': '37',
            'value': '37',
            'text': '待摊资产材料耗用'
        },
        {
            'id': '38',
            'value': '38',
            'text': '待摊资产构建费用'
        },
        {
            'id': '39',
            'value': '39',
            'text': '资产报废'
        },
        {
            'id': '40',
            'value': '40',
            'text': '低值易耗品申购'
        },
        {
            'id': '41',
            'value': '41',
            'text': '低值易耗品验收申请'
        },
        {
            'id': '42',
            'value': '42',
            'text': '待摊资产提交验收'
        },
        {
            'id': '43',
            'value': '43',
            'text': '盘点审批任务'
        },
        {
            'id': '44',
            'value': '44',
            'text': '盘点完成消息通知'
        },
        {
            'id': '45',
            'value': '45',
            'text': '收款申报'
        },
        {
            'id': '46',
            'value': '46',
            'text': '付款确认'
        },
        {
            'id': '50',
            'value': '50',
            'text': '研发项目新增'
        },
        {
            'id': '51',
            'value': '51',
            'text': '项目构建预算'
        },
        {
            'id': '52',
            'value': '52',
            'text': '项目材料申购'
        },
        {
            'id': '53',
            'value': '53',
            'text': '项目材料收料'
        },
        {
            'id': '54',
            'value': '54',
            'text': '项目人工结算'
        },
        {
            'id': '55',
            'value': '55',
            'text': '项目材料耗用'
        },
        {
            'id': '56',
            'value': '56',
            'text': '项目构建费用'
        },
        {
            'id': '57',
            'value': '57',
            'text': '项目提交验收'
        },
        {
            'id': '58',
            'value': '58',
            'text': '品质检验'
        },
        {
            'id': '60',
            'value': '60',
            'text': '工程项目材料申购'
        },
        {
            'id': '61',
            'value': '61',
            'text': '工程项目人工结算'
        },
        {
            'id': '62',
            'value': '62',
            'text': '工程项目材料耗用'
        },
        {
            'id': '63',
            'value': '63',
            'text': '工程项目构建费用'
        },
        {
            'id': '64',
            'value': '64',
            'text': '工程项目提交验收'
        },
        {
            'id': '65',
            'value': '65',
            'text': '工程项目新建'
        },
        {
            'id': '66',
            'value': '66',
            'text': '工程项目提交预算'
        },

        {
            'id': '67',
            'value': '67',
            'text': '手工记账凭证新增'
        },
        {
            'id': '68',
            'value': '68',
            'text': '会计科目详情审批'
        },
        {
            'id': '70',
            'value': '70',
            'text': '产品规划物料审核'
        },
        {
            'id': '71',
            'value': '71',
            'text': '产品规划联产品审核'
        },
        {
            'id': '72',
            'value': '72',
            'text': '产品规划边余料审核'
        },
        {
            'id': '73',
            'value': '73',
            'text': '产品规划工序管理审核'
        },
        {
            'id': '80',
            'value': '80',
            'text': '税务申报表审核'
        },
        {
            'id': '81',
            'value': '81',
            'text': '税费付款审核'
        },
        {
            'id': '82',
            'value': '82',
            'text': '供应商付款审核'
        },
        {
            'id': '84',
            'value': '84',
            'text': '外包服务审核'
        },
        {
            'id': '83',
            'value': '83',
            'text': '长期资产付款审核'
        },
        {
            'id': '85',
            'value': '85',
            'text': '生产派工单'
        },
        {
            'id': '86',
            'value': '86',
            'text': '离职审核'
        },
        {
            'id': '87',
            'value': '87',
            'text': '安全库存审核'
        },
        {
            'id': '88',
            'value': '88',
            'text': '生产工序移交'
        },
        {
            'id': '90',
            'value': '90',
            'text': '投料变更任务'
        },
        {
            'id': '91',
            'value': '91',
            'text': '异常停线'
        },
        {
            'id': '92',
            'value': '92',
            'text': '生产任务单转采购'
        },
        {
            'id': '93',
            'value': '93',
            'text': '生产投料报废审核任务'
        },
        {
            'id': '94',
            'value': '94',
            'text': '跟线生产任务'
        },
        {
            'id': '95',
            'value': '95',
            'text': '挪料任务'
        },
        {
            'id': '96',
            'value': '96',
            'text': '日计划影响因素改善措施'
        },
        {
            'id': '100',
            'value': '100',
            'text': '申请借款审核'
        },
        {
            'id': '101',
            'value': '101',
            'text': '工资申请审核'
        },
        //==========沿海 begin========
        {
            'id': '201',
            'value': '201',
            'text': '印章刻印审核'
        },
        {
            'id': '202',
            'value': '202',
            'text': '用章审核'
        },
        {
            'id': '203',
            'value': '203',
            'text': '印章归位审批'
        },
        {
            'id': '204',
            'value': '204',
            'text': '印章报废审核'
        },
        {
            'id': '205',
            'value': '205',
            'text': '证照外借审核'
        },
        {
            'id': '206',
            'value': '206',
            'text': '证照外借归位确认'
        },
        {
            'id': '207',
            'value': '207',
            'text': '证照年检确认'
        },
        {
            'id': '208',
            'value': '208',
            'text': '证照有效期修改确认'
        },
        {
            'id': '209',
            'value': '209',
            'text': '应交档案已超过归档时间提醒'
        },
        {
            'id': '210',
            'value': '210',
            'text': '档案外借'
        },
        {
            'id': '211',
            'value': '211',
            'text': '档案外借归位'
        },
        {
            'id': '212',
            'value': '212',
            'text': '劳动合同提醒'
        },
        {
            'id': '213',
            'value': '213',
            'text': '劳动合同提醒'
        },
        {
            'id': '214',
            'value': '214',
            'text': '利息支付申请确认'
        },
        {
            'id': '215',
            'value': '215',
            'text': '借款支付利息提醒'
        },
        {//项目管理
            'id': '216',
            'value': '216',
            'text': '项目里程碑问题'
        },
        {
            'id': '217',
            'value': '217',
            'text': '项目售后问题'
        },
        {
            'id': '218',
            'value': '218',
            'text': '项目收款任务提醒'
        },
        {//票据管理
            'id': '219',
            'value': '219',
            'text': '收到票据背书转让申请'
        },
        {
            'id': '220',
            'value': '220',
            'text': '收到票据贴现申请'
        },
        {
            'id': '221',
            'value': '221',
            'text': '收到票据兑收任务确认'
        },
        {
            'id': '222',
            'value': '222',
            'text': '开出票据申请'
        },
        {
            'id': '223',
            'value': '223',
            'text': '开出票据兑付任务确认'
        },
        //==========沿海 end========
    ],
    TASKLISTSTATE: [ //任务状态
        {
            'id': '1',
            'value': '1',
            'text': '未完成'
        },
        {
            'id': '2',
            'value': '2',
            'text': '已完成'
        },
        {
            'id': '3',
            'value': '3',
            'text': '已确认'
        },
        {
            'id': '4',
            'value': '4',
            'text': '已驳回'
        }
    ],
    MATERIALREVIEWSTATE: [{
            'id': '1',
            'value': '1',
            'text': '待审核'
        },
        {
            'id': '2',
            'value': '2',
            'text': '已审核'
        },
        {
            'id': '3',
            'value': '3',
            'text': '驳回'
        }
    ],
    CHECKUSESTATE: [{
        'id': '1',
        'value': '1',
        'text': '待审核'
    },
        {
            'id': '2',
            'value': '2',
            'text': '已审核'
        },
        {
            'id': '3',
            'value': '3',
            'text': '驳回'
        }
    ],

    ORDERCHECKSTATE: [
        {
            'id': '0',
            'value': '0',
            'text': '未提交'
        },
        {
            'id': '1',
            'value': '1',
            'text': '已提交'
        },
        {
            'id': '2',
            'value': '2',
            'text': '通过'
        },
        {
            'id': '3',
            'value': '3',
            'text': '拒绝'
        }
    ],
    THIRDSIGNUSER: [{
            'id': '1',
            'value': '1',
            'text': '供应商用户'
        },
        {
            'id': '2',
            'value': '2',
            'text': '地产商用户'
        }
    ],
    ZOWEEPROCESSSTATE: [{
            'id': '0',
            'value': '0',
            'text': '未上传'
        },
        {
            'id': '1',
            'value': '1',
            'text': '已提交'
        },
        {
            'id': '2',
            'value': '2',
            'text': '技术审核通过'
        },
        {
            'id': '3',
            'value': '3',
            'text': '技术审核拒绝'
        },
        {
            'id': '4',
            'value': '4',
            'text': '订单重传'
        },
        {
            'id': '5',
            'value': '5',
            'text': '下单生产'
        },
        {
            'id': '6',
            'value': '6',
            'text': '入库中'
        }
    ],
    SAFEPURCHASE: [{
            'id': '0',
            'value': '0',
            'text': '未采购'
        },
        {
            'id': '1',
            'value': '1',
            'text': '已采购'
        }
    ],
    INVALIDATEORDERSTATE: [{
            'id': '1',
            'value': '1',
            'text': '待提交'
        },
        {
            'id': '2',
            'value': '2',
            'text': '待审批'
        },
        {
            'id': '3',
            'value': '3',
            'text': '未通过'
        },
        {
            'id': '4',
            'value': '4',
            'text': '已报废'
        }
    ],
    INVALIDATEORDERREASON: [{ //报废原因
        'id': '1',
        'value': '1',
        'text': '不良来料'
    },
        {
            'id': '2',
            'value': '2',
            'text': '退货换货'
        },
        {
            'id': '3',
            'value': '3',
            'text': '生产废料'
        },
        {
            'id': '4',
            'value': '4',
            'text': '边角余料'
        },
        {
            'id': '5',
            'value': '5',
            'text': '和试样试机'
        }
    ],
    INVENTORYSTATE: [{
            'id': '0',
            'value': '0',
            'text': '待提交'
        },
        {
            'id': '1',
            'value': '1',
            'text': '待审批'
        }
    ],
    ZOWEEPROCESSTYPE: [ //制造单类型
        {
            'id': '1',
            'value': '1',
            'text': '正常'
        },
        {
            'id': '2',
            'value': '2',
            'text': '补单'
        }
    ],
    STOCKORDERSTATE: [
        {
        'id': '0',
        'value': '0',
        'text': '待提交'
        },
        {
            'id': '1',
            'value': '1',
            'text': '待审批'
        },
        {
            'id': '2',
            'value': '2',
            'text': '未通过'
        },
        {
            'id': '3',
            'value': '3',
            'text': '已通过'
        }
    ],
    STOCKOUTAPPLYSTATE: [
        {
            'id': '0',
            'value': '0',
            'text': '待提交'
        },
        {
            'id': '1',
            'value': '1',
            'text': '待审批'
        },
        {
            'id': '2',
            'value': '2',
            'text': '未通过'
        },
        {
            'id': '3',
            'value': '3',
            'text': '已通过'
        }
    ],
    USERSTATE: [{
        'id': '0',
        'value': '0',
        'text': '停用'
    },
        {
            'id': '1',
            'value': '1',
            'text': '启用'
        }
    ],
    DEPARTTYPE: [{
        'id': '0',
        'value': '0',
        'text': '制造部门'
        },
        {
            'id': '1',
            'value': '1',
            'text': '销售部门'
        },
        {
            'id': '2',
            'value': '2',
            'text': '其他部门'
        }
    ],
    PROJECTSTATE: [
        {
        'id': '1',
        'value': '1',
        'text': '新建'//预算状态
        },
        {
            'id': '2',
            'value': '2',
            'text': '预算待审批'//预算状态
        },
        {
            'id': '3',
            'value': '3',
            'text': '决算待提交'//预算通过决算待提交
        },
        {
            'id': '4',
            'value': '4',
            'text': '预算已驳回'//预算状态
        },
        {
            'id': '5',
            'value': '5',
            'text': '决算待审批'//决算状态
        },
        {
            'id': '6',
            'value': '6',
            'text': '决算已通过'//决算状态
        },
        {
            'id': '7',
            'value': '7',
            'text': '决算已驳回'//决算状态
        }
    ],
    NOTICESTATE: [
        {
            'id': '0',
            'value': '0',
            'text': '未读'
        },
        {
            'id': '1',
            'value': '1',
            'text': '已读'
        }
    ],
    HRSTATE: [
        {
            'id': '0',
            'value': '0',
            'text': '待提交'
        },
        {
            'id': '1',
            'value': '1',
            'text': '待招录'
        },
        {
            'id': '2',
            'value': '2',
            'text': '已招录'
        }
    ],
    CONTRACT: [
        {
            'id': '1',
            'value': '1',
            'text': '合同制'
        },
        {
            'id': '2',
            'value': '2',
            'text': '劳务制'
        },
        {
            'id': '3',
            'value': '3',
            'text': '临时工'
        }
    ],
    USERSTATION: [
        {
            'id': '0',
            'value': '0',
            'text': '离职'
        },
        {
            'id': '1',
            'value': '1',
            'text': '在职'
        }
    ],
    DEPARTUREREASON: [
        {
            'id': '1',
            'value': '1',
            'text': '企业原因'
        },
        {
            'id': '2',
            'value': '2',
            'text': '个人原因'
        },
        {
            'id': '3',
            'value': '3',
            'text': '其他原因'
        }
    ],
    REGISTERCATEGORY: [
        {
            'id': '1',
            'value': '1',
            'text': '农业户口'
        },
        {
            'id': '2',
            'value': '2',
            'text': '非农业户口'
        }
    ],
    EDUCATION: [
        {
            'id': '0',
            'value': '0',
            'text': '小学'
        },
        {
            'id': '1',
            'value': '1',
            'text': '初中'
        },
        {
            'id': '2',
            'value': '2',
            'text': '高中'
        },
        {
            'id': '3',
            'value': '3',
            'text': '中专'
        },
        {
            'id': '4',
            'value': '4',
            'text': '大专'
        },
        {
            'id': '5',
            'value': '5',
            'text': '本科'
        },
        {
            'id': '6',
            'value': '6',
            'text': '硕士'
        },
        {
            'id': '7',
            'value': '7',
            'text': '博士'
        }
    ],
    MARITALSTATUS: [
        {
            'id': '1',
            'value': '1',
            'text': '未婚'
        },
        {
            'id': '2',
            'value': '2',
            'text': '已婚'
        }
    ],
    CONTRACTSTATE: [
        {
            'id': '1',
            'value': '1',
            'text': '新签'
        },
        {
            'id': '2',
            'value': '2',
            'text': '续签'
        },
        {
            'id': '3',
            'value': '3',
            'text': '已解除'
        }
    ],
    NATIONAL: [
        {
            'id': '1',
            'value': '1',
            'text': '汉族'
        },
        {
            'id': '2',
            'value': '2',
            'text': '壮族'
        },
        {
            'id': '3',
            'value': '3',
            'text': '满族'
        },
        {
            'id': '4',
            'value': '4',
            'text': '回族'
        },
        {
            'id': '5',
            'value': '5',
            'text': '苗族'
        },
        {
            'id': '6',
            'value': '6',
            'text': '维吾尔族'
        },
        {
            'id': '7',
            'value': '7',
            'text': '土家族'
        },
        {
            'id': '8',
            'value': '8',
            'text': '彝族'
        },
        {
            'id': '9',
            'value': '9',
            'text': '蒙古族'
        },
        {
            'id': '10',
            'value': '10',
            'text': '藏族'
        },
        {
            'id': '11',
            'value': '11',
            'text': '布依族'
        },
        {
            'id': '12',
            'value': '12',
            'text': '侗族'
        },
        {
            'id': '13',
            'value': '13',
            'text': '瑶族'
        },
        {
            'id': '14',
            'value': '14',
            'text': '朝鲜族'
        },
        {
            'id': '15',
            'value': '15',
            'text': '白族'
        },
        {
            'id': '16',
            'value': '16',
            'text': '哈尼族'
        },
        {
            'id': '17',
            'value': '17',
            'text': '哈萨克族'
        },
        {
            'id': '18',
            'value': '18',
            'text': '黎族'
        },
        {
            'id': '19',
            'value': '19',
            'text': '傣族'
        },
        {
            'id': '20',
            'value': '20',
            'text': '畲族'
        },
        {
            'id': '21',
            'value': '21',
            'text': '傈僳族'
        },
        {
            'id': '22',
            'value': '22',
            'text': '仡佬族'
        },
        {
            'id': '23',
            'value': '23',
            'text': '东乡族'
        },
        {
            'id': '24',
            'value': '24',
            'text': '高山族'
        },
        {
            'id': '25',
            'value': '25',
            'text': '拉祜族'
        },
        {
            'id': '26',
            'value': '26',
            'text': '水族'
        },
        {
            'id': '27',
            'value': '27',
            'text': '佤族'
        },
        {
            'id': '28',
            'value': '28',
            'text': '纳西族'
        },
        {
            'id': '29',
            'value': '29',
            'text': '羌族'
        },
        {
            'id': '30',
            'value': '30',
            'text': '土族'
        },
        {
            'id': '31',
            'value': '31',
            'text': '仫佬族'
        },
        {
            'id': '32',
            'value': '32',
            'text': '锡伯族'//
        },
        {
            'id': '33',
            'value': '33',
            'text': '柯尔克孜族'
        },
        {
            'id': '34',
            'value': '34',
            'text': '达斡尔族'
        },
        {
            'id': '35',
            'value': '35',
            'text': '景颇族'
        },
        {
            'id': '36',
            'value': '36',
            'text': '毛南族'
        },
        {
            'id': '37',
            'value': '37',
            'text': '撒拉族'
        },
        {
            'id': '38',
            'value': '38',
            'text': '布朗族'
        },
        {
            'id': '39',
            'value': '39',
            'text': '塔吉克族'
        },
        {
            'id': '40',
            'value': '40',
            'text': '阿昌族'
        },
        {
            'id': '41',
            'value': '41',
            'text': '普米族'
        },
        {
            'id': '42',
            'value': '42',
            'text': '鄂温克族'
        },
        {
            'id': '43',
            'value': '43',
            'text': '怒族'
        },
        {
            'id': '44',
            'value': '44',
            'text': '京族'
        },
        {
            'id': '45',
            'value': '45',
            'text': '基诺族'
        },
        {
            'id': '46',
            'value': '46',
            'text': '德昂族'
        },
        {
            'id': '47',
            'value': '47',
            'text': '保安族'
        },
        {
            'id': '48',
            'value': '48',
            'text': '俄罗斯族'
        },
        {
            'id': '49',
            'value': '49',
            'text': '裕固族'
        },
        {
            'id': '50',
            'value': '50',
            'text': '乌兹别克族'
        },
        {
            'id': '51',
            'value': '51',
            'text': '门巴族'
        },
        {
            'id': '52',
            'value': '52',
            'text': '鄂伦春族'
        },
        {
            'id': '54',
            'value': '54',
            'text': '京族'
        },
        {
            'id': '53',
            'value': '53',
            'text': '独龙族'
        },
        {
            'id': '54',
            'value': '54',
            'text': '塔塔尔族'
        },
        {
            'id': '55',
            'value': '55',
            'text': '赫哲族'
        },
        {
            'id': '56',
            'value': '56',
            'text': '珞巴族'
        }
    ],
    CHECKSTATE: [{
            'id': '0',
            'value': '0',
            'text': '待检验'
        },
        {
            'id': '1',
            'value': '1',
            'text': '部分检验'
        },
        {
            'id': '2',
            'value': '2',
            'text': '全部检验'
        }
    ],
    DECORATETYPE: [
        {
            'id': '1',
            'value': '1',
            'text': '小程序装修资讯'
        },
        {
            'id': '2',
            'value': '2',
            'text': '酷家乐VR展示'
        }
    ],
    SALETYPE: [
        {
            'id': '1',
            'value': '1',
            'text': '开售'
        },
        {
            'id': '2',
            'value': '2',
            'text': '暂未开售'
        }
    ],
    LOANINFO: [{
        'id': '0',
        'value': '0',
        'text': '未受理'
    },
        {
            'id': '1',
            'value': '1',
            'text': '已受理'
        }
    ],
    SPACEPOSITION: [{
        'id': '天花',
        'value': '天花',
        'text': '天花'
    },
        {
            'id': '地面',
            'value': '地面',
            'text': '地面'
        },
        {
            'id': '墙身1',
            'value': '墙身1',
            'text': '墙身1'
        },
        {
            'id': '墙身2',
            'value': '墙身2',
            'text': '墙身2'
        },
        {
            'id': '墙身3',
            'value': '墙身3',
            'text': '墙身3'
        },
        {
            'id': '墙身4',
            'value': '墙身4',
            'text': '墙身4'
        },
        {
            'id': '内部构件',
            'value': '内部构件',
            'text': '内部构件'
        }
    ],
    NOTICEANSWER: [
        {
        'id': '1',
        'value': '1',
        'text': 'A'
        },
        {
            'id': '2',
            'value': '2',
            'text': 'B'
        },
        {
            'id': '3',
            'value': '3',
            'text': 'C'
        },
        {
            'id': '4',
            'value': '4',
            'text': 'D'
        }
    ],
    VEHICLESTATUS: [
        {
            'id': '0',
            'value': '0',
            'text': '待使用'
        },
        {
            'id': '1',
            'value': '1',
            'text': '使用中'
        }
    ],
    VEHICLESTATUSFLAG: [
        {
            'id': '0',
            'value': '0',
            'text': '手动更新'
        },
        {
            'id': '1',
            'value': '1',
            'text': '自动更新'
        }
    ],
    VEHICLETYPE: [
        {
            'id': '1',
            'value': '1',
            'text': '载货汽车'
        },
        {
            'id': '2',
            'value': '2',
            'text': '越野汽车'
        },
        {
            'id': '3',
            'value': '3',
            'text': '自卸汽车'
        },
        {
            'id': '4',
            'value': '4',
            'text': '牵引车'
        },
        {
            'id': '5',
            'value': '5',
            'text': '专用汽车'
        },
        {
            'id': '6',
            'value': '6',
            'text': '客车'
        },
        {
            'id': '7',
            'value': '7',
            'text': '轿车'
        },
        {
            'id': '8',
            'value': '8',
            'text': '半挂车'
        }
    ],
    MEETINGROOMSTATE: [
        {
            'id': '0',
            'value': '0',
            'text': '未确认'
        },
        {
            'id': '1',
            'value': '1',
            'text': '已确认'
        }
    ],
    //出差事由分类
    TRAPPLY_TRIP_REASON_TYPE :[
        {
            id:'1',
            value:'1',
            text:'销售、采购及生产业务出差'
        },
        {
            id:'2',
            value:'2',
            text:'其它出差'
        }
    ],
    //交通方式
    TRAPPLY_TRANS_WAY:[
        {
            id:'1',
            value:'1',
            text:'公共交通工具'
        },
        {
            id:"2",
            value:'2',
            text:'自驾车'
        },
        {
            id:"3",
            value:'3',
            text:'公司车辆'
        },
        {
            id:"4",
            value:'4',
            text:'其它'
        }
    ],
    //公司派车报销模式
    TRAPPLY_VEHICLE_REVIEW_TYPE:[
        {
            id:'1',
            value:'1',
            text:'汇总月结管理'
        },
        {
            id:'2',
            value:'2',
            text:'个人自行报销'
        }
    ],
    //接待事由分类
    TRAPPLY_RECEPTION_REASON_TYPE:[
        {
            id:'1',
            value:'1',
            text:'销售、采购及生产业务接待'
        },
        {
            id:'4',
            value:'4',
            text:'其它接待'
        }
    ],
    //接待住宿费用报销模式
    TRAPPLY_RECEPTION_REVIEW_TYPE:[
        {
            id:'1',
            value:'1',
            text:'汇总月结管理'
        },
        {
            id:'2',
            value:'2',
            text:'个人自行报销'
        }
    ],
    //
    ASKFORLEAVEREASON: [
        {
            'id': '1',
            'value': '1',
            'text': '事假'
        },
        {
            'id': '2',
            'value': '2',
            'text': '病假'
        },
        {
            'id': '3',
            'value': '3',
            'text': '婚假'
        },
        {
            'id': '4',
            'value': '4',
            'text': '丧假'
        },
        {
            'id': '5',
            'value': '5',
            'text': '公休假'
        },
        {
            'id': '6',
            'value': '6',
            'text': '工伤假'
        },
        {
            'id': '7',
            'value': '7',
            'text': '产假'
        },
        {
            'id': '8',
            'value': '8',
            'text': '陪产假'
        },
        {
            'id': '9',
            'value': '9',
            'text': '特殊事项有薪假'
        }
    ],
    //交通接待报销类型
    TR_EXPENSE_TYPE:[
        {
            id:"1",
            value:'trapply_traffic_fee',
            text:'非自驾车交通工具费用',
        },
        {
            id:'2',
            value:'reimburserank_gas_price',
            text:'自驾车的油补费用',
        },
        {
            id:'3',
            value:'reimburserank_trip_putup_price',
            text:'住宿费用'
        },
        {
            id:'4',
            value:'reimburserank_downtown_traffic_price',
            text:'市内交通补助'
        },
        {
            id:'5',
            value:'reimburserank_meal_price',
            text:'伙食补助'
        },
        {
            id:'6',
            value:'reimburserank_reception_price',
            text:'接待费用'
        },
        {
            id:'7',
            value:'reimburserank_reception_putup_price',
            text:'接待住宿费用'
        },
        {
            id:'8',
            value:'trapply_reception_extra_fee',
            text:'赠送礼品及额外活动费用'
        }
    ],
    //位置1
    CONTENT_LOCATION_ONE:[
        {
            id:'1',
            value:'1',
            text:'首页banner'
        },
        {
            id:'2',
            value:'2',
            text:'附近门店banner'
        },
        {
            id:'3',
            value:'3',
            text:'实拍案例banner'
        },
        {
            id:'4',
            value:'4',
            text:'装修日记banner'
        },
        {
            id:'5',
            value:'5',
            text:'整装套餐(极客·简美)'
        },
        {
            id:'6',
            value:'6',
            text:'整装套餐(蓝调·简欧)'
        },
        {
            id:'7',
            value:'7',
            text:'整装套餐(悦茗·新中式)'
        },
        {
            id:'8',
            value:'8',
            text:'服务流程'
        },
        {
            id:'9',
            value:'9',
            text:'品牌故事'
        },
        {
            id:'10',
            value:'10',
            text:'招商加盟'
        },
        {
            id:'11',
            value:'11',
            text:'实拍案例'
        },
        {
            id:'12',
            value:'12',
            text:'装修日记'
        },
        {
            id:'13',
            value:'13',
            text:'环保科技'
        },
        {
            id:'14',
            value:'14',
            text:'装修资讯'
        },
        {
            id:'15',
            value:'15',
            text:'小程序banner'
        },
        {
            id:'16',
            value:'16',
            text:'导购PAD套餐'
        },
        {
            id:'17',
            value:'17',
            text:'小程序套餐'
        }
    ],
    //位置2
    CONTENT_LOCATION_TWO:[
        {
            id:'1',
            value:'1',
            text:'实拍案例详情'
        },
        {
            id:'2',
            value:'2',
            text:'装修日记详情'
        }
    ],

    S_EXPENSE_TYPE:[
        {
            id:'1',
            value:'1',
            text:'业务接待',
        },
        {
            id:'2',
            value:'2',
            text:'其他接待',
        }
    ],
    CUSTOMERCATEGORY: [
        {
            'id': '1',
            'value': '1',
            'text': '强势产品企业'
        },
        {
            'id': '2',
            'value': '2',
            'text': '贴牌企业'
        },
        {
            'id': '3',
            'value': '3',
            'text': '定制企业'
        }
    ],
    PAYMENTTYPE: [
        {
            'id': '1',
            'value': '1',
            'text': '预付后货到付款'
        },
        {
            'id': '2',
            'value': '2',
            'text': '现金结算'
        },
        {
            'id': '3',
            'value': '3',
            'text': '月结结算'
        }
    ],
    CLIENTTYPE:[
        {
            'id': '1',
            'value': '1',
            'text': '机构'
        },
        {
            'id': '2',
            'value': '2',
            'text': '个人'
        },
        {
            'id': '3',
            'value': '3',
            'text': '企业'
        }
    ],
    SAPSTATE:[
        {
            'id': '1',
            'value': '1',
            'text': '新建'
        },
        {
            'id': '2',
            'value': '2',
            'text': '完成'
        },
    ],
    AMORTIZED:[
        {
            'id': '1',
            'value': '1',
            'text': '一次摊销'
        },
        {
            'id': '2',
            'value': '2',
            'text': '五五摊销'
        },
        {
            'id': '3',
            'value': '3',
            'text': '分期摊销'
        }
    ],
    OPTIONINFO:[
        {
            'id': '1',
            'value': '1',
            'text': '待摊资产项目'
        },
        {
            'id': '2',
            'value': '2',
            'text': '研发项目'
        },
    ],
    AMORTIZEPROJECTSTATE:[
        {
            'id': '1',
            'value': '1',
            'text': '待审核'
        },
        {
            'id': '2',
            'value': '2',
            'text': '已通过'
        },
        {
            'id': '3',
            'value': '3',
            'text': '已驳回'
        }
    ],
    AMORTIZECHECKSTATE:[
        {
            'id': '0',
            'value': '0',
            'text': '待提交'
        },
        {
            'id': '1',
            'value': '1',
            'text': '已提交'
        },
        {
            'id': '2',
            'value': '2',
            'text': '通过'
        },
        {
            'id': '3',
            'value': '3',
            'text': '拒绝'
        }
    ],
    AMORTIZEBUDGETSTATE:[
        {
            'id': '0',
            'value': '0',
            'text': '待提交'
        },
        {
            'id': '1',
            'value': '1',
            'text': '已提交'
        },
        {
            'id': '2',
            'value': '2',
            'text': '通过'
        },
        {
            'id': '3',
            'value': '3',
            'text': '拒绝'
        }
    ],
    AMORTIZESUBSCRIBEORDERSTATE:[
        {
            'id': '0',
            'value': '0',
            'text': '待提交'
        },
        {
            'id': '1',
            'value': '1',
            'text': '已提交'
        },
        {
            'id': '2',
            'value': '2',
            'text': '通过'
        },
        {
            'id': '3',
            'value': '3',
            'text': '拒绝'
        }
    ],
    DEVELOPSUBSCRIBEORDERSTATE:[
        {
            'id': '0',
            'value': '0',
            'text': '待提交'
        },
        {
            'id': '1',
            'value': '1',
            'text': '已提交'
        },
        {
            'id': '2',
            'value': '2',
            'text': '通过'
        },
        {
            'id': '3',
            'value': '3',
            'text': '拒绝'
        }
    ],
    AMORTIZESUBSCRIBESTATE:[
        {
            'id': '0',
            'value': '0',
            'text': '待提交'
        },
        {
            'id': '1',
            'value': '1',
            'text': '已提交'
        },
        {
            'id': '2',
            'value': '2',
            'text': '通过'
        },
        {
            'id': '3',
            'value': '3',
            'text': '拒绝'
        }
    ],
    AMORTIZERECEIVESTATE:[
        {
            'id': '0',
            'value': '0',
            'text': '待提交'
        },
        {
            'id': '1',
            'value': '1',
            'text': '已提交'
        },
        {
            'id': '2',
            'value': '2',
            'text': '通过'
        },
        {
            'id': '3',
            'value': '3',
            'text': '拒绝'
        }
    ],
    AMORTIZECONSUMESTATE:[
        {
            'id': '0',
            'value': '0',
            'text': '待提交'
        },
        {
            'id': '1',
            'value': '1',
            'text': '已提交'
        },
        {
            'id': '2',
            'value': '2',
            'text': '通过'
        },
        {
            'id': '3',
            'value': '3',
            'text': '拒绝'
        }
    ],
    AMORTIZECOSTSTATE:[
        {
            'id': '0',
            'value': '0',
            'text': '待提交'
        },
        {
            'id': '1',
            'value': '1',
            'text': '已提交'
        },
        {
            'id': '2',
            'value': '2',
            'text': '通过'
        },
        {
            'id': '3',
            'value': '3',
            'text': '拒绝'
        }
    ],
    AMORTIZECLEARINGSTATE:[
        {
            'id': '0',
            'value': '0',
            'text': '待提交'
        },
        {
            'id': '1',
            'value': '1',
            'text': '已提交'
        },
        {
            'id': '2',
            'value': '2',
            'text': '通过'
        },
        {
            'id': '3',
            'value': '3',
            'text': '拒绝'
        }
    ],
    FIXEDASSETS:[
        {
            'id': '1',
            'value': '1',
            'text': '房屋建筑'
        },
        {
            'id': '2',
            'value': '2',
            'text': '大型交通工具及生产设备'
        },
        {
            'id': '3',
            'value': '3',
            'text': '工具家具'
        },
        {
            'id': '4',
            'value': '4',
            'text': '普通运输工具'
        },
        {
            'id': '5',
            'value': '5',
            'text': '电子设备'
        }
    ],
    LONGASSETSTYPE:[
        {
            'id': '1',
            'value': '1',
            'text': '生产性'
        },
        {
            'id': '2',
            'value': '2',
            'text': '非生产性'
        }
    ],
    DEPRECIATIONMETHOD:[
        {
            'id': '1',
            'value': '1',
            'text': '平均年限法'
        },
        {
            'id': '2',
            'value': '2',
            'text': '年数总和法'
        },
        {
            'id': '3',
            'value': '3',
            'text': '双倍余额递减法'
        },
        {
            'id': '4',
            'value': '4',
            'text': '工作量法'
        }
    ],
    FIXEDACCEPTANCETYPE:[
        {
            'id': '1',
            'value': '1',
            'text': '盘盈验收'
        },
        {
            'id': '2',
            'value': '2',
            'text': '购入验收'
        }
    ],
    SCRAPTYPE:[
        {
            'id': '0',
            'value': '0',
            'text': '是'
        },
        {
            'id': '1',
            'value': '1',
            'text': '否'
        }
    ],
    REPAIRSTATE:[
        {
            'id': '0',
            'value': '0',
            'text': '待提交'
        },
        {
            'id': '1',
            'value': '1',
            'text': '未完成'
        },
        {
            'id': '2',
            'value': '2',
            'text': '已完成'
        }
    ],
    //低值易耗品管理类型
    LOW_VALUE_TYPE:[
        {
            'id':"1",
            'value': '1',
            'text': '资产申购'
        },
        {
            'id':"2",
            'value': '2',
            'text': '资产验收'
        }
    ],
    //低值易耗品验收类型
    LOW_VALUE_ACCEPTANCE_TYPE:[
        {
            'id':"1",
            'value': '1',
            'text': '盘盈验收'
        },
        {
            'id':"2",
            'value': '2',
            'text': '购入验收'
        }
    ],
    //低值易耗品状态
    LOW_VALUE_STATUS:[
        {
            'id': '0',
            'value': '0',
            'text': '待提交'
        },
        {
            'id': '1',
            'value': '1',
            'text': '待审批'
        },
        {
            'id': '2',
            'value': '2',
            'text': '未通过'
        },
        {
            'id': '3',
            'value': '3',
            'text': '已通过'
        }
    ],
    //盘点状态
    TAKES_STOCK_STATUS:[
        {
            'id': '0',
            'value': '0',
            'text': '待提交'
        },
        {
            'id': '1',
            'value': '1',
            'text': '待盘点'
        },
        {
            'id': '2',
            'value': '2',
            'text': '已完成'
        },
        {
            'id': '3',
            'value': '3',
            'text': '已确认'
        }
    ],
    //盈亏状态
    TAKES_STOCK_FLAG:[
        {
            'id': '0',
            'value': '0',
            'text': '盈亏'
        },
        {
            'id': '1',
            'value': '1',
                'text': '正常'
        }
    ],
    GATHERINGTYPE:[
        {
            'id': '0',
            'value': '0',
            'text': '客户销售业务款'
        },
        {
            'id': '1',
            'value': '1',
            'text': '借款'
        },
        {
            'id': '2',
            'value': '2',
            'text': '政府补助'
        },
        {
            'id': '3',
            'value': '3',
            'text': '投资款'
        },
        {
            'id': '4',
            'value': '4',
            'text': '其它'
        },
    ],
    CASHIERGATHERINGSTATE:[
        {
            'id': '1',
            'value': '1',
            'text': '待确认'
        },
        {
            'id': '2',
            'value': '2',
            'text': '已确认'
        }
    ],
    CAPITALCOSTTYLE:[
        {
            'id': '0',
            'value': '0',
            'text': '商品及劳务采购款'
        },
        {
            'id': '1',
            'value': '1',
            'text': '职工薪酬'
        },
        {
            'id': '3',
            'value': '3',
            'text': '短期投资款'
        },
        {
            'id': '4',
            'value': '4',
            'text': '长期投资款中长期股权投资'
        },
        {
            'id': '5',
            'value': '5',
            'text': '支付长期投资款中持有至到期投资'
        },
        {
            'id': '6',
            'value': '6',
            'text': '可供出售金融资产'
        },
        {
            'id': '7',
            'value': '7',
            'text': '归还短期借款本金'
        },
        {
            'id': '8',
            'value': '8',
            'text': '归还长期借款本金'
        },
        {
            'id': '9',
            'value': '9',
            'text': '支付借款利息'
        },
        {
            'id': '10',
            'value': '10',
            'text': '支付分红'
        },
        {
            'id': '11',
            'value': '11',
            'text': '生产部门费用报销'
        },
        {
            'id': '12',
            'value': '12',
            'text': '销售部门费用报销'
        },
        {
            'id': '13',
            'value': '13',
            'text': '长期资产采购款'
        },
        {
            'id': '14',
            'value': '14',
            'text': '其他部门费用报销'
        },

    ],
    PAYMENTCONFIRMTYPE:[
        {
            'id': '1',
            'value': '1',
            'text': '资金支出'
        },
        {
            'id': '2',
            'value': '2',
            'text': '交通接待费用报销'
        },
        {
            'id': '3',
            'value': '3',
            'text': '税费付款'
        },
        {
            'id': '4',
            'value': '4',
            'text': '供应商付款'
        },
        {
            'id': '5',
            'value': '5',
            'text': '长期资产付款'
        },
        {
            'id': '6',
            'value': '6',
            'text': '借款申请'
        },
    ],
    PAYMENTCONFIRMSTATE:[
        {
            'id': '1',
            'value': '1',
            'text': '待确认'
        },
        {
            'id': '2',
            'value': '2',
            'text': '已确认'
        },
    ],
    CREDITLINEDETAILTYPE:[
        {
            'id': '1',
            'value': '1',
            'text': '增加'
        },
        {
            'id': '2',
            'value': '2',
            'text': '减少'
        },
    ],
    FEEDBACKTYPE: [
        {
            id: 1,
            value: '1',
            text: '投诉'
        },
        {
            id: 2,
            value: '2',
            text: '报修'
        },
        {
            id: 3,
            value: '3',
            text: '反馈'
        }
    ],
    FEEDBACKSTATUS: [
        {
            id: 1,
            value: '1',
            text: '未受理'
        },
        {
            id: 2,
            value: '2',
            text: '已受理'
        },
        {
            id: 3,
            value: '3',
            text: '已完成'
        }
    ],
    REPAIRTYPE: [
        {
            id: 0,
            value: '0',
            text: '其它'
        }
    ],
    ASSETSCLASSIFICATION: [
        {
            id: 1,
            value: '1',
            text: '固定资产'
        },
        {
            id: 2,
            value: '2',
            text: '低值易耗品'
        }
    ],
    TRAFFICTOOLS: [
        {
            id: 0,
            value: '0',
            text: '头等舱飞机'
        },
        {
            id: 1,
            value: '1',
            text: '经济舱飞机'
        },
        {
            id: 2,
            value: '2',
            text: '商务舱高铁'
        },
        {
            id: 3,
            value: '3',
            text: '一等座高铁'
        },
        {
            id: 4,
            value: '4',
            text: '二等及下高铁'
        },
        {
            id: 5,
            value: '5',
            text: '汽车'
        }
    ],
    PRICEEFFECTIVE: [
        {
            id: 1,
            value: '1',
            text: '采购订单'
        },
        {
            id: 2,
            value: '2',
            text: '收货单'
        },
        {
            id: 3,
            value: '3',
            text: '入库单'
        },
        {
            id: 4,
            value: '4',
            text: '销售订单'
        },
        {
            id: 5,
            value: '5',
            text: '销售出库单'
        }
    ],

    DEVELOPPROJECTSTATE:[
        {
            'id': '1',
            'value': '1',
            'text': '待审核'
        },
        {
            'id': '2',
            'value': '2',
            'text': '已通过'
        },
        {
            'id': '3',
            'value': '3',
            'text': '已驳回'
        }
    ],
    DEVELOPCHECKSTATE:[
        {
            'id': '0',
            'value': '0',
            'text': '待提交'
        },
        {
            'id': '1',
            'value': '1',
            'text': '已提交'
        },
        {
            'id': '2',
            'value': '2',
            'text': '通过'
        },
        {
            'id': '3',
            'value': '3',
            'text': '拒绝'
        }
    ],
    DEVELOPBUDGETSTATE:[
        {
            'id': '0',
            'value': '0',
            'text': '待提交'
        },
        {
            'id': '1',
            'value': '1',
            'text': '已提交'
        },
        {
            'id': '2',
            'value': '2',
            'text': '通过'
        },
        {
            'id': '3',
            'value': '3',
            'text': '拒绝'
        }
    ],
    DEVELOPSUBSCRIBEORDERSTATE:[
        {
            'id': '0',
            'value': '0',
            'text': '待提交'
        },
        {
            'id': '1',
            'value': '1',
            'text': '已提交'
        },
        {
            'id': '2',
            'value': '2',
            'text': '通过'
        },
        {
            'id': '3',
            'value': '3',
            'text': '拒绝'
        }
    ],
    DEVELOPSUBSCRIBESTATE:[
        {
            'id': '0',
            'value': '0',
            'text': '待提交'
        },
        {
            'id': '1',
            'value': '1',
            'text': '已提交'
        },
        {
            'id': '2',
            'value': '2',
            'text': '通过'
        },
        {
            'id': '3',
            'value': '3',
            'text': '拒绝'
        }
    ],
    DEVELOPRECEIVESTATE:[
        {
            'id': '0',
            'value': '0',
            'text': '待提交'
        },
        {
            'id': '1',
            'value': '1',
            'text': '已提交'
        },
        {
            'id': '2',
            'value': '2',
            'text': '通过'
        },
        {
            'id': '3',
            'value': '3',
            'text': '拒绝'
        }
    ],
    DEVELOPCONSUMESTATE:[
        {
            'id': '0',
            'value': '0',
            'text': '待提交'
        },
        {
            'id': '1',
            'value': '1',
            'text': '已提交'
        },
        {
            'id': '2',
            'value': '2',
            'text': '通过'
        },
        {
            'id': '3',
            'value': '3',
            'text': '拒绝'
        }
    ],
    DEVELOPCOSTSTATE:[
        {
            'id': '0',
            'value': '0',
            'text': '待提交'
        },
        {
            'id': '1',
            'value': '1',
            'text': '已提交'
        },
        {
            'id': '2',
            'value': '2',
            'text': '通过'
        },
        {
            'id': '3',
            'value': '3',
            'text': '拒绝'
        }
    ],
    DEVELOPCLEARINGSTATE:[
        {
            'id': '0',
            'value': '0',
            'text': '待提交'
        },
        {
            'id': '1',
            'value': '1',
            'text': '已提交'
        },
        {
            'id': '2',
            'value': '2',
            'text': '通过'
        },
        {
            'id': '3',
            'value': '3',
            'text': '拒绝'
        }
    ],

    COLLECTGOODSSTATE: [
        {
            'id': '0',
            'value': '0',
            'text': '待收货'
        },
        {
            'id': '1',
            'value': '1',
            'text': '部分收货'
        },
        {
            'id': '2',
            'value': '2',
            'text': '全部收货'
        }
    ],
    MATERIELSTATEMANAGEMENT: [
        {
            'id': '0',
            'value': '0',
            'text': '库存商品'
        },
        {
            'id': '1',
            'value': '1',
            'text': '基本成品'
        },
        /*{
            'id': '2',
            'value': '2',
            'text': '客户成品'
        },*/
        {
            'id': '3',
            'value': '3',
            'text': '半成品'
        },
        {
            'id': '4',
            'value': '4',
            'text': '原材料'
        },
        {
            'id': '5',
            'value': '5',
            'text': '消耗性辅材'
        },
        {
            'id': '6',
            'value': '6',
            'text': '修理用配件'
        },
        {
            'id': '7',
            'value': '7',
            'text': '研发物料'
        },
        {
            'id': '8',
            'value': '8',
            'text': '边余料'
        },
        {
            'id': '9',
            'value': '9',
            'text': '报废物料'
        }
    ],
    CUSTOMERTTYPEONE:[
        {
            'id': '1',
            'value': '1',
            'text': '机构'
        }
    ],
    CUSTOMERTTYPETWO:[
        {
            'id': '2',
            'value': '2',
            'text': '个人'
        }
    ],
    CUSTOMERTTYPETHREE:[
        {
            'id': '3',
            'value': '3',
            'text': '企业'
        }
    ],
    PROCUREMENTTYPE: [ //（物料）采购状态
        {
            'id': '1',
            'value': '1',
            'text': '集团采购'
        },
        {
            'id': '2',
            'value': '2',
            'text': '属地采购'
        }
    ],
    DELIVERYSTATE: [//交货状态
        {
            'id': '1',
            'value': '1',
            'text': '未交货'
        },
        {
            'id': '2',
            'value': '2',
            'text': '已交货'
        },
        {
            'id': '3',
            'value': '3',
            'text': '已超时'
        }
    ],
    SORTINGWAY: [ //排序方式
        {
            'id': '1',
            'value': '1',
            'text': '工号排列'
        },
        {
            'id': '2',
            'value': '2',
            'text': '入职时间排列'
        }
    ],


    PROJECTPROJECTSTATE:[
        {
            'id': '0',
            'value': '0',
            'text': '待提交'
        },
        {
            'id': '1',
            'value': '1',
            'text': '待审核'
        },
        {
            'id': '2',
            'value': '2',
            'text': '已通过'
        },
        {
            'id': '3',
            'value': '3',
            'text': '已驳回'
        }
    ],
    PROJECTCHECKSTATE:[
        {
            'id': '1',
            'value': '1',
            'text': '已提交'
        },
        {
            'id': '2',
            'value': '2',
            'text': '通过'
        },
        {
            'id': '3',
            'value': '3',
            'text': '拒绝'
        }
    ],
    PROJECTBUDGETSTATE:[
        {
            'id': '0',
            'value': '0',
            'text': '待提交'
        },
        {
            'id': '1',
            'value': '1',
            'text': '已提交'
        },
        {
            'id': '2',
            'value': '2',
            'text': '通过'
        },
        {
            'id': '3',
            'value': '3',
            'text': '拒绝'
        }
    ],
    PROJECTSUBSCRIBEORDERSTATE:[
        {
            'id': '0',
            'value': '0',
            'text': '待提交'
        },
        {
            'id': '1',
            'value': '1',
            'text': '已提交'
        },
        {
            'id': '2',
            'value': '2',
            'text': '通过'
        },
        {
            'id': '3',
            'value': '3',
            'text': '拒绝'
        }
    ],
    PROJECTSUBSCRIBESTATE:[
        {
            'id': '0',
            'value': '0',
            'text': '待提交'
        },
        {
            'id': '1',
            'value': '1',
            'text': '已提交'
        },
        {
            'id': '2',
            'value': '2',
            'text': '通过'
        },
        {
            'id': '3',
            'value': '3',
            'text': '拒绝'
        }
    ],
    PROJECTRECEIVESTATE:[
        {
            'id': '0',
            'value': '0',
            'text': '待提交'
        },
        {
            'id': '1',
            'value': '1',
            'text': '已提交'
        },
        {
            'id': '2',
            'value': '2',
            'text': '通过'
        },
        {
            'id': '3',
            'value': '3',
            'text': '拒绝'
        }
    ],
    PROJECTCONSUMESTATE:[
        {
            'id': '0',
            'value': '0',
            'text': '待提交'
        },
        {
            'id': '1',
            'value': '1',
            'text': '已提交'
        },
        {
            'id': '2',
            'value': '2',
            'text': '通过'
        },
        {
            'id': '3',
            'value': '3',
            'text': '拒绝'
        }
    ],
    PROJECTCOSTSTATE:[
        {
            'id': '0',
            'value': '0',
            'text': '待提交'
        },
        {
            'id': '1',
            'value': '1',
            'text': '已提交'
        },
        {
            'id': '2',
            'value': '2',
            'text': '通过'
        },
        {
            'id': '3',
            'value': '3',
            'text': '拒绝'
        }
    ],
    PROJECTCLEARINGSTATE:[
        {
            'id': '0',
            'value': '0',
            'text': '待提交'
        },
        {
            'id': '1',
            'value': '1',
            'text': '已提交'
        },
        {
            'id': '2',
            'value': '2',
            'text': '通过'
        },
        {
            'id': '3',
            'value': '3',
            'text': '拒绝'
        }
    ],
    PAYMENTMETHOD:[
        {
            'id': '0',
            'value': '0',
            'text': '库存现金'
        },
        {
            'id': '1',
            'value': '1',
            'text': '银行存款'
        },
        {
            'id': '2',
            'value': '2',
            'text': '其它货币资金'
        }
    ],
    BANKNOTYPE:[
        {
            'id': '0',
            'value': '0',
            'text': '对公账号'
        },
        {
            'id': '1',
            'value': '1',
            'text': '对私账号'
        }
    ],
    RECORDINGVOUCHERSCSTATE:[
        {
            'id': '0',
            'value': '0',
            'text': '待提交'
        },
        {
            'id': '1',
            'value': '1',
            'text': '已提交'
        },
        {
            'id': '2',
            'value': '2',
            'text': '通过'
        },
        {
            'id': '3',
            'value': '3',
            'text': '拒绝'
        }
    ],
    CORPORATECLIENTSCLASS:[
        {
            'id': '0',
            'value': '0',
            'text': '品牌体系客户'
        },
        {
            'id': '1',
            'value': '1',
            'text': '定制体系客户'
        }
    ],
    CORPORATECLIENTSSCOPE:[
        {
            'id': '0',
            'value': '0',
            'text': '有限'
        },
        {
            'id': '1',
            'value': '1',
            'text': '无限'
        },
    ],

    CREDITLINEDETAILDETAILTYPE:[
        {
            'id': '0',
            'value': '0',
            'text': '信用金额'
        },
        {
            'id': '1',
            'value': '1',
            'text': '预付款金额'
        },
    ],

    PRODUCTDEVICETYPE:[
        {
            'id': '1',
            'value': '1',
            'text': '生产主设备'
        },
        {
            'id': '2',
            'value': '2',
            'text': '生产辅设备'
        },
    ],

    INVOICETYPE:[
        {
            'id': '0',
            'value': '0',
            'text': '不提供发票'
        },
        {
            'id': '1',
            'value': '1',
            'text': '提供发票'
        },
    ],

    MATERIELACCOUNTING:[
        {
            'id': '0',
            'value': '0',
            'text': '库存商品'
        },
        {
            'id': '1',
            'value': '1',
            'text': '半成品'
        },
        {
            'id': '2',
            'value': '2',
            'text': '原材料'
        }
    ],
    SALARYTYPE:[
        {
            'id': '0',
            'value': '0',
            'text': '月薪制'
        },
        {
            'id': '1',
            'value': '1',
            'text': '月薪加提成制'
        },
        {
            'id': '2',
            'value': '2',
            'text': '年薪制'
        },
        {
            'id': '3',
            'value': '3',
            'text': '计件制'
        }
    ],

    TAX_PAYMENT_TYPE: [
        {
            id: 1,
            value: 1,
            text: '应交增值税'
        },
        {
            id: 2,
            value: 2,
            text: '应交消费税'
        },
        {
            id: 3,
            value: 3,
            text: '应交所得税'
        },
        {
            id: 4,
            value: 4,
            text: '应交资源税'
        },
        {
            id: 5,
            value: 5,
            text: '应交土地增值税'
        },
        {
            id: 6,
            value: 6,
            text: '应交城市维护建设税'
        },
        {
            id: 7,
            value: 7,
            text: '应交房产税'
        },
        {
            id: 8,
            value: 8,
            text: '应交土地使用税'
        },
        {
            id: 9,
            value: 9,
            text: '应交个人所得税'
        },
        {
            id: 10,
            value: 10,
            text: '应交车船税'
        },
        {
            id: 11,
            value: 11,
            text: '教育费用附加'
        },
        {
            id: 12,
            value: 12,
            text: '矿产资源补偿费用'
        },
        {
            id: 13,
            value: 13,
            text: '其他'
        },
    ],

    TAX_INVOICE_TYPE: [
        {
            id: 1,
            value: 1,
            text: '专用发票'
        },
        {
            id: 2,
            value: 2,
            text: '普通发票'
        },
        {
            id: 3,
            value: 3,
            text: '出口发票'
        },
        {
            id: 4,
            value: 4,
            text: '无票申报'
        },
    ],
    SALE_INVOICE_TYPE: [
        {
            id: 1,
            value: 1,
            text: '增值税专用发票'
        },
        {
            id: 2,
            value: 2,
            text: '普通发票'
        },
        {
            id: 3,
            value: 3,
            text: '出口发票'
        },
        {
            id: 4,
            value: 4,
            text: '收购发票'
        },
    ],
    INVOICE_MANAGE_TYPE: [
        {
            id: 1,
            value: 1,
            text: '购入'
        },
        {
            id: 2,
            value: 2,
            text: '作废'
        },
        {
            id: 3,
            value: 3,
            text: '缴销'
        },
    ],
    AMORTIZE_PAYMENT_TYPE: [
        {
            id: 1,
            value: 1,
            text: '人工款'
        },
        {
            id: 2,
            value: 2,
            text: '材料款'
        },
        {
            id: 3,
            value: 3,
            text: '报销款'
        },
    ],
    PRODUCT_DESIGNATE_TYPE: [
        {
            id: 0,
            value: 0,
            text: '未确认'
        },
        {
            id: 1,
            value: 1,
            text: '已确认'
        }
    ],

    FEED_CHANGE_TYPE: [
        {
            id: 0,
            value: 0,
            text: '待提交'
        },
        {
            id: 1,
            value: 1,
            text: '已提交'
        },
        {
            id: 2,
            value: 2,
            text: '已通过'
        },
        {
            id: 3,
            value: 3,
            text: '已驳回'
        }
    ],

    PPMASTERRECEIVE_STATE:[
        {
            id: 0,
            value: 0,
            text: '提交'
        },
        {
            id: 1,
            value: 1,
            text: '通过'
        }

    ],
    SCRAP_TYPE: [
        {
            id: 0,
            value: 0,
            text: '待提交'
        },
        {
            id: 1,
            value: 1,
            text: '已提交'
        },
        {
            id: 2,
            value: 2,
            text: '已通过'
        },
        {
            id: 3,
            value: 3,
            text: '已驳回'
        }
    ],

    STOPLINEIMPROVE_STATE: [
        {
            id: 0,
            value: 0,
            text: '未确认'
        },
        {
            id: 1,
            value: 1,
            text: '已确认'
        }
    ],

    STOPLINEIMPROVEDETAIL_PUT_STATE: [
        {
            id: 0,
            value: 0,
            text: '未确认'
        },
        {
            id: 1,
            value: 1,
            text: '已确认'
        }
    ],
    STOPLINEIMPROVEDETAIL_SUPE_STATE: [
        {
            id: 0,
            value: 0,
            text: '未确认'
        },
        {
            id: 1,
            value: 1,
            text: '已确认'
        }
    ],
    STOPLINEGATHER_STATE: [
        {
            id: 0,
            value: 0,
            text: '未确认'
        },
        {
            id: 1,
            value: 1,
            text: '已确认'
        }
    ],
    VACATION_STATE: [
        {
            id: 0,
            value: 0,
            text: '未配置'
        },
        {
            id: 1,
            value: 1,
            text: '单休'
        },
        {
            id: 2,
            value: 2,
            text: '双休'
        }
    ],
    WAREHOUSE_CLASS: [
        {
            id: 1,
            text: '半成品仓',
            type: 1
        },
        {
            id: 2,
            text: '成品仓',
            type: 1
        },
        {
            id: 3,
            text: '辅料仓',
            type: 1
        },
        {
            id: 4,
            text: '原材料仓',
            type: 1
        },
        {
            id: 5,
            text: '废料仓',
            type: 2
        },
        {
            id: 6,
            text: '不良品仓',
            type: 2
        },
    ],
    PRINT_INVOICE: {
        cgrk: '采购入库移交任务',
        cprk: '产品入库移交任务',
        qtrk: '其他入库移交任务',
        wwrk: '委外入库移交任务',
        xsck: '销售出库移交任务',
        llck: '生产领料移交任务',
        qtck: '其他出库移交任务',
        wwck: '委外出库移交任务',
    },
    NEED_INVOICE: [
        {
            id: '0',
            value: '0',
            text: '不需要',
        },
        {
            id: '1',
            value: '1',
            text: '普通发票',
        },
        {
            id: '2',
            value: '2',
            text: '专用发票',
        },
    ],
    STORAGE_TYPE: [
        {
            id: 1,
            value: 1,
            text: '安全库存管理',
        },
        {
            id: 2,
            value: 2,
            text: '订单号管理',
        },
        {
            id: 3,
            value: 3,
            text: '闲置库存管理',
        },
    ],
    //==========沿海 begin===========
    SEALCREATETYPE:[
        {
            'id': '1',
            'value': '1',
            'text': '办公'
        },
        {
            'id': '2',
            'value': '2',
            'text': '财务'
        }
    ],
    SEALCREATESTATE:[
        {
            'id': '1',
            'value': '1',
            'text': '待审核'
        },
        {
            'id': '2',
            'value': '2',
            'text': '已通过'
        },
        {
            'id': '3',
            'value': '3',
            'text': '已驳回'
        }
    ],
    SEALCREATEISFINISH:[
        {
            'id': '0',
            'value': '0',
            'text': '未归位'
        },
        {
            'id': '1',
            'value': '1',
            'text': '已归位'
        }
    ],
    SEALUSESTATE:[
        {
            'id': '1',
            'value': '1',
            'text': '待审核'
        },
        {
            'id': '2',
            'value': '2',
            'text': '已通过'
        },
        {
            'id': '3',
            'value': '3',
            'text': '已驳回'
        }
    ],
    SEALUSEISBORROW:[
        {
            'id': '0',
            'value': '0',
            'text': '否'
        },
        {
            'id': '1',
            'value': '1',
            'text': '是'
        }
    ],
    SEALUSEREVERTSTATE:[
        {
            'id': '1',
            'value': '1',
            'text': '未归还'
        },
        {
            'id': '2',
            'value': '2',
            'text': '申请归还中'
        },
        {
            'id': '3',
            'value': '3',
            'text': '已归还'
        }
    ],
    SEALCREATEISDISCARD:[
        {
            'id': '0',
            'value': '0',
            'text': '否'
        },
        {
            'id': '1',
            'value': '1',
            'text': '是'
        }
    ],
    SEALDISCARDSTATE:[
        {
            'id': '1',
            'value': '1',
            'text': '待审核'
        },
        {
            'id': '2',
            'value': '2',
            'text': '已通过'
        },
        {
            'id': '3',
            'value': '3',
            'text': '已驳回'
        }
    ],
    CERTIFICATETYPE:[
        {
            'id': '1',
            'value': '1',
            'text': '土地使用证'
        },
        {
            'id': '2',
            'value': '2',
            'text': '房产证'
        },
        {
            'id': '3',
            'value': '3',
            'text': '不动产证'
        },
        {
            'id': '4',
            'value': '4',
            'text': '专利证'
        },
        {
            'id': '5',
            'value': '5',
            'text': '营业执照证'
        },
        {
            'id': '6',
            'value': '6',
            'text': '一般纳税人证'
        },
        {
            'id': '7',
            'value': '7',
            'text': '税种认定表'
        },
        {
            'id': '8',
            'value': '8',
            'text': '机构代码证'
        },
        {
            'id': '9',
            'value': '9',
            'text': '社会荣誉证照'
        },
        {
            'id': '10',
            'value': '10',
            'text': '基本账户开户许可证'
        },
        {
            'id': '11',
            'value': '11',
            'text': '体系认证'
        },
        {
            'id': '12',
            'value': '12',
            'text': '其他证件分类'
        }
    ],
    CERTIFICATESTATE: [
        {
            'id': '1',
            'value': '1',
            'text': '正常'
        },
        {
            'id': '2',
            'value': '2',
            'text': '借出'
        },
        {
            'id': '3',
            'value': '3',
            'text': '作废'
        }
    ],
    CERTIFICATEISPUBLIC: [
        {
            'id': '0',
            'value': '0',
            'text': '不公开'
        },
        {
            'id': '1',
            'value': '1',
            'text': '公开'
        }
    ],
    CERTIFICATEUSEREVERTSTATE:[
        {
            'id': '1',
            'value': '1',
            'text': '未归还'
        },
        {
            'id': '2',
            'value': '2',
            'text': '申请归还中'
        },
        {
            'id': '3',
            'value': '3',
            'text': '已归还'
        }
    ],
    CERTIFICATEUSESTATE:[
        {
            'id': '1',
            'value': '1',
            'text': '待审核'
        },
        {
            'id': '2',
            'value': '2',
            'text': '已通过'
        },
        {
            'id': '3',
            'value': '3',
            'text': '已驳回'
        }
    ],
    ARCHIVESUSEREVERTSTATE:[
        {
            'id': '1',
            'value': '1',
            'text': '未归还'
        },
        {
            'id': '2',
            'value': '2',
            'text': '申请归还中'
        },
        {
            'id': '3',
            'value': '3',
            'text': '已归还'
        }
    ],
    ARCHIVESHANDSTATE:[
        {
            'id': '1',
            'value': '1',
            'text': '未归档'
        },
        {
            'id': '2',
            'value': '2',
            'text': '已归档'

        }
    ],
    LABORCONTRACTSTATE:[
        {
            'id': '1',
            'value': '1',
            'text': '在职'
        },
        {
            'id': '2',
            'value': '2',
            'text': '离职'
        }
    ],
    LENDMONEYCOMPANYTYPE:[
        {
            'id': '1',
            'value': '1',
            'text': '客户'
        },
        {
            'id': '2',
            'value': '2',
            'text': '供应商'
        },
        {
            'id': '3',
            'value': '3',
            'text': '员工'
        },
        {
            'id': '4',
            'value': '4',
            'text': '其他相关主体'
        }
    ],
    LENDMONEYSTATE:[
        {
            'id': '1',
            'value': '1',
            'text': '待确认'
        },
        {
            'id': '2',
            'value': '2',
            'text': '确认'
        },
        {
            'id': '3',
            'value': '3',
            'text': '拒绝'
        }
    ],
    GRADEISUSE:[
        {
            'id': '1',
            'value': '1',
            'text': '使用'
        },
        {
            'id': '0',
            'value': '0',
            'text': '作废'
        }
    ],
    LENDMONEYREPAYSTATE:[
        {
            'id': '1',
            'value': '1',
            'text': '待确认'
        },
        {
            'id': '2',
            'value': '2',
            'text': '确认'
        },
        {
            'id': '3',
            'value': '3',
            'text': '拒绝'
        }
    ],
    /*项目跟进状态created by Haij on 19.01.31*/
    PROJECTFLLOWUPSTATE:[
        {
            'id': '1',
            'value': '1',
            'text': '立项'
        },
        {
            'id': '2',
            'value': '2',
            'text': '进行中'
        },
        {
            'id': '3',
            'value': '3',
            'text': '结束'
        }
    ],
    PROJECTINVOICESTATE:[
        {
            'id': '1',
            'value': '1',
            'text': '无需发票'
        },
        {
            'id': '2',
            'value': '2',
            'text': '普通发票'
        },
        {
            'id': '3',
            'value': '3',
            'text': '专用发票'
        }
    ],
    ACCEPTANCESTATUS:[
        {
            'id': '1',
            'value': '1',
            'text': '已验收'
        },
        {
            'id': '0',
            'value': '0',
            'text': '未验收'
        } 
    ],
    PROCESS_STATUS:[
        {
            'id': '1',
            'value': '1',
            'text': '待处理'
        } ,
        {
            'id': '2',
            'value': '2',
            'text': '已处理'
        } ,
        {
            'id': '3',
            'value': '3',
            'text': '新建'
        } 
    ],
    PRIORITY:[
        {
            'id': '1',
            'value': '1',
            'text': '特别紧急'
        } ,
        {
            'id': '2',
            'value': '2',
            'text': '紧急'
        } ,
        {
            'id': '3',
            'value': '3',
            'text': '普通'
        } 
    ],
    /* 票据管理模块 */
    BILLCOMPANYTYPE:[
        {
            'id': '1',
            'value': '1',
            'text': '客户'
        },
        {
            'id': '2',
            'value': '2',
            'text': '供应商'
        },
        {
            'id': '3',
            'value': '3',
            'text': '其他相关主体'
        }
    ],
    
    BILLNAME:[
        {
            'id': '1',
            'value': '1',
            'text': '支票'
        },
        {
            'id': '2',
            'value': '2',
            'text': '本票'
        },
        {
            'id': '3',
            'value': '3',
            'text': '银行承兑汇票'
        },
        {
            'id': '4',
            'value': '4',
            'text': '商业承兑汇票'
        }
    ],
    BILLOUTSTATE:[//开出票据的状态
        {
            'id': '1',
            'value': '1',
            'text': '持有'
        },
        {
            'id': '2',
            'value': '2',
            'text': '未支付'
        },
        {
            'id': '3',
            'value': '3',
            'text': '已支付'
        }
    ],
    BILLRECEIPTSTATE:[
        {
            'id': '1',
            'value': '1',
            'text': '持有'
        },
        {
            'id': '2',
            'value': '2',
            'text': '已过期'
        },
        {
            'id': '3',
            'value': '3',
            'text': '已背书转让'
        },
        {
            'id': '4',
            'value': '4',
            'text': '已贴现'
        },
        {
            'id': '5',
            'value': '5',
            'text': '已兑收'
        },
        {
            'id': '6',
            'value': '6',
            'text': '背书转让审批中'
        },
        {
            'id': '7',
            'value': '7',
            'text': '贴现审批中'
        }
    ],
    /*园区-供应商审核状态created by Haij on 19.11.11*/
    ADUITSTATE:[
        {
            'id': '1',
            'value': '1',
            'text': '审核中'
        } ,
        {
            'id': '2',
            'value': '2',
            'text': '审核通过'
        } ,
        {
            'id': '3',
            'value': '3',
            'text': '审核不通过'
        } 
    ],
    PURCHASE_TYPE:[
        {
            'id': '1',
            'value': '1',
            'text': '现货'
        } ,
        {
            'id': '2',
            'value': '2',
            'text': '标准品'
        } 
    ]
    //==========沿海 end===========
};
