import REGION_DATA from 'china-area-data';
import { cloneDeep } from 'lodash-es';

// code转汉字大对象
const CodeToText = {};
// 汉字转code大对象
const TextToCode = {};
const provinceObject = REGION_DATA['86']; // 省份对象
const regionData = [];
let provinceAndCityData = [];

CodeToText[''] = '全部';

const gy_area = [
  { code: '110000', name: '北京市' },
  { code: '310000', name: '上海市' },
  { code: '440000', name: '广东省' },
  { code: '320000', name: '江苏省' },
  { code: '330000', name: '浙江省' },
  { code: '350000', name: '福建省' },
  { code: '370000', name: '山东省' },
  { code: '420000', name: '湖北省' },
  { code: '430000', name: '湖南省' },
  { code: '340000', name: '安徽省' },
  { code: '510000', name: '四川省' },
  { code: '500000', name: '重庆市' },
  { code: '610000', name: '陕西省' },
  { code: '130000', name: '河北省' },
  { code: '410000', name: '河南省' },
  { code: '140000', name: '山西省' },
  { code: '120000', name: '天津市' },
  { code: '360000', name: '江西省' },
  { code: '450000', name: '广西壮族自治区' },
  { code: '530000', name: '云南省' },
  { code: '520000', name: '贵州省' },
  { code: '460000', name: '海南省' },
  { code: '210000', name: '辽宁省' },
  { code: '220000', name: '吉林省' },
  { code: '230000', name: '黑龙江省' },
  { code: '150000', name: '内蒙古自治区' },
  { code: '650000', name: '新疆维吾尔自治区' },
  { code: '620000', name: '甘肃省' },
  { code: '640000', name: '宁夏回族自治区' },
  { code: '630000', name: '青海省' },
  { code: '540000', name: '西藏自治区' },
  { code: '810000', name: '香港特别行政区' },
  { code: '820000', name: '澳门特别行政区' },
  { code: '710000', name: '台湾省' },
];

// 计算省
// for (const prop in provinceObject) {
//   regionData.push({
//     value: prop, // 省份code值
//     label: provinceObject[prop], // 省份汉字
//   });
//   CodeToText[prop] = provinceObject[prop];
//   TextToCode[provinceObject[prop]] = {
//     code: prop,
//   };
//   TextToCode[provinceObject[prop]]['全部'] = {
//     code: '',
//   };
// }

for (const item_i in gy_area) {
  let item = gy_area[item_i];
  regionData.push({
    value: item.code, // 省份code值
    label: item.name, // 省份汉字
  });
  CodeToText[item.code] = item.name;

  TextToCode[item.name] = {
    code: item.code,
  };
  TextToCode[item.name]['全部'] = {
    code: '',
  };
}

// 计算市
for (let i = 0, len = regionData.length; i < len; i++) {
  const provinceCode = regionData[i].value;
  const provinceText = regionData[i].label;
  const provinceChildren = [];
  for (const prop in REGION_DATA[provinceCode]) {
	const cityText = ['市辖区'].includes(REGION_DATA[provinceCode][prop]) ? provinceText : REGION_DATA[provinceCode][prop];
    provinceChildren.push({
      value: prop,
      label: cityText,
    });
    CodeToText[prop] = cityText;
    TextToCode[provinceText][cityText] = {
      code: prop,
    };
    TextToCode[provinceText][cityText]['全部'] = {
      code: '',
    };
  }
  if (provinceChildren.length) {
    regionData[i].children = provinceChildren;
  }
}
provinceAndCityData = cloneDeep(regionData);

// 计算区
for (let i = 0, len = regionData.length; i < len; i++) {
  const province = regionData[i].children;
  const provinceText = regionData[i].label;
  if (province) {
    for (let j = 0, len = province.length; j < len; j++) {
      const cityCode = province[j].value;
      const cityText = province[j].label;
      const cityChildren = [];
      for (const prop in REGION_DATA[cityCode]) {
        cityChildren.push({
          value: prop,
          label: REGION_DATA[cityCode][prop],
        });
        CodeToText[prop] = REGION_DATA[cityCode][prop];
        TextToCode[provinceText][cityText][REGION_DATA[cityCode][prop]] = {
          code: prop,
        };
      }
      if (cityChildren.length) {
        province[j].children = cityChildren;
      }
    }
  }
}

// 添加“全部”选项
const provinceAndCityDataPlus = cloneDeep(provinceAndCityData);
provinceAndCityDataPlus.unshift({
  value: '',
  label: '全部',
});
for (let i = 0, len = provinceAndCityDataPlus.length; i < len; i++) {
  const province = provinceAndCityDataPlus[i].children;
  if (province && province.length) {
    province.unshift({
      value: '',
      label: '全部',
    });
    for (let j = 0, len = province.length; j < len; j++) {
      const city = province[j].children;
      if (city && city.length) {
        city.unshift({
          value: '',
          label: '全部',
        });
      }
    }
  }
}

