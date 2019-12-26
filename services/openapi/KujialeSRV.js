const rp = require('request-promise');
const moment = require('moment');
const querystring = require('querystring');

const common = require('../../util/CommonUtil');
const GLBConfig = require('../../util/GLBConfig');
const Sequence = require('../../util/Sequence');
const logger = require('../../util/Logger').createLogger('ZoweeInterfaceSRV');
const model = require('../../model');

const sequelize = model.sequelize;
const tb_orderkujiale = model.erc_orderkujiale;
const tb_order = model.erc_order;
const tb_roomtype = model.erc_roomtype;
const tb_orderroom = model.erc_orderroom;
const tb_materiel = model.erc_materiel;
const tb_ordermateriel = model.erc_ordermateriel;
const tb_operator = model.erc_operator;
const tb_user = model.common_user;

exports.KujialeControlResource = (req, res) => {
  let method = req.query.method;
  if (method === 'getIframeSrc') {
    getIframeSrcAct(req, res);
  } else if (method === 'sync') {
    syncAct(req, res)
  } else if (method === 'queryStandard') {
    queryStandardAct(req, res)
  } else if (method === 'queryDesign') {
    queryDesignAct(req, res)
  } else if (method === 'changeDesignName') {
    changeDesignNameAct(req, res)
  } else {
    common.sendError(res, 'common_01')
  }
};

exports.KujialeGetControlResource = (req, res) => {
  let method = req.query.method;
  if (method === 'queryEstate') {
    queryEstateAct(req, res)
  } else {
    common.sendError(res, 'common_01')
  }
};

function getAuthString(appuid, queryPara) {
  let appkey = '9Gb5NA8TIf'
  let appsecret = 'A5CWcaN396kVNQSrDhRTSY0AMNv4PDiC'
  let timestamp = moment().valueOf()
  let authString = ''

  if (appuid) {
    let sign = require('crypto').createHash('md5').update(appsecret + appkey + appuid + timestamp).digest('hex')
    authString = querystring.stringify({
      appkey: appkey,
      timestamp: timestamp,
      appuid: appuid,
      sign: sign
    })
  } else {
    let sign = require('crypto').createHash('md5').update(appsecret + appkey + timestamp).digest('hex')
    authString = querystring.stringify({
      appkey: appkey,
      timestamp: timestamp,
      sign: sign
    })
  }

  if (queryPara) {
    paraString = querystring.stringify(
      queryPara
    )
    authString += '&' + paraString
  }

  return '?' + authString
}

async function getAccessToken(req, appuid) {
  try {
    let user = req.user
    let avatar = user.avatar
    if (avatar) {
      avatar += 'http://www.erchouse.com'
    } else {
      avatar = 'http://www.erchouse.com/static/images/base/head.jpg'
    }
    let requestData = {
      "name": user.name,
      "email": user.email,
      "telephone": user.phone,
      "avatar": avatar,
      "type": 0
    }
    let options = {
      method: 'POST',
      uri: 'https://openapi.kujiale.com/v2/login' + getAuthString(appuid),
      json: true,
      headers: {
        "content-type": "application/json",
      },
      body: requestData
    };

    let body = await rp(options)
    return body.d
  } catch (error) {
    throw error
  }
}

