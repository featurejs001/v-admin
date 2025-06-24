<template>
	<div class="filter-wrap">
		<div v-if="state.loading" class="loading">
			<a-spin  />
		</div>
		<div v-else v-show="state.isOpen">
			<div class="common_tab_level" v-for="item in state.leverList.filter(v => !v.isHide)" :key="item.key">
				<div class="flex items-start">
					<div class="first_introduction_text">
						<span class="">{{ item.name }}</span>
					</div>
					<a-button
						class="ant-btn-default my_shouqi1"
						iconsize="15"
						isupload="false"
						type="button"
						@click="handleClickAll(item.key)"
					>
						<a-tooltip :title="getToolHint(state.tooltips, '项目中心', '全选')">
	                        全选
							<span v-if="item.selectedTags.length > 0" class="plus">+</span>
							<span v-else class="minus">-</span>
	                    </a-tooltip>
					</a-button>
					<div :id="item.key + '-tags'" :class="['flex-row', 'filter-tags', !item.showMore || item.showAll ? 'all' : '']">
						<span
						 v-for="tag in item.tags" 
						 :key="tag"
						 :class="[
						 	'filter-tag', 
							item.key.includes('domain') ? 'classic' : '', 
							item.selectedTags.includes(tag) ? 'active' : ''
						  ]"
						  @click="handleCheckedTag(item.key, tag)"
						>{{ tag }}({{ props.statsMap[item.key + '-' + tag] || 0 }})</span>
					</div>
					<a-button
						class="my_shouqi"
						type="link"
						:style="{visibility: item.showMore ? 'visible' : 'hidden'}"
						@click="item.showAll = !item.showAll"
					>
						<a-tooltip :title="getToolHint(state.tooltips, '项目中心', item.showAll ? '收起' : '更多')">
                          <span v-if="item.showAll" class="common_plus_icon less_btn_icon" style="position: relative; top: 0px; right: 4px">- </span>
                          <span v-else class="common_plus_icon">+ </span>
                          <span class="more">{{ item.showAll ? '收起' : '更多' }}</span>
                        </a-tooltip>
					</a-button>
				</div>
			</div>
		</div>
		<div class="collapse">
			<div v-if="state.isOpen" class="title" @click="state.isOpen = false">
				<UpOutlined />
				收起
			</div>
			<div v-else class="title" @click="state.isOpen = true">
				<DownOutlined />
				展开
			</div>
		</div>
	</div>
</template>
<script setup>
import { reactive, onMounted, watch, onBeforeUnmount, nextTick, defineEmits, defineExpose, defineProps } from 'vue'
import { getToolTip, getCategoryList, getDomainNth } from '@/api/industry'
import { getSystemUsers } from "@/api/user"
import { getToolHint } from "@/utils/helper"
import { UpOutlined, DownOutlined } from '@ant-design/icons-vue'
import { 
	priorityFilter,
	turnFilter,
	stageFilter,
	followStageFilter
} from "@/utils/projectHelper";

const emits = defineEmits(['filterChange'])

const props = defineProps({
    statsMap: {
		type: Object,
		default: () => ({})
	}
})

const state = reactive({
	isOpen: true,
	loading: false,
	tooltips: [],
	selectedDomain1Tags: [],
	orderMap: {}, // 存储每个domain的nth值
	domainAllList: [],
	leverList: [
		{
			name: '一级赛道',
			key: 'domain1',
			tags: [],
			selectedTags: [],
			
			showMore: true,
		},
		{
			name: '二级赛道',
			key: 'domain2',
			tags: [],
			selectedTags: [],
			showMore: true,
		},
		{
			name: '三级赛道',
			key: 'domain3',
			tags: [],
			selectedTags: [],
			showMore: true,
		},
		{
			name: '行业等级',
			key: 'priority',
			tags: [...priorityFilter],
			selectedTags: [],
		},
		{
			name: '轮次',
			key: 'turn2',
			tags: [...turnFilter],
			selectedTags: [],
		},
		{
			name: '项目阶段',
			key: 'stage',
			tags: [...stageFilter],
			selectedTags: [],
		},
		{
			name: '跟进状态',
			key: 'followStage',
			tags: [...followStageFilter],
			selectedTags: [],
		},
		{
			name: '主理人',
			key: 'main',
			tags: [],
			selectedTags: [],
		},
		{
			name: '协理人',
			key: 'assistant',
			tags: [],
			selectedTags: [],
		},
		{
			name: '省',
			key: 'provinceMap',
			isHide: true,
			tags: [],
			selectedTags: [],
		},
		{
			name: '市',
			key: 'cityMap',
			isHide: true,
			tags: [],
			selectedTags: [],
		},
		{
			name: '区',
			key: 'regionMap',
			isHide: true,
			tags: [],
			selectedTags: [],
		}
	]
})

