// index.js 短信验证码输入弹窗

// import request from '../../utils/request';
import { maskPhone } from '../../utils/util';
const computedBehavior = require('miniprogram-computed').behavior;
let timer = null;
let triggerFlag = false; //某些机子自动填充会触发多次提交
const durationInit = 60;

Component({
  behaviors: [computedBehavior],
  /**
   * 组件的属性列表
   */
  properties: {
    type: {
      //验证码的type
      /**
       *     ALIYUN_REGISTER("", "通用-获取验证码",1),
    ALIYUN_BIND_CODE("", "通用-换绑验证",2),
   ALIYUN_BIZ_ACCOUNT_WITHDRAW_APPLY("", "商户端-提现申请安全验证",16),
       */
      type: Number,
      value: 16,
    },
  },

  /**
   * 组件的初始数据
   */
  data: {
    show: false,
    duration: durationInit, //默认的倒计时时间
    focus: false,
    num: [],
  },
  attached() {
    // console.$ds = this;
  },
  computed: {
    maskPhone(data) {
      return data.phone ? maskPhone(data.phone) : '';
    },
  },
  /**
   * 组件的方法列表
   */
  methods: {
    sendCode() {
      //发送验证码的方法
      return new Promise((resolve, reject) => {
        resolve();
        //   request({
        //     url: '/xct/auth/smsCodes',
        //     data: { mobile: this.data.phone, type: this.data.type },
        //     option: { tokenEnable: true, isClient: false },
        //   })
        //     .then(resolve)
        //     .catch(reject);
      });
    },
    init(item = { phone: '' }) {
      this.setData(
        {
          phone: item.phone,
          show: !!item.phone,
        },
        () => {
          this.onGetSms();
        },
      );
    },
    close() {
      this.setData({
        show: false,
      });
    },
    async onGetSms(e) {
      this.sendCode().then(() => {
        e &&
          wx.showToast({
            title: '发送验证码成功',
            icon: 'none',
          });
        this.setData(
          {
            show: true,
            val: '',
            duration: durationInit,
            num: [],
          },
          () => {
            clearTimeout(timer);
            this.runTimer();
          },
        );
      });
    },
    runTimer() {
      let { duration } = this.data;
      if (duration <= 0) {
        clearTimeout(timer);
        return;
      }
      timer = setTimeout(() => {
        duration--;
        this.setData({
          duration,
        });
        this.runTimer();
      }, 1000);
    },
    onInpBlur() {
      this.setData({
        focus: false,
      });
    },
    submitSms(val) {
      this.triggerEvent('submitSms', val);
    },
    onFocusInp(e) {
      this.setData({
        focus: true,
      });
    },
    onClose() {
      this.setData({
        show: false,
      });
    },
    onInputNum(e) {
      let focus = true;
      if (e.detail.value.length > 3) {
        focus = false;
        if (triggerFlag) {
          return;
        }
        this.submitSms(e.detail.value);
        triggerFlag = true;
        setTimeout(() => {
          triggerFlag = false;
        }, 1000);
      }
      this.setData({
        focus,
        num: e.detail.value.split(''),
      });
    },
  },
});
