<template>
	<div class="table-wrap">
		<div class="header" v-if="!$props.isHideLeft">
			<slot name="header-left"></slot>
			<a-popconfirm
			 v-if="$props.isShowColumnSetting"
			 ok-text="保存" 
			 cancel-text="重置" 
			 @cancel="handleSettingReset"
			 @confirm="handleSettingSave"
			 overlayClassName="custom-popconfirm" 
			 placement="bottomRight" 
			 trigger="click">
			 	<template #default>
					<a-tooltip placement="top">
						<template #title>
							列设置
						</template>
						<SettingOutlined class="setting-icon" />
					</a-tooltip>
				</template>
				<template #icon>
				</template>
				<template #title>
					<div style="width: 260px;display: flex; justify-content: space-between;">
						<a-checkbox
					      v-model:checked="state.sorter.checkAll"
					      :indeterminate="state.sorter.indeterminate"
						  class="custom-checkbox"
					      @change="onColumnCheckAllChange"
					    >
						列展示
						</a-checkbox>
						<a-checkbox
					      v-model:checked="state.sorter.showDataIndex"
						  class="custom-checkbox"
					      @change="onColumnIndexChange"
					    >
						序号列
						</a-checkbox>
					</div>
				</template>
				<template #description>
					<VueDraggable ref="el" class="list" v-model="state.sorter.columns" handle=".dragHandle" @end="onSorterEnd">
						<div class="list-item" v-for="item in state.sorter.columns" :key="item.dataIndex" v-show="!isHideColumn(item.dataIndex)">
							<div :class="[isColumnSettingDrag(item.dataIndex) ? 'dragHandle' : '']">
								<MenuOutlined  style="margin-right: 5px;" />
							</div>
							<a-checkbox
							 :checked="state.sorter.selectedColumns.includes(item.dataIndex)" 
							 class="custom-checkbox"
							 @change="onColumnCheckChange(item.dataIndex)">
							 {{ item.title }}
							</a-checkbox>
						</div>
					</VueDraggable>
				</template>
			</a-popconfirm>
		</div>
		<div class="table-content" ref="tableRef">
			<a-table 
			@resizeColumn="handleResizeColumn" 
			v-bind="{...$props.tableProps, columns: tableColumns}" 
			:scroll="state.scroll" @change="handleTableChange" size="small">
				<template #headerCell="{ column }">
		          <span v-if="column.isCheckbox" >选择</span>
		          <slot v-else-if="column.titleSlot" :name="column.titleSlot" v-bind="column">序号</slot>
		          <span v-else >{{ column.title }}</span>
		        </template>
				<template #bodyCell="data">
			          <!-- update-begin--author:liaozhiyang---date:220230717---for：【issues-179】antd3 一些警告以及报错(针对表格) -->
			          <!-- update-begin--author:liusq---date:20230921---for：【issues/770】slotsBak异常报错的问题,增加判断column是否存在 -->
					  <template v-if="data.column?.slot === 'commonRowIndex'">
						{{ Number(data.index) + 1 }}
					  </template>
			          <slot v-else-if="data.column?.slot" :name="data.column?.slot" v-bind="data || {}"></slot>
					  <template v-else-if="'function' === typeof data.column?.customRender">
						{{ data.column.customRender(data) }}
					  </template>
			          <template v-else>
			            <span>{{ data.record[data.column?.dataIndex] }}</span>
			          </template>
			          <!-- update-begin--author:liaozhiyang---date:22030717---for：【issues-179】antd3 一些警告以及报错(针对表格) -->
		        </template>
				<template #customFilterIcon="{ filtered }">
					<FilterOutlined v-if="!filtered" />
					<FilterFilled v-else />
				</template>
				<template v-if="$slots['customFilterDropdown']" #customFilterDropdown="props">
					<slot name="customFilterDropdown" v-bind="props"></slot>
				</template>
			</a-table>
			<div class="pagination">
				<a-pagination v-if="pagination" v-bind="$props.pagination" size="small" @change="onChangePage" />
			</div>
		</div>
	</div>