let getIframeSrcAct = async (req, res) => {
  try {
    let doc = common.docTrim(req.body),
      user = req.user,
      planId = '',
      designId = '',
      designName = '',
      appuid = '',
      token = '',
      dsinfo

    if (doc.order_id) {
      let orderkujiale = await tb_orderkujiale.findOne({
        where: {
          order_id: doc.order_id
        }
      })

      if (!orderkujiale) {
        appuid = user.username
        token = await getAccessToken(req, appuid)
        if (!doc.planId) {
          let order = await tb_order.findOne({
            where: {
              order_id: doc.order_id
            }
          })

          let roomtype = await tb_roomtype.findOne({
            where: {
              roomtype_id: order.roomtype_id
            }
          })

          if (!roomtype) {
            return common.sendError(res, 'kujiale_02')
          }

          if (!roomtype.roomtype_kjl_planid) {
            return common.sendError(res, 'kujiale_04')
          }
          planId = roomtype.roomtype_kjl_planid
        } else {
          planId = doc.planId
        }

        let cpop = {
          method: 'POST',
          uri: 'https://openapi.kujiale.com/v2/floorplan/' + planId + '/copy' + getAuthString(user.username, {}),
          headers: {
            "content-type": "text/plain;charset=utf-8",
          }
        }

        let fp = await rp(cpop)

        if (!doc.designId) {
          let options = {
            method: 'POST',
            uri: 'https://openapi.kujiale.com/v2/design/creation' + getAuthString(user.username, {
              plan_id: JSON.parse(fp).d.planId
            }),
            headers: {
              "content-type": "text/plain;charset=utf-8",
            }
          };
          let body = await rp(options)
          designId = JSON.parse(body).d
        } else {
          let options = {
            method: 'POST',
            uri: 'https://openapi.kujiale.com/v2/design/' + doc.designId + '/copy' + getAuthString(user.username, {}),
            headers: {
              "content-type": "text/plain;charset=utf-8",
            }
          };
          let body = await rp(options)
          designId = JSON.parse(body).d
        }

        let url = 'https://openapi.kujiale.com/v2/design/' + designId + '/basic' + getAuthString('', {})
        let info = await rp(url)
        dsinfo = JSON.parse(info).d

        orderkujiale = await tb_orderkujiale.create({
          order_id: doc.order_id,
          appuid: user.username,
          fpid: dsinfo.planId,
          desid: dsinfo.designId,
          kujiale_planPic: dsinfo.planPic,
          kujiale_commName: dsinfo.commName,
          kujiale_city: dsinfo.city,
          kujiale_srcArea: dsinfo.srcArea,
          kujiale_specName: dsinfo.specName
        });
      } else {
        appuid = orderkujiale.appuid
        designId = orderkujiale.desid
        token = await getAccessToken(req, appuid)
      }
    } else {
      appuid = user.username
      token = await getAccessToken(req, appuid)
      if (doc.designId) {
        let options = {
          method: 'POST',
          uri: 'https://openapi.kujiale.com/v2/design/' + doc.designId + '/copy' + getAuthString(appuid, {}),
          headers: {
            "content-type": "text/plain;charset=utf-8",
          }
        };
        let body = await rp(options)
        designId = JSON.parse(body).d
      } else {
        if (doc.planId) {
          let cpop = {
            method: 'POST',
            uri: 'https://openapi.kujiale.com/v2/floorplan/' + doc.planId + '/copy' + getAuthString(appuid, {}),
            headers: {
              "content-type": "text/plain;charset=utf-8",
            }
          }

          let fp = await rp(cpop)

          let options = {
            method: 'POST',
            uri: 'https://openapi.kujiale.com/v2/design/creation' + getAuthString(appuid, {
              plan_id: JSON.parse(fp).d.planId
            }),
            headers: {
              "content-type": "text/plain;charset=utf-8",
            }
          };
          let body = await rp(options)
          designId = JSON.parse(body).d
        } else {
          return common.sendError(res, 'kujiale_05')
        }
      }
    }
    if (!dsinfo) {
      let desurl = 'https://openapi.kujiale.com/v2/design/' + designId + '/basic' + getAuthString('', {})
      let desinfo = await rp(desurl)
      dsinfo = JSON.parse(desinfo).d
    }

    let queryPara = {
      accesstoken: token,
      designid: designId,
      dest: 1
    }

    let url = 'https://www.kujiale.com/v/auth?' + querystring.stringify(queryPara)

    return common.sendData(res, {
      iframeurl: url,
      name: dsinfo.name
    });
  } catch (error) {
    return common.sendFault(res, error);
  }
}

