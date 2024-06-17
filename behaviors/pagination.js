import { LOADINGMORE_STATUS } from '../constants/index';
const computedBehavior = require('miniprogram-computed').behavior;

module.exports = Behavior({
  behaviors: [computedBehavior],
  data: {
    LOADINGMORE_STATUS,
    currentLoadingMoreStatus: LOADINGMORE_STATUS.IDLE,
  },
  methods: {
    resetLoadingmore: function () {
      this.setData({ currentLoadingMoreStatus: LOADINGMORE_STATUS.IDLE });
    },
    setLoadingmoreBegin: function () {
      this.setData({ currentLoadingMoreStatus: LOADINGMORE_STATUS.INIT });
    },
    setLoadingmoreDoing: function () {
      this.setData({ currentLoadingMoreStatus: LOADINGMORE_STATUS.DOING });
    },
    setLoadingNomore() {
      this.setData({ currentLoadingMoreStatus: LOADINGMORE_STATUS.NOMORE });
    },
    triggerReachBottom() {
      this.setLoadingmoreBegin();
      if (this.data.loadAll) {
        return this.setLoadingNomore();
      }
      setTimeout(() => {
        this.setLoadingmoreDoing();
        this.fetchList()
          .then(() => this.resetLoadingmore())
          .catch(() => this.setLoadingNomore());
      }, 800);
    },
  },
});
