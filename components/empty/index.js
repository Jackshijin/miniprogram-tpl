// 增加外部复写样式
Component({
  properties: {
    picSrc: {
      type: String,
      value: 'https://static.xiaochatai.com/weapp/pic_empty.svg',
    },
    desc: {
      type: String,
      value: '暂无记录',
    },
  },
  options: {
    styleIsolation: 'isolated',
  },
  externalClasses: ['empty-dialog'],
});
