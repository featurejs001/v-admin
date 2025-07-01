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
			scrollToFirstRowOnChange: true,
			loading: state.loading,
			pagination: false,
			dataSource: state.filterRecords,
			columns: getProjectColumns(state.params.filters, state.filterValuesMap, state.filterRecords, state.recordType, state.selectedOption),
			bordered: true,
			
		 }"
		 :pagination="{
			total: state.params.total,
			current: state.params.pageNo,
			defaultPageSize: state.params.pageSize,
			showTotal: (total) => `共 ${total} 条数据`,
			showQuickJumper: true,
		  }"
		 :isFixedMaxHeight="true"
		 @change="handleTableChange"
		 @pageChange="handlePageChange"
		 >
			<template #header-left>
				<div style="display: flex; align-items: center;">
					<a-button type="primary" ghost :icon="h(PlusOutlined)" @click="handleAdd">新增</a-button>
					<a-button v-if="state.recordType === 'merge'" type="primary" ghost :icon="h(ExpandOutlined)" @click="handleToggleMerge">展开</a-button>
					<a-button v-else type="primary" ghost :icon="h(MergeCellsOutlined)" @click="handleToggleMerge">合并</a-button>
					<a-button type="primary" ghost :disabled="!state.selectedRowKeys.length" @click="handleBatchPush(state.selectedRowKeys)">
						<template #icon>
							<svg  style="width: 16px;height: 16px;margin-right: 8px;" t="1749093877974" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4326" width="24" height="24"><path d="M96 800c-10.4 0-21-2.8-30.6-8.2-20.6-11.6-33.4-34.2-33.4-58.8v-442c0-24.8 13-47.4 33.8-59 19.6-11 42.8-10.6 62 1.2l361.4 216.2v-158.4c0-24.8 13-47.4 33.8-59 19.6-11 42.8-10.6 62 1.2l377.6 226c18.4 11 29.4 30.8 29.4 53s-11 42-29.4 53l-377.8 226c-19.4 11.6-42.6 11.8-62.2 0.6-20.6-11.8-33.4-34.4-33.4-58.8v-158L127.6 791.2c-9.8 6-20.8 8.8-31.6 8.8z m457.6-511c-0.2 0.4-0.4 1.2-0.4 2v442c0 1 0.2 1.8 0.4 2.4l373-223.2-373-223.2z m-457.2 0c-0.2 0.4-0.4 1.2-0.4 2v442c0 1 0.2 1.8 0.4 2.4l373-223.2L96.4 289z" p-id="4327"></path></svg>
						</template>
						批量推送
					</a-button>
					<a-button type="primary" ghost :disabled="!state.selectedRowKeys.length" :icon="h(EditOutlined)" @click="handleBatchEdit">批量编辑</a-button>
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
				<a-tooltip placement="top" :trigger="String(text).length*15 >= column.width ? 'hover' : 'none'">
					<template #title>
						<div>{{ text }}</div>
					</template>
			        <a class="overflow-ellipsis" style="color: rgba(0, 0, 0, 0.65)" @click="handleToRow(record)">
			          {{ record.name }}
			        </a>
				</a-tooltip>
		    </template>
			<template #editCommon="{ column, record, index, text }">
				<a-tooltip placement="top" v-if="state.edit.index !== index" :trigger="String(text).length > 10 ? 'hover' : 'none'">
					<template #title>
						<div v-html="text"></div>
					</template>
					<div class="overflow-ellipsis" v-html="text">
					</div>
				</a-tooltip>
				<div v-else-if="state.edit.field !== column.dataIndex || state.edit.isModal" class="overflow-ellipsis edit-span" @click="handleEdit(index, column.dataIndex, column.title)"  v-html="text">
				</div>
				<a-select
			      v-else-if="editSelectOptions.length"
			      v-model:value="state.edit.value"
				  size="small"
				  class="w-full"
			      @select="handleChangeValue"
			    >
					<a-select-option v-for="item in editSelectOptions" :key="item" :value="item">{{ item }}</a-select-option>
				</a-select>
				<a-date-picker
				 v-model:value="state.edit.value" 
				 v-else-if="column.dataIndex === 'foundationDate'" 
				 valueFormat="YYYY-MM-DD"
				 size="small"
				 class="w-full"
				 @change="handleChangeValue" />
			</template>
			<template #action1="{ column, record, index, text }">
				<a-tooltip v-if="state.edit.index === index" placement="bottom" trigger="hover">
		          <template #title>
		            <span>完成</span>
		          </template>
				  <CheckOutlined class="action-btn" @click="state.edit.index = -1" />
				</a-tooltip>
				<a-tooltip v-else placement="bottom" trigger="hover">
		          <template #title>
		            <span>编辑</span>
		          </template>
		          <EditOutlined class="action-btn" @click="handleEdit(index, 'stage', column.title)" />
		        </a-tooltip>
				
				<template v-if="['项目列表', '推送列表'].includes(state.selectedOption)">
					<a-tooltip placement="bottom" trigger="hover">
			          <template #title>
			            <span>推送</span>
			          </template>
			          <ForwardOutlined class="action-btn" @click="handleBatchPush(record.projectId)" />
			        </a-tooltip>
					<a-popconfirm
					    title="是否确认删除?"
					    @confirm="() => handleRemove(record.projectId)"
					>
						<template #default>
							<a-tooltip placement="bottom" trigger="hover">
								<template #title>
									<span>删除</span>
								</template>
								<DeleteOutlined class="action-btn danger" />
					        </a-tooltip>
						</template>
					</a-popconfirm>
				</template>
				<template v-else-if="['删除列表'].includes(state.selectedOption)">
					<a-popconfirm
					    title="是否确认还原?"
					    @confirm="() => handleRestore(record.projectId)"
					>
						<template #default>
							<a-tooltip class="max-content" placement="bottom" trigger="hover">
								<template #title>
									<span>取回</span>
								</template>
								<RedoOutlined class="action-btn" />
					        </a-tooltip>
						</template>
					</a-popconfirm>
					<a-popconfirm
					    title="是否确认删除?"
					    @confirm="() => handleDelete(record.projectId)"
					>
						<template #default>
							<a-tooltip placement="bottom" trigger="hover">
								<template #title>
									<span>彻底删除</span>
								</template>
								<ScissorOutlined class="action-btn danger" />
					        </a-tooltip>
						</template>
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
					  	:style="{marginBottom: '4px', order: !['provinceMap', 'cityMap', 'regionMap'].includes(column.dataIndex) || state.statsMap[column.dataIndex + '-' + item.value] > 0 ? 0 : 1}"
						@change="(e) => handleCheckboxChange(e, column, item.value)"
						>
		                {{ item.text }}
						<span>({{ state.statsMap[column.dataIndex + '-' + item.value] || 0 }})</span>
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
		<UserSelectModal ref="userSelectModalRef" title="选择推送用户" :showShare="true" @ok="handleSelectCallback" />
		<BatchEditModal ref="batchEditModalRef"
		 @success="getData" 
		 :stageList="state.filterValuesMap?.stage || []"
		 :followStageList="state.filterValuesMap?.followStage || []"
		 />
		 <EditFieldModal 
		 	v-model="state.edit.modal"
			:title="state.edit.title"
		 	:field="state.edit.field"
		 	:record="state.filterRecords[state.edit.index]"
			:allDomain="state.filterValuesMap?.allDomain || []"
		 	@success="() => {state.edit.modal = false; getData()}"
			@close="state.edit.modal = false"
		 />
	</div>
