<template>
	<div class="table-wrap">
		<div class="header">
			<slot name="header-left"></slot>
			<a-popconfirm placement="rightBottom" ok-text="保存" cancel-text="重置" @confirm="handleSettingSave">
				<a-tooltip placement="top">
					<template #title>
						列设置
					</template>
					<SettingOutlined class="setting-icon" />
				</a-tooltip>
			</a-popconfirm>
		</div>
		<div class="table-content" ref="tableRef">
			<a-table  :dataSource="$props.dataSource" :columns="$props.columns" :scroll="state.scroll" size="small">
				<template #headerCell="{ column }">
		          <span v-if="column.isCheckbox" v-bind="selectHeaderProps">选择</span>
		          <span v-else >{{ column.title }}</span>
		        </template>
				<template #bodyCell="data">
			          <!-- update-begin--author:liaozhiyang---date:220230717---for：【issues-179】antd3 一些警告以及报错(针对表格) -->
			          <!-- update-begin--author:liusq---date:20230921---for：【issues/770】slotsBak异常报错的问题,增加判断column是否存在 -->
			          <slot v-if="data.column?.slot" :name="data.column?.slot" v-bind="data || {}"></slot>
			          <template v-else>
			            <span>{{ data.record[data.column?.dataIndex] }}</span>
			          </template>
			          <!-- update-begin--author:liaozhiyang---date:22030717---for：【issues-179】antd3 一些警告以及报错(针对表格) -->
		        </template>
				<template #customFilterIcon="{ filtered }">
					<FilterOutlined v-if="!filtered" />
					<FilterFilled v-else />
				</template>
			</a-table>
		</div>
	</div>
</template>
<script setup>
import { SettingOutlined, FilterOutlined, FilterFilled } from '@ant-design/icons-vue'
import { defineProps, toRefs, ref, onMounted, reactive, onBeforeUnmount } from "vue"

const props = defineProps({
	dataSource: {
		type: Array,
		default: () => []
	},
	columns: {
		type: Array,
		default: () => []
	},
	scroll: {
		type: Object,
		default: () => ({ x: '100%' })
	},
	isFixedMaxHeight: {
		type: Object,
		default: false
	},
	minHeight: {
		type: Number,
		default: 400
	}
})
// console.log("props:", props)

const { scroll, isFixedMaxHeight } = toRefs(props)

const tableRef = ref(null);
const state = reactive({
	scroll: {
		x: props.scroll.x,
		y: props.scroll.y || undefined
	}
})

const handleSettingSave = () => {
	console.log('save')
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

onMounted(() => {
	
	handleResize()
	window.addEventListener('resize', handleResize)
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
			    overflow: hidden;
			    white-space: nowrap;
			    text-overflow: ellipsis;
			    word-break: keep-all;
		}
		.ant-table-thead > tr > th, 
		.ant-table-thead > tr > td {
			color: #444;
			font-weight: 400;
    		font-size: 13.5px;
		}
		.ant-table-column-title {
			overflow: hidden;
		    text-overflow: ellipsis;
		    word-break: keep-all;
		}
	}
}
</style>