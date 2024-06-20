// 开票详情

const computedBehavior = require('miniprogram-computed').behavior;
import { recordDetail } from '../../../../api/invoice';
Page({
  behaviors: [computedBehavior],
  data: {
    status: 3, // 发票申请状态：0-预开票 1-待开票 2-换开票中 3-已开票 4-换开票成功
    orders: [],
    detail: {},
    applyType: 3,
    id: 0,
  },
  computed: {},
  onLoad: function (options) {
    this.setData({
      id: options.id,
    });
  },
  onShow: function () {
    this.init();
  },
  init() {
    this.fetchData();
  },
  async fetchData() {
    const params = { id: this.data.id };
    const res = await recordDetail(params);
    console.warn('res', res);
    this.setData({
      status: res.invoiceApplyStatus,
      // orders: res.orders,
      applyType: res.applyType,
      detail: res,
    });
  },
  openContact() {
    this.selectComponent('#contact').setData({ show: true });
  },
  changeInvoiceTitle(e) {
    // 修改抬头/换开
    const { item } = e.currentTarget.dataset;
    console.log('item', item);
    wx.navigateTo({
      url: `/subpackages/business/pages/invoice-open/index?id=${this.data.id}&status=${item.invoiceApplyStatus}&applyType=${this.data.applyType}`,
    });
  },
});
