// import Dialog from '@vant/weapp/dialog/dialog';
import { store } from '../store';
import request from './request';

// 判断微信服务器的session是否还有效
async function checkSession() {
  return new Promise((resolve, reject) => {
    wx.checkSession({
      success() {
        return resolve(true);
      },
      fail() {
        return resolve(false);
      },
    });
  });
}

/**
 *
 * @param {String} mode 客户端还是商户端, client/business
 * @returns {Boolean} 是否已经登录
 */
export async function checkHasLogined(mode) {
  // const currentMode = wx.getStorageSync('mode');
  // 商户端和客户端为不同的账户体系, token不能共用
  // if (currentMode !== mode) {
  //   return false;
  // }

  const token = wx.getStorageSync(`${mode}_token`);
  if (!token) {
    return false;
  }
  // TODO: 因为用到wx.login的地方有限, 暂时先不用这个检测session是否有效的功能
  // const loggined = await checkSession();
  // if (!loggined) {
  //   wx.removeStorageSync('token');
  //   console.log('3');
  //   return false;
  // }

  // TODO: 通过接口判断token是否还有效
  return true;
}

export async function checkClientHasLogined() {
  return await checkHasLogined(APP_MODE.C);
}

// 通过接口判断登陆是否有效
// 新开API确保不影响原有的checkClientHasLogined, 即原有逻辑
export async function checkClientHasLoginedViaAPI() {
  try {
    let res = await request({
      // 随意使用一个必须要验证的api
      url: '/xct/customerUser/getUserInfo',
      option: { tokenEnable: true, selfControl: true, isClient:true},
    });

    console.log('[checkClientHasLoginedViaAPI] @http res: ', res);
    // 顺便更新用户信息
    store.updateCUserInfo(res.data);
    store.updateCWxInfo(res.data);
    return Promise.resolve();
  } catch (error) {
    console.log('[checkClientHasLoginedViaAPI] @http exception: ', error);

    // 只处理登陆相关, 其他不管
    const app = getApp();
    if (error.respCode === 5001 && app) {
      // 保存前一个页面
      const pages = getCurrentPages();
      app.globalData.lastPageUrl = pages[pages.length - 1].route;
      wx.navigateTo({ url: '/subpackages/client/pages/auth/index' });
    }

    return Promise.reject();
  }
}
export function trackEventWithCUserInfo(name, params) {
  wx.uma.trackEvent(name, {
    ...params,
    Um_Key_UserId: store.cUserInfo && store.cUserInfo.id ? store.cUserInfo.id : undefined,
  });
}

/**
 *
 * @param {Function} fallback 假如不存在上个页面时, 执行fallback
 */
export function backToLastPage(fallback) {
  const app = getApp();
  const { lastPageUrl } = app.globalData;

  // app全局状态不存在 上一个页面
  if (!lastPageUrl && fallback) {
    return fallback();
  }

  // 仅使用一次, 确保下次数据干净
  app.globalData.lastPageUrl = '';

  let pages = getCurrentPages();
  console.log('[backToLastPage] ', pages);
  const index = pages.findIndex((item) => item.route === lastPageUrl);

  // 路由器对象中找不到 上一个页面
  if (index === -1 && fallback) {
    return fallback();
  }
  console.log('[backToLastPage] ', index);
  wx.navigateBack({ delta: pages.length - 1 - index });
}

export const APP_MODE = {
  C: 'client', //客户端
  B: 'business', // 商户端
};

/**
 * 登录之后擦屁股
 * @param {String} mode 哪个端
 * @param {String} token 凭证
 */
export function loginHandler(mode, token) {
  wx.setStorageSync(`${mode}_token`, token);
  wx.setStorageSync('mode', mode);
  if (mode === APP_MODE.C) {
    fetchCUserInfo();
  } else {
    fetchUserInfo();
  }
}

export function fetchUserInfo() {
  return new Promise((resolve, reject) => {
    request({
      url: '/xct/businessUser/getUserInfo',
      option: { tokenEnable: true, isClient: false },
    })
      .then((res) => {
        store.updateBUserInfo(res.data);
        store.updateBWxInfo(res.data);
        resolve();
      })
      .catch((err) => {
        if (err.respCode === 5000) {
          wx.showToast({
            title: err.respMsg,
            icon: 'none',
          });
        }
        reject();
      });
  });
}

export function fetchCUserInfo() {
  return new Promise((resolve, reject) => {
    request({
      url: '/xct/customerUser/getUserInfo',
      option: { tokenEnable: true, isClient: true},
    })
      .then((res) => {
        store.updateCUserInfo(res.data);
        store.updateCWxInfo(res.data);
        resolve();
      })
      .catch((err) => {
        if (err.respCode === 5000) {
          wx.showToast({
            title: err.respMsg,
            icon: 'none',
          });
        }
        reject();
      });
  });
}

