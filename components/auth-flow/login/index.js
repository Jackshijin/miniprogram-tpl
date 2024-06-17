// index.js
import { storeBindingsBehavior } from 'mobx-miniprogram-bindings';
import { store } from '../../../store/index';
import Helper from '../../../utils/helper';
import { updateUserInfo } from '../../../api/test';
Component({
  /**
   * 组件的属性列表
   */
  properties: {},
  behaviors: [storeBindingsBehavior],
  storeBindings: {
    store,
    fields: ['showAuthLogin', 'hasLogin', 'userinfo'],
    actions: ['updateUIAuthLogin'],
  },
  /**
   * 组件的初始数据
   */
  data: {
    //兼容自定义tabbar
    customClass: '',
  },
  attached() {
    this.init();
  },
  detached() {
    getApp().Bus.off('onLoginSuccess', this);
  },
  /**
   * 组件的方法列表
   */
  methods: {
    init() {
      console.$login = this;
      console.$h = Helper;
      if (Helper.getTabBarInstance) {
        this.setData({
          customClass: 'is-tabbar',
        });
      }
      getApp().Bus.on('onLoginSuccess', this, e => {
        console.log('onLoginSuccess 登录成功的回调');
      });
    },
    onClose() {
      this.updateUIAuthLogin(false);
    },
    async onGetUerInfo(e) {
      console.log('onGetUerInfo e', e.detail);
      if (!e.detail.userInfo) {
        return wx.showToast({
          title: 'fail',
          icon: 'none',
        });
      }
      const res = await updateUserInfo({
        ...e.detail.userInfo,
      });
      console.log('onGetUerInfo res', res);
      store.updateUserinfo({ ...res.userinfo, token: res.token });
    },
    onGetPhone(e) {
      console.log('onGetPhone e', e.detail);
    },
  },
});
