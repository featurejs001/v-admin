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
                          <span v-if="item.showAll" class="common_plus_icon less_btn_icon" style="position: relative; top: 0px; right: 0px">- </span>
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
import { getToolTip, getCategoryList, getDomainNth, getIndustrFieldValues } from '@/api/industry'
import { getSystemUsers } from "@/api/user"
import { getToolHint } from "@/utils/helper"
import { UpOutlined, DownOutlined } from '@ant-design/icons-vue'
import { 
	priorityFilter,
	turnFilter,
	stageFilter,
	followStageFilter
} from "@/utils/projectHelper";
import { useUser } from "@/store/user";
import { storeToRefs } from "pinia";
import {
    getCitiesByProvinces,
    getCityOptions,
    getIntersectionOfRegions,
    getRegionOptions,
    getRegionsByCities,
	getAllRegions,
	getProvinceByName1
  } from '@/utils/areaDataUtil';
import { provinceOrder, pinyinSort } from "@/utils/util1";
import { useRoute } from "vue-router";

const route = useRoute();
const emits = defineEmits(['filterChange'])

const props = defineProps({
    statsMap: {
		type: Object,
		default: () => ({})
	},
	fromWhichComponent: {
		type: String,
		default: 'project_center'
	}
})

const userStore = useUser();
const { gUserRoles } = storeToRefs(userStore);

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
	],
	provinceTags: [],
	cityTags: [],
	regionTags: [],
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
	if (key === '') {
		for (const item of state.leverList) {
			item.selectedTags = []
		}
		getFilterItems()
		return;
	}
	const index = state.leverList.findIndex(item => item.key === key)
	if (index === -1) {
		return
	}
	state.leverList[index].selectedTags = []
	if (key.includes("domain")) {
		const curLevel = Number(key.replace('domain', ''));
		let nextLevel = curLevel + 1;
		while (nextLevel) {
			const nextIndex = state.leverList.findIndex(item => item.key === `domain${nextLevel}`);
			if (-1 === nextIndex) {
				break;
			}
			state.leverList[nextIndex].selectedTags = [];
			nextLevel++;
		}
		changeDomainTags();
	} else if (['provinceMap', 'cityMap', 'regionMap'].includes(key)) {
		if ('provinceMap' === key) {
			const cityIndex = state.leverList.findIndex(item => item.key === 'cityMap');
			const regionIndex = state.leverList.findIndex(item => item.key === 'regionMap');
			if (cityIndex !== -1) {
				state.leverList[cityIndex].selectedTags = [];
			}
			if (regionIndex !== -1) {
				state.leverList[regionIndex].selectedTags = [];
			}
		} else if ('cityMap' === key) {
			const regionIndex = state.leverList.findIndex(item => item.key === 'regionMap');
			if (regionIndex !== -1) {
				state.leverList[regionIndex].selectedTags = [];
			}
		}
		changeCityTags();
	}
	getFilterItems()
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
	const filterValuesMap = {
		allDomain: [...state.domainAllList]
	}; // 可选项
	state.leverList.forEach(item => {
		if (item.selectedTags.length) {
			filters[item.key] = item.selectedTags
		}
		filterValuesMap[item.key] = item.tags;
	}) 
	emits('filterChange', {
		filters,
		filterValuesMap
	})
}

// 切换省市区后，下级过滤
function changeCityTags() {
	// let tags1 = [];
	let cityList = [];
	let regionList = [];
	
	let allData = [...state.domainAllList];
	const index1 = state.leverList.findIndex(item => item.key === 'provinceMap')
	const index2 = state.leverList.findIndex(item => item.key === 'cityMap')
	const index3 = state.leverList.findIndex(item => item.key === 'regionMap')

	if (state.leverList[index1].selectedTags.length !== 0) {
		cityList = getCitiesByProvinces(state.leverList[index1].selectedTags)
	} else {
		cityList = getCitiesByProvinces(state.provinceTags)
	}
	cityList = Array.from(new Set(cityList))
	state.leverList[index2].tags = customSort(pinyinSort(
      cityList
        .map((city) => ({
          text: city,
          value: city,
        })),
      'text',
    ), 'cityMap').map(item => item.text);
	
	if (state.leverList[index2].selectedTags.length !== 0) {
		regionList = getRegionsByCities(state.leverList[index2].selectedTags);
	} else {
		regionList = getRegionsByCities(state.leverList[index1].selectedTags.length !== 0 ? cityList : state.cityTags);
	}
	regionList = Array.from(new Set(regionList))
	state.leverList[index3].tags = customSort(pinyinSort(
		regionList
        .map((city) => ({
			...city,
          text: city,
          value: city,
        })),
      'text',
    ), 'regionMap').map(item => item.text);

}

