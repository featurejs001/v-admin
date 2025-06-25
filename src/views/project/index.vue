<template>
	<div class="project-wrap">
		<div class="filter-container">
			<Search @search="updateSearchKey" @success="handleSearch" @export="handleExport" />
			<Filter ref="filterRef" :statsMap="state.statsMap" @filterChange="updateFilters" />
			<!-- 接口返回total：{{ state.total }}<br />
			过滤后总记录数：{{ state.filterAllRecords.length }}<br />
			合并前总记录数：{{ state.allRecords.length }} -->
			
		</div>
		<Table
		 :tableProps="{
			loading: state.loading,
			pagination: {
				total: state.filterAllRecords.length,
				defaultPageSize: state.params.pageSize,
				showTotal: (total) => `共 ${total} 条数据`,
				showQuickJumper: true
		 	},
			dataSource: state.filterAllRecords,
			columns: getProjectColumns(state.params.filters, state.filterValuesMap, state.filterAllRecords, state.recordType, state.selectedOption),
			bordered: true,
			
		 }"
		 :isFixedMaxHeight="true">
			<template #header-left>
				<div>
					<a-button type="primary" ghost :icon="h(PlusOutlined)" @click="handleAdd">新增</a-button>
					<a-button v-if="state.recordType === 'merge'" type="primary" ghost :icon="h(ExpandOutlined)" @click="handleToggleMerge">展开</a-button>
					<a-button v-else type="primary" ghost :icon="h(MergeCellsOutlined)" @click="handleToggleMerge">合并</a-button>
					<a-button type="primary" ghost :disabled="!state.selectedRowKeys.length" @click="handleBatchPush">
						<template #icon>
							<svg  style="width: 16px;height: 16px;margin-right: 8px;" t="1749093877974" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4326" width="24" height="24"><path d="M96 800c-10.4 0-21-2.8-30.6-8.2-20.6-11.6-33.4-34.2-33.4-58.8v-442c0-24.8 13-47.4 33.8-59 19.6-11 42.8-10.6 62 1.2l361.4 216.2v-158.4c0-24.8 13-47.4 33.8-59 19.6-11 42.8-10.6 62 1.2l377.6 226c18.4 11 29.4 30.8 29.4 53s-11 42-29.4 53l-377.8 226c-19.4 11.6-42.6 11.8-62.2 0.6-20.6-11.8-33.4-34.4-33.4-58.8v-158L127.6 791.2c-9.8 6-20.8 8.8-31.6 8.8z m457.6-511c-0.2 0.4-0.4 1.2-0.4 2v442c0 1 0.2 1.8 0.4 2.4l373-223.2-373-223.2z m-457.2 0c-0.2 0.4-0.4 1.2-0.4 2v442c0 1 0.2 1.8 0.4 2.4l373-223.2L96.4 289z" p-id="4327"></path></svg>
						</template>
						批量推送
					</a-button>
					<a-button type="primary" ghost :disabled="!state.selectedRowKeys.length" :icon="h(EditOutlined)" @click="handleEdit">批量编辑</a-button>
					<a-popconfirm
					    title="是否确认删除?"
					    @confirm="() => handleRemove(state.selectedRowKeys)"
					>
						<a-button type="primary" danger :disabled="!state.selectedRowKeys.length" ghost :icon="h(DeleteOutlined)">批量删除</a-button>
					</a-popconfirm>
					<a-select
				      v-model:value="state.selectedOption"
				      style="width: 120px"
				      @change="handleSelectChange"
				    >
				      <a-select-option value="项目列表">项目列表</a-select-option>
			          <a-select-option value="推送列表">推送列表</a-select-option>
			          <a-select-option value="删除列表">删除列表</a-select-option>
				    </a-select>
				</div>
			</template>
			<template #checkbox="{record}">
				<a-checkbox
			      :checked="state.selectedRowKeys.includes(record.projectId)"
				  class="custom-checkbox"
			      @change="onSelectChange(record.projectId)"
			    />
			</template>
			<template #name="{ column, record, index, text }">
		        <a style="color: rgba(0, 0, 0, 0.65)" @click="handleEdit(record)">
		          <span style="display: flex; align-items: center;">{{ record.name }}</span>
		        </a>
		    </template>
			<template #action1="{ column, record, index, text }">
				<a-tooltip placement="bottom" trigger="hover">
		          <template #title>
		            <span>编辑</span>
		          </template>
		          <EditOutlined class="action-btn" @click="handleEdit(record)" />
		        </a-tooltip>
				<template v-if="['项目列表', '推送列表'].includes(state.selectedOption)">
					<a-tooltip placement="bottom" trigger="hover">
			          <template #title>
			            <span>推送</span>
			          </template>
			          <ForwardOutlined class="action-btn" @click="handleEdit(record)" />
			        </a-tooltip>
					<a-popconfirm
					    title="是否确认删除?"
					    @confirm="() => handleRemove(record.projectId)"
					>
						<a-tooltip placement="bottom" trigger="hover">
							<template #title>
								<span>删除</span>
							</template>
							<DeleteOutlined class="action-btn danger" />
				        </a-tooltip>
					</a-popconfirm>
				</template>
				<template v-else-if="['删除列表'].includes(state.selectedOption)">
					<a-popconfirm
					    title="是否确认还原?"
					    @confirm="() => handleRestore(record.projectId)"
					>
						<a-tooltip class="max-content" placement="bottom" trigger="hover">
							<template #title>
								<span>取回</span>
							</template>
							<RedoOutlined class="action-btn" @click="handleEdit(record)" />
				        </a-tooltip>
					</a-popconfirm>
					<a-popconfirm
					    title="是否确认删除?"
					    @confirm="() => handleDelete(record.projectId)"
					>
						<a-tooltip placement="bottom" trigger="hover">
							<template #title>
								<span>彻底删除</span>
							</template>
							<ScissorOutlined class="action-btn danger" />
				        </a-tooltip>
					</a-popconfirm>
				</template>
			</template>
			<template #customFilterDropdown="{ setSelectedKeys, selectedKeys, confirm, clearFilters, column }">
		        <div style="padding: 8px">
		          <!-- 滚动区域 -->
		          <div style="max-height: 200px; overflow-y: auto">
		            <a-checkbox-group
		              :value="selectedKeys"
		              @change="(checkList) => handleCheckGroupChange(checkList, column)"
		              style="display: flex; flex-direction: column; font-size: 13px"
		            >
		              <a-checkbox v-for="item in column.filters" :key="item.value" :value="item.value" class="custom-checkbox" 
					  	:style="{marginBottom: '4px', order: state.statsMap[column.dataIndex + '-' + item.value] > 0 ? 0 : 1}">
		                {{ item.text }}
						<span v-if="state.statsMap[column.dataIndex + '-' + item.value] > 0">({{ state.statsMap[column.dataIndex + '-' + item.value] }})</span>
		              </a-checkbox>
		            </a-checkbox-group>
		          </div>

		          <!-- 重置按钮区域 -->
		          <div style="margin-top: 8px; text-align: center; padding-top: 8px; border-top: 1px solid #f0f0f0">
		            <a-button
		              size="small"
		              class="common_click_btn_style"
		              style="width: 90px; height:32px;"
		              @click="handleReset(column)"
		            >
		              重置
		            </a-button>
		          </div>
		        </div>
		      </template>
		</Table>
	</div>
