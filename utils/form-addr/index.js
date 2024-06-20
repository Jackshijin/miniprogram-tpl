import request from '../../utils/request';
import { validator } from '../../utils/util';
import { APP_MODE } from '../../utils/auth';
import { getData } from '../../utils/area';
const computedBehavior = require('miniprogram-computed').behavior;

Component({
  behaviors: [computedBehavior],
  properties: {
    primaryKey: Number,
    payload: String,
  },
  data: {},
  computed: {
    canISubmit(data) {
      return !data.receiverName || !data.phone || !data.address || !data.locationText;
    },
    locationText(data) {
      if (data.provinceName && data.cityName && data.areaName) {
        return `${data.provinceName} ${data.cityName} ${data.areaName}`;
      }
      return '';
    },
  },
  pageLifetimes: {
    show: async function () {
      if (this.data.primaryKey) {
        wx.showLoading({ title: '请稍等', mask: true });
        Promise.all([this.loadArea(), this.loadData()]).then(wx.hideLoading);
      } else if (this.data.payload) {
        const payload = JSON.parse(this.data.payload);

        this.setData({
          payload,
          receiverName: payload.userName,
          phone: payload.telNumber,
          provinceName: payload.provinceName,
          cityName: payload.cityName,
          areaName: payload.countyName,
          address: payload.detailInfo,
        });

        wx.showLoading({ title: '请稍等' });
        this.loadArea().then(wx.hideLoading).catch(wx.hideLoading);
      } else {
        wx.showLoading({ title: '请稍等', mask: true });
        this.loadArea().then(wx.hideLoading).catch(wx.hideLoading);
      }
    },
  },
  methods: {
    loadData() {
      const { primaryKey } = this.data;
      return new Promise((resolve, reject) => {
        request({
          url: '/xct/receiveAddress/list',
          option: { tokenEnable: true, isClient: wx.getStorageSync('mode') === APP_MODE.C },
        })
          .then(res => {
            const item = res.data.filter(item => item.id === Number(primaryKey))[0];
            this.setData({ ...item });
            wx.hideLoading();
            resolve();
          })
          .catch(err => {
            wx.hideLoading();
            if (err.respCode === 5000) {
              wx.showToast({
                title: err.respMsg,
                icon: 'none',
              });
            }
            reject();
          });
      });
    },
    async loadArea() {
      try {
        const areaList = await getData();
        this.setData({ areaList });
        return Promise.resolve();
      } catch (err) {
        return Promise.reject(err);
      }
    },
    showAddrDialog() {
      this.setData({ isShowArea: true });
    },
    hideAddrDialog() {
      this.setData({ isShowArea: false });
    },
    submit() {
      let {
        userId,
        id,
        receiverName,
        phone,
        address,
        provinceCode,
        provinceName,
        cityCode,
        cityName,
        areaCode,
        areaName,
        locationText,

        primaryKey,
      } = this.data;

      if (!/^[a-zA-Z\u4e00-\u9fa5·]{1,30}$/.test(receiverName)) {
        return wx.showToast({ title: '收货人格式不正确', icon: 'none' });
      }
      if (!validator.checkPhone(phone)) {
        return wx.showToast({ title: '手机号格式不正确', icon: 'none' });
      }
      if (!locationText) {
        return wx.showToast({ title: '请选择省市区', icon: 'none' });
      }
      if (!address) {
        return wx.showToast({ title: '详细地址不能为空', icon: 'none' });
      }

      let form = {
        receiverName,
        phone,
        provinceCode,
        provinceName,
        cityCode,
        cityName,
        areaCode,
        areaName,
        address,
      };

      if (primaryKey) {
        form = { userId, id, ...form };
      }

      this.triggerEvent('submit', form);
    },

    setDefaultAddress() {
      wx.showLoading({ title: '加载中', mask: true });
      let { id } = this.data;
      return new Promise((resolve, reject) => {
        request({
          url: '/xct/receiveAddress/markDefault',
          data: { id },
          option: { tokenEnable: true, isClient: wx.getStorageSync('mode') === APP_MODE.C },
        })
          .then(res => {
            console.log('res:', res);
            wx.hideLoading();
            wx.showToast({
              title: res.respMsg,
            });
            resolve();
          })
          .catch(err => {
            console.log('err:', err);
            wx.hideLoading();
            if (err.respCode === 5000) {
              wx.showToast({
                title: err.respMsg,
                icon: 'none',
              });
            }
            reject();
          });
      });
    },

    getProvincesData() {
      return new Promise((resolve, reject) => {
        request({
          url: '/xct/regions/listProvinces',
          option: { tokenEnable: true, isClient: wx.getStorageSync('mode') === APP_MODE.C },
        })
          .then(res => {
            console.log('res:', res);
            let provincesList = {},
              areaList = {};
            res.data.map((item, index) => {
              provincesList[item.code] = item.name;
            });
            areaList['province_list'] = provincesList;
            this.setData({
              areaList,
            });
            console.log('debug => ', this.data.areaList);
            resolve();
          })
          .catch(err => {
            console.log('err:', err);
            if (err.respCode === 5000) {
              wx.showToast({
                title: err.respMsg,
                icon: 'none',
              });
            }
            reject();
          });
      });
    },

    getRegionsData(parentCode, type) {
      return new Promise((resolve, reject) => {
        request({
          url: '/xct/regions/listRegions',
          data: {
            parentCode,
          },
          option: { tokenEnable: true, isClient: wx.getStorageSync('mode') === APP_MODE.C },
        })
          .then(res => {
            console.log('res:', res);
            let _list = {},
              areaList = this.data.areaList;
            res.data.map((item, index) => {
              _list[item.code] = item.name;
            });
            if (type === 0) {
              areaList['city_list'] = _list;
            } else {
              areaList['county_list'] = _list;
            }
            this.setData({
              areaList,
            });
            console.log('debug => ', this.data.areaList);
            resolve();
          })
          .catch(err => {
            console.log('err:', err);
            if (err.respCode === 5000) {
              wx.showToast({
                title: err.respMsg,
                icon: 'none',
              });
            }
            reject();
          });
      });
    },

    selectArea({ detail }) {
      if (detail.index !== 2) {
        let code = detail.values[detail.index].code;
        this.getRegionsData(code, detail.index);
      }
      // this.setData({addressData: detail.values})
    },
    confirmArea({ detail }) {
      console.log('@confirm => ', detail);
      let provinceCode = detail.values[0].code;
      let provinceName = detail.values[0].name;
      let cityCode = detail.values[1] ? detail.values[1].code : '';
      let cityName = detail.values[1] ? detail.values[1].name : '';
      let areaCode = detail.values[2] ? detail.values[2].code : '';
      let areaName = detail.values[2] ? detail.values[2].name : '';
      // this.setData({addressData: detail.values})
      this.setData({
        provinceCode,
        provinceName,
        cityCode,
        cityName,
        areaCode,
        areaName,
        isShowArea: false,
      });
    },

    onChangeSwitch({ detail }) {
      this.setData({ isDefault: detail });
    },
  },
});
