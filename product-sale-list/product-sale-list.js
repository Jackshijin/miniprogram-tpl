// subpackages/client/pages/product-sale-list/product-sale-list.js
import { getGoodsList } from '../../../../api/onepay';
import { getSearchList } from '../../../../api/search';
const loadingmoreBehavior = require('../../../../behaviors/pagination');
import { sleep } from '../../../../utils/util';

let viewTime; //统计浏览时间
const userinfo = wx.getStorageSync('c_userinfo');

const pageOption = {
  //翻页
  pageCurrent: 1,
  pageSize: 10
};
Page({
  behaviors: [loadingmoreBehavior],
  /**
   * 页面的初始数据
   */
  data: {
    id: 0, //pageType=0，已开售商品会有id
    title: '已开售商品',
    list: [],
    loadAll: false,
    pageType: 0 //pageType，0:已开售商品，1:一口价商品
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    pageOption.pageCurrent = 1;
    const { type = 0, id = 0 } = options;
    let title = '';
    switch (
      Number(type) //根据type来显示列表，0:已开售商品，1:一口价商品
    ) {
      case 0:
        title = '已开售商品';
        break;
      case 1:
        title = '一口价商品';
        break;
    }
    wx.setNavigationBarTitle({ title });
    this.setData({ pageType: Number(type), title, id });
    this.fetchList();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    viewTime = Date.now();
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    getApp().trackEvent('Um_Event_FpItemList', {
      Um_Key_UserId: userinfo.id,
      Um_Key_Status: userinfo.status,
      Um_Key_Duration: (Date.now() - viewTime) / 1000,
      Um_Key_UserLevel: wx.getStorageSync('c_vipinfo').levelName
    });
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    getApp().trackEvent('Um_Event_FpItemList', {
      Um_Key_UserId: userinfo.id,
      Um_Key_Status: userinfo.status,
      Um_Key_Duration: (Date.now() - viewTime) / 1000,
      Um_Key_UserLevel: wx.getStorageSync('c_vipinfo').levelName
    });
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {},

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: async function () {
    if (this.data['loadAll']) {
      this.setLoadingNomore();
      return;
    }
    this.setLoadingmoreBegin();
    await sleep(0.8);
    this.setLoadingmoreDoing();
    this.fetchList()
      .then(() => this.resetLoadingmore())
      .catch(() => this.setLoadingNomore());
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {},
  async fetchList() {
    const { pageType } = this.data;
    if (this.data.loadAll) {
      return;
    }
    let { loadAll, list } = this.data;
    let res;
    if (pageType === 1) {
      res = await getGoodsList({
        ...pageOption
      });
      res.data.map(item => {
        item.productUrl = item.itemCover?.split(';')[0] || item.productUrl?.split(';')[0];
      });
    } else {
      res = await getSearchList({
        productId: this.data.id,
        ...pageOption
      });
      res.data.map(item => {
        //接口返回的字段有点不统一啊
        item.itemType = item.type || item.itemType;
        item.productUrl = item.itemCover?.split(';')[0] || item.productUrl?.split(';')[0];
      });
    }
    if (!res) {
      return;
    }
    pageOption.pageCurrent += 1;
    list = list.concat(res.data);
    if (res.data.length < pageOption.pageSize) {
      loadAll = true;
    }
    console.log('list', list, loadAll);
    this.setData({
      loadAll,
      list
    });
  }
});
