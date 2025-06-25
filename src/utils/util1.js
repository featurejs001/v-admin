// get user list
import pinyin from 'pinyin';

// get track list

export const excludedUserNames = ['admin', 'root', 'super'];

export function isNotNull(obj) {
  return obj !== null && obj !== undefined;
}

export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const prioritiesOrder = { 跟进: 0, 关注: 1, 投后: 3, 其他: 2  };
export const stageTagsOrder = { 线索: 0, 跟进: 1, 立项: 2, 上会: 3, 投后: 4, 废弃: 5 };
export const followStageTagsOrder = { 暂无接触: 0, 资料分析: 1, 外围访谈: 2, 高管访谈: 3, CEO访谈: 4, 业务尽调: 5, 三方财法尽调: 6 };

export const turnTagsOrder = {
  '种子/天使轮': 0,
  A轮: 1,
  B轮: 2,
  C轮: 3,
  'D轮至Pre-IPO': 4,
  股权投资: 5,
  战略投资: 6,
  IPO: 7,
  被收购: 8,
  其他: 9,
  未知: 10,
};
export const PeopleOrder = { 魏浩成: 0, 张婧婷: 1, 邓登: 2, 王思远: 3, 柴博: 4 };

export const provinceOrder = {
  北京市: 0,
  上海市: 1,
  广东省: 2,
  江苏省: 3,
  浙江省: 4,
  福建省: 5,
  山东省: 6,
  湖北省: 7,
  湖南省: 8,
  安徽省: 9,
  四川省: 10,
  重庆市: 11,
  陕西省: 12,
  河北省: 13,
  河南省: 14,
  山西省: 15,
  天津市: 16,
  江西省: 17,
  广西壮族自治区: 18,
  云南省: 19,
  贵州省: 20,
  海南省: 21,
  辽宁省: 22,
  吉林省: 23,
  黑龙江省: 24,
  内蒙古自治区: 25,
  新疆维吾尔自治区: 26,
  甘肃省: 27,
  宁夏回族自治区: 28,
  青海省: 29,
  西藏自治区: 30,
  香港特别行政区: 31,
  澳门特别行政区: 32,
  台湾省: 33,
};

export const capitalOrder = {
  广州市: 0,
  南京市: 1,
  杭州市: 2,
  北京市: 3,
  上海市: 4,
  福州市: 5,
  济南市: 6,
  武汉市: 7,
  长沙市: 8,
  合肥市: 9,
  成都市: 10,
  重庆市: 11,
  西安市: 12,
  石家庄市: 13,
  郑州市: 14,
  太原市: 15,
  天津市: 16,
  南昌市: 17,
  南宁市: 18,
  昆明市: 19,
  贵阳市: 20,
  海口市: 21,
  沈阳市: 22,
  长春市: 23,
  哈尔滨市: 24,
  呼和浩特市: 25,
  乌鲁木齐市: 26,
  兰州市: 27,
  银川市: 28,
  西宁市: 29,
  拉萨市: 30,
  香港特别行政区: 31,
  澳门特别行政区: 32,
  台北市: 33,
};
export function generateGUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    let r = (Math.random() * 16) | 0,
      v = c == 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export const removeProjectNumber = (obj) =>
  Object.fromEntries(
    Object.entries(obj).map(([key, value]) => {
      if (typeof value === 'string' && value.includes('(')) {
        return [key, value.replace(/\(\d+\)/, '')];
      } else if (Array.isArray(value)) {
        return [key, value.map((v) => (typeof v === 'string' && v.includes('(') ? v.replace(/\(\d+\)/, '') : v))];
      }
      return [key, value];
    })
  );

// export const MyIconFont = createFromIconfontCN({
//   scriptUrl: '//at.alicdn.com/t/c/font_4579828_tntx8pelen.js',
// });

export let MyIconFont;

export const extractTextBeforeParentheses = (str) => {
  const match = str?.match(/^(.*?)(\(\d+\))?$/);
  return match ? match[1] : null;
};

export const gy_cache = {
  data: {},
  params: {}, // 用于存储参数的对象
  threshold: 60000, // 时间阈值，单位为毫秒，例如60秒
  expiryTime: 180000, // 过期时间，单位为毫秒，例如3分钟

  // 自定义的 btoa 函数，可以处理包含非拉丁字符的字符串
  utf8ToBase64(str) {
    return btoa(unescape(encodeURIComponent(str)));
  },

  // 获取缓存的键值，移除 _t 参数并转换为 base64
  getBase64Key(payload) {
    if (!payload) {
      return null;
    }
    const { _t, ...rest } = payload;
    return this.utf8ToBase64(JSON.stringify(rest));
  },

  // 检查缓存
  checkCache(base64Key) {
    if (!base64Key) {
      return null;
    }
    this.cleanExpiredCache();
    const cachedItem = this.data[base64Key];
    if (cachedItem && Date.now() - cachedItem.timestamp < this.threshold) {
      return cachedItem.data;
    }
    return null;
  },

  // 设置缓存
  setCache(base64Key, result) {
    if (base64Key) {
      this.cleanExpiredCache();
      this.data[base64Key] = {
        data: result,
        timestamp: Date.now(),
      };
    }
  },

  // 清理过期缓存项
  cleanExpiredCache() {
    const now = Date.now();
    const totalItems = Object.keys(this.data).length;
    let clearedItems = 0;

    for (const [key, value] of Object.entries(this.data)) {
      if (now - value.timestamp >= this.expiryTime) {
        delete this.data[key];
        clearedItems++;
      }
    }

    // console.info(`Total cache items: ${totalItems}, Cleared expired cache items: ${clearedItems}`);
  },

  // 清除所有缓存
  clearAllCache() {
    this.data = {};
    // console.info('All cache items have been cleared.');
  },

  // 设置参数
  setParams(params) {
    if (!params) {
      return;
    }
    this.params = params; // 直接替换 params 对象
  },

  // 获取参数
  getParams() {
    return this.params; // 直接返回 params 对象
  },
};

