<template>
	<div class="project-wrap">
		<div class="filter-container">
			<Search
			 :showImport="false"
			 :showExport="false"
			 :showRedo="true"
			 @search="updateSearchKey" 
			 @clearSearch="clearSearch" 
			 @success="handleSearch" 
			 @export="handleExport" 
			/>
			<Filter
			 ref="filterRef" 
			 :statsMap="state.statsMap" 
			 :isOption="true"
			 @filterChange="updateFilters" 
			 />
		</div>
	</div>
</template>
<script setup>
import Search from './components/search.vue'
import Filter from './components/filter.vue'
import { reactive, ref } from "vue";

const filterRef = ref(null)
const state = reactive({
	statsMap: {}, // 每个标签数量统计
	filterValuesMap: {},
	params: {
		searchKey: '',
	}
})

const handleFilterChange = () => {}

const updateSearchKey = (key) => {
	state.params.searchKey = key;
	handleFilterChange()
}

const clearSearch = () => {
	state.params.searchKey = ''
	filterRef.value?.handleClickAll('')
}

const updateFilters = (data) => {
	// console.log('updateFilters :', data)
	state.params.filters = data.filters || {};
	state.filterValuesMap = data.filterValuesMap || {}
	handleFilterChange()
}

const handleSearch = () => {
	handleFilterChange()
}

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
}
</style>