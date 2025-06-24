import pinyin from 'pinyin';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

export // 定义表头和字段映射
const headers = [
    { label: '项目名称', key: 'name' },
    { label: '项目ID', key: 'projectId' },
    { label: '行业ID', key: 'industryId' },
    { label: '创建时间', key: 'createTime' },
    { label: '更新时间', key: 'updateTime' },
    { label: '全名', key: 'fullName' },
    { label: '阶段', key: 'stage' },
    { label: '跟进阶段', key: 'followStage' },
    { label: '融资窗口开始时间', key: 'financingWindowStartTime' },
    { label: '融资窗口结束时间', key: 'financingWindowEndTime' },
    { label: '一级赛道', key: 'domain1' },
    { label: '二级赛道', key: 'domain2' },
    { label: '三级赛道', key: 'domain3' },
    { label: '优先级', key: 'priority' },
    { label: '标签', key: 'tags' },
    { label: '备注', key: 'memo' },
    { label: '主要负责人', key: 'main' },
    { label: '助理', key: 'assistant' },
    { label: '其他', key: 'other' },
    { label: '成立日期', key: 'foundationDate' },
    { label: '省份1', key: 'province' },
    { label: '城市1', key: 'city' },
    { label: '区域1', key: 'region' },
    { label: '飞书链接', key: 'feishuLink' },
    { label: '第三方链接', key: 'thirdPartyLink' },
    { label: '简介', key: 'briefIntroduction' },
    { label: '网站', key: 'website' },
    { label: '财务标签', key: 'financeTag' },
    { label: '代码', key: 'code' },
    { label: '投资日期', key: 'investDate' },
    { label: '轮次', key: 'turn' },
    { label: '轮次2', key: 'turn2' },
    { label: '金额', key: 'amount' },
    { label: '投资者', key: 'investor' },
    { label: '别名', key: 'alias' },
    { label: '操作1', key: 'op_1' },
    { label: '操作2', key: 'op_2' },
    { label: '操作时间', key: 'op_time' },
    { label: '操作状态', key: 'op_status' },
    { label: '推送时间', key: 'pushTime' },
    { label: '推送状态', key: 'pushStatus' },
    { label: '删除时间', key: 'delTime' },
    { label: '删除者UID', key: 'delByUid' },
    { label: '删除者用户名', key: 'delByUsername' },
    { label: '导入时间', key: 'importTime' },
    { label: '拒绝时间', key: 'rejectTime' },
    { label: '阻止时间', key: 'blockTime' },
    { label: '导入者UID', key: 'importByUid' },
    { label: '导入者用户名', key: 'importByUsername' },
    { label: '拒绝者UID', key: 'rejectByUid' },
    { label: '拒绝者用户名', key: 'rejectByUsername' },
    { label: '创建者', key: 'createBy' },
    { label: '更新者', key: 'updateBy' },
    { label: '省份', key: 'provinceMap' },
    { label: '城市', key: 'cityMap' },
    { label: '区域', key: 'regionMap' },
    { label: 'ID', key: 'id' },
];

  // 配置对象，选择需要导出的表头
export const selectedHeaders = headers
    .filter(
      (header) =>
        !['项目ID', '行业ID', '财务标签', '代码', 'ID', '操作1', '操作2', '操作时间', '操作状态', '省份1', '城市1', '区域1'].includes(header.label)
    )
    .map((header) => header.label);

export const priorityFilter = ['跟进', '关注', '其他', '投后'];

export const turnFilter = ['种子/天使轮', 'A轮', 'B轮', 'C轮', 'D轮至Pre-IPO', '股权投资', '战略投资', 'IPO', '被收购', '其他', '未知'];

export const stageFilter = ['线索', '跟进', '立项', '上会', '投后', '废弃'];

export const followStageFilter = ['暂无接触', '资料分析', '外围访谈', '高管访谈', 'CEO访谈', '业务尽调', '三方财法尽调']

function sortColumn(a, b, key) {
	const aPinyin = pinyin(a[key], {
        style: pinyin.STYLE_NORMAL,
    })
    .flat()
    .join('');

    const bPinyin = pinyin(b[key], {
        style: pinyin.STYLE_NORMAL,
    })
    .flat()
    .join('');

    if (aPinyin === bPinyin) return 0;

    const compareResult = aPinyin.localeCompare(bPinyin);
    return compareResult;
}

