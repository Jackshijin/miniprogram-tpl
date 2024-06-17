const app = getApp();

/**
 * 获取共享的navbar相关的高度, 以便在wxml中直接使用
 */
module.exports = Behavior({
  data: {
    navbarHeight: 0,
    statusBarHeight: 0,
    toolbarHeight: 0,
  },
  attached: function () {
    this.setData({
      navbarHeight: app.globalData.navbarHeight,
      statusBarHeight: app.globalData.statusBarHeight,
      toolbarHeight: app.globalData.toolbarHeight,
    });
  },
});
