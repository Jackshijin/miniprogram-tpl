import Config, { table } from '../config';
import { JSEncrypt } from 'wxmp-rsa';

const formatTime = date => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return [year, month, day].map(formatNumber).join('-');
};
const getFilePrefix = (filename = '') => {
  return filename.split('.').pop();
};
const formatNumber = n => {
  n = n.toString();
  return n[1] ? n : `0${n}`;
};

const validator = {
  // 手机号校验
  checkPhone(input) {
    return /^1[3-9]\d{9}$/.test(input);
  },
  // 身份证校验
  checkIDCard(input) {
    return /^[1-9]\d{5}(18|19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/.test(input);
  },
  checkPasswd(input) {
    return /^[a-zA-Z0-9_]{6,20}$/.test(input);
  },
  checkOnlyChinese(input) {
    return /^[\u4e00-\u9fa5]+$/.test(input);
  },
  checkLegalPersonName(input) {
    return /^[\u4e00-\u9fa5·]+$/.test(input);
  },
  checkOnlyEngAndNum(input) {
    return /^[a-zA-Z0-9]+$/.test(input);
  },
  checkOnlyCnEnNum(input) {
    return /^[a-zA-Z0-9\u4e00-\u9fa5]+$/.test(input);
  },
  checkPrice(input) {
    if (input == 0) return false;
    if (Number.isNaN(Number(input))) return false;

    return /^\d+(.\d{1,2})?$/.test(input);
  },
  checkTrueName(input) {
    //验证姓名
    return /^([\u4e00-\u9fa5\·|a-zA-Z\.]{1,30})$/.test(input);
  },
  checkAddress(input) {
    return input.length <= 30 && input.length >= 3 && replaceBlank(input).length >= 1;
  },
  checkAdjustPrice(input) {
    // if (String(input).length > 9) return false;
    // return /^\d+\.?\d*$/.test(input); //判断数字(可能为小数)
    return String(input).length <= 9 && /^\d*\.?\d{1,2}$/.test(input) && Number(input) > 0;
  },
  checkEmail(input) {
    return /\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*/.test(input);
  },
  checkTaxNo(input) {
    //检验税号
    return /^[a-zA-Z0-9]{0,25}$/.test(input);
  },
  checkNickname(input) {
    //检验昵称
    return /^[a-z0-9\u4e00-\u9fa5]+$/i.test(input);
  },
  checkKgInput(input) {
    //校验kg单位的输入
    if (!input) {
      return false;
    }
    if (!Number(input)) {
      return false;
    }
    let gInput = Number(input * 1000); //装换为g单位
    return gInput - parseInt(gInput) === 0;
  }
};

const maskPhone = phone => phone.substr(0, 3) + '****' + phone.substr(7);

const padNumber = n => String(n).padStart(2, 0);

function formatCountdown(countdown) {
  const hour = Math.floor(countdown / (60 * 60 * 1000));
  const min = Math.floor((countdown - hour * 60 * 60 * 1000) / (60 * 1000));
  const sec = Math.floor((countdown - hour * 60 * 60 * 1000 - min * 60 * 1000) / 1000);
  return `${padNumber(hour)}:${padNumber(min)}:${padNumber(sec)}`;
}

/**
 *
 * @param {Number} duration 倒计时总时长, 单位: 微秒
 * @param {Function} update 更新回调函数, 第一个参数为格式化的时分秒, 第二个为timer, 可以主动关掉定时器, 防止内存泄漏
 * @param {Function} complete 完成回调函数
 */
function countdown(duration, update, complete) {
  let n = Number(duration);
  console.log('@countdown duration => ', n);

  let timer = null;
  const fn = () => {
    n -= 1000;

    if (n >= 0) return update(formatCountdown(n), timer);

    if (timer) clearInterval(timer);
    complete();
  };

  fn();
  timer = setInterval(fn, 1000);
}

/**
 *
 * @param {Object} obj 目标对象
 * @returns &拼接的字符串
 */
const qs = obj =>
  Object.keys(obj)
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(obj[key])}`)
    .join('&');

function encryptData(data) {
  var encrypt = new JSEncrypt();
  encrypt.setPublicKey(table[Config.current].RSAPublicKey);
  return encrypt.encryptLong(data);
}

function decryptEPay(data) {
  var decrypt = new JSEncrypt();
  decrypt.setPrivateKey(table[Config.current].ePayKey);
  var uncrypted = decrypt.decrypt(data);
  return uncrypted;
}

function sleep(num) {
  return new Promise(resolve => {
    setTimeout(() => resolve(), num * 1000);
  });
}
function replaceBlank(input) {
  return input ? input.replace(/\s+/g, '') : '';
}
function byteConvert(bytes, j) {
  if (bytes < 1000 && !j) return bytes + 'B';
  var k = 1024; // 1024
  var sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  var i = 0;
  if (j) {
    i = j;
    return parseFloat((bytes / Math.pow(k, i)).toPrecision()).toFixed(2);
  } else {
    i = Math.floor(Math.log(bytes) / Math.log(k));
  }
  return parseFloat((bytes / Math.pow(k, i)).toPrecision()).toFixed(2) + ' ' + sizes[i];
}
const getFloat = function (num, point = 2) {
  if (!num) {
    return Number(0).toFixed(point);
  }
  return Number(num).toFixed(point);
};
export {
  validator,
  getFilePrefix,
  byteConvert,
  formatTime,
  maskPhone,
  countdown,
  qs,
  encryptData,
  decryptEPay,
  sleep,
  replaceBlank,
  getFloat
};

exports.default = {
  validator,
  getFilePrefix,
  byteConvert,
  formatTime,
  maskPhone,
  countdown,
  qs,
  encryptData,
  sleep,
  replaceBlank,
  getFloat
};