</template>
<script setup>
import { SettingOutlined, FilterOutlined, FilterFilled, MenuOutlined } from '@ant-design/icons-vue'
import { defineProps, toRefs, ref, onMounted, reactive, onBeforeUnmount, computed, watch } from "vue"
import { VueDraggable } from 'vue-draggable-plus'
import { useRoute } from "vue-router";
import { useTableColumnWidth } from '@/utils/useTableColumnWidth'
import { useUser } from "@/store/user";
// import 'ant-design-vue/dist/antd.css'

const route = useRoute();

const emits = defineEmits(["change", "pageChange"])
const props = defineProps({
	tableProps: {
		type: Object,
		default: () => ({
			dataSource: [],
			columns: []
		})
	},
	pagination: {
		type: [Object, Boolean],
		default: false
	},
	// dataSource: {
	// 	type: Array,
	// 	default: () => []
	// },
	// columns: {
	// 	type: Array,
	// 	default: () => []
	// },
	// scroll: {
	// 	type: Object,
	// 	default: () => ({ x: '100%' })
	// },
	isFixedMaxHeight: {
		type: Boolean,
		default: false
	},
	minHeight: {
		type: Number,
		default: 400
	},
	isHideLeft: {
		type: Boolean,
		default: false
	},
	isShowColumnSetting: {
	    type: Boolean,
		default: true
	}
})
// console.log("props:", props)

const { tableProps, isFixedMaxHeight } = toRefs(props)

const tableRef = ref(null);
const state = reactive({
	scroll: {
		x: tableProps.value?.scroll?.x || '100%',
		y: tableProps.value?.scroll?.y || undefined
	},
	sorter: {
		indeterminate: false,
		checkAll: false,
		showDataIndex: false, // 是否显示序号列
		columns: [], // 排序得字段
		selectedColumns: []
	}
})
const isResizing = ref(false);

const tableColumns = computed(() => {
	const fields = tableProps.value.columns.filter(item => {
		if (item.isHide) return false;
		return -1 !== state.sorter.selectedColumns.indexOf(item.dataIndex)
	});
	fields.sort((a, b) => {
		const indexA = state.sorter.columns.findIndex(item => item.dataIndex === a.dataIndex)
		const indexB = state.sorter.columns.findIndex(item => item.dataIndex === b.dataIndex)
		return indexA - indexB
	})
	
	if (state.sorter.showDataIndex) {
		fields.unshift({
			title: '序号',
			dataIndex: 'index',
			slot: 'commonRowIndex',
			isCheckbox: false,
			width: 60,
			align: 'center',
			fixed: 'left',
			resizable: true
		})
	}
	return fields;
})
const userStore = useUser();
const columns = ref(tableProps.value.columns) // 或者直接 tableProps.value.columns
const tableKey = props.tableProps.dataIndex || 'defaultTable'
const username = userStore.userInfo.realname || 'guest'
const { saveColumnWidths, applyColumnWidths } = useTableColumnWidth(columns, tableKey, username)
const handleResizeColumn = (width, column) => {
	isResizing.value = true;
  const col = tableProps.value.columns.find(c => c.dataIndex === column.dataIndex)
  if (col) col.width = width
  saveColumnWidths()
  setTimeout(() => {
    isResizing.value = false;
  }, 200); // 拖拽结束后短暂延迟
}
const isHideColumn = computed(() => {
	return (dataIndex) => {
		const item = tableProps.value.columns.find(item => item.dataIndex === dataIndex);
		return item?.isHide || item?.columnSettingHide || false;
	}
})

const isColumnSettingDrag = computed(() => {
	return (dataIndex) => {
	    const item = tableProps.value.columns.find(item => item.dataIndex === dataIndex);
		return false === item?.columnSettingDrag ? false : true;
	}
})

const handleSettingSave = () => {
	console.log('save')
	const cacheData = state.sorter.columns.map((item) => {
	    return {
			...item,
			selected: state.sorter.selectedColumns.includes(item.dataIndex)
		}
	})
	localStorage.setItem('columnSettings-' + route.name, JSON.stringify(cacheData));
}

