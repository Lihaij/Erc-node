const fs = require('fs');
const path = require('path');
const iconvLite = require('iconv-lite');

const config = require('../../../config');
const common = require('../../../util/CommonUtil');
const GLBConfig = require('../../../util/GLBConfig');
const Sequence = require('../../../util/Sequence');
const logger = require('../../../util/Logger').createLogger('ERCEstateControlSRV');
const model = require('../../../model');
const FDomain = require('../../../bl/common/FunctionDomainBL');
const kujialeSRV = require('../../openapi/KujialeSRV');

const sequelize = model.sequelize;
const tb_domain = model.common_domain;
const tb_estate = model.erc_estate;
const tb_estateroom = model.erc_estateroom;
const tb_estateteam = model.erc_estateteam;
const tb_roomtype = model.erc_roomtype;
const tb_order = model.erc_order;
const tb_orderworkflow = model.erc_orderworkflow;
const tb_goorderroom = model.erc_goorderroom;
const tb_goconstructionnode = model.erc_goconstructionnode;
const tb_orderroom = model.erc_orderroom;
const tb_gantttasks = model.erc_gantttasks;
const tb_goordermateriel = model.erc_goordermateriel;
const tb_ordermateriel = model.erc_ordermateriel;
const tb_goacceptance = model.erc_goacceptance;
const tb_orderacceptance = model.erc_orderacceptance;
const tb_landagent = model.erc_landagent;

const tb_usergroup = model.common_usergroup;
const tb_user = model.common_user;
const tb_thirdsignuser = model.erc_thirdsignuser;