/**
 *
 * @param {Number} status 商户端的状态
 * @returns
 */
export function routeByBStatus(status) {
  const routeMap = {
    0: '/subpackages/business/pages/bind/index',
    1: '/subpackages/business/pages/bind/subpage/status/status',
    2: '/subpackages/business/pages/index/index',
    3: '/subpackages/business/pages/index/index',
    4: '/subpackages/business/pages/bind/index?edit=yes',
    5: '/subpackages/business/pages/bind/index?edit=yes',
  };

  return wx.reLaunch({ url: routeMap[status] });
}

// async function wxaCode() {
//   return new Promise((resolve, reject) => {
//     wx.login({
//       success(res) {
//         return resolve(res.code);
//       },
//       fail() {
//         wx.showToast({
//           title: '获取code失败',
//           icon: 'none',
//         });
//         return resolve('获取code失败');
//       },
//     });
//   });
// }

// async function loginByPasswd(page) {}
// async function login(page) {
//   const _this = this;
//   wx.login({
//     success: function (res) {
//       const componentAppid = wx.getStorageSync('componentAppid');
//       if (componentAppid) {
//         WXAPI.wxappServiceLogin({
//           componentAppid,
//           appid: wx.getStorageSync('appid'),
//           code: res.code,
//         }).then(function (res) {
//           if (res.code == 10000) {
//             // 去注册
//             return;
//           }
//           if (res.code != 0) {
//             // 登录错误
//             wx.showModal({
//               title: '无法登录',
//               content: res.msg,
//               showCancel: false,
//             });
//             return;
//           }
//           wx.setStorageSync('token', res.data.token);
//           wx.setStorageSync('uid', res.data.uid);
//           _this.bindSeller();
//           if (page) {
//             page.onShow();
//           }
//         });
//       } else {
//         WXAPI.login_wx(res.code).then(function (res) {
//           if (res.code == 10000) {
//             // 去注册
//             return;
//           }
//           if (res.code != 0) {
//             // 登录错误
//             wx.showModal({
//               title: '无法登录',
//               content: res.msg,
//               showCancel: false,
//             });
//             return;
//           }
//           wx.setStorageSync('token', res.data.token);
//           wx.setStorageSync('uid', res.data.uid);
//           _this.bindSeller();
//           if (page) {
//             page.onShow();
//           }
//         });
//       }
//     },
//   });
// }

// async function authorize() {
//   return new Promise((resolve, reject) => {
//     wx.login({
//       success: function (res) {
//         const code = res.code;
//         let referrer = ''; // 推荐人
//         let referrer_storge = wx.getStorageSync('referrer');
//         if (referrer_storge) {
//           referrer = referrer_storge;
//         }
//         // 下面开始调用注册接口
//         const componentAppid = wx.getStorageSync('componentAppid');
//         if (componentAppid) {
//           WXAPI.wxappServiceAuthorize({
//             code: code,
//             referrer: referrer,
//           }).then(function (res) {
//             if (res.code == 0) {
//               wx.setStorageSync('token', res.data.token);
//               wx.setStorageSync('uid', res.data.uid);
//               resolve(res);
//             } else {
//               wx.showToast({
//                 title: res.msg,
//                 icon: 'none',
//               });
//               reject(res.msg);
//             }
//           });
//         } else {
//           WXAPI.authorize({
//             code: code,
//             referrer: referrer,
//           }).then(function (res) {
//             if (res.code == 0) {
//               wx.setStorageSync('token', res.data.token);
//               wx.setStorageSync('uid', res.data.uid);
//               resolve(res);
//             } else {
//               wx.showToast({
//                 title: res.msg,
//                 icon: 'none',
//               });
//               reject(res.msg);
//             }
//           });
//         }
//       },
//       fail: (err) => {
//         reject(err);
//       },
//     });
//   });
// }

// async function checkAndAuthorize(scope) {
//   return new Promise((resolve, reject) => {
//     wx.getSetting({
//       success(res) {
//         if (!res.authSetting[scope]) {
//           wx.authorize({
//             scope: scope,
//             success() {
//               resolve(); // 无返回参数
//             },
//             fail(e) {
//               console.error(e);
//               // if (e.errMsg.indexof('auth deny') != -1) {
//               //   wx.showToast({
//               //     title: e.errMsg,
//               //     icon: 'none'
//               //   })
//               // }
//               wx.showModal({
//                 title: '无权操作',
//                 content: '需要获得您的授权',
//                 showCancel: false,
//                 confirmText: '立即授权',
//                 confirmColor: '#e64340',
//                 success(res) {
//                   wx.openSetting();
//                 },
//                 fail(e) {
//                   console.error(e);
//                   reject(e);
//                 },
//               });
//             },
//           });
//         } else {
//           resolve(); // 无返回参数
//         }
//       },
//       fail(e) {
//         console.error(e);
//         reject(e);
//       },
//     });
//   });
// }