const handleResize = async () => {
	// console.log("resize leverList");
	await nextTick();
	state.leverList.forEach(item => {
		const tagsDom = document.getElementById(item.key + "-tags")
		
		if (!tagsDom || !item.key.includes("domain")) {
			return;
		}
		// console.log("resize :", item.key, tagsDom?.scrollHeight)
		if (30 === tagsDom?.scrollHeight) {
			item.showMore = false
		} else {
			item.showMore = true
		}
	})
}

const handleClickAll = (key) => {
	const index = state.leverList.findIndex(item => item.key === key)
	if (index === -1) {
		return
	}
	state.leverList[index].selectedTags = []
}

// 选中上级标签
const checkedParentTag = (key, tag) => {
	const curLevel = Number(key.replace('domain', ''));
	const prevLevel = curLevel - 1;
	const prevIndex = state.leverList.findIndex(item => item.key === `domain${prevLevel}`);
	if (prevIndex === -1) { // 没有上级，无需处理
		return;
	}

	// 先过滤出来选中的标签
	let filterTags = state.domainAllList.filter(item => {
		return item[`domain${curLevel}`] === tag
	})

	let loopLevel = 1;
	let parentTag = '';
	while(loopLevel < curLevel) {
		const loopIndex = loopLevel - 1;

		if (parentTag) {
			filterTags = filterTags.filter(item => {
			    if (item[`domain${loopIndex}`] === parentTag) {
					return true
				} else {
					return false
				}
			})
		} 
		
		const tempTags = sortDomainTags(
			Array.from(
				new Set(
					filterTags.map(item => item[`domain${loopLevel}`])
				)
			)
		);
		parentTag = tempTags[0];
		if (!parentTag) {
			break;
		}
		// 只选中第一个
		if (!state.leverList[loopIndex].selectedTags.includes(parentTag)) {
			state.leverList[loopIndex].selectedTags.push(parentTag)
		}
		loopLevel++;
	}
}

// 取消选中下级标签
const uncheckChildTag = (key, tag) => {
	const curLevel = Number(key.replace('domain', ''));
	const nextLevel = curLevel + 1;
	const nextIndex = state.leverList.findIndex(item => item.key === `domain${nextLevel}`);
	if (nextIndex === -1 || state.leverList[nextIndex].selectedTags.length === 0) { // 没有下级 或 下级没有选中的标签，无需处理
		return;
	}
	const nextTags = state.domainAllList.filter(item => item[`domain${curLevel}`] === tag).map(item => item[`domain${nextLevel}`]);
	// console.log("tag :", key, tag, nextTags);
	state.leverList[nextIndex].selectedTags = state.leverList[nextIndex].selectedTags.filter(item => {
		if (nextTags.includes(item)) {
			// 过滤下级
			uncheckChildTag(`domain${nextLevel}`, item);
			return false;
		} else {
			return true;
		}
	});
}

const getFilterItems = () => {
	// 过滤数据
	const filters = {};
	state.leverList.forEach(item => {
		if (item.selectedTags.length) {
			filters[item.key] = item.selectedTags
		}
	})
	emits('filterChange', filters)
}