const handleSettingReset = () => {
	state.sorter.showDataIndex = false;
	state.sorter.columns = tableProps.value.columns.map((item) => {
		return {
			dataIndex: item.dataIndex,
			title: item.title
		}
	})
	state.sorter.selectedColumns = tableProps.value.columns.map((item) => item.dataIndex)
	state.sorter.checkAll = state.sorter.selectedColumns.length === tableProps.value.columns.length
	localStorage.removeItem('columnSettings-' + route.name);
}

const handleTableChange = (pagination, filters, sorter) => {
	if (isResizing.value) {
		// 阻止排序
		return;
	}
	console.log('pagination, filters, sorter', pagination, filters, sorter)
	emits("change", { pagination, filters, sorter })
}

const onSorterEnd = () => {
	// console.log('onSorterEnd', state.sorter.columns)
}

const handleResize = () => {
	
	if (isFixedMaxHeight.value) {
		let y = Math.floor(document.body.clientHeight - tableRef.value?.getBoundingClientRect?.()?.top - 120);
		console.log('pageYOffset :', document.body.clientHeight, tableRef.value?.getBoundingClientRect?.()?.top, props.minHeight);
		if (y <= props.minHeight) {
			y = props.minHeight;
		}
		state.scroll.y = y;
		
	}
}

const onChangePage = (page, pageSize) => {
	console.log('page, pageSize', page, pageSize)
	emits('pageChange', {
		current: page,
		pageSize
	})
}

const onColumnCheckAllChange = () => {
	Object.assign(state.sorter, {
		indeterminate: false,
		selectedColumns: state.sorter.checkAll ? tableProps.value.columns.map((item) => item.dataIndex) : [],
	})
}

const onColumnCheckChange = (key) => {
	const index = state.sorter.selectedColumns.indexOf(key);
	if (index > -1) {
		state.sorter.selectedColumns.splice(index, 1);
	} else {
		state.sorter.selectedColumns.push(key);
	}

	Object.assign(state, {
		indeterminate: !!state.sorter.selectedColumns.length && state.sorter.selectedColumns.length < tableProps.value.columns.length,
		checkAll: state.sorter.selectedColumns.length === tableProps.value.columns.length,
	})
}

const onColumnIndexChange = () => {
	// state.sorter.showDataIndex = !state.sorter.showDataIndex;
}

onMounted(() => {
	applyColumnWidths()
	handleResize()
	window.addEventListener('resize', handleResize)

	let cacheData = []
	if (props.isShowColumnSetting) {
		const str = localStorage.getItem('columnSettings-' + route.name);
		try {
			cacheData = JSON.parse(str);
			if (!Array.isArray(cacheData) || !cacheData) {
				cacheData = []
			}
		} catch(e) {
		}
	}

	const columns = tableProps.value.columns.map((item) => {
		const selected = cacheData.find(v => v.dataIndex === item.dataIndex)?.selected === false ? false : true;
		return {
			dataIndex: item.dataIndex,
			title: item.title,
			selected
		}
	})

	columns.sort((a, b) => {
		const indexA = cacheData.findIndex(v => v.dataIndex === a.dataIndex);
		const indexB = cacheData.findIndex(v => v.dataIndex === b.dataIndex);
		return indexA - indexB;
	})
	
	state.sorter.columns = columns;
	state.sorter.selectedColumns = columns.filter(v => v.selected).map((item) => item.dataIndex)
	state.sorter.checkAll = state.sorter.selectedColumns.length === columns.length  
})