</template>
<script setup>
import Search from './components/search.vue'
import Filter from './components/filter.vue'
import { h, reactive, onMounted, ref } from "vue"
import { 
	getProjectList,
	getPushList,
	getDeleteList,
	getIndustrFieldValues,
	removeProject,
	deleteProject,
	restoreProject
} from "@/api/industry";
import { 
	mergeRecordsByName, 
	getProjectsFilter, 
	getProjectsPages, 
	getProjectCountMap, 
	exportToExcel,
	getProjectColumns 
} from "@/utils/projectHelper";
import Table from "@/components/Table/index.vue"
import { 
	ExpandOutlined, 
	MergeCellsOutlined, 
	PlusOutlined, 
	EditOutlined, 
	DeleteOutlined,
	FilterOutlined,
	FilterFilled,
	ForwardOutlined,
	RedoOutlined,
	ScissorOutlined
} from "@ant-design/icons-vue";
import { message } from 'ant-design-vue';
import BatchPushIcon from "@/assets/img/batchPushIcon.svg"
import { useUser } from "@/store/user";
import { storeToRefs } from "pinia";
import cities from "@/utils/cities.json"
import {
    getCitiesByProvinces,
    getCityOptions,
    getIntersectionOfRegions,
    getRegionOptions,
    getRegionsByCities,
	getAllRegions,
  } from '@/utils/areaDataUtil';
import { provinceOrder, pinyinSort } from "@/utils/util1";

const userStore = useUser();
const { gUserRoles } = storeToRefs(userStore);

const props = defineProps({
    fromWhichComponent: {
        type: String,
		default: 'project_center'
    }
})