let syncAct = async (req, res) => {
  try {
    let doc = common.docTrim(req.body),
      returnData = {},
      url;

    let orderkujiale = await tb_orderkujiale.findOne({
      where: {
        order_id: doc.order_id
      }
    })

    if (!orderkujiale.listingid) {
      url = "https://openapi.kujiale.com/v2/listing/init" + getAuthString('', {
        design_id: orderkujiale.desid
      })
      let init = await rp(url)
      init = JSON.parse(init)
      orderkujiale.listingid = init.d
      await orderkujiale.save()
    }

    if (orderkujiale.sync_state === '0') {
      let options = {
        method: 'POST',
        uri: "https://openapi.kujiale.com/v2/listing/" + orderkujiale.listingid + "/sync" + getAuthString('', {
          appuid: orderkujiale.appuid
        }),
        headers: {
          "content-type": "text/plain;charset=utf-8",
        }
      };
      let sync = await rp(options)
      sync = JSON.parse(sync)
      if (sync.c === '0') {
        orderkujiale.sync_state = '1'
        await orderkujiale.save()
      }
    }

    url = "https://openapi.kujiale.com/v2/listing/" + orderkujiale.listingid + "/state" + getAuthString('', {
      listingId: orderkujiale.listingid
    })
    let state = await rp(url)
    state = JSON.parse(state)

    if (state.d != '3') {
      return common.sendError(res, 'kujiale_01')
    }

    orderkujiale.sync_state = '0'
    await orderkujiale.save()

    //获取总览
    url = "https://openapi.kujiale.com/v2/listing/" + orderkujiale.listingid + "/brief" + getAuthString('', {
      listingId: orderkujiale.listingid
    })
    let brief = await rp(url)
    brief = JSON.parse(brief)

    //获取空间
    url = "https://openapi.kujiale.com/v2/listing/" + orderkujiale.listingid + "/project/detail" + getAuthString('', {
      listingId: orderkujiale.listingid
    })
    let detail = await rp(url)
    detail = JSON.parse(detail)

    let order = await tb_order.findOne({
      where: {
        order_id: doc.order_id
      }
    })

    if (detail.d.length > 0) {
      await common.transaction(async function (t) {
        order.order_house_area = brief.d.floorArea
        await order.save({
          transaction: t
        })

        await tb_orderroom.destroy({
          where: {
            order_id: order.order_id
          },
          transaction: t
        });

        await tb_ordermateriel.destroy({
          where: {
            order_id: order.order_id
          },
          transaction: t
        });

        // 硬装
        url = "https://openapi.kujiale.com/v2/listing/" + orderkujiale.listingid + "/hard/outfit/detail" + getAuthString('', {
          listingId: orderkujiale.listingid
        })
        let hardOutfitDetail = await rp(url)
        hardOutfitDetail = JSON.parse(hardOutfitDetail)

        // 软装
        url = "https://openapi.kujiale.com/v2/listing/" + orderkujiale.listingid + "/soft/outfit/detail" + getAuthString('', {
          listingId: orderkujiale.listingid
        })
        let softOutfitDetail = await rp(url)
        softOutfitDetail = JSON.parse(softOutfitDetail)

        // // 橱柜
        // url = "https://openapi.kujiale.com/v2/listing/" + orderkujiale.listingid + "/custom/cupboard/detail" + getAuthString('', {
        //     listingId: orderkujiale.listingid
        // })
        // let customCupboardDetail = await rp(url)
        // customCupboardDetail = JSON.parse(customCupboardDetail)
        //
        // // 衣柜
        // url = "https://openapi.kujiale.com/v2/listing/" + orderkujiale.listingid + "/custom/wardrobe/detail" + getAuthString('', {
        //     listingId: orderkujiale.listingid
        // })
        // let customWardrobeDetail = await rp(url)
        // customWardrobeDetail = JSON.parse(customWardrobeDetail)

        function searchRoomType(room_name) {
          for (let rt of GLBConfig.ROOMTYPE) {
            if (room_name === '起居室') {
              return '2'
            }
            if (room_name.search(rt.text) >= 0) {
              return rt.id
            }
          }
          return '20'
        }

        for (let r of detail.d) {
          let room = await tb_orderroom.create({
            order_id: order.order_id,
            room_type: searchRoomType(r.typeName),
            room_name: r.typeName,
            room_area: r.groundArea,
            wall_area: r.wall_area,
            ground_perimeter: r.ground_perimeter,
            kjl_room_id: r.roomId
          }, {
            transaction: t
          })

          //硬装
          for (let ho of hardOutfitDetail.d) {
            if (ho.roomId === r.roomId) {
              for (let m of ho.hardOutfits) {
                if (m.code) {
                  let mt = await tb_materiel.findOne({
                    where: {
                      materiel_code: m.code
                    }
                  })
                  if (mt) {
                    await tb_ordermateriel.create({
                      room_id: room.room_id,
                      order_id: order.order_id,
                      materiel_id: mt.materiel_id,
                      materiel_amount: Math.ceil(m.number),
                      room_type: room.room_type,
                      kjl_type: m.type,
                      kjl_imageurl: m.imageUrl,
                      kjl_name: m.name,
                      kjl_brand: m.brand,
                      kjl_specification: m.specification,
                      kjl_unit: m.unit,
                      kjl_number: m.number,
                      kjl_unitprice: m.unitPrice,
                      kjl_realprice: m.realPrice,
                      kjl_group: '硬装'
                    }, {
                      transaction: t
                    })
                  } else {
                    logger.error(m.code + ' do not exists.')
                    throw new Error(m.code + ' do not exists.')
                  }
                }
              }
            }
          } //硬装

          //软装
          for (let so of softOutfitDetail.d) {
            if (so.roomId === r.roomId) {
              for (let m of so.softOutfits) {
                if (m.code) {
                  let mt = await tb_materiel.findOne({
                    where: {
                      materiel_code: m.code
                    }
                  })
                  if (mt) {
                    await tb_ordermateriel.create({
                      room_id: room.room_id,
                      order_id: order.order_id,
                      materiel_id: mt.materiel_id,
                      materiel_amount: Math.ceil(m.number),
                      room_type: room.room_type,
                      kjl_type: m.type,
                      kjl_imageurl: m.imageUrl,
                      kjl_name: m.name,
                      kjl_brand: m.brand,
                      kjl_unit: m.unit,
                      kjl_number: m.number,
                      kjl_unitprice: m.unitPrice,
                      kjl_realprice: m.realPrice,
                      kjl_group: '软装'
                    }, {
                      transaction: t
                    })
                  } else {
                    logger.error(m.code + ' do not exists.')
                    throw new Error(m.code + ' do not exists.')
                  }
                }
              }
            }
          } //软装
        }
      })
    }

    common.sendData(res);
  } catch (error) {
    return common.sendError(res, '', error.message);
  }
}

