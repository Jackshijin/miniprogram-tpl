import dayjs from 'dayjs';
import Config from '../config';
import { APP_MODE } from '../constants/index';
import Session from '../base/session';
let setUrl = function (url) {
  //补全url
  if (/^(http)/.test(url)) {
    return url;
  }
  return Config.baseUrl + url;
};
// 主要处理多个接口并发, 需要确保先登陆的问题
/**
 *
 * @param  {Object} args 请求参数
 * @returns
 */
console.warn('APP_MODE', APP_MODE);

export default function request(args = {}) {
  let ISCLIENT = wx.getStorageSync('mode') ? wx.getStorageSync('mode') === 'client' : true;
  const { option = {} } = args;
  const { keepLogin = true, isClient = ISCLIENT } = option;
  if (keepLogin) {
    return new Promise((resolve, reject) => {
      // 第一次逻辑判断有没有登陆, 假如session有效, 则直接调用接口
      Session.login()
        .then(() => {
          _request(args)
            .then(resolve)
            .catch(err => {
              if (isClient && err.respCode === 5001) {
                Session.login(true).then(() => {
                  _request(args).then(resolve).catch(reject);
                });
              } else {
                reject(err);
              }
            });
        })
        .catch(reject);
    });
  } else {
    return _request(args);
  }
}

// 主要处理除了登陆以外的请求相关的逻辑
export function _request(args = {}) {
  let ISCLIENT = wx.getStorageSync('mode') ? wx.getStorageSync('mode') === 'client' : true;
  let { url, data, method, option = {} } = args;
  const { tokenEnable, selfControl, isClient = ISCLIENT } = option;
  const mode = isClient ? APP_MODE.C : APP_MODE.B;

  return new Promise((resolve, reject) => {
    let params = { version: Config.apiVersion, data };

    if (tokenEnable) {
      // FIXME: mode 并不可靠, 无法准确的知道跳转的页面是处于哪一个端
      // 方法: 而外参数指定当前端, 默认客户端
      // const mode = wx.getStorageSync('mode');
      params._mode = mode;
      params.token = wx.getStorageSync(`${mode}_token`);
    }

    wx.showNavigationBarLoading();

    const requestTime = dayjs();
    wx.request({
      url: setUrl(url),
      // 全部接口默认使用POST请求
      method: method || 'post',
      data: params,
      timeout: 500000,
      success: res => {
        const responseTime = dayjs();
        new HttpLogger({
          start: requestTime,
          end: responseTime,
          url,
          params,
          res,
          baseUrl: Config.baseUrl
        }).print();

        // 网络层异常
        if (res.statusCode !== 200 && !option.noToast) {
          wx.showToast({ title: '网络异常', icon: 'none' });
          console.error('[Debug]', '网络异常');
          return reject();
        }

        const response = { ...res.data, raw: res };

        // 业务层异常
        if (res.data.respCode === 6000 && !option.noToast) {
          wx.showToast({ title: '未知异常', icon: 'none' });
          console.error('[Debug]', '未知异常');
          return reject(response);
        }

        // 假如不需要通用业务层的通用处理方法, 可以直接设置selfControl来跳过
        if (!selfControl) {
          // 通用业务层, 特定事件拦截
          // 5001 token无效
          if (res.data.respCode === 5001) {
            wx.showToast({ title: '登录状态失效, 请重新登录', icon: 'none', mask: true });

            // TODO: 清除该端所有的登陆信息
            wx.removeStorageSync(`${mode}_token`);
            return setTimeout(() => {
              if (mode === APP_MODE.B) {
                return wx.reLaunch({ url: '/subpackages/business/pages/auth/subpage/login/login' });
              }

              return wx.reLaunch({ url: '/pages/index/index' });
            }, 500);
          }
        }

        if (res.data.respCode === 2000 || res.data.rcode === 200) {
          return resolve(response);
        }
        console.error('[Debug] 非2000状态, ', res.data);
        reject(response);
      },
      fail: res => {
        if (res.errMsg.includes('request:fail')) {
          wx.showToast({ title: '网络异常', icon: 'none' });
        }

        reject();
      },
      complete: wx.hideNavigationBarLoading
    });
  });
}

class HttpLogger {
  constructor({ start, end, url, params, res, baseUrl }) {
    this.start = start;
    this.end = end;
    this.url = url;
    this.params = params;
    this.res = res;
    this.baseUrl = baseUrl;
  }

  print() {
    // 因为app的onLaunch hook里包含http请求, 这时app尚未初始化完成, 导致request里调用app的全局状态出问题
    // FIXME: 考虑将debug参数放到配置文件
    // if (app.globalData.debug) {
    console.log('>============================================<');
    console.log(`Daddy is POST ${this.url}`);
    console.log(`Daddy's body: `, this.params);
    console.log(`Daddy receive ${this.res.data.respCode}, and response: `);
    if (this.res.data.respCode === 2000) {
      console.log('[Success]data: ', this.res.data.data);
      console.log('[Success]message: ', this.res.data.respMsg);
    } else {
      console.log('[Fail]message: ', this.res.data.respMsg);
    }
    console.log('----------------------------------------------');
    console.log(`[Environment] baseUrl: ${this.baseUrl}`);
    console.log(
      `[Performance] Request at ${this.start.format('HH:mm:ss')}, response at ${this.end.format(
        'HH:mm:ss'
      )}, latency: ${this.end - this.start}ms.`
    );
    console.log('>============================================<');
    // }
    // if (app.globalData.debug) {
    //   console.log('>-----------------------------------------------------<');
    //   console.log(`[info] 爸爸正在 POST ${params.url}`);
    //   console.log(`[info] 爸爸的请求体是: `, data);
    //   console.log(
    //     `[info] 儿子给我返回了 ${res.data.respCode}, 儿子的响应体是: `,
    //     res.data.data
    //   );
    //   console.log('>-----------------------------------------------------<');
    // }
  }
}
