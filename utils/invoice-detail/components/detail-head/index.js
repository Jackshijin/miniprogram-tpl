
// 开票详情头部组件


const computedBehavior = require('miniprogram-computed').behavior;

Component({
  behaviors: [computedBehavior],
  properties: {
    status: {
      // 发票申请状态：0-预开票 1-待开票 2-换开票中 3-已开票 4-换开票成功
      type: Number,
      value: -1
    },
    invoices: {
      type: Array,
      value: []
    }
    // invoices: {
    //   // 发票文件 [<{url, size, name}>]
    //   type: Array,
    //   value: []
    // }
  },
  data: {
    show: false,
    invoiceImgUrl: "https://static.xiaochatai.com/weapp/invoce/invoice_view.jpg"
  },
  computed: {
    
  },
  methods: {
    onDialogClose() {
      this.setData({
        show: false
      })
    },
    checkDetailInvoice() {
      this.setData({
        show: true
      })
    },
    previewInvoice(e) {
      const invoice = e.currentTarget.dataset.item
      const { fileInfo } = invoice
      if (!fileInfo.url) {
        wx.showToast({icon: 'none', title: '无法预览该发票，请联系客服~'})
        return false
      }
      wx.showLoading({ title: '正在加载文件', mask: true })
      wx.downloadFile({
        url:fileInfo.url,
        success(res) {
          wx.hideLoading();
          if (res.statusCode === 200) {
            let path = res.tempFilePath; 
            wx.openDocument({
              filePath: path,
              success: wx.hideLoading,
            });
          }
        },
        fail(err) {
          console.error(err);
          wx.showToast({ icon: 'none', title: '加载失败, 请重试' })
        },
      });
    }
  }
})