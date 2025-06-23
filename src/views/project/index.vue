<template>
	<div class="project-wrap">
		<div class="filter-container">
			<Search @search="updateSearchKey" @success="handleSearch" @export="handleExport" />
			<Filter ref="filterRef" :statsMap="state.statsMap" @filterChange="updateFilters" />
			接口返回total：{{ state.total }}<br />
			过滤后总记录数：{{ state.filterAllRecords.length }}<br />
			合并前总记录数：{{ state.allRecords.length }}
		</div>
	</div>
</template>
<script setup>
import Search from './components/search.vue'
import Filter from './components/filter.vue'
import { reactive, onMounted, ref } from "vue"
import { getProjectList } from "@/api/industry";
import { mergeRecordsByName, getProjectsFilter, getProjectsPages, getProjectCountMap, exportToExcel } from "@/utils/projectHelper";

const filterRef = ref(null)
const state = reactive({
	loading: false,
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

onMounted(() => {
	getData()
})
</script>
<style lang="less" scoped>
.project-wrap {
	display: flex;
	flex-direction: column;
	height: 100%;
	overflow-y: auto;
	.filter-container {
		margin-bottom: 8px;
		flex-shrink: 0;
		flex-grow: 0;
	}
	.table-container {
		flex-grow: 1;
		flex-shrink: 1;
	}
}
</style>