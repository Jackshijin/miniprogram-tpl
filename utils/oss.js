import request from './request';

let config = null;

const oss = {
  async fetchSetting() {
    const res = await request({ url: '/xct/file/policy' });
    config = res.data;
  },
  /**
   * 上传单个图片
   * @param {string} file 微信本地图片的路径, 形如: http://tmp/NdIMdSwfnGw28f32e28e8cac9769795ef21578aca1c1.png
   */
  async upload(file) {
    if (!config) await this.fetchSetting();

    const fileName = file.substr(file.lastIndexOf('/') + 1);

    const form = {
      key: `${config.dir}${fileName}`,
      policy: config.policy,
      OSSAccessKeyId: config.accessid,
      signature: config.signature,
    };

    return await new Promise((resolve, reject) => {
      wx.uploadFile({
        url: config.host,
        filePath: file,
        name: 'file',
        formData: form,
        success: res => {
          if (res.statusCode === 204) {
            const url = `${config.cdnHost}/${config.dir}${fileName}`;
            resolve({ url, fileName });
          } else {
            reject(res);
          }
        },
        fail: reject,
      });
    });
  },
  /**
   * 上传多个图片
   * @param {Array} files 微信本地图片地址的列表, 具体格式参考upload
   */
  async uploadMulti(files) {
    if (!config) await this.fetchSetting();

    return await Promise.all(files.map(f => this.upload(f)));
  },
};

export { oss };
export default oss;