// 小区楼盘维护接口
exports.ERCEstateControlResource = (req, res) => {
    let method = req.query.method;
    if (method === 'init') {
        initAct(req, res)
    } else if (method === 'getLandAgentUserInfo') {
        getLandAgentUserInfo(req, res)
    } else if (method === 'search') {
        searchAct(req, res);
    } else if (method === 'searchEstate') {
        searchEstate(req, res);
    } else if (method === 'delete') {
        deleteEstate(req, res);
    } else if (method === 'add') {
        addEstate(req, res);
    } else if (method === 'modify') {
        modifyEstate(req, res);
    } else if (method === 'createOrder') {
        createOrder(req, res)
    } else if (method === 'queryTeam') {
        queryTeam(req, res)
    } else if (method === 'changeTeam') {
        changeTeam(req, res)
    } else if (method === 'searchRoomList') {
        searchRoomList(req, res)
    } else if (method === 'addRoom') {
        addRoom(req, res)
    } else if (method === 'modifyRoom') {
        modifyRoom(req, res)
    } else if (method === 'importRoom') {
        importRoom(req, res)
    } else if (method === 'downloadTemplate') {
        downloadTemplate(req, res)
    } else if (method === 'upload') {
        upload(req, res)
    } else {
        common.sendError(res, 'common_01')
    }
};
// 初始化基础数据
async function initAct(req, res) {
    try {
        let returnData = {},
            user = req.user;
        returnData.roomType = GLBConfig.HTYPEINFO; //户型
        returnData.landAgents = [];

        let landAgents = await tb_landagent.findAll({
            where: {
                state: GLBConfig.ENABLE,
                domain_id: user.domain_id
            }
        });

        for (let land of landAgents) {
            let elem = {};
            elem.id = land.landagent_id;
            elem.value = land.landagent_id;
            elem.text = land.landagent_name;
            returnData.landAgents.push(elem)
        }

        await FDomain.getDomainListInit(req, returnData);
        let result = await tb_thirdsignuser.findOne({
            where: {
                user_id: user.user_id
            }
        });
        returnData.thirdUser = !!result;
        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
    }
}
// 增加楼盘
async function addEstate(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;
        let replacements = [],
            estate;
        estate = await tb_estate.findOne({
            where: {
                province: doc.province,
                city: doc.city,
                district: doc.district,
                estate_name: doc.estate_name
            }
        });

        if (estate) {
            common.sendError(res, 'estate_02');
            return
        }

        let addEstate = await tb_estate.create({
            estate_no: "",
            province: doc.province,
            city: doc.city,
            district: doc.district,
            estate_name: doc.estate_name,
            source: user.domain_type,
            land_agent: doc.land_agent,
            address: doc.address,
            domain_id: user.domain_id
        });

        let complete = (Array(4).join(0) + addEstate.estate_id).slice(-4);
        if (addEstate) {
            addEstate.estate_no = parseInt(complete) + 1000;
            await addEstate.save()
        }
        let standards = await kujialeSRV.getStandards(addEstate.province, addEstate.city, addEstate.estate_name)
        for (let s of standards) {
            await tb_roomtype.create({
                estate_id: addEstate.estate_id,
                roomtype_name: s.name,
                roomtype_spec_name: s.specName,
                roomtype_srcage: s.srcArea,
                roomtype_area: s.area,
                roomtype_plan_pic: s.planPic,
                roomtype_room_count: s.room_count,
                roomtype_kjl_planid: s.planId
            });
        }
        common.sendData(res, addEstate);
    } catch (error) {
        common.sendFault(res, error);
        return;
    }
}
// 删除楼盘
async function deleteEstate(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let delEstate = await tb_estate.findOne({
            where: {
                estate_id: doc.estate_id,
                state: GLBConfig.ENABLE
            }
        });

        if (delEstate) {
            delEstate.state = GLBConfig.DISABLE;
            await delEstate.save();
            common.sendData(res);
            return
        } else {
            common.sendError(res, 'estate_01');
            return
        }
    } catch (error) {
        common.sendFault(res, error);
        return
    }
}
// 修改楼盘
async function modifyEstate(req, res) {
    try {

        let doc = common.docTrim(req.body),
            replacements = [],
            modEstate;


        modEstate = await tb_estate.findOne({
            where: {
                province: doc.province,
                city: doc.city,
                district: doc.district,
                estate_name: doc.estate_name,
                estate_id: {
                    '$ne': doc.estate_id
                }
            }
        });
        if (modEstate) {
            common.sendError(res, 'estate_02');
            return
        }


        modEstate = await tb_estate.findOne({
            where: {
                estate_id: doc.estate_id
            }
        });

        if (modEstate) {
            modEstate.province = doc.province;
            modEstate.city = doc.city;
            modEstate.district = doc.district;
            modEstate.estate_name = doc.estate_name;
            modEstate.address = doc.address;
            modEstate.land_agent = doc.land_agent;
            modEstate.estate_name = doc.estate_name;
            await modEstate.save()
        } else {
            return common.sendError(res, '楼盘不存在');
        }

        common.sendData(res, modEstate);

    } catch (error) {
        return common.sendFault(res, error);
    }
}
// 查询楼盘列表
async function searchAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let returnData = {};
        let replacements = [];

        let queryStr = 'select tbe.*,tbd.landagent_name ' +
            'from tbl_erc_estate tbe ' +
            'left join tbl_erc_landagent tbd on (tbe.land_agent=tbd.landagent_id and tbd.state=1) ' +
            'where tbe.state=1 and tbe.domain_id ' + await FDomain.getDomainListStr(req);
        if (doc.estate_id) {
            queryStr += ' and tbe.estate_id=?';
            replacements.push(doc.estate_id);
            doc.offset = 0;
            doc.limit = 1;
        }
        if (doc.idName) {
            queryStr += ' and (tbe.estate_no like ? or tbe.estate_name like ?)';
            replacements.push('%' + doc.idName + '%');
            replacements.push('%' + doc.idName + '%');
        }
        if (doc.land_agent) {
            queryStr += ' and tbe.land_agent=?';
            replacements.push(doc.land_agent);
        }
        if (doc.province) {
            queryStr += ' and tbe.province=?';
            replacements.push(doc.province);
        }
        if (doc.city) {
            queryStr += ' and tbe.city=?';
            replacements.push(doc.city);
        }
        if (doc.district) {
            queryStr += ' and tbe.district=?';
            replacements.push(doc.district);
        }
        if (doc.source) {
            queryStr += ' and tbe.source=?';
            replacements.push(doc.source);
        }
        // if (doc.createdBeginTime) {
        //     queryStr += ' and tbe.created_at >=?';
        //     replacements.push(doc.createdBeginTime + ' 00:00:00');
        // }
        // if (doc.createdEndTime) {
        //     queryStr += ' and tbe.created_at <=?';
        //     replacements.push(doc.createdEndTime + ' 23:59:59');
        // }
        let result = await common.queryWithCount(sequelize, req, queryStr, replacements);

        returnData.total = result.count;
        returnData.rows = [];
        for (let r of result.data) {
            let result = JSON.parse(JSON.stringify(r));
            result.create_date = r.created_at.Format("yyyy-MM-dd");
            returnData.rows.push(result)
        }
        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
        return
    }
}
// 查询楼盘列表
async function searchEstate(req, res) {
    try {
        let doc = common.docTrim(req.body),
            returnData = {},
            replacements = [],
            result, queryStr;

        // let estate = await tb_estate.findOne({
        //     where: {
        //         estate_id: doc.estate_id
        //     }
        // })
        queryStr = `select e.*,l.landagent_name
         from tbl_erc_estate e
         left join tbl_erc_landagent l on (e.land_agent=l.landagent_id and l.state=1)
         where e.estate_id=?`;
        replacements.push(doc.estate_id);
        result = await sequelize.query(queryStr, {
            replacements: replacements,
            type: sequelize.QueryTypes.SELECT
        });
        if (result && result.length > 0) {
            returnData = JSON.parse(JSON.stringify(result[0]));
        }

        replacements = [];
        queryStr = 'select build from tbl_erc_estateroom where state=1';
        if (doc.estate_id) {
            queryStr += ' and estate_id=?';
            replacements.push(doc.estate_id)
        }
        queryStr += ' group by build';
        result = await sequelize.query(queryStr, {
            replacements: replacements,
            type: sequelize.QueryTypes.SELECT
        });
        returnData.build = [];
        for (let i = 0; i < result.length; i++) {
            let elem = {
                id: i + 1,
                value: result[i].build,
                text: result[i].build
            };
            returnData.build.push(elem);
        }

        replacements = [];
        queryStr = 'select unit from tbl_erc_estateroom where state=1';
        if (doc.estate_id) {
            queryStr += ' and estate_id=?';
            replacements.push(doc.estate_id)
        }
        queryStr += ' group by unit';
        result = await sequelize.query(queryStr, {
            replacements: replacements,
            type: sequelize.QueryTypes.SELECT
        });
        returnData.unit = [];
        for (let i = 0; i < result.length; i++) {
            let elem = {
                id: i + 1,
                value: result[i].unit,
                text: result[i].unit
            };
            returnData.unit.push(elem);
        }

        replacements = [];
        queryStr = 'select roomtype_id,roomtype_name from tbl_erc_roomtype where state=1';
        if (doc.estate_id) {
            queryStr += ' and estate_id=?';
            replacements.push(doc.estate_id)
        }
        result = await sequelize.query(queryStr, {
            replacements: replacements,
            type: sequelize.QueryTypes.SELECT
        });
        returnData.roomtype = [];
        for (let i = 0; i < result.length; i++) {
            let elem = {
                id: result[i].roomtype_id,
                value: result[i].roomtype_name,
                text: result[i].roomtype_name
            };
            returnData.roomtype.push(elem);
        }

        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
        return
    }
}
// 通过楼盘批量建立订单
async function createOrder(req, res) {
    try {
        let doc = common.docTrim(req.body),
            user = req.user;

        let estate = await tb_estate.findOne({
            where: {
                estate_id: doc.estate_id
            }
        })

        let rooms = await tb_estateroom.findAll({
            where: {
                estate_id: doc.estate_id,
                order_id: ''
            }
        })

        await common.transaction(async function(t) {
            for (let r of rooms) {
                let roomType = await tb_roomtype.findOne({
                    where: {
                        roomtype_id: r.roomtype_id
                    }
                })

                let addOrder = await tb_order.create({
                    order_id: await Sequence.genOrderID(user),
                    domain_id: user.domain_id,
                    order_type: '7', //OTYPEINFO
                    order_address: estate.province + estate.city + estate.district + estate.address + estate.estate_name + r.build + "栋" + r.unit + "单元" + r.room_no + "号",
                    roomtype_id: r.roomtype_id,
                    order_house_area: roomType.acreage,
                    order_state: 'NEW', //ORDERSTATEINFO
                    estate_id: r.estate_id,
                    estate_room_id: r.room_id
                }, {
                    transaction: t
                });

                r.order_id = addOrder.order_id
                r.save({
                    transaction: t
                })

                await tb_orderworkflow.create({
                    order_id: addOrder.order_id,
                    orderworkflow_state: 'NEW',
                    orderworkflow_desc: '新建'
                }, {
                    transaction: t
                })

                // 增加施工节点
                let nodes = await tb_goconstructionnode.findAll({
                    where: {
                        roomtype_id: r.roomtype_id,
                        state: GLBConfig.ENABLE
                    }
                })
                let ganntttasks = []
                for (let n of nodes) {
                    let gt = await tb_gantttasks.create({
                        text: n.gonode_name,
                        node_id: n.gonode_id,
                        order_id: addOrder.order_id,
                        start_date: n.gostart_day,
                        duration: 0,
                        progress: 0,
                        sortorder: n.gonode_index,
                        parent: 0,
                        task_state: '1' //TASKSTATE
                    }, {
                        transaction: t
                    });
                    ganntttasks.push(gt)
                }

                // 增加空间
                let orderrooms = await tb_goorderroom.findAll({
                    where: {
                        roomtype_id: r.roomtype_id
                    }
                })

                for (let or of orderrooms) {
                    // 增加空间
                    let oroom = await tb_orderroom.create({
                        order_id: addOrder.order_id,
                        room_type: or.goroom_type,
                        room_name: or.goroom_name
                    })

                    // 增加物料
                    let materiels = await tb_goordermateriel.findAll({
                        where: {
                            roomtype_id: r.roomtype_id,
                            goroom_id: or.goroom_id
                        }
                    })
                    for (let m of materiels) {
                        await tb_ordermateriel.create({
                            order_id: addOrder.order_id,
                            room_id: oroom.room_id,
                            materiel_id: m.gomateriel_id,
                            materiel_amount: m.gomateriel_amount,
                            materiel_batch: m.gomateriel_batch,
                            room_type: m.goroom_type,
                            purchase_state: '1' //未采购
                        }, {
                            transaction: t
                        });
                    }

                    //生成验收计划
                    for (let gt of ganntttasks) {
                        let findAcceptance = await tb_goacceptance.findAll({
                            where: {
                                goroom_id: or.goroom_id,
                                gonode_id: gt.node_id,
                                state: GLBConfig.ENABLE
                            }
                        });

                        for (let a of findAcceptance) {
                            await tb_orderacceptance.create({
                                gantttasks_id: gt.gantttasks_id,
                                order_id: addOrder.order_id,
                                room_id: oroom.room_id,
                                acceptance_id: a.goacceptance_id,
                                acceptance_index: a.goacceptance_index,
                                node_id: a.gonode_id,
                                room_type: a.goroom_type,
                                acceptance_name: a.goacceptance_name,
                                is_hidden: a.gois_hidden,
                                technological_require: a.gotechnological_require,
                                evidence_require: a.goevidence_require,
                                acceptance_state: 'NEW',
                                upload_format: a.goupload_format
                            }, {
                                transaction: t
                            })
                        }
                    } //生成验收计划结束
                } // end of orderrooms
            }
            common.sendData(res);
        })
    } catch (error) {
        common.sendFault(res, error);
    }
}
// 查询楼盘管理团队
async function queryTeam(req, res) {
    try {
        let doc = common.docTrim(req.body),
            user = req.user,
            replacements = [],
            returnData = [];
        let queryStr = 'select * from tbl_erc_estateteam a, tbl_common_user b where a.user_id = b.user_id';
        if (doc.estate_id) {
            queryStr += ' and estate_id=?';
            replacements.push(doc.estate_id)
        }
        let result = await sequelize.query(queryStr, {
            replacements: replacements,
            type: sequelize.QueryTypes.SELECT
        });

        let usergroups = await tb_usergroup.findAll({
            where: {
                domain_id: user.domain_id
            }
        });

        for (let r of result) {
            let rj = JSON.parse(JSON.stringify(r))
            delete rj.pwaaword
            rj.position = genPosition(rj.usergroup_id, usergroups).substring(1)
            returnData.push(rj)
        }

        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
        return
    }
}
// 获得定位
function genPosition(usergroup_id, usergroups) {
    let positionName = '',
        parent_id;

    function isEqual(element, index, array) {
        if (element.usergroup_id === usergroup_id) {
            positionName = element.usergroup_name
            parent_id = element.parent_id
            return true
        } else {
            return false
        }
    }

    if (usergroups.some(isEqual)) {
        positionName = genPosition(parent_id, usergroups) + '>' + positionName
    }
    return positionName
}
// 新建楼盘管理团队
async function changeTeam(req, res) {
    try {
        let doc = common.docTrim(req.body),
            user = req.user,
            returnData = [];

        await tb_estateteam.destroy({
            where: {
                estate_id: doc.estate_id
            }
        })

        for (let u of doc.users) {
            await tb_estateteam.create({
                estate_id: doc.estate_id,
                user_id: u.user_id,
            })
        }

        common.sendData(res);
    } catch (error) {
        common.sendFault(res, error);
        return
    }
}
// 查询楼盘户型
async function searchRoomList(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let returnData = {};
        let replacements = [];

        let queryStr = 'select * ' +
            'from tbl_erc_estateroom tbe ' +
            'left join tbl_erc_roomtype tbr on (tbe.roomtype_id=tbr.roomtype_id and tbr.state=1) ' +
            'where tbe.state=1';
        if (doc.estate_id) {
            queryStr += ' and tbe.estate_id=?';
            replacements.push(doc.estate_id)
        }
        if (doc.build) {
            queryStr += ' and tbe.build=?';
            replacements.push(doc.build)
        }
        if (doc.unit) {
            queryStr += ' and tbe.unit=?';
            replacements.push(doc.unit)
        }
        let result = await common.queryWithCount(sequelize, req, queryStr, replacements);

        returnData.total = result.count;

        returnData.rows = result.data;
        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
        return
    }
}
// 增加户型
async function addRoom(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let replacements = [];

        let build = ('000' + doc.build).slice(-3);
        let unit = ('00' + doc.unit).slice(-2);
        let room_no = ('0000' + doc.room_no).slice(-4);

        let estateroom = await tb_estateroom.findOne({
            where: {
                estate_id: doc.estate_id,
                build: build,
                unit: unit,
                room_no: room_no
            }
        });
        if (estateroom) {
            common.sendError(res, 'room_01');
            return
        }

        let estate = await tb_estate.findOne({
            where: {
                estate_id: doc.estate_id,
            }
        });

        let roomCode = estate.estate_no + build + unit + room_no;

        let addEstateRoom = await tb_estateroom.create({
            estate_id: doc.estate_id,
            room_code: roomCode,
            build: build,
            unit: unit,
            room_no: room_no,
            roomtype_id: doc.roomtype_id
        });

        common.sendData(res, addEstateRoom);
    } catch (error) {
        common.sendFault(res, error);
        return;
    }
}
// 修改户型
async function modifyRoom(req, res) {
    try {
        let doc = common.docTrim(req.body),
            replacements = [],
            addFile;

        let modRoom = await tb_estateroom.findOne({
            where: {
                room_id: doc.room_id
            }
        });

        if (modRoom) {
            modRoom.estate_id = doc.estate_id,
                modRoom.room_code = doc.room_code,
                modRoom.build = doc.build,
                modRoom.unit = doc.unit,
                modRoom.room_no = doc.room_no,
                modRoom.roomtype_id = doc.roomtype_id
            await modRoom.save()
        } else {
            common.sendError(res, '楼盘不存在');
            return
        }

        common.sendData(res, modRoom);

    } catch (error) {
        common.sendFault(res, error);
        return null
    }
}