const handleCheckedTag = (key, tag) => {
	const index = state.leverList.findIndex(item => item.key === key)
	if (index === -1) {
		return
	}
	const tagIndex = state.leverList[index].selectedTags.findIndex(item => item === tag)
	if (tagIndex === -1) {
		state.leverList[index].selectedTags.push(tag)
		if (key.includes("domain")) {
			// 选中上级标签
			checkedParentTag(key, tag)
		}
	} else {
		state.leverList[index].selectedTags.splice(tagIndex, 1)
		
		if (key.includes("domain")) {
			// 过滤掉已取消选中的下级赛道标签
			uncheckChildTag(key, tag)
		}
	}

	if (key.includes('domain')) {
		// 页面显示tags修改
		changeDomainTags();
	}
	
	getFilterItems()
}

function sortDomainTags(domainTags) {
	return domainTags?.sort((a, b) => {
	  let orderA = state.orderMap[a] ? state.orderMap[a].nth : Infinity;
	  let orderB = state.orderMap[b] ? state.orderMap[b].nth : Infinity;
	  return orderA - orderB;
	});
}

function getDomainOptions(level, value) {
    // value = value?.replace(/\(\d+\)/, ''); // 移除括号和数字
	
    const domainOptions = Array.from(
      new Set(
        state.domainAllList
          .filter((item) => item[`domain${level - 1}`] === value)
          .map((item) => item[`domain${level}`])
      )
    )

    return domainOptions;
}
const getDomainTags = (domainTags, level) => {
	  let tags = []
	  domainTags?.forEach((domainTag) => {
	    tags = tags.concat(getDomainOptions(level, domainTag))
	  });
	  return Array.from(new Set(tags));
};

// 切换赛道后，其他赛道过滤
function changeDomainTags() {
	let tags1 = [];
	let tags2 = [];
	// let tags3 = [];
	
	let allData = [...state.domainAllList];
	const index1 = state.leverList.findIndex(item => item.key === 'domain1')
	const index2 = state.leverList.findIndex(item => item.key === 'domain2')
	const index3 = state.leverList.findIndex(item => item.key === 'domain3')

	if (state.leverList[index1].selectedTags.length !== 0) {
		allData = allData.filter(item => state.leverList[0].selectedTags.includes(item.domain1))
		tags1 = [...state.leverList[index1].selectedTags];
	} else {
		tags1 = [...state.leverList[index1].tags];
	}
	state.leverList[index2].tags = sortDomainTags(getDomainTags(tags1, 2))
	
	if (state.leverList[index2].selectedTags.length !== 0) {
		allData = allData.filter(item => state.leverList[1].selectedTags.includes(item.domain2));
		tags2 = [...state.leverList[index2].selectedTags];
	} else {
		tags2 = [...state.leverList[index2].tags];
	}

	state.leverList[index3].tags = sortDomainTags(getDomainTags(tags2, 3))

	handleResize()
}

const initData = () => {
	state.loading = true;
	const promiseAll = []
	let promiseIndex = 0
	promiseAll[promiseIndex++] = getToolTip().then((res) => {
		state.tooltips = res.result || []
		return Promise.resolve(res)
	}).catch(() => {
		return Promise.resolve({})
	})

	promiseAll[promiseIndex++] = getCategoryList({
		pageNo: 1,
		pageSize: 100000
	}).then((res) => {
	    return Promise.resolve(res)
	}).catch(() => {
		return Promise.resolve({})
	})

	promiseAll[promiseIndex++] = getDomainNth().then((res) => {
	    return Promise.resolve(res)
	}).catch(() => {
		return Promise.resolve({})
	})

	promiseAll[promiseIndex++] = getSystemUsers({
	    pageNo: 1,
		pageSize: 100000
	}).then(res => {
		const users = res?.result?.records?.filter?.(item => !['管理员rootroot', '毛振华', '孙婷'].includes(item.realname))?.map?.(item => item.realname) || []
		const mainIndex = state.leverList.findIndex(item => item.key === 'main')
		state.leverList[mainIndex].tags = [...users]

		const assistantIndex = state.leverList.findIndex(item => item.key === 'assistant')
		state.leverList[assistantIndex].tags = [...users]
		return Promise.resolve(res)
	}).catch(() => {})

	Promise.all(promiseAll).then((res) => {
		let orderMap = {}
		const nthList = res[2]?.result || [];
		nthList.forEach(item => {
			orderMap[item.name] = {
				...item,
				nth: item.nth === 0 || item.name === '未分类I' ? 100000 : item.nth,
			}
		})
		

		const domainList = res[1]?.result?.records || []
		state.domainAllList = domainList;

		state.orderMap = orderMap;

		let tag1 = sortDomainTags(Array.from(new Set(domainList.map(item => item.domain1)))).map(item => item);
		const leverIndex = state.leverList.findIndex(item => item.key === 'domain1')
		state.leverList[leverIndex].tags = tag1;
		changeDomainTags()
	}).finally(() => {
		state.loading = false;
	})
}

