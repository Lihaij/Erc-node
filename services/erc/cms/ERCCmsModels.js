/**
 * Created by Zhang Jizhe on 2018/4/19.
 */
const config = require('../../../config');
let mongoose = require('mongoose');
const format = require('util').format;
mongoose.connect(config.mongo.auth ? format(config.mongo.connect,
    config.mongo.auth.username, config.mongo.auth.password) : config.mongo.connect);

exports.getMongo = ()=> {
    return mongoose;
};
let Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

//内容管理类型结构
exports.TypeEntity = new Schema({
    name: String,//
    type: Number,//1 :整23
    pt: Number,//
    active: Number,
    status: Number,
    seq: Number,
    pid: String,
    updated_on: Date,
    created_on: {type: Date, default: Date.now()}
});
//内容管理数据结构
exports.ContentEntity = new Schema({
    type: {type: Array},//类型
    pt: {type: Number},//位置：1首页banner，2附近门店banner，3实拍案例banner，4整装套餐(极客·简美)，5整装套餐(蓝调·简欧)，6整装套餐(悦茗·新中式)，7服务流程，8环保科技，9品牌故事，10招商加盟，11实拍案例
    biz_id: {type: Number},
    title: {type: String},
    content: {type: Object},//内容
    author: {type: String},//作者
    addons: {type: Array},//附件
    ip_info: {type: String},
    top: Number,//置顶
    turn: Number,//轮播
    icon: String,//图标
    seq: Number,//顺序
    abstract: String,
    ext1: {type: String},//生成图片链接
    parent_id: {type: String},//父类ID
    active: {type: Number},
    status: {type: Number},
    updated_on: {type: Date},
    created_on: {type: Date, default: Date.now()},
    completion_date: {type: Date},//完工日期
    roomType: {type: Array},//详情的空间选择
    jump_url:String,//缩略图跳转地址,
    hits:{type: Number}

});