/**
 * 很简单的一个event-bus
 */
export default {
  events: [], //存储事件
  //订阅
  on(name, ctx, cb) {
    console.warn('BUS on ', name, ctx);
    this.events.push({
      name,
      id: Date.now(),
      nodeId: ctx.__wxExparserNodeId__, //当前节点的id，用于删除特定节点里面的事件
      ctx,
      cb,
    });
  },
  //触发事件
  emit(name, params) {
    this.events.map(item => {
      if (item.name === name) {
        console.warn('BUS emit ', name, params);
        if (item.cb) {
          item.cb = item.cb.bind(item.ctx);
          item.cb(params);
        }
      }
    });
  },
  //删除事件
  off(name, ctx) {
    //ctx可以不传，不传的话会删除所有的节点下为name的事件
    console.warn('BUS off', name);
    let newEvents = [];
    this.events.map(item => {
      if (ctx) {
        if (item.name !== name && ctx.__wxExparserNodeId__ !== item.nodeId) {
          newEvents.push(item);
        }
      } else {
        if (item.name !== name) {
          newEvents.push(item);
        }
      }
    });
    this.events = newEvents;
  },
};