onMounted(() => {
	initData()
	window.addEventListener("resize", handleResize);
})

onBeforeUnmount(() => {
	window.removeEventListener("resize", handleResize);
})

const setFilterItem = (key, selectedTags) => {
    const item = state.leverList.find(item => item.key === key);
	if (item) { 
		item.selectedTags = [...selectedTags];
		getFilterItems()
	}
}

defineExpose({
	getFilterItems,
	setFilterItem
})

</script>
<style lang="less" scoped>
.filter-wrap {
	width: 100%;
	margin-top: 17px;
	> div {
		width: 100%;
	}
	.loading {
		display: flex;
		justify-content: center; 
		align-items: center;
		width: 100%;
	}

	.common_tab_level {
		display: flex;
    	flex-direction: column;
		line-height: 30px;
		.first_introduction_text {
		    width: 60px;
		    color: rgba(0, 0, 0, 0.7);
		    position: relative;
		    margin-right: 11px;
		    font-size: 13.5px;
		    line-height: 30px;
		    text-align: left;
		}
		.my_shouqi {
			margin-left: 18px;
		    border: 0;
		    box-shadow: none;
		    font-weight: 400;
		    color: #167FFF!important;
		    background-color: transparent!important;
		    font-size: 13px;
		    height: 30px;
			padding: 0 15px;
		}
		.my_shouqi1 {
			font-weight: 400;
		    color: #555555;
		    border: 0;
		    box-shadow: none;
		    width: 70px;
		    height: 30px;
		    line-height: 26px;
		    padding: 0 15px;
		}

		.filter-tags {
			display: flex;
		    flex-wrap: wrap;
		    row-gap: 2px;
		    -moz-column-gap: 0px;
		    column-gap: 0px;

			flex: 1 1 0%; 
			flex-wrap: wrap; 
			overflow: hidden; 
			max-height: 30px; 
			transition: max-height 0.3s ease 0s;
			&.all {
				flex-wrap: wrap;
			    overflow: visible;
			    max-height: none;
			}

			.filter-tag {
				overflow-wrap: break-word;
				font-size: 13px;
				text-align: left;
				white-space: nowrap;
				margin: 0px 0 0 3px;
				color: #555;
				line-height: 30px;
				padding: 0px 7px;
				min-width: 109px;
				cursor: pointer;
				&.classic {
					width: 188px;
					flex: 0 0 188px;
				}
				&.active,&:hover {
					color: #167FFF;
				}
			}
		}
	}

	.collapse {
	    display: flex;
	    justify-content: center;
	    margin-top: 0rem;
	    position: relative;
		&::before {
			content: "";
			position: absolute;
			top: 50%;
			left: 0;
			transform: translateY(-50%);
			content: "";
			width: 100%;
			height: 1px;
			background-color: rgba(0, 0, 0, 0.15);
		}
		.title {
			position: relative;
		    background: white;
		    z-index: 1;
			padding: 0 15px;
		}
		.title {
			position: relative;
		    background: white;
		    z-index: 1;
			padding: 0 15px;
			font-size: 13.5px;
			cursor: pointer;
			height: 32px;
			display: flex;
			align-items: center;
			color: #888888;
			&:hover {
				color: #167FFF;
			}
			:deep(.anticon) {
				margin-right: 8px;
			}
		}
	}
}
</style>