// 同时选中上级标签
const checkedCityParentTag = (key, tag) => {
	const provinceIndex = state.leverList.findIndex(item => item.key === 'provinceMap');

	if ('cityMap' === key) {
		// 获取上级省份
		const provinceList = getProvinceByName1(tag, 'city');
		
		for (const item of provinceList) {
			if (state.leverList[provinceIndex].selectedTags.includes(item[0])) {
				continue;
			}
			state.leverList[provinceIndex].selectedTags.push(item[0]);
		}
	} else if ('regionMap' === key) {
		// 获取上级城市
		const cityList = getProvinceByName1(tag, 'region');
		const cityIndex = state.leverList.findIndex(item => item.key === 'cityMap');
		for (const item of cityList) {
			// console.log("item :", item)
			if (state.leverList[cityIndex].selectedTags.includes(item[1])) {
				continue;
			}
			state.leverList[cityIndex].selectedTags.push(item[1]);
			if (state.leverList[provinceIndex].selectedTags.includes(item[0])) {
				continue;
			}
			state.leverList[provinceIndex].selectedTags.push(item[0]);
		}
	}
}

// 取消选中下级标签
const uncheckCityChildTag = (key, tag) => {
	const cityIndex = state.leverList.findIndex(item => item.key === 'cityMap');
	const regionIndex = state.leverList.findIndex(item => item.key === 'regionMap');

	if ('provinceMap' === key) {
		// 获取下级城市
		const cityList = getCityOptions(tag);
		state.leverList[cityIndex].selectedTags = state.leverList[cityIndex].selectedTags.filter(item => {
			if (cityList.includes(item)) {
				// 过滤下级
				uncheckCityChildTag('cityMap', item);
				return false;
			} else {
				return true;
			}
		})
	} else if ('cityMap' === key) {
	    const regionList = getRegionOptions(tag);
		// console.log("regionList :", regionList)
		state.leverList[regionIndex].selectedTags = state.leverList[regionIndex].selectedTags.filter(item => {
			if (regionList.includes(item)) {
				// 过滤下级
				return false;
			} else {
				return true;
			}
		})
	}
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
		} else if (['cityMap', 'regionMap'].includes(key)) {
			// 选中上级标签
			checkedCityParentTag(key, tag)
		}
	} else {
		state.leverList[index].selectedTags.splice(tagIndex, 1)
		
		if (key.includes("domain")) {
			// 过滤掉已取消选中的下级赛道标签
			uncheckChildTag(key, tag)
		} else if (['provinceMap', 'cityMap'].includes(key)) {
			// 取消下级选中
			uncheckCityChildTag(key, tag)
		}
	}

	if (key.includes('domain')) {
		// 页面显示tags修改
		changeDomainTags();
	} else if (['provinceMap', 'cityMap', 'regionMap'].includes(key)) {
		// 页面显示tags修改
		changeCityTags();
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

function customSort(array, levelKey = '', textKey = 'value') {
	return array.sort((a, b) => {
		const textA = a[textKey];
		const textB = b[textKey];

		// 检查是否包含括号
		const hasParenA = props.statsMap[levelKey + '-' + textA] > 0; // textA.includes('(');
		const hasParenB = props.statsMap[levelKey + '-' + textB] > 0;// textB.includes('(');
		// console.log("customSort :", levelKey, textA, textB, hasParenA, hasParenB)

		// 如果一个有括号一个没有，有括号的排在前面
		if (hasParenA && !hasParenB) return -1;
		if (!hasParenA && hasParenB) return 1;

		// 都有括号或都没有括号，按拼音排序
		return textA.localeCompare(textB, 'zh-CN');
    });
}

const getProjectFieldValues = () => {
	return new Promise(async (resolve) => {
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
		    }) || [];

			state.cityTags = result?.result?.[0]?.city_values?.split(',')?.map((item) => {
		      let [name, code] = item.split(':');
		      return name;
		    }) || [];

		    state.regionTags = result?.result?.[0]?.region_values?.split(',')?.map((item) => {
		      let [name, code] = item.split(':');
		      return name;
		    }) || [];

			changeCityTags()

			// const cityList = getCitiesByProvinces(state.provinceTags)
			// // console.log('cityList :', cityList, state.provinceTags)
			// const cityIndex = state.leverList.findIndex(item => item.key === 'cityMap')
			// state.leverList[cityIndex].tags = customSort(pinyinSort(
			//       cityList
			//         .map((city) => ({
			//           text: city,
			//           value: city,
			//         })),
			//       'text',
			//     ), 'cityMap').map(item => item.text);

			// const regionList = getRegionsByCities(state.cityTags)
			// const regionIndex = state.leverList.findIndex(item => item.key === 'regionMap')
			// state.leverList[regionIndex].tags = customSort(pinyinSort(
			// 	regionList
		    //     .map((city) => ({
			// 		...city,
		    //       text: city,
		    //       value: city,
		    //     })),
		    //   'text',
		    // ), 'regionMap').map(item => item.text);
		} catch (e) {
			console.error(e)
		}
		
		resolve()
	})
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

	promiseAll[promiseIndex++] = userStore.getUserList().then(records => {
		const users = records.filter?.(item => !['管理员rootroot', '毛振华', '孙婷'].includes(item.realname))?.map?.(item => item.realname) || []
		const mainIndex = state.leverList.findIndex(item => item.key === 'main')
		state.leverList[mainIndex].tags = [...users]

		const assistantIndex = state.leverList.findIndex(item => item.key === 'assistant')
		state.leverList[assistantIndex].tags = [...users]
		return Promise.resolve(res)
	}).catch(() => {
		return Promise.resolve({})
	})

	promiseAll[promiseIndex++] = getProjectFieldValues()

	return Promise.all(promiseAll).then((res) => {
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

		// 是否有路由查询参数
		if (route.query.level) {
			switch(Number(route.query.level)) {
				case 1:
					if (route.query.domain1) {
						state.leverList[leverIndex].isHide = true;
						state.leverList[leverIndex].selectedTags = [route.query.domain1]
					}
					break;
				case 2:
					if (route.query.domain1 && route.query.domain2) {
						state.leverList[leverIndex].isHide = true;
						state.leverList[leverIndex].selectedTags = [route.query.domain1];
						state.leverList[leverIndex+1].isHide = true;
					    state.leverList[leverIndex+1].selectedTags = [route.query.domain2];
					}
					
					break;
				case 3:
					if (route.query.domain1 && route.query.domain2 && route.query.domain3) {
						state.leverList[leverIndex].isHide = true;
						state.leverList[leverIndex].selectedTags = [route.query.domain1];
						state.leverList[leverIndex+1].isHide = true;
						state.leverList[leverIndex+1].selectedTags = [route.query.domain2];
						state.leverList[leverIndex+2].isHide = true;
						state.leverList[leverIndex+2].selectedTags = [route.query.domain3]
					}
					break;
			}
		}
		if (route.query.stage) {
			const stateIndex = state.leverList.findIndex(item => item.key === 'stage');
			if (-1 !== stateIndex) {
				state.leverList[stateIndex].selectedTags = [route.query.stage];
				state.leverList[stateIndex].isHide = true;
			}
		}

		if (route.query.followStage) {
			const followIndex = state.leverList.findIndex(item => item.key === 'followStage');
			if (-1 !== followIndex) {
				state.leverList[followIndex].selectedTags = [route.query.followStage];
				state.leverList[followIndex].isHide = true;
			}
		}
		getFilterItems()
	}).finally(() => {
		state.loading = false;
		return Promise.resolve();
	})
}

onMounted(() => {
	const provinceValues = []
	for (const key in provinceOrder) {
		provinceValues.push(key)
	}
	const index = state.leverList.findIndex(v => v.key === 'provinceMap')
	state.leverList[index].tags = [...provinceValues]

	initData()
	window.addEventListener("resize", handleResize);
})

onBeforeUnmount(() => {
	window.removeEventListener("resize", handleResize);
})

// const setFilterItem = (key, selectedTags) => {
//     const item = state.leverList.find(item => item.key === key);
// 	if (item) { 
// 		item.selectedTags = [...selectedTags];
// 		getFilterItems()
// 	}
// }

defineExpose({
	getFilterItems,
	// setFilterItem,
	handleCheckedTag,
	handleClickAll
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