export const getProjectColumns = (filterMaps = {}, filterValuesMap = {}) => { 
	return [{
	    title: '项目',
	    align: 'center',
	    dataIndex: 'name',
	    fixed: 'left',
	    slot: 'name',
	    resizable: true,
	    sorter: true,
	    width: 90,
	 }, {
	    title: '行业等级',
	    align: 'center',
	    dataIndex: 'priority',
	    resizable: true,
	    sorter: true,
		width: 120,
	    filters: priorityFilter.map(item => {
			return {
				text: item,
				value: item
			}
		}),
	}, {
		title: '项目阶段',
	    align: 'center',
	    dataIndex: 'stage',
	    resizable: true,
	    sorter: true,
	    filters: stageFilter.map(item => {
			return {
				text: item,
				value: item
			}
		}),
	    width: 120,
	}, {
		title: '跟进阶段',
	    align: 'center',
	    dataIndex: 'followStage',
	    resizable: true,
	    sorter: true,
	    filters: followStageFilter.map(item => {
			return {
				text: item,
				value: item
			}
		}),
	    width: 120,
	}, {
		title: '融资开始',
	    align: 'center',
	    dataIndex: 'financingWindowStartTime',
	    customRender: ({ text }) => {
	      return !text ? '' : text.split('-').slice(0, 2).join('-');
	    },
	    resizable: true,
	    sorter: true,
	    width: 120,
	}, {
		title: '融资结束',
	    align: 'center',
	    dataIndex: 'financingWindowEndTime',
	    customRender: ({ text }) => {
	      return !text ? '' : text.split('-').slice(0, 2).join('-');
	    },
	    resizable: true,
	    sorter: true,
	    width: 120,
	}, {
		title: '最近融资',
	    align: 'center',
	    dataIndex: 'investDate',
	    resizable: true,
	    defaultSortOrder: 'descend',
	    sortDirections: ['ascend', 'descend'],
	    sorter: true,
	    width: 120,
	}, {
		title: '轮次',
	    align: 'center',
	    dataIndex: 'turn2',
	    resizable: true,
	    sorter: true,
	    width: 90,
	    filters: turnFilter.map(item => {
			return {
				value: item,
				text: item
			}
		}),
	},   {
	    title: '金额',
	    align: 'center',
	    dataIndex: 'amount',
	    resizable: true,
	    sorter: true,
	    width: 90,
	},
	{
		title: '投资方',
		// align: 'center',
		dataIndex: 'investor',
		resizable: true,
		align: 'left',
		sorter: true,
		width: 90,
	},
	{
		title: '一级赛道',
		align: 'left',
		dataIndex: 'domain1',
		resizable: true,
		sorter: true,
		// filters: domain1Filter,
		width: 110,
	},
	{
		title: '二级赛道',
		align: 'left',
		dataIndex: 'domain2',
		resizable: true,
		sorter: true,
		width: 110,
		// filters: domain2Filter,
	},
	{
		title: '三级赛道',
		align: 'left',
		dataIndex: 'domain3',
		resizable: true,
		sorter: true,
		width: 110,
		// filters: domain3Filter,
	}, {
		title: '简介',
	    // align: 'center',
	    dataIndex: 'briefIntroduction',
	    resizable: true,
	    align: 'left',
	    sorter: true,
	    width: 110,
	}, {
		title: '成立时间',
	    // align: 'center',
	    dataIndex: 'foundationDate',
	    resizable: true,
	    align: 'left',
	    sorter: true,
	    width: 120,
	}, {
		title: '第三方链接',
	    // align: 'center',
	    dataIndex: 'thirdLink',
	    resizable: true,
	    align: 'left',
	    sorter: true,
	    width: 110,
	}, {
		title: '官网',
	    // align: 'center',
	    dataIndex: 'website',
	    resizable: true,
	    align: 'left',
	    sorter: true,
	    width: 110,
	}, {
		align: 'center',
	    // customRender: ({text}) => {
	    //   return getTextByCode(text);
	    // },
	    dataIndex: 'provinceMap',
	    resizable: true,
	    ifShow: false,
	    sorter: true,
	    title: '省',
	    filteredValue: [],
	    filters: filterValuesMap['province'] || [],
	    width: 100,
	}, {
		title: '市',
	    // align: 'center',
	    dataIndex: 'cityMap',
	    resizable: true,
	    ifShow: false,
	    align: 'center',
	    sorter: true,
	    // customRender: ({text}) => {
	    //   return getTextByCode(text);
	    // },
	    filteredValue: [],
	    filters: filterValuesMap['city'] || [],
	    width: 100,
	}, {
		 title: '区',
	    // align: 'center',
	    dataIndex: 'regionMap',
	    resizable: true,
	    ifShow: false,
	    align: 'center',
	    sorter: true,
	    // customRender: ({text}) => {
	    //   return getTextByCode(text);
	    // },
	    filteredValue: [],
	    filters: filterValuesMap['region'] || [],
	    width: 100,
	}, {
		title: '标签',
	    align: 'left',
	    dataIndex: 'tags',
	    ellipsis: true,
	    resizable: true,
	    sorter: true,
	    width: 100,
	}, {
		title: '主理人',
	    align: 'left',
	    dataIndex: 'main',
	    resizable: true,
	    sorter: true,
	    width: 100,
	}, {
		title: '协理人',
	    align: 'left',
	    dataIndex: 'assistant',
	    resizable: true,
	    sorter: true,
	    width: 100,
	}, {
		title: '其他人',
	    align: 'left',
	    dataIndex: 'other',
	    resizable: true,
	    sorter: true,
		width: 90
	}, {
		title: '创建时间',
	    align: 'center',
	    dataIndex: 'createTime',
	    resizable: true,
	    sorter: true,
	    ifShow: true,
	    width: 120,
	    // filters: otherFilter,
	    customRender: ({ text }) => {
	      if (!text) {
	        return '';
	      }

	      const datePart = text.split(' ')[0]; // 获取'YYYY-MM-DD'

	      return datePart; // 返回日期部分
	    },
	},{
		title: '更新时间',
	    align: 'center',
	    dataIndex: 'updateTime',
	    resizable: true,
	    sorter: true,
	    width: 80,
	    // filters: otherFilter,
	    customRender: ({ text }) => {
	      if (!text) {
	        return '';
	      }

	      const datePart = text.split(' ')[0]; // 获取'YYYY-MM-DD'

	      return datePart; // 返回日期部分
	    },
	}, {
		title: '项目主体',
	    // align: 'center',
	    dataIndex: 'fullName',
	    resizable: true,
	    align: 'left',
	    sorter: true,
	    width: 120,
	}, {
		title: '项目别名',
	    // align: 'center',
	    dataIndex: 'alias',
	    resizable: true,
	    align: 'left',
	    sorter: true,
	    width: 120,
	}, {
		title: '推送人',
	    // align: 'center',
	    dataIndex: 'op_1',
	    resizable: true,
	    align: 'left',
	    sorter: true,
	    ifShow: true,
	    width: 50,
	}, {
		title: '推送对象',
	    // align: 'center',
	    dataIndex: 'op_2',
	    resizable: true,
	    align: 'left',
	    sorter: true,
	    ifShow: true,
	    width: 50,
	}, {
		title: '推送时间',
	    dataIndex: 'op_time',
	    resizable: true,
	    align: 'left',
	    sorter: true,
	    width: 70,
	}, {
		title: '推送分类',
	    dataIndex: 'op_status',
	    resizable: true,
	    align: 'left',
	    sorter: true,
	    width: 50,
	}, {
		title: '推送状态',
	    dataIndex: 'pushStatus',
	    resizable: true,
	    align: 'left',
	    sorter: true,
	    width: 50,
	}, {
	    title: '删除人',
	    dataIndex: 'delByUsername',
	    resizable: true,
	    align: 'left',
	    sorter: true,
	    ifShow: true,
	    width: 50,
	},
	{
	    title: '删除时间',
	    dataIndex: 'delTime',
	    resizable: true,
	    align: 'left',
	    sorter: true,
	    width: 70,
	}, {
	    title: '移入人',
	    dataIndex: 'importByUsername',
	    resizable: true,
	    align: 'left',
	    sorter: true,
	    ifShow: true,
	    width: 50,
	}, 
	{
	    title: '移入时间',
	    dataIndex: 'importTime',
	    resizable: true,
	    align: 'left',
	    sorter: true,
	    ifShow: true,
	    width: 70,
	}, 
	{
	    title: '拒收人',
	    dataIndex: 'rejectByUsername',
	    resizable: true,
	    align: 'left',
	    ifShow: true,
	    sorter: true,
	    width: 50,
	},
	{
	    title: '拒收时间',
	    dataIndex: 'rejectTime',
	    resizable: true,
	    align: 'left',
	    ifShow: true,
	    sorter: true,
	    width: 70,
	},
	{
	    title: '屏蔽区间',
	    dataIndex: 'blockTime',
	    resizable: true,
	    ifShow: true,
	    align: 'left',
	    sorter: true,
	    width: 70,
	},
	{
		title: '创建人',
	    align: 'left',
	    dataIndex: 'createBy',
	    resizable: true,
	    sorter: true,
	    width: 90,
	}, {
		title: '更新人',
	    align: 'left',
	    dataIndex: 'updateBy',
	    resizable: true,
	    sorter: true,
	    width: 90,
	},{
		title: '操作',
	    dataIndex: 'action1',
		slot: 'action1',
	    fixed: 'right',
	    width: 120,
	}].map(item => {
		const newItem = {
			...item,
			ellipsis: true,
		}
		if (newItem.filters) {
			newItem.customFilterDropdown = true;
			newItem.filteredValue = filterMaps?.[newItem.dataIndex] || [];
		}
		if (true === newItem.sorter) {
			newItem.sorter = (a, b) => {
				if (['createTime', 'updateTime', 'op_time', 'delTime', 'importTime', 'rejectTime', 'blockTime'].includes(newItem.dataIndex)) {
					return new Date(a[newItem.dataIndex]) - new Date(b[newItem.dataIndex])
				}
				return sortColumn(a, b, newItem.dataIndex)
			}
		}
		return newItem;
	})
}
export const exportToExcel = (records) => {
	// 根据配置对象选择表头
    const selectedHeaderKeys = headers.filter((header) => selectedHeaders.includes(header.label)).map((header) => header.key);

	// 过滤记录，只保留 selectedHeaderKeys 中的字段
    const filteredRecords = records.map((record) => {
      const filteredRecord = {};
      selectedHeaderKeys.forEach((key) => {
        filteredRecord[key] = record[key];
      });
      return filteredRecord;
    });

    // 创建一个新的工作簿
    const workbook = XLSX.utils.book_new();

    // 将数据转换为工作表
    const worksheet = XLSX.utils.json_to_sheet(filteredRecords, { header: selectedHeaderKeys });

    // 设置表头
    const selectedHeaderLabels = headers.filter((header) => selectedHeaders.includes(header.label)).map((header) => header.label);
    XLSX.utils.sheet_add_aoa(worksheet, [selectedHeaderLabels], { origin: 'A1' });

    // 将工作表添加到工作簿
    XLSX.utils.book_append_sheet(workbook, worksheet, '项目中心');

    // 生成 Excel 文件
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

    // 创建 Blob 对象
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });

    // 下载文件
    saveAs(blob, '项目中心.xlsx');
}