export function removeBracketsAndNumbers(str) {
  return str?.replace(/\(\d+\)/, '').trim();
}

// 取到自己的领域,权限限制
// let response = await reportFilterBarChart('titles=');
// gIndustries.value = response.domain;

// backend queryOwnDomains
// v_user_project_list 获取用户项目列表.权限限制

export function setColumnsVisible(columns, columnsArray) {
  columns.forEach((column) => {
    column.ifShow = true;
    column.showInTable = true;
    // ,'province','city','region'
    if (['projectId', 'industryId', 'province', 'city', 'region'].includes(column.dataIndex)) {
      column.ifShow = false;
      column.showInTable = false;
    }

    if (columnsArray.includes(column.dataIndex)) {
      column.ifShow = false;
      column.showInTable = false;
    }
  });
}

export function change_css_style(direction = 'down') {
  // clickDown();
  // clickDown();
  // clickDown();
  // console.error('change_css_style:', direction);
  // Select all elements with the class 'ant-table-column-sorters'

  const sorters = document.querySelectorAll('.ant-table-column-sorters');

  // Loop through each element
  sorters.forEach((sorter) => {
    // Find the span with the text content '最近融资'
    const titleSpan = sorter.querySelector('.ant-table-column-title span');

    // Check if the span contains the text '最近融资'
    if (titleSpan && titleSpan.textContent === '最近融资') {
      // Find the sibling span with the class 'ant-table-column-sorter ant-table-column-sorter-full'
      const sorterFull = sorter.querySelector('.ant-table-column-sorter.ant-table-column-sorter-full');

      // Log or manipulate the found element as needed
      if (sorterFull) {
        //   console.log('Found the sibling sorter:', sorterFull);

        // Find the element with aria-label="caret-down"
        let caretDown = sorterFull.querySelector('[aria-label="caret-down"]');

        if (direction === 'up') {
          caretDown = sorterFull.querySelector('[aria-label="caret-up"]');
        }

        // Check if the element does not already have the 'active' class and add it
        if (caretDown && !caretDown.classList.contains('active')) {
          caretDown.classList.add('active');
          // console.info('Added "active" class to caret-down element');
        }

        if (direction === 'none') {
          caretDown = sorterFull.querySelector('[aria-label="caret-up"]');
          caretDown.classList.remove('active');
          caretDown = sorterFull.querySelector('[aria-label="caret-down"]');
          caretDown.classList.remove('active');
        }

        // sorterFull.click();
        // setTimeout(() => {
        //   sorterFull.click();
        // }, 1);
        // // Create a new double-click event
        // const doubleClickEvent = new MouseEvent('dblclick', {
        //   bubbles: true,
        //   cancelable: true,
        //   view: window
        // });
        //
        // // Dispatch the double-click event to the sorterFull element
        // sorterFull.dispatchEvent(doubleClickEvent);
        // You can now manipulate sorterFull as needed
      }
    }
  });
}


export function pinyinSort(arr, key = null, order = 'asc') {
  return arr.sort((a, b) => {
    const valueA = key ? a[key] : a;
    const valueB = key ? b[key] : b;

    const capitalOrderA = capitalOrder[valueA.replace(/\(.*?\)/g, '')]; // 去除括号和数字再查找
    const capitalOrderB = capitalOrder[valueB.replace(/\(.*?\)/g, '')];

    // 优先处理 capitalOrder 中的元素
    if (capitalOrderA !== undefined && capitalOrderB !== undefined) {
      if (capitalOrderA !== capitalOrderB) {
        return order === 'desc' ? capitalOrderB - capitalOrderA : capitalOrderA - capitalOrderB;
      } else {
        // 如果 capitalOrder 值相同，则按拼音排序
        const pinyinA = pinyin(valueA, { style: pinyin.STYLE_NORMAL }).join('');
        const pinyinB = pinyin(valueB, { style: pinyin.STYLE_NORMAL }).join('');
        return order === 'desc' ? pinyinB.localeCompare(pinyinA) : pinyinA.localeCompare(pinyinB);
      }
    } else if (capitalOrderA !== undefined) {
      return -1;
    } else if (capitalOrderB !== undefined) {
      return 1;
    }

    // 如果都不在 capitalOrder 中，则按拼音排序
    const pinyinA = pinyin(valueA, { style: pinyin.STYLE_NORMAL }).join('');
    const pinyinB = pinyin(valueB, { style: pinyin.STYLE_NORMAL }).join('');

    if (order === 'desc') {
      return pinyinB.localeCompare(pinyinA, undefined, { numeric: true });
    } else {
      return pinyinA.localeCompare(pinyinB, undefined, { numeric: true });
    }
  });
}

// // 升序排列
// const arrAsc = ['张三', '李四', '王五', '赵六'];
// const sortedArrAsc = pinyinSort(arrAsc);
// console.log(sortedArrAsc); // 输出: ["李四", "王五", "张三", "赵六"]
//
// // 降序排列
// const arrDesc = ['张三', '李四', '王五', '赵六'];
// const sortedArrDesc = pinyinSort(arrDesc, null, 'desc');
// console.log(sortedArrDesc); // 输出: ["赵六", "张三", "王五", "李四"]
//
// // 对象数组升序排列
// const objArrAsc = [
//   { name: '张三', age: 20 },
//   { name: '李四', age: 25 },
//   { name: '王五', age: 18 },
// ];
// const sortedObjArrAsc = pinyinSort(objArrAsc, 'name');
// console.log(sortedObjArrAsc);