const regionDataPlus = cloneDeep(regionData);
regionDataPlus.unshift({
  value: '',
  label: '全部',
});
for (let i = 0, len = regionDataPlus.length; i < len; i++) {
  const province = regionDataPlus[i].children;
  if (province && province.length) {
    province.unshift({
      value: '',
      label: '全部',
    });

    for (let j = 0, len = province.length; j < len; j++) {
      const city = province[j].children;
      if (city && city.length) {
        city.unshift({
          value: '',
          label: '全部',
        });
      }
    }
  }
}
//--begin--@updateBy:liusq----date:20210922---for:省市区三级联动需求方法-----
//省份数据
const provinceOptions = [];
for (const item_i in gy_area) {
  let item = gy_area[item_i];
  provinceOptions.push({
    value: item.code, // 省份code值
    label: item.name, // 省份汉字
  });
}
/**
 * 根据code获取下拉option的数据
 * @param code
 * @returns []
 */
function getDataByCode(code) {
  let data = [];
  for (const prop in REGION_DATA[code]) {
    data.push({
      value: prop, // 省份code值
      label: REGION_DATA[code][prop], // 省份汉字
    });
  }
  return data;
}

/**
 * 获取全部省市区的层级
 * @type {Array}
 */
const pca = [];
Object.keys(provinceObject).map((province) => {
  pca.push({ id: province, text: provinceObject[province], pid: '86', index: 1 });
  const cityObject = REGION_DATA[province];
  Object.keys(cityObject).map((city) => {
    pca.push({ id: city, text: cityObject[city], pid: province, index: 2 });
    const areaObject = REGION_DATA[city];
    if (areaObject) {
      Object.keys(areaObject).map((area) => {
        pca.push({ id: area, text: areaObject[area], pid: city, index: 3 });
      });
    }
  });
});

/**
 * 根据code反推value
 * @param code
 * @param level
 * @returns {Array}
 */
function getRealCode(code, level) {
  let arr = [];
  getPcode(code, arr, level);
  return arr;
}
function getPcode(id, arr, index) {
  for (let item of pca) {
    if (item.id === id && item.index == index) {
      arr.unshift(id);
      if (item.pid != '86') {
        getPcode(item.pid, arr, --index);
      }
    }
  }
}

// console.log(getCodeByNames(['北京市']));  // 输出: '110000'
// console.log(getCodeByNames(['北京市', '市辖区']));  // 输出: '110100'
// console.log(getCodeByNames(['北京市', '市辖区', '海淀区']));  // 输出: '110108'
function getCodeByNames(params) {
  let currentLevel = TextToCode;
  for (let i = 0; i < params.length; i++) {
    if (currentLevel.hasOwnProperty(params[i])) {
      currentLevel = currentLevel[params[i]];
    } else {
      return null;
    }
  }
  return currentLevel.code || null;
}

function findTextByCode(data, code) {
  for (let key in data) {
    if (data[key].code === code) {
      return key; // <-- 这里改变了：直接返回 key，而不是 parentKey
    } else if (typeof data[key] === 'object' && data[key] !== null) {
      let result = findTextByCode(data[key], code); // <-- 这里改变了：移除了 key 参数
      if (result) {
        return result;
      }
    }
  }
  return null;
}

function getTextByCode(code) {
  return findTextByCode(TextToCode, code) || '';
}
// function getTextByCode(code) {
//   return CodeToText[code] || '';
// }
//--end--@updateBy:liusq----date:20210922---for:省市区三级联动需求方法-----

/**
 * 给定省份的数组集合，返回对应的城市数组集合
 * @param provinces
 * @returns {Array}
 */
function getCitiesByProvinces(provinces) {
  const cities = [];
  // 确保 provinces 是数组
  const provinceArray = Array.isArray(provinces) ? provinces : Array.from(provinces);

  provinceArray.forEach((provinceName) => {
    if (TextToCode[provinceName]) {
      for (const cityName in TextToCode[provinceName]) {
        // 跳过"全部"和"code"属性
        if (cityName !== '全部' && cityName !== 'code') {
          cities.push({
			name: cityName,
			provinceName
		  });
        }
      }
    }
  });

  return cities;
}

/**
 * 给定城市的数组集合，返回对应的区域数组集合
 * @param cities
 * @returns {Array}
 */
function getRegionsByCities(cities) {
	console.log('ciicicic :', cities, TextToCode)
  const regions = [];
  // 确保 cities 是数组
  const cityArray = Array.isArray(cities) ? cities : Array.from(cities);

  cityArray.forEach((cityItem) => {
    // for (const province in TextToCode) {
	// console.log("city :", city, TextToCode[province][city])
	  const city = cityItem.name;
	  const province = cityItem.provinceName;
      if (TextToCode[province][city]) {
        const cityCode = TextToCode[province][city].code;
        const cityRegions = REGION_DATA[cityCode];
        for (const regionCode in cityRegions) {
          regions.push({
			name: cityRegions[regionCode],
			provinceName: province,
			cityName: city
		  });
        }
        // break;
      }
    // }
  });

  return regions;
}

