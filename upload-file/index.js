const computedBehavior = require('miniprogram-computed').behavior;

Component({
  behaviors: [computedBehavior],
  properties: {
    filename: String,
    size: String,
    showPreview: {
      type: Boolean,
      default: false,
    },
    previewUrl: String,
  },
  computed: {
    fileType(data) {
      const extension = data.filename.split('.').pop();
      if (['doc', 'docx'].includes(extension)) return 'word';
      if (['xls', 'xlsx'].includes(extension)) return 'excel';
      if (['pdf'].includes(extension)) return 'pdf';

      return 'file_default';
    },
    fileSize(data) {
      if (data.size < 1000) {
        return data.size + 'B';
      } else if (data.size < 1000 * 1000) {
        return (data.size / 1000).toFixed(3) + 'KB';
      } else {
        return (data.size / 1000 / 1000).toFixed(3) + 'MB';
      }
    },
  },
  methods: {
    clickClose() {
      this.triggerEvent('clickClose');
    },
    preview(url) {
      const self = this;
      wx.showLoading({ title: '请稍等', mask: true });
      wx.downloadFile({
        url: self.data.previewUrl,
        success(res) {
          wx.hideLoading();
          if (res.statusCode === 200) {
            let path = res.tempFilePath; //返回的文件临时地址，用于后面打开本地预览所用
            wx.openDocument({
              filePath: path, //要打开的文件路径
              success: wx.hideLoading,
            });
          }
        },
        fail(err) {
          console.error(err);
          wx.showToast({ icon: 'none', title: '加载失败, 请重试' });
        },
      });
    },
  },
});