export function mergeRecordsByName(allRecords) {
    // 创建一个对象来存储合并后的记录
    const mergedRecords = {};

    // 遍历 data.records
    allRecords.forEach((record) => {
      const { name, ...rest } = record;

      // 如果 name 不存在于 mergedRecords 中,创建一个新的对象
      if (!mergedRecords[name]) {
        mergedRecords[name] = { name, ...rest };
      } else {
        // 需要特殊处理的字段
        const specialFields = ['investDate', 'turn', 'turn2', 'amount', 'investor'];
        // 需要特殊处理合并的字段
        const domainFields = ['domain1', 'domain2', 'domain3'];

        // 如果当前记录的investDate比已存在记录的更新,则更新特殊字段
        if (rest.investDate && (!mergedRecords[name].investDate || new Date(rest.investDate) > new Date(mergedRecords[name].investDate))) {
          specialFields.forEach((field) => {
            if (rest[field]) {
              mergedRecords[name][field] = rest[field];
            }
          });
        }

        // 特殊处理 domain 字段，保留所有非 null 值并用逗号连接
        domainFields.forEach((field) => {
          // 如果新记录中该字段有值（非 null 和非 undefined）
          if (rest[field] != null) {
            // 如果已合并记录中该字段为 null 或 undefined，直接使用新值
            if (mergedRecords[name][field] == null) {
              mergedRecords[name][field] = rest[field];
            } 
            // 如果已合并记录中该字段已有值，且与新值不同，则合并（用逗号连接）
            else if (mergedRecords[name][field] !== rest[field] && !mergedRecords[name][field].includes(rest[field])) {
              mergedRecords[name][field] = `${mergedRecords[name][field]},${rest[field]}`;
            }
          }
        });

        // 合并其他非特殊字段
        Object.keys(rest).forEach((key) => {
          if (!specialFields.includes(key) && !domainFields.includes(key)) {
            if (Array.isArray(mergedRecords[name][key])) {
              // 修复这里的错误，应该使用 mergedRecords 而不是 mergedData
              mergedRecords[name][key] = [...new Set([...mergedRecords[name][key], ...(Array.isArray(rest[key]) ? rest[key] : [rest[key]])])];
            } else if (typeof mergedRecords[name][key] === 'string' && typeof rest[key] === 'string') {
              // 如果两个值不同，才进行合并
              if (mergedRecords[name][key] !== rest[key]) {
                mergedRecords[name][key] = [mergedRecords[name][key], rest[key]].join(',');
              }
            } else {
              // 对于其他类型的字段，如果当前值为 null 而新值不为 null，则使用新值
              if (mergedRecords[name][key] == null && rest[key] != null) {
                mergedRecords[name][key] = rest[key];
              } else if (rest[key] != null) {
                // 如果两者都不为 null，则使用新值
                mergedRecords[name][key] = rest[key];
              }
            }
          }
        });
      }
    });

    // 将合并后的记录转换为数组
    const mergedRecordsArray = Object.values(mergedRecords);

	mergedRecordsArray.forEach((record) => {
      Object.keys(record).forEach((key) => {
        if (typeof record[key] === 'string') {
          // 将字符串按逗号分隔并去重
          const values = record[key].split(',');
          const uniqueValues = [...new Set(values)];
          record[key] = uniqueValues.join(',');
        }
      });
    });

    // 返回修改后的数据
    return mergedRecordsArray;
}