const filterRef = ref(null)
const state = reactive({
	loading: false,
	selectedOption: '项目列表',
	params: {
       pageNo: 1,
       pageSize: 20,
	   sorts: [], // 排序条件
	   filters: {}, // 过滤条件
	   searchKey: '', // 搜索关键字
	},
	total: 0,
	recordType: 'merge',
	allRecords: [], // 所有的数据
	filterAllRecords: [], // 过滤后的数据， 无分页
	filterRecords: [], // 过滤后的数据， 有分页
	statsMap: {}, // 每个标签对应的数量 {`lever.key + '-' + tag`:数量}
	selectedRowKeys: [],
	filterValuesMap: {
		province: [],
		city: [],
		region: [],
	},
	provinceTags: [],
	cityTags: [],
	regionTags: [],
})

function customSort(array, levelKey = '', textKey = 'value') {
	return array.sort((a, b) => {
		const textA = a[textKey];
		const textB = b[textKey];

		// 检查是否包含括号
		const hasParenA = state.statsMap[levelKey + '-' + textA] > 0; // textA.includes('(');
		const hasParenB = state.statsMap[levelKey + '-' + textB] > 0;// textB.includes('(');
		// console.log("customSort :", levelKey, textA, textB, hasParenA, hasParenB)

		// 如果一个有括号一个没有，有括号的排在前面
		if (hasParenA && !hasParenB) return -1;
		if (!hasParenA && hasParenB) return 1;

		// 都有括号或都没有括号，按拼音排序
		return textA.localeCompare(textB, 'zh-CN');
    });
}
	
const getData = async () => {
	state.loading = true;

	if (!state.filterValuesMap['city']?.length) {
		try {
			let result = null
			if (!gUserRoles.value.includes('mgr') && !gUserRoles.value.includes('admin')) {
		      if (props.fromWhichComponent === 'project_center') {
		        result = await getIndustrFieldValues('touyan_report_project_field_values_proj_center_dgy');
		      } else {
		        result = await getIndustrFieldValues('touyan_report_project_field_values_info_center_dgy');
		      }
		    } else {
		      if (props.fromWhichComponent === 'project_center') {
		        result = await getIndustrFieldValues('report_project_field_values_proj_center_gsh');
		      } else {
		        result = await getIndustrFieldValues('report_project_field_values_info_center_gsh');
		      }
		    }

			state.provinceTags = result?.result?.[0]?.province_values?.split(',')?.map((item) => {
		      let [name, code] = item.split(':');
		      return name;
		    });

			state.cityTags = result?.result?.[0]?.city_values?.split(',')?.map((item) => {
		      let [name, code] = item.split(':');
		      return name;
		    });

		    state.regionTags = result?.result?.[0]?.region_values?.split(',')?.map((item) => {
		      let [name, code] = item.split(':');
		      return name;
		    });

			const cityList = getCitiesByProvinces(state.provinceTags)
			// console.log('cityList :', cityList, state.provinceTags)
			state.filterValuesMap['city'] = customSort(pinyinSort(
			      cityList
			        .map((city) => ({
					  ...city,
			          text: city.name,
			          value: city.name,
			        })),
			      'text',
			    ), 'cityMap');

			const regionList = getRegionsByCities(cityList)
			state.filterValuesMap['region'] = customSort(pinyinSort(
				regionList
		        .map((city) => ({
					...city,
		          text: city.name,
		          value: city.name,
		        })),
		      'text',
		    ), 'regionMap');
		} catch (e) {}
	}

	let func = getProjectList;
	let params = {
		column: 'investDate',
		order: 'desc',
		pageNo: 1,
		pageSize: 100000,
		type: 1
	}
	switch(state.selectedOption) {
		case '推送列表':
			func = getPushList;
			params = {
			    column: 'op_status',
				order: 'asc',
				pageNo: 1,
				pageSize: 100000,
				type: 1
			}
			break;
		case '删除列表':
			func = getDeleteList;
			params = {
				column: 'op_status',
				order: 'asc',
				pageNo: 1,
				pageSize: 100000,
				type: 1
			}
			break;
	}
	
    func(params).then((res) => {
		if (['推送列表', '删除列表'].includes(state.selectedOption)) {
			state.allRecords = res?.result?.records || [];
			state.total = res?.result?.total || 0;
		} else {
	        state.allRecords = res?.result?.pageList?.records?.sort?.((a, b) => {
		        if (a.name === b.name) {
		          return new Date(b.investDate) - new Date(a.investDate);
		        } else {
		          // return a.name.localeCompare(b.name);
		        }
		    }) || [];

			state.total = res?.result?.pageList?.total || 0;
		}
		handleFilterChange()
    }).finally(() => {
		state.loading = false;
	})
}

const handleSearch = () => {
	getData()
}

