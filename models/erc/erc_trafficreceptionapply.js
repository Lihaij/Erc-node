/**
 * Created by Zhang Jizhe on 2018/4/9.
 */
/** 闲置库存申请 **/
const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');
module.exports = db.defineModel('tbl_erc_transreceptionapply', {
    trapply_id: {//
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    domain_id: {//机构id
        type: db.IDNO,
        allowNull: true
    },
    trapply_code: {//申请编号
        type: db.STRING(100),
        allowNull: true
    },
    trapply_creator_id: {//申请人ID
        type: db.STRING(100),
        allowNull: true
    },
    trapply_creator_name: {//申请人名称
        type: db.STRING(100),
        allowNull: true
    },
    trapply_confirm_time: {//审核日期
        type: db.DATE,
        allowNull: true
    },
    trapply_confirm_id: {//审核人ID
        type: db.STRING(100),
        allowNull: true
    },
    trapply_rejected_description: {//审核驳回信息
        type: db.STRING(100),
        allowNull: true
    },
    trapply_state: {//审核状态
        type: db.STRING(10),
        allowNull: true
    },
    trapply_start_time: {//申请时间起始
        type: db.DATE,
        allowNull: true
    },
    trapply_end_time: {//申请时间截止
        type: db.DATE,
        allowNull: true
    },
    trapply_pre_fee: {//申请预借费用
        type: db.STRING(1000),
        allowNull: true
    },
    /**
     * 交通申请详情
     */
    trapply_trip_reason: {//出差事由
        type: db.STRING(100),
        allowNull: true
    },
    trapply_trip_reason_type: {//出差事由分类
        type: db.STRING(10),
        allowNull: true
    },
    trapply_trip_origin_prov: {//出差起始地省
        type: db.STRING(100),
        allowNull: true
    },
    trapply_trip_origin_city: {//出差起始地市
        type: db.STRING(100),
        allowNull: true
    },
    trapply_trip_origin_dist: {//出差起始地区
        type: db.STRING(100),
        allowNull: true
    },
    trapply_trip_origin_detail: {//出差起始地详细地址
        type: db.STRING(1000),
        allowNull: true
    },
    trapply_trip_termini_prov: {//出差目的地省
        type: db.STRING(100),
        allowNull: true
    },
    trapply_trip_termini_city: {//出差目的地市
        type: db.STRING(100),
        allowNull: true
    },
    trapply_trip_termini_dist: {//出差目的地区
        type: db.STRING(100),
        allowNull: true
    },
    trapply_trip_termini_detail: {//出差目的地详细地址
        type: db.STRING(1000),
        allowNull: true
    },
    trapply_trans_way: {//交通方式
        type: db.STRING(10),
        allowNull: true
    },
    trapply_vehicle_apply: {//车辆申请
        type: db.STRING(10),
        allowNull: true
    },
    trapply_vehicle_review_type: {//派车费用报销模式
        type: db.STRING(10),
        allowNull: true
    },
    trapply_vehicle_distance: {//预计公里数
        type: db.STRING(1000),
        allowNull: true
    },
    trapply_vehicle_remark: {//公里数说明
        type: db.STRING(1000),
        allowNull: true
    },
    trapply_traffic_tools: {//交通工具
        type: db.STRING(10),
        allowNull: true
    },

    /**
     * 接待申请详情
     */
    trapply_reception_reason: {//接待事由
        type: db.STRING(100),
        allowNull: true
    },
    trapply_reception_reason_type: {//接待事由分类
        type: db.STRING(10),
        allowNull: true
    },
    trapply_reception_object: {//接待主要对象姓名
        type: db.STRING(100),
        allowNull: true
    },
    trapply_reception_room_num: {//住宿登记房间个数
        type: db.STRING(10),
        allowNull: true
    },
    trapply_reception_review_type: {//接待费用报销模式
        type: db.STRING(10),
        allowNull: true
    },
    trapply_reception_review_level: {//接待主要对象报销级别
        type: db.STRING(10),
        allowNull: true
    },
    trapply_reception_crew_num: {//接待对象随行人数
        type: db.STRING(10),
        allowNull: true
    },
    trapply_reception_extra: {//赠送礼品或额外活动
        type: db.STRING(100),
        allowNull: true
    },
    trapply_reception_extra_fee: {//额外活动费用预算
        type: db.STRING(1000),
        allowNull: true
    },
    trapply_recetion_crew_ids: {//陪同人员IDs
        type: db.STRING(1000),
        allowNull: true
    },
    trapply_recetion_crew_names: {//陪同人员名单
        type: db.STRING(2000),
        allowNull: true
    },


    //费用
    trapply_traffic_fee:{//非自驾车预计交通工具费用
        type: db.STRING(1000),
        allowNull: true
    }

});