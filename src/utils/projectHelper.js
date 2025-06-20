import pinyin from 'pinyin';

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