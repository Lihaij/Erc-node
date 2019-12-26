const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');
/**客户信息**/
module.exports = db.defineModel('tbl_erc_customer', {
    user_id: {
        type: db.ID,
        primaryKey: true
    },
    customer_level: { //级别
        type: db.STRING(3),
        allowNull: true
    },
    customer_state: {
        type: db.STRING(3),
        defaultValue: '1',
        allowNull: true
    },
    customer_type: {
        type: db.STRING(3),
        allowNull: true
    },
    customer_remarks: {
        type: db.STRING(500),
        defaultValue: '',
        allowNull: false
    },
    customer_source: {//客户来源：APP，总部导入，门店录入
        type: db.STRING(3),
        allowNull: true
    },
    education: {//学历 EDUCATION
        type: db.STRING(20),
        defaultValue: '',
        allowNull: true
    },
    age: {//年龄
        type: db.STRING(20),
        defaultValue: '',
        allowNull: true
    },
    career: {//职业
        type: db.STRING(20),
        defaultValue: '',
        allowNull: true
    },
    income: {//收入
        type: db.INTEGER,
        defaultValue: 0,
        allowNull: true
    },
    gender: {//性别
        type: db.STRING(20),
        defaultValue: '',
        allowNull: true
    },
    province: {//省
        type: db.STRING(20),
        defaultValue: '',
        allowNull: true
    },
    city: {//市/县
        type: db.STRING(20),
        defaultValue: '',
        allowNull: true
    },
    district: {//区
        type: db.STRING(20),
        defaultValue: '',
        allowNull: true
    },
    area_code: {
        type: db.STRING(20),
        defaultValue: '',
        allowNull: true
    },
    decorate_address: {//详细地址
        type: db.STRING(200),
        defaultValue: '',
        allowNull: true
    },
    flow_source: {//流量来源
        type: db.STRING(3),
        allowNull: true
    },
    user_form: {//聘用形式
        type: db.STRING(10),
        defaultValue: '',
        allowNull: true
    },
    entry_date:{//入职时间
        type: db.DATE,
        allowNull: true
    },
    departure_date:{//离职时间
        type: db.DATE,
        allowNull: true
    },
    departure_reason:{//离职原因
        type: db.STRING(10),
        defaultValue: '',
        allowNull: true
    },
    departure_remark:{//离职备注
        type: db.STRING(300),
        defaultValue: '',
        allowNull: true
    },
    parttime_usergroup_id: {//兼职部门
        type: db.ID,
        allowNull: true
    },
    job_level: {//职级
        type: db.STRING(10),
        defaultValue: '',
        allowNull: true
    },
    direct_leadership: {//汇报对象
        type: db.ID,
        allowNull: true
    },
    qq_no: {//QQ号
        type: db.STRING(20),
        defaultValue: '',
        allowNull: true
    },
    wechat_no: {//微信号
        type: db.STRING(50),
        defaultValue: '',
        allowNull: true
    },
    idcarde_no: {//身份证号
        type: db.STRING(20),
        defaultValue: '',
        allowNull: true
    },
    birth_date:{//出生日期
        type: db.DATE,
        allowNull: true
    },
    marital_status: {//婚姻状况
        type: db.STRING(10),
        defaultValue: '',
        allowNull: true
    },
    graduate_institution: {//毕业院校
        type: db.STRING(100),
        defaultValue: '',
        allowNull: true
    },
    graduate_date:{//毕业日期
        type: db.DATE,
        allowNull: true
    },
    native_place: {//籍贯
        type: db.STRING(100),
        defaultValue: '',
        allowNull: true
    },
    ethnicity: {//民族
        type: db.STRING(10),
        defaultValue: '',
        allowNull: true
    },
    register_category: {//户口类型
        type: db.STRING(10),
        defaultValue: '',
        allowNull: true
    },
    living_place: {//现居住地
        type: db.STRING(100),
        defaultValue: '',
        allowNull: true
    },
    service_length: {//个人工龄
        type: db.STRING(10),
        defaultValue: '',
        allowNull: true
    },
    working_age: {//司龄
        type: db.STRING(10),
        defaultValue: '',
        allowNull: true
    },
    emergency_contact_person : {//紧急联系人
        type: db.STRING(50),
        defaultValue: '',
        allowNull: true
    },
    emergency_contact_phone: {//联系电话
        type: db.STRING(50),
        defaultValue: '',
        allowNull: true
    },
    emergency_contact_qq: {//联系人QQ
        type: db.STRING(20),
        defaultValue: '',
        allowNull: true
    },
    standard_img: {//标准照
        type: db.STRING(200),
        defaultValue: '',
        allowNull: true
    },
    photo_title: {
        type: db.STRING(200),
        defaultValue: '',
        allowNull: true
    },
    goupload_format: {//上传格式
        type: db.STRING(20),
        defaultValue: '',
        allowNull: true
    },
    customer_reimburserank_id: {//报销职级
        type: db.IDNO,
        allowNull: true
    },
    customer_point: {//可用积分
        type: db.INTEGER,
        defaultValue: 0,
        allowNull: true
    },
    salesperson_id: { //导购员
        type: db.ID,
        allowNull: true
    },
    open_id: {
        type: db.ID,
        allowNull: true
    },
    nickname: { //微信名称
        type: db.STRING(20),
        allowNull: true
    },
    professional_qualification: { //    专业资质
        type: db.STRING(30),
        allowNull: true
    },
    user_state: { //员工状态 0候选人 1正式员工
        type: db.STRING(4),
        defaultValue: '1',
        allowNull: true
    },
    submit_state: { //离职提交任务状态  0未提交离职 1提交离职 2离职通过 3离职拒绝
        type: db.STRING(4),
        defaultValue: '0',
        allowNull: true
    },
    task_description: {//任务备注
        type: db.STRING(300),
        defaultValue: null,
        allowNull: true
    }
});
