import request from './request';
import { APP_MODE } from './auth';

let list = null;

async function fetchData() {
  const res = await request({
    url: '/xct/regions/listAllRegions',
    option: { tokenEnable: true, isClient: wx.getStorageSync('mode') === APP_MODE.C },
  });
  return res.data;
}
async function getData() {
  if (list) return list;

  const res = await fetchData();
  list = normalizeList(res);
  return list;
}

function normalizeList(list) {
  let result = {
    province_list: {},
    city_list: {},
    county_list: {},
  };

  list.forEach(item => {
    switch (item.type) {
      case 1:
        result.province_list[item.code] = item.name;
        break;
      case 2:
        result.city_list[item.code] = item.name;
        break;
      case 3:
        result.county_list[item.code] = item.name;
      default:
        break;
    }
  });

  result = {
    province_list: sortObj(result.province_list),
    city_list: sortObj(result.city_list),
    county_list: sortObj(result.county_list),
  };

  return result;
}

function sortObj(obj) {
  const result = {};
  Object.keys(obj)
    .sort()
    .forEach(key => (result[key] = obj[key]));
  return result;
}

export { getData };