// 按分页获取数据
export async function getProjectsPages(data = [], page = 1, pageSize = 10) {
	// 分页
	const total = data.length;
	const start = (page - 1) * pageSize;
	const end = start + pageSize;
	const pageItems = data.slice(start, end);

	return {
        items: [...pageItems],
        total,
        page,
        pageSize,
    };
}

// 过滤项目数据
export async function getProjectsFilter({ data = [], sorts = [], filters = {}, searchKey = '' }) {
    try {
      console.log('开始查询，排序参数:', sorts, '筛选参数:', filters, '搜索关键字:', searchKey);
      let query = data.map(item => {
		return {...item}
	  })

      // 添加搜索关键字过滤
      if (searchKey) {
        const searchKeyLower = searchKey.toLowerCase();
        // 定义所有可搜索的字段
        const searchFields = [
          'name',
          'fullName',
          'stage',
          'followStage',
          'domain1',
          'domain2',
          'domain3',
          'priority',
          'tags',
          'memo',
          'main',
          'assistant',
          'other',
          'province',
          'city',
          'region',
          'briefIntroduction',
          'website',
          'financeTag',
          'code',
          'turn',
          'turn2',
          'amount',
          'investor',
          'alias',
          'createBy',
          'updateBy',
          'provinceMap',
          'cityMap',
          'regionMap',
        ];

        query = query.filter((item) => {
          return searchFields.some((field) => {
            const fieldValue = String(item[field] || '');
            // 转换为拼音进行搜索
            const pinyinValue = pinyin(fieldValue, {
              style: pinyin.STYLE_NORMAL,
            })
              .flat()
              .join('')
              .toLowerCase();

            return fieldValue.toLowerCase().includes(searchKeyLower) || pinyinValue.includes(searchKeyLower);
          });
        });
      }

      // 定义特殊处理的多值字段
      const multiValueFields = ['main', 'assistant', 'other'];

      // 应用筛选
      query = query.filter((item) => {
        // 检查每个字段组的筛选条件
        for (const [field, values] of Object.entries(filters)) {
          if (!values || !Array.isArray(values) || values.length === 0) {
            continue; // 跳过空的筛选条件
          }

          if (multiValueFields.includes(field)) {
            // 处理特殊的多值字段（main, assistant, other）
            const itemValues = String(item[field] || '')
              .split(',')
              .map((v) => v.trim());

            // 只要有一个值匹配就符合条件（并集）
            const hasMatch = values.some((filterValue) =>
              itemValues.some((itemValue) => {
                const itemPinyin = pinyin(itemValue, {
                  style: pinyin.STYLE_NORMAL,
                })
                  .flat()
                  .join('')
                  .toLowerCase();

                const filterPinyin = pinyin(filterValue, {
                  style: pinyin.STYLE_NORMAL,
                })
                  .flat()
                  .join('')
                  .toLowerCase();

                return itemPinyin === filterPinyin;
              })
            );

            if (!hasMatch) {
              return false; // 如果这个字段没有匹配，整条记录不符合条件
            }
          } else {
            // 处理普通字段
            const itemValue = String(item[field] || '');
			

            // 对于同一个字段的多个值是并集关系（OR）
            const hasMatch = values.some((filterValue) => {
				
              const itemPinyin = pinyin(itemValue, {
                style: pinyin.STYLE_NORMAL,
              })
                .flat()
                .join('')
                .toLowerCase();

              const filterPinyin = pinyin(filterValue, {
                style: pinyin.STYLE_NORMAL,
              })
                .flat()
                .join('')
                .toLowerCase();

              return itemPinyin === filterPinyin;
            });

            if (!hasMatch) {
              return false; // 如果这个字段没有匹配，整条记录不符合条件
            }
          }
        }

        // 所有字段都匹配才返回 true（不同字段间是交集关系 AND）
        return true;
      });

      console.log('筛选后的记录数:', query.length);

      // 应用排序
      if (sorts && sorts.length > 0) {
        query = query.sort((a, b) => {
          for (const { field, order } of sorts) {
            // 处理时间字段
            if (field.toLowerCase().includes('time') || field === 'investDate') {
              const aTime = new Date(a[field] || 0).getTime();
              const bTime = new Date(b[field] || 0).getTime();
              if (aTime === bTime) continue;
              return order === 'asc' ? aTime - bTime : bTime - aTime;
            }

            // 处理多值字段
            if (multiValueFields.includes(field)) {
              const aValues = String(a[field] || '')
                .split(',')
                .map((v) => v.trim());
              const bValues = String(b[field] || '')
                .split(',')
                .map((v) => v.trim());

              // 使用第一个值进行排序
              const aValue = aValues[0] || '';
              const bValue = bValues[0] || '';

              const aPinyin = pinyin(aValue, {
                style: pinyin.STYLE_NORMAL,
              })
                .flat()
                .join('');

              const bPinyin = pinyin(bValue, {
                style: pinyin.STYLE_NORMAL,
              })
                .flat()
                .join('');

              if (aPinyin === bPinyin) continue;

              const compareResult = aPinyin.localeCompare(bPinyin);
              return order === 'asc' ? compareResult : -compareResult;
            }

            // 处理普通字段
            const aValue = String(a[field] || '');
            const bValue = String(b[field] || '');

            const aPinyin = pinyin(aValue, {
              style: pinyin.STYLE_NORMAL,
            })
              .flat()
              .join('');

            const bPinyin = pinyin(bValue, {
              style: pinyin.STYLE_NORMAL,
            })
              .flat()
              .join('');

            if (aPinyin === bPinyin) continue;

            const compareResult = aPinyin.localeCompare(bPinyin);
            return order === 'asc' ? compareResult : -compareResult;
          }
          return 0;
        });
      }
	  return [...query]

      // 分页
    //   const total = query.length;
    //   const start = (page - 1) * pageSize;
    //   const end = start + pageSize;
    //   const pageItems = query.slice(start, end);

    //   return {
    //     items: [...query],
    //     total,
    //     page,
    //     pageSize,
    //   };
    } catch (error) {
      console.error('查询项目数据失败:', error);
    //   return {
    //     items: [],
    //     total: 0,
    //     page,
    //     pageSize,
    //   };
    }
	return []
}