function iGetInnerText(testStr) {
    var resultStr;
    resultStr = testStr.replace(/\ +/g, ""); //去掉空格
    resultStr = testStr.replace(/[ ]/g, ""); //去掉空格
    resultStr = testStr.replace(/[\r\n]/g, ""); //去掉回车换行
    return resultStr;
}
// 导入户型
async function importRoom(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let replacements = [],
            result, addEstateRoom, estateRoom, roomArrTemp, roomCode, objRegExp, roomType;
        let build, unit, roomNo, roomTypeName;
        let roomArrfile = await common.csvtojsonByUrl(doc.uploadurl);

        for (let i = 1; i < roomArrfile.length; i++) {
            roomArrTemp = roomArrfile[i].split(',');
            if (roomArrTemp[0] && roomArrTemp[1] && roomArrTemp[2]) {

                build = iGetInnerText(roomArrTemp[0]);
                unit = iGetInnerText(roomArrTemp[1]);
                roomNo = iGetInnerText(roomArrTemp[2]);
                roomTypeName = iGetInnerText(roomArrTemp[3]);

                if (build.length > 3 || build.length == 0) {
                    return common.sendError(res, 'room_02');
                }
                if (unit.length > 2 || unit.length == 0) {
                    return common.sendError(res, 'room_03');
                }
                if (roomNo.length > 4 || roomNo.length == 0) {
                    return common.sendError(res, 'room_04');
                }

                build = ('000' + build).slice(-3);
                unit = ('00' + unit).slice(-2);
                roomNo = ('0000' + roomNo).slice(-4);

                result = await tb_roomtype.findOne({
                    where: {
                        estate_id: doc.estate_id,
                        name: roomTypeName
                    }
                });
                if (!result) {
                    common.sendError(res, 'room_05');
                    return
                }

                result = await tb_estateroom.findOne({
                    where: {
                        estate_id: doc.estate_id,
                        build: build,
                        unit: unit,
                        room_no: roomNo
                    }
                });
                if (result) {
                    common.sendError(res, 'room_01');
                    return
                }
            }
        }

        for (let i = 1; i < roomArrfile.length; i++) {
            roomArrTemp = roomArrfile[i].split(',');
            if (roomArrTemp[0] && roomArrTemp[1] && roomArrTemp[2]) {
                build = iGetInnerText(roomArrTemp[0]);
                unit = iGetInnerText(roomArrTemp[1]);
                roomNo = iGetInnerText(roomArrTemp[2]);
                roomTypeName = iGetInnerText(roomArrTemp[3]);

                build = ('000' + build).slice(-3);
                unit = ('00' + unit).slice(-2);
                roomNo = ('0000' + roomNo).slice(-4);


                roomCode = doc.estate_no + build + unit + roomNo;

                result = await tb_roomtype.findOne({
                    where: {
                        estate_id: doc.estate_id,
                        name: roomTypeName
                    }
                });

                roomType = result.roomtype_id;

                estateRoom = await tb_estateroom.create({
                    estate_id: doc.estate_id,
                    room_code: roomCode,
                    build: build,
                    unit: unit,
                    room_no: roomNo,
                    roomtype_id: roomType
                })
            }
        }
        common.sendData(res, estateRoom);
    } catch (error) {
        common.sendFault(res, error);
        return;
    }
}
// 下载模板
async function downloadTemplate(req, res) {
    try {
        let str = '楼栋,单元,房间号,原始户型\r101,01,1001,A型\r楼栋3位、单元2位、房间号4位、原始户型需填写当前楼盘已设置好的户型名称';

        // let filename = 'download_' + common.getUUIDByTime(32) + '.csv';
        let filename = '乐宜嘉楼盘房屋数据导入模板.csv';
        let tempfile = path.join(__dirname, '../../../' + config.uploadOptions.uploadDir + '/' + filename);
        let csvBuffer = iconvLite.encode(str, 'gb2312');
        fs.writeFile(tempfile, csvBuffer, function(err) {
            if (err) throw err;
            common.sendData(res, config.tmpUrlBase + filename);
        });
    } catch (error) {
        common.sendFault(res, error);
    }
}
// 上传
async function upload(req, res) {
    try {
        let uploadurl = await common.fileSave(req);
        common.sendData(res, {
            uploadurl: uploadurl
        })
    } catch (error) {
        common.sendFault(res, error);
        return
    }
}
// 获得地产商信息
async function getLandAgentUserInfo(req, res) {
    let returnData = {};
    let user = req.user;
    let userInfo = await tb_user.findOne({
        where: {
            user_id: user.user_id
        }
    });
    returnData.userGroup = await tb_usergroup.findOne({
        where: {
            usergroup_id: userInfo.usergroup_id
        }
    });
    let thirdSignUser = await tb_thirdsignuser.findOne({
        where: {
            user_id: user.user_id
        }
    });
    returnData.landAgent = await tb_landagent.findOne({
        where: {
            landagent_id: thirdSignUser.supplier_id
        }
    });
    common.sendData(res, returnData);
}