let queryStandardAct = async (req, res) => {
  try {
    let doc = common.docTrim(req.body)
    let returnData = {
      results: []
    }
    if (doc.search_text && doc.province) {
      let city_id = common.searchKujialeCityid(doc.province, doc.city)
      let queryPara = {
        start: 0,
        num: 50,
        q: doc.search_text,
        city_id: city_id
      }
      if (doc.count) {
        queryPara.room_count = parseInt(doc.count)
      }
      if (doc.min) {
        queryPara.area_min = parseInt(doc.min)
      }
      if (doc.max) {
        queryPara.area_max = parseInt(doc.max)
      }
      let hasMore = true
      let url = ''
      while (hasMore) {
        url = "https://openapi.kujiale.com/v2/floorplan/standard" + getAuthString('', queryPara)
        let standard = await rp(url)
        standard = JSON.parse(standard)
        hasMore = standard.d.hasMore
        for (let h of standard.d.result) {
          returnData.results.push(h)
        }
        queryPara.start += queryPara.num
      }
    }
    common.sendData(res, returnData)
  } catch (error) {
    return common.sendFault(res, error);
  }
}

let queryDesignAct = async (req, res) => {
  try {
    let doc = common.docTrim(req.body),
      user = req.user
    let returnData = {
      results: []
    }

    let queryPara = {
      start: 0,
      num: 50,
      status: 1,
      appuid: user.username
    }

    if (doc.search_text) {
      queryPara.keyword = doc.search_text
    }

    let hasMore = true
    let url = ''
    while (hasMore) {
      url = "https://openapi.kujiale.com/v2/design/list" + getAuthString(user.username, queryPara)
      let designs = await rp(url)
      designs = JSON.parse(designs)
      hasMore = designs.d.hasMore
      for (let d of designs.d.result) {
        returnData.results.push(d)
      }
      queryPara.start += queryPara.num
    }

    common.sendData(res, returnData)
  } catch (error) {
    return common.sendFault(res, error);
  }
}

