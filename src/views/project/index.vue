<template>
	<div class="project-wrap">
		<div class="filter-container">
			<Search @search="updateSearchKey" @success="handleSearch" @export="handleExport" />
			<Filter ref="filterRef" :statsMap="state.statsMap" @filterChange="updateFilters" />
			<!-- 接口返回total：{{ state.total }}<br />
			过滤后总记录数：{{ state.filterAllRecords.length }}<br />
			合并前总记录数：{{ state.allRecords.length }} -->
			
		</div>
		<Table :dataSource="state.filterAllRecords" :columns="getProjectColumns(state.params.filters)" :isFixedMaxHeight="true">
			<template #header-left>
				<div>
					<a-button type="primary" ghost :icon="h(PlusOutlined)" @click="handleAdd">新增</a-button>
					<a-button v-if="state.recordType === 'merge'" type="primary" ghost :icon="h(ExpandOutlined)" @click="handleToggleMerge">展开</a-button>
					<a-button v-else type="primary" ghost :icon="h(MergeCellsOutlined)" @click="handleToggleMerge">展开</a-button>
					<a-button type="primary" ghost :disabled="true" @click="handleBatchPush">
						<template #icon>
							<svg  style="width: 16px;height: 16px;margin-right: 8px;" t="1749093877974" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4326" width="24" height="24"><path d="M96 800c-10.4 0-21-2.8-30.6-8.2-20.6-11.6-33.4-34.2-33.4-58.8v-442c0-24.8 13-47.4 33.8-59 19.6-11 42.8-10.6 62 1.2l361.4 216.2v-158.4c0-24.8 13-47.4 33.8-59 19.6-11 42.8-10.6 62 1.2l377.6 226c18.4 11 29.4 30.8 29.4 53s-11 42-29.4 53l-377.8 226c-19.4 11.6-42.6 11.8-62.2 0.6-20.6-11.8-33.4-34.4-33.4-58.8v-158L127.6 791.2c-9.8 6-20.8 8.8-31.6 8.8z m457.6-511c-0.2 0.4-0.4 1.2-0.4 2v442c0 1 0.2 1.8 0.4 2.4l373-223.2-373-223.2z m-457.2 0c-0.2 0.4-0.4 1.2-0.4 2v442c0 1 0.2 1.8 0.4 2.4l373-223.2L96.4 289z" p-id="4327"></path></svg>
						</template>
						批量推送
					</a-button>
					<a-button type="primary" ghost :icon="h(EditOutlined)" @click="handleEdit">批量编辑</a-button>
					<a-button type="primary" danger ghost :icon="h(DeleteOutlined)" @click="handleDelete">批量删除</a-button>
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
			<template #name="{ column, record, index, text }">
		        <a style="color: rgba(0, 0, 0, 0.65)" @click="handleEdit(record)">
		          <span style="display: flex; align-items: center;">{{ record.name }}</span>
		        </a>
		    </template>
		</Table>
	</div>
</template>
<script setup>
import Search from './components/search.vue'
import Filter from './components/filter.vue'
import { h, reactive, onMounted, ref } from "vue"
import { getProjectList } from "@/api/industry";
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
	FilterFilled
} from "@ant-design/icons-vue";
import BatchPushIcon from "@/assets/img/batchPushIcon.svg"

const filterRef = ref(null)
const state = reactive({
	loading: false,
	selectedOption: '项目列表',
	params: {
       pageNo: 1,
       pageSize: 10,
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
	columns: []
})

const getData = () => {
	state.loading = true;
	
    getProjectList({
		column: 'investDate',
		order: 'desc',
		pageNo: 1,
		pageSize: 100000,
		type: 1
	}).then((res) => {
        state.allRecords = res?.result?.pageList?.records?.sort?.((a, b) => {
	        if (a.name === b.name) {
	          return new Date(b.investDate) - new Date(a.investDate);
	        } else {
	          // return a.name.localeCompare(b.name);
	        }
	    }) || [];

		state.total = res?.result?.pageList?.total || 0;
		handleFilterChange()
    }).finally(() => {
		state.loading = false;
	})
}

const handleSearch = () => {
	getData()
}

const handleFilterChange = async () => {
	const tempAllRecords = await getProjectsFilter({
		data: [...state.allRecords], 
		filters: state.params.filters,
		searchKey: state.params.searchKey,
		sorts: state.params.sorts
	})
	
	if (state.recordType === 'merge') {
		// 合并数据
		state.filterAllRecords = mergeRecordsByName(tempAllRecords);
	} else {
		state.filterAllRecords = [...tempAllRecords]
	}
	state.filterRecords = getProjectsPages([...state.filterAllRecords], state.params.pageNo, state.params.pageSize)

	// 每个标签数量统计
	state.statsMap = getProjectCountMap([...tempAllRecords]);
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
}

const handleBatchPush = () => {
	console.log('handleBatchPush')
}

const handleEdit = () => {
	console.log('handleEdit')
}

const handleDelete = () => {
	console.log('handleDelete')
}

const handleSelectChange = (value) => {
	console.log("handleSelectChange", value)
}

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
		.icon {
			fill: var(--active-color);
		}
		&:disabled {
			.icon {
			    fill: rgba(0, 0, 0, 0.25);
			}
		}
	}
}
</style>