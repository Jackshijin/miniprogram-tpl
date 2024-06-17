const computedBehavior = require('miniprogram-computed').behavior;
import { LOADINGMORE_STATUS } from '../../constants/index';

Component({
  behaviors: [computedBehavior],
  properties: {
    status: {
      type: Number,
      default: -1,
      // 状态与behaviors/pagination.js保持统一
    },
  },
  data: {
    LOADINGMORE_STATUS,
  },
  computed: {
    loadingMoreHint(data) {
      switch (data.status) {
        case LOADINGMORE_STATUS.INIT:
          return '正在加载更多';
        case LOADINGMORE_STATUS.DOING:
          return '加载中...';
        case LOADINGMORE_STATUS.NOMORE:
          return '没有更多数据了';
        default:
          return '';
      }
    },
  },
});