let changeDesignNameAct = async (req, res) => {
  try {
    let doc = common.docTrim(req.body),
      user = req.user

    let options = {
      method: 'POST',
      uri: 'https://openapi.kujiale.com/v2/design/' + doc.designId+ '/basic' + getAuthString('', {}),
      json: true,
      headers: {
        "content-type": "application/json;charset=utf-8",
      },
      body: {
        name: doc.name 
      }
    };
    let body = await rp(options)

    common.sendData(res)
  } catch (error) {
    return common.sendFault(res, error);
  }
}

let queryEstateAct = async (req, res) => {
  try {
    let doc = req.query
    let returnData = {
      results: [],
      pagination: {
        more: false
      }
    }
    if (doc.search_text && doc.province) {
      let city_id = common.searchKujialeCityid(doc.province, doc.city)
      let url = "https://openapi.kujiale.com/v2/floorplan/standard" + getAuthString('', {
        start: 0,
        num: 50,
        q: doc.search_text,
        city_id: city_id
      })
      let standard = await rp(url)
      standard = JSON.parse(standard)
      let tempName = []
      for (let e of standard.d.result) {
        tempName.push(e.commName)
      }
      let estateName = Array.from(new Set(tempName))
      let i = 1
      for (let e of estateName) {
        returnData.results.push({
          id: i,
          text: e
        })
        i += 1
      }
    }
    res.send(returnData)
  } catch (error) {
    return common.sendFault(res, error);
  }
}

exports.getStandards = async (province, city, estateName) => {
  try {
    let result = [],
      room_list = [1, 2, 3, 4, 5],
      url = ''
    let city_id = common.searchKujialeCityid(province, city)
    for (let rc of room_list) {
      let start = 0,
        page = 50,
        hasMore = true
      while (hasMore) {
        url = "https://openapi.kujiale.com/v2/floorplan/standard" + getAuthString('', {
          start: start,
          num: page,
          q: estateName,
          room_count: rc,
          city_id: city_id
        })
        let standard = await rp(url)
        standard = JSON.parse(standard)
        hasMore = standard.d.hasMore
        for (let h of standard.d.result) {
          h.room_count = rc
          result.push(h)
        }
        start += page
      }
    }
    return result
  } catch (error) {
    throw error;
  }
}

exports.getRenderpic = async (req, res) => {
  try {
    let doc = common.docTrim(req.body)
    let url = "https://openapi.kujiale.com/v2/renderpic/list" + getAuthString('', {
      design_id: doc.design_id,
      start: doc.start,
      num: doc.num
    })
    let standard = await rp(url)
    common.sendData(res, JSON.parse(standard));
  } catch (error) {
    throw error
  }
}

async function getEmailAccessToken(userId, username) {
  try {
    let user = await tb_user.findOne({
      where: {
        user_id: userId,
        state: '1'
      }
    });
    let avatar = user.avatar
    if (avatar) {
      avatar += 'http://www.erchouse.com'
    } else {
      avatar = 'http://www.erchouse.com/static/images/base/head.jpg'
    }
    let requestData = {
      "name": user.name,
      "email": user.email,
      "telephone": user.phone,
      "avatar": avatar,
      "type": 0
    }
    let options = {
      method: 'POST',
      uri: 'https://openapi.kujiale.com/v2/login' + getAuthString(username),
      json: true,
      headers: {
        "content-type": "application/json",
      },
      body: requestData
    };

    let body = await rp(options)
    return body.d
  } catch (error) {
    throw error
  }
}

async function getEmail(username, kujialeEmail, userId) {
  try {
    let token = await getEmailAccessToken(userId, username)
    let emails = {
      method: 'POST',
      uri: 'https://openapi.kujiale.com/v2/user/bind' + getAuthString(username),
      json: true,
      headers: {
        "content-type": "application/json",
      },
      body: {
        'email': kujialeEmail
      }
    };
    let body = await rp(emails);
    if (body.c != '0') {
      return body.m
    } else {
      let operator = await tb_operator.findOne({
        where: {
          user_id: userId,
          kujiale_appuid: kujialeEmail,
          state: 1
        }
      });
      if (operator) {
        operator.kujiale_appuid = kujialeEmail;
        await operator.save();
      } else {
        operator = await tb_operator.create({
          user_id: userId,
          kujiale_appuid: kujialeEmail

        });
      }
      return operator;
    }
  } catch (error) {
    throw error
  }
}

exports.getEmail = getEmail