onBeforeUnmount(() => {
	window.removeEventListener('resize', handleResize)
})
</script>
<style lang="less" scoped>
.table-wrap {
	flex: 1;
	display: flex;
	flex-direction: column;
	.header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		overflow: hidden;
		margin-bottom: 8px;
		flex-shrink: 0;
		flex-grow: 0;
		.setting-icon {
			color: #888888;
			width: 18px;
			height: 18px;
			:deep(svg) {
				width: 100%;
				height: 100%;
				&:hover {
					color: var(--active-color);
					transform: scale(1.2);
				}
			}
		}
	}
	.table-content {
		flex: 1;
		overflow: hidden;
	}
	:deep(.ant-table-wrapper) {
		.ant-table-filter-trigger.ant-dropdown-open .anticon-filter, .ant-table-filter-trigger.active .anticon-filter {
		    color: #167FFF;
		}

		.ant-table-column-sorter-up svg {
		    display: none;
		}
		  .ant-table-column-sorter-down svg {
		    display: none;
		}
		.ant-table-column-sorter-up {
		    width: 16px;
		    height: 16px;
		    background: url('@/assets/img/chevron-up.svg') no-repeat center 3px;
		    background-size: contain;
		    cursor: pointer;
			/* display: none; */
		}
		.ant-table-column-sorter-up.active {
		    background: url('@/assets/img/upactive.svg') no-repeat center 0px;
		    background-size: contain;
		    cursor: pointer;
		    fill: #167FFF!important;
		    /* filter: invert(34%) sepia(89%) saturate(1400%) hue-rotate(195deg) brightness(98%) contrast(97%); */
			display: block;
		}
		.ant-table-column-sorter-down {
		    width: 16px;
		    height: 16px;
		    background: url('@/assets/img/chevron-down.svg') ; /*no-repeat center;*/
			  background-repeat: no-repeat;
		    background-size: contain;
		    cursor: pointer;
		    background-position: center top -3px;
		}
		.ant-table-column-sorter-down.active {
		    background: url('@/assets/img/downactive.svg') no-repeat center 0px;
		    background-size: contain;
		    /* filter: invert(34%) sepia(89%) saturate(1400%) hue-rotate(195deg) brightness(98%) contrast(97%); */
		    cursor: pointer;
		    /* color: #167FFF!important; */
		}
		.ant-table-thead>tr>th {
			    // overflow: hidden;
			    // white-space: nowrap;
			    // text-overflow: ellipsis;
			    // word-break: keep-all;
			font-size: 13.5px;
			color: #444;
			line-height: 20px;
			padding: 8px 8px;
		}
		.ant-table-tbody >tr >td {
			font-size: 13px;
			color: #555;
			line-height: 20px;
			padding: 5px 8px;
		}
		.ant-table-thead > tr > th, 
		.ant-table-thead > tr > td {
			color: #444;
			font-weight: 400;
    		font-size: 13.5px;
			line-height: 20px;
			padding: 8px 8px;
		}
		.ant-table-tbody >tr.ant-table-row-selected >td {
			background: inherit;
		}
		.ant-table-tbody >tr.ant-table-row-selected:hover >td {
			background: #fafafa;
		}
		.ant-table-column-title {
			overflow: hidden;
		    text-overflow: ellipsis;
		    word-break: keep-all;
		}
		// .ant-table-cell {
		// 	.ant-checkbox-checked {
		// 		.ant-checkbox-inner {
		// 		    border-color: #167FFF;
		// 		    background: transparent;
		// 		    width: 14px;
		// 		    height: 14px;
		// 			border-radius: 2px;
		// 			&::after {
		// 				border-color: #167fff;
		// 			}
		// 		}
		// 	}
		// }
	}
	:deep(.ant-pagination) {
		color: #888888;
    	font-size: 14px;
		.ant-pagination-disabled {
			display: none;
		}
		.ant-pagination-item {
			margin: 0 4px;
			a {
				color: #888888;
				font-weight: 400;
				font-size: 14px;
			}
			&:hover, {
				background-color: transparent;
				a {
					color: var(--active-color);
				}
				
			}
			&.ant-pagination-item-active {
				background-color: var(--active-color);
				border-radius: 2px;
				a {
					color: #FFF;
				}
			}
		}
		.ant-pagination-next:hover, .ant-pagination-prev:hover {
			.ant-pagination-item-link {
				background-color: transparent;
			}
		}
		
	}
}
.pagination {
	display: flex;
	justify-content: flex-end;
	padding: 10px 0px;
}
</style>