const handleFilterChange = async () => {
	state.selectedRowKeys = []
	const tempAllRecords = await getProjectsFilter({
		data: [...state.allRecords], 
		filters: state.params.filters,
		searchKey: state.params.searchKey,
		sorts: state.recordType === 'merge' ? state.params.sorts : [{field:'name', order: 'asc'}]
	})
	
	if (state.recordType === 'merge') {
		// 合并数据
		state.filterAllRecords = mergeRecordsByName(tempAllRecords);
	} else {
		state.filterAllRecords = [...tempAllRecords]
	}
	// state.filterRecords = getProjectsPages([...state.filterAllRecords], state.params.pageNo, state.params.pageSize)

	// 每个标签数量统计
	state.statsMap = getProjectCountMap([...tempAllRecords]);
	// console.log("statsMap :", state.statsMap)
}

const updateSearchKey = (key) => {
	state.params.searchKey = key;
	handleFilterChange()
}

const updateFilters = (filters) => {
	state.params.filters = filters;
	handleFilterChange()
}

const handleExport = async () => {
	exportToExcel(state.filterAllRecords);
}

const handleAdd = () => {
	console.log('handleAdd')
}

const handleToggleMerge = () => {
    if (state.recordType === 'merge') {
		state.recordType = 'single'
	} else {
		state.recordType = 'merge'
	}
	handleFilterChange();
}

const handleBatchPush = () => {
	console.log('handleBatchPush')
}

const handleEdit = () => {
	console.log('handleEdit')
}

// 还原
const handleRestore = (id) => {
	return new Promise((resolve) => {
		restoreProject({
			id: Array.isArray(id) ? id.join(",") : id
		}).then(res => {
			if (res.message) {
				message.success(res.message)
			}
			getData()
		}).finally(() => {
		    return resolve(true)
		})
	})
}
// 普通删除
const handleRemove = (id) => {
	return new Promise((resolve) => { 
		removeProject({
			id: Array.isArray(id) ? id.join(",") : id
		}).then(res => {
			message.success(res.message)
			getData()
		}).finally(() => {
		    return resolve(true)
		})
	})
}


// 彻底删除
const handleDelete = (id) => {
	return new Promise((resolve) => { 
		deleteProject({
			id: Array.isArray(id) ? id.join(",") : id
		}).then(res => {
			message.success(res.message)
			getData()
		}).finally(() => {
		    return resolve(true)
		})
	})
}

const handleSelectChange = (value) => {
	console.log("handleSelectChange", value)
	getData()
}

const onSelectChange = (key) => {
	console.log("keys :", key)
	if (state.selectedRowKeys.includes(key)) {
		state.selectedRowKeys = state.selectedRowKeys.filter(item => item !== key)
	} else {
		state.selectedRowKeys.push(key)
	}
	// state.selectedRowKeys = keys
}

const handleCheckGroupChange = (checkList, column) => {
	// console.log("checkList :", checkList, column, selectedKeys)
	filterRef.value?.setFilterItem(column.dataIndex, checkList)

	if (column.dataIndex === 'provinceMap') {
		// 更改城市、区可选项
	}

	if (column.dataIndex === 'cityMap') {
		// 更改区可选择，省选择
	}

	if (column.dataIndex === 'regionMap') {
		// 选中上级，省、市、区都选中
		
	}
}

const handleReset = (column) => {
	// console.log("setSelectedKeys, selectedKeys, confirm, clearFilters, column :", setSelectedKeys, selectedKeys, confirm, clearFilters, column)
	filterRef.value?.setFilterItem(column.dataIndex, [])

}

onMounted(() => {
	const provinceValues = []
	for (const key in provinceOrder) {
		provinceValues.push(key)
	}
	state.filterValuesMap.province = provinceValues.map(item => {
		return {
			text: item,
			value: item
		}
	})
	getData()
})
</script>
<style lang="less" scoped>
.project-wrap {
	display: flex;
	flex-direction: column;
	height: 100%;
	.filter-container {
		margin-bottom: 8px;
		flex-shrink: 0;
		flex-grow: 0;
	}
	.table-container {
		flex-grow: 1;
		flex-shrink: 1;
	}
	:deep(.ant-btn) {
		margin-right: 4px;
		margin-bottom: 4px;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		.icon {
			fill: var(--active-color);
		}
		&:disabled {
			border-color: #d9d9d9;
		    color: rgba(0, 0, 0, 0.25);
		    background-color: rgba(0, 0, 0, 0.04);
		    box-shadow: none;
			.icon {
			    fill: rgba(0, 0, 0, 0.25);
			}
		}
	}

	.action-btn {
		padding: 0px 7px;
		cursor: pointer;
		:deep(svg) {
			height: 16px;
			color: #555;
		}
		&:hover {
		    :deep(svg) {
				color: var(--active-color);
			}
		}
		&.danger {
			:deep(svg) {
				color: #888888;
			}
			&:hover {
				:deep(svg) {
					color: #ED6F6F;
				}
			}
		}
	}
}
</style>