// 根据省份名称获取城市选项
function getCityOptions(provinceName) {
  const cities = [];
  // 从 TextToCode 中获取省份对应的城市
  if (TextToCode[provinceName]) {
    for (const cityName in TextToCode[provinceName]) {
      // 跳过"全部"和"code"属性
      if (cityName !== '全部' && cityName !== 'code') {
        cities.push(cityName);
      }
    }
  }
  return cities;
}

// 根据城市名称获取区域选项
function getRegionOptions(cityName) {
  const regions = [];
  // 遍历所有省份
  for (const province in TextToCode) {
    // 在当前省份中查找城市
    if (TextToCode[province][cityName]) {
      // 获取城市下的所有区域
      for (const regionName in TextToCode[province][cityName]) {
        // 跳过"全部"和"code"属性
        if (regionName !== '全部' && regionName !== 'code') {
          regions.push({
            value: TextToCode[province][cityName][regionName].code,
            label: regionName,
          });
        }
      }
      break; // 找到城市后就不需要继续遍历
    }
  }
  return regions;
}

export {
  provinceAndCityData,
  regionData,
  provinceAndCityDataPlus,
  regionDataPlus,
  getDataByCode,
  provinceOptions,
  getRealCode,
  getTextByCode,
  getCodeByNames,
  getCitiesByProvinces,
  getRegionsByCities,
  getCityOptions,
  getRegionOptions,
};

// const provinces = ['广东省', '江苏省'];
// const cities = getCitiesByProvinces(provinces);
// console.info(cities);
//
// const citiesList = ['广州市', '南京市'];
// const regions = getRegionsByCities(citiesList);
// console.info(regions);

/**
 * 获取两个区域数组的交集
 * @param regions1
 * @param regions2
 * @returns {Array}
 */
export function getIntersectionOfRegions(regions1, regions2) {
  return regions1.filter((region1) => regions2.some((region2) => region1.value === region2.value));
}

// get provinve and city by name,传进来的是city或者region，返回 省份和城市
export function getProvinceByName1(name) {
  // 用于存储结果
  const results = [];

  // 遍历 TextToCode 对象查找匹配
  for (const province in TextToCode) {
    // 跳过"全部"和"code"属性
    if (province === '全部' || province === 'code') continue;

    const provinceData = TextToCode[province];

    // 遍历城市
    for (const city in provinceData) {
      // 跳过"全部"、"code"属性和非对象属性
      if (city === '全部' || city === 'code' || typeof provinceData[city] !== 'object') continue;

      // 如果找到匹配的城市
      if (city === name) {
        results.push([province]);
        continue;
      }

      // 遍历区域
      const cityData = provinceData[city];
      for (const region in cityData) {
        // 跳过"全部"、"code"属性和非对象属性
        if (region === '全部' || region === 'code' || typeof cityData[region] !== 'object') continue;

        // 如果找到匹配的区域
        if (region === name) {
          results.push([province, city]);
          break; // 找到区域后就不需要继续遍历该城市的其他区域
        }
      }
    }
  }

  return results;
}

// 使用示例：
// getProvinceByName('广州市') 返回 [['广东省']]
// getProvinceByName('越秀区') 返回 [['广东省', '广州市']]
// getProvinceByName('朝阳区') 可能返回多个结果，如 [['北京市', '北京市'], ['辽宁省', '朝阳市']]
// const citiesList2 = ['上海市', '南京市'];
// const regions2 = getRegionsByCities(citiesList2);
// // console.info(regions2);
//
// console.info(getIntersectionOfRegions(regions, regions2));

/**
 * 获取所有城市列表
 * @returns {Array<string>} 城市名称数组
 */
export function getAllCities() {
  const cities = new Set();
  
  for (const province in TextToCode) {
    // 跳过"全部"
    if (province === '全部') continue;
    
    const provinceData = TextToCode[province];
    for (const cityName in provinceData) {
      // 只处理实际的城市名称（不是"全部"且不是"code"属性）
      if (cityName !== '全部' && cityName !== 'code') {
        cities.add(cityName);
      }
    }
  }
  
  return Array.from(cities);
}

/**
 * 获取所有区域列表
 * @returns {Array<string>} 区域名称数组
 */
export function getAllRegions() {
  const regions = new Set();
  
  for (const province in TextToCode) {
    // 跳过"全部"
    if (province === '全部') continue;
    
    const provinceData = TextToCode[province];
    for (const cityName in provinceData) {
      // 跳过"全部"和"code"属性
      if (cityName === '全部' || cityName === 'code') continue;
      
      const cityData = provinceData[cityName];
      for (const regionName in cityData) {
        // 只处理实际的区域名称（不是"全部"且不是"code"属性）
        if (regionName !== '全部' && regionName !== 'code') {
          regions.add(regionName);
        }
      }
    }
  }
  
  return Array.from(regions);
}

// 获取所有城市
const allCities = getAllCities();
// console.info(allCities); // ['广州市', '深圳市', ...]

// 获取所有区域
const allRegions = getAllRegions();
// console.info(allRegions); // ['越秀区', '福田区', ...]
