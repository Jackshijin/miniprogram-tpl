/**
 * 存储的token别名
 */
export const ALIAS_TOKEN = 'client_token';
//REQ开头的是接口返回的code，msg的名字
export const REQ_CODE = 'rcode';
export const REQ_MSG = 'msg';
export const CODE_SUCCESS = 200;
export const CODE_SUCCESS2 = 2000;
export const CODE_NOLOGIN = 702;
export const CODE_LOGINTWO = 600; //需要注册授权
export const LOADINGMORE_STATUS = {
	IDLE: -1, // 空闲状态 => 什么都不显示
	INIT: 0, // 未加载 => 正在加载更多
	DOING: 1, // 正在加载 => 正在加载中
	NOMORE: 2, // 没有更多 => 没有更多数据
};
export default { ALIAS_TOKEN, REQ_CODE };
