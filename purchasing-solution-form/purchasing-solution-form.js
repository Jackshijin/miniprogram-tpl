import oss from '../../../../utils/oss';
import request from '../../../../utils/request';
Page({
  data: {
    demandId: -1,
    content: '',
    imageList: [],
    fileList: [],
  },
  onLoad: function ({ id }) {
    this.setData({ id });

    wx.enableAlertBeforeUnload({
      message: '确定清空内容放弃编辑并返回吗？',
    });
  },
  bindKeyInput(event) {
    const { key, maxlength } = event.currentTarget.dataset;
    let { value } = event.detail;
    console.log({ value, key, maxlength });
    if (maxlength && value.length > maxlength) {
      console.log('@if');
      value = value.substring(0, maxlength);
    }
    this.setData({ [key]: value });
  },
  async afterMultiRead(event) {
    wx.showLoading({ title: '正在上传...', mask: true });
    const { file: imageList } = event.detail;

    try {
      const res = await oss.uploadMulti(imageList.map(i => i.url));
      this.setData({ imageList: [...this.data.imageList, ...res] });
      wx.hideLoading();
    } catch (err) {
      console.error(err);
      wx.showToast({ title: '上传失败', icon: 'none' });
    }
  },
  onDelete(event) {
    let { imageList } = this.data;
    imageList.splice(event.detail.index, 1);
    this.setData({ imageList });
  },
  addFile(event) {
    const self = this;
    wx.chooseMessageFile({
      count: 3 - self.data.fileList.length,
      type: 'file',
      extension: ['pdf', 'doc', 'docx'],
      success(res) {
        if (res.tempFiles.some(file => file.size > 50 * 1000 * 1000)) {
          return wx.showToast({ title: '文件不能超过50M', icon: 'none' });
        }
        self.setData({
          fileList: [...self.data.fileList, ...res.tempFiles],
        });
      },
    });
  },
  delFile(event) {
    const { index } = event.currentTarget.dataset;
    this.data.fileList.splice(index, 1);
    this.setData({ fileList: this.data.fileList });
  },
  submit() {
    const self = this;
    if (self.data.content === '') {
      return wx.showToast({ title: '内容不能为空', icon: 'none' });
    }

    wx.showLoading({ title: '请稍等', icon: 'none', mask: true });
    oss
      .uploadMulti(self.data.fileList.map(i => i.path))
      .then(res => res.map(i => i.url))
      .then(urls =>
        request({
          url: '/xct/customizedDemandSchema/add',
          data: {
            demandId: self.data.id,
            content: self.data.content,
            imageURLs: self.data.imageList.map(item => item.url),
            pdfFileInfos: self.data.fileList.map((item, index) => ({
              name: item.name,
              size: item.size,
              url: urls[index],
            })),
          },
          option: { tokenEnable: true },
        }),
      )
      .then(res => {
        wx.hideLoading();
        wx.redirectTo({ url: '/subpackages/client/pages/purchasing-solution-result/purchasing-solution-result' });
      })
      .catch(err => {
        wx.hideLoading();
        if (err && err.respCode === 5000) {
          wx.showToast({ title: err.respMsg, icon: 'none' });
        } else {
          wx.showToast({ title: '请重试', icon: 'none' });
        }
      });
  },
});