export function getProjectCountMap(records) {
	// 定义需要特殊处理的多值字段
    const multiValueFields = ['main', 'assistant', 'other'];
	// 计算统计数据 - 确保相同 project_id 的项目只计数一次
    const counts = {};
    let countedProjects = {};

	// 初始化字段
    const fieldsToCount = [
        'stage',
        'cityMap',
        'regionMap',
        'provinceMap',
        'followStage',
        'priority',
        'domain1',
        'turn',
        'turn2',
        'domain2',
        'domain3',
        'main',
        'assistant',
        'other',
    ];
	// 初始化计数对象和已计数项目集合
    fieldsToCount.forEach(field => {
        counts[field] = {};
        countedProjects[field] = {};
    });

	// 遍历所有项目进行统计
    records.forEach(project => {
        const projectId = project.projectId;
        
        fieldsToCount.forEach(field => {
          if (project[field]) {
            // 确保该字段的计数对象已初始化
            counts[field] = counts[field] || {};
            countedProjects[field] = countedProjects[field] || {};
            
            if (multiValueFields.includes(field)) {
              // 处理多值字段（如 main, assistant, other）
              const values = String(project[field])
                .split(',')
                .map(v => v.trim())
                .filter(v => v); // 过滤空值
              
              values.forEach(value => {
                // 初始化该值的计数和已计数项目集合
                counts[field][value] = counts[field][value] || 0;
                countedProjects[field][value] = countedProjects[field][value] || new Set();
                
                // 如果该项目在该值下尚未计数，则计数并记录
                if (!countedProjects[field][value].has(projectId)) {
                  counts[field][value] += 1;
                  countedProjects[field][value].add(projectId);
                }
              });
            } else {
              // 处理普通字段
              const value = project[field];
              counts[field][value] = counts[field][value] || 0;
              countedProjects[field][value] = countedProjects[field][value] || new Set();
              
              // 如果该项目在该值下尚未计数，则计数并记录
              if (!countedProjects[field][value].has(projectId)) {
                counts[field][value] += 1;
                countedProjects[field][value].add(projectId);
              }
            }
          }
        });
    });
    
	  // 清理内存
    // countedProjects = {};
	countedProjects = undefined

    let project_count = Object.entries(counts).flatMap(([catalog, values]) =>
        Object.entries(values).map(([name, count]) => ({ catalog, name, count }))
    );

      // 转换 project_count 的 key
    const stats = project_count.map((item) => {
        const newItem = { ...item };

        // followStage 转成 follow_stage, cityMap 转成 city, regionMap 转成 region, provinceMap 转成 province
        switch (item.catalog) {
          case 'cityMap':
            newItem.catalog = 'city';
            break;
          case 'regionMap':
            newItem.catalog = 'region';
            break;
          case 'provinceMap':
            newItem.catalog = 'province';
            break;
          default:
            break;
        }
        if (newItem.catalog === 'followStage') {
          newItem.catalog = 'follow_stage';
        }

        // turn 用 turn2 的值替换
        if (newItem.catalog === 'turn' && counts['turn2']) {
          const turn2Values = counts['turn2'];
          newItem.name = Object.keys(turn2Values).find((key) => key) || newItem.name;
          newItem.count = turn2Values[newItem.name] || newItem.count;
        }

        return newItem;
    });

	const statsMap = {};
	for (const item of stats) {
		statsMap[item.catalog + '-' + item.name] = item.count;
	}
	return statsMap;
}