</template>
<script setup>
import Search from './components/search.vue'
import Filter from './components/filter.vue'
import { h, reactive, onMounted, ref, computed } from "vue"
import { 
	getProjectList,
	getPushList,
	getDeleteList,
	getIndustrFieldValues,
	removeProject,
	deleteProject,
	restoreProject,
	editProject
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
	ScissorOutlined,
	CheckOutlined
} from "@ant-design/icons-vue";
import { message } from 'ant-design-vue';
import BatchPushIcon from "@/assets/img/batchPushIcon.svg"
import UserSelectModal from "@/components/user/selectModal.vue"
import { pushProject } from "@/api/industry";
import BatchEditModal from "./components/BatchEditModal.vue"
import { getTextByCode } from "@/utils/areaDataUtil"
import EditFieldModal from "./components/EditFieldModal.vue"

const props = defineProps({
    fromWhichComponent: {
        type: String,
		default: 'project_center'
    }
})

const userSelectModalRef = ref(null)
const batchEditModalRef = ref(null)
const filterRef = ref(null)
const state = reactive({
	loading: false,
	selectedOption: '项目列表',
	params: {
	   total: 0,
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
	},
	edit: {
		index: -1,
		field: '',
		value: '',
		modal: false
	}
})

const editSelectOptions = computed(() => {
	/*const record = state.filterRecords[state.edit.index];
	if (!record) return [];

    if ('domain2' === state.edit.field) {
        return state.filterValuesMap?.allDomain?.filter?.(item => item.domain1 === record.domain1)?.map(item => {
			item.domain2;
		}) || []
    } else if ('domain3' === state.edit.field) {
		return state.filterValuesMap?.allDomain?.filter?.(item => item.domain1 === record.domain1 && item.domain2 === record.domain2)?.map(item => {
			item.domain3;
		}) || []
    } else if ('cityMap' === state.edit.field) {
		return getCityOptions(record.provinceMap);
	} else if ('regionMap' === state.edit.field) {
		return getRegionOptions( record.cityMap, record.provinceMap );
	}*/

	return state.filterValuesMap[state.edit.field] || [];
})
	
const getData = async () => {
	state.loading = true;

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

const getPageRecord = () => {
	if (state.recordType === 'merge') {
		const pages = getProjectsPages([...state.filterAllRecords], state.params.pageNo, state.params.pageSize);
		// console.log("...stateleng :", pages)
		state.params.total = pages.total;
		state.filterRecords = pages.items;
	} else {
		const names = Array.from(new Set(state.filterAllRecords.map(item => item.name)));
		state.params.total = names.length;
		const pages = getProjectsPages([...names], state.params.pageNo, state.params.pageSize);
		console.log("...stateleng :", pages)
		const tempList = []
		pages.items.forEach((name) => {
			const temp = state.filterAllRecords.filter(item => item.name === name)
			tempList.push(...temp);
		});
		console.log("filter lllll :", tempList.length)
		state.filterRecords = [...tempList]
	}
	
}

const handleFilterChange = async () => {
	
	state.selectedRowKeys = []
	const tempAllRecords = await getProjectsFilter({
		data: [...state.allRecords], 
		filters: state.params.filters,
		searchKey: state.params.searchKey,
		sorts: state.params.sorts
	})
	state.params.pageNo = 1;
	
	if (state.recordType === 'merge') {
		// 合并数据
		state.filterAllRecords = mergeRecordsByName(tempAllRecords);
	} else {
		state.filterAllRecords = [...tempAllRecords]
	}
	
	getPageRecord()

	// 每个标签数量统计
	state.statsMap = getProjectCountMap([...tempAllRecords]);
	// console.log("statsMap :", state.statsMap)
}

const updateSearchKey = (key) => {
	state.params.searchKey = key;
	handleFilterChange()
}

const updateFilters = (data) => {
	// console.log('updateFilters :', data)
	state.params.filters = data.filters || {};
	state.filterValuesMap = data.filterValuesMap || {}
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

const handleBatchPush = (id) => {
	console.log('handleBatchPush')
	userSelectModalRef.value?.handleOpen?.({
		id: Array.isArray(id) ? id.join(",") : id,
	});
}

const handleEdit = (index, field, title) => {
	const record = {...state.filterRecords[index]};
	let value = record[field];
	let modal = false;
	if (['domain1', 'domain2', 'domain3'].includes(field)) {
		modal = true;
		title = '赛道编辑'
	} else if (['provinceMap', 'cityMap', 'regionMap'].includes(field)) {
		modal = true
		title = '选择地区';
	} else if (!['foundationDate'].includes(field) && !state.filterValuesMap[field]?.length) {
		modal = true;
	}
	
	Object.assign(state.edit, {
		index,
		field,
		value,
		modal,
		title,
		isModal: modal, // 是否弹框修改
	})
	console.log('handleEdit', state.edit)
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

const handleCheckboxChange = (e, column, value) => {
	console.log("handleCheckboxChange :", e, column, value)
	filterRef.value?.handleCheckedTag(column.dataIndex, value);
}

const handleCheckGroupChange = (checkList, column) => {
	// 注释掉的原因：联动
	// console.log("checkList :", checkList, column, selectedKeys)
	// filterRef.value?.setFilterItem(column.dataIndex, checkList)
}

const handleReset = (column) => {
	// console.log("setSelectedKeys, selectedKeys, confirm, clearFilters, column :", setSelectedKeys, selectedKeys, confirm, clearFilters, column)
	// filterRef.value?.setFilterItem(column.dataIndex, [])
	filterRef.value?.handleClickAll(column.dataIndex)

}

const handleSelectCallback = (params) => {
	pushProject({
		id: params.id,
		share_type: params.shareType,
		users: params.userIds.join(","),
	}).then((res) => {
		message.success(res.message)
		userSelectModalRef.value?.handleClose?.()
		getData()
	}).catch(() => {
	})
}

// 批量修改
const handleBatchEdit = () => {
    batchEditModalRef.value?.handleOpen?.({
		ids: state.selectedRowKeys,        
    })
}

const handlePageChange = (params) => {
	state.params.pageNo = params.current;
	state.params.pageSize = params.pageSize;
	getPageRecord()
}

const handleTableChange = (params) => {
	// console.log("params :", params)
	if (params.sorter?.field && params.sorter?.order) {
		state.params.sorts = [{
			field: params.sorter.field,
			order: params.sorter.order === 'ascend' ? 'asc' : 'desc'
		}]
	} else {
		state.params.sorts = []
	}
	handleFilterChange()
}

// 修改数据
const handleChangeRow = (params) => {
}

// 修改列数据
const handleChangeValue = () => {
	if (-1 === state.edit.index || !state.edit.field || !state.edit.value) {
		message.error("请选择修改项");
		return;
	}
	const obj = {
		...state.filterRecords[state.edit.index],
		[state.edit.field]: state.edit.value
	}

	editProject(obj).then(res => {
		message.success("修改成功")
		getData()
	})
}


// 
const handleToRow = () => {}

onMounted(() => {
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

	.edit-span {
		background-color: rgba(24, 144, 255, 0.1);
		width: 100%;
		min-height: 13px;
		cursor: pointer;
	}
}
</style>