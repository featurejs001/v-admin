<template>
	<div class="filter-wrap">
		<div v-if="state.loading" class="loading">
			<a-spin  />
		</div>
		<div v-else>
			<div class="common_tab_level" v-for="item in state.leverList" :key="item.key">
				<div class="flex items-start">
					<div class="first_introduction_text">
						<span class="">{{ item.name }}</span>
					</div>
					<a-button
						class="ant-btn-default my_shouqi1"
						iconsize="15"
						isupload="false"
						type="button"
						@click="clickAll(item.key)"
					>
						<a-tooltip :title="getToolHint(state.tooltips, '项目中心', '全选')">
	                        全选
							<span v-if="item.selectedTags.length > 0" class="plus">+</span>
							<span v-else class="minus">-</span>
	                    </a-tooltip>
					</a-button>
					<div class="flex-row filter-tags ">
						<span :class="['filter-tag', item.key.includes('domain') ? 'classic' : '']" v-for="i in 30" :key="i">汽车电动化(21)</span>
					</div>
					<a-button
						class="my_shouqi"
						type="link"
					>
						<span>
							<span class="common_plus_icon">+ </span>
							<span class="more">更多</span>
						</span>
					</a-button>
				</div>
			</div>
		</div>
	</div>
</template>
<script setup>
import { reactive, onMounted } from 'vue'
import { getToolTip } from '@/api/industry'
import { getToolHint } from "@/utils/helper"

const state = reactive({
	loading: false,
	tooltips: [],
	selectedDomain1Tags: [],
	leverList: [
		{
			name: '一级赛道',
			key: 'domain1',
			tags: [],
			selectedTags: []
		},
		{
			name: '二级赛道',
			key: 'domain2',
			tags: [],
			selectedTags: [],
		},
		{
			name: '三级赛道',
			key: 'domain3',
			tags: [],
			selectedTags: [],
		},
		{
			name: '行业等级',
			key: 'priority',
			tags: ['跟进', '关注', '其他', '投后'],
			selectedTags: []
		},
		{
			name: '轮次',
			key: 'turn2',
			tags: ['种子/天使轮', 'A轮', 'B轮', 'C轮', 'D轮至Pre-IPO', '股权投资', '战略投资', 'IPO', '被收购', '其他', '未知'],
			selectedTags: []
		},
		{
			name: '项目阶段',
			key: 'stage',
			tags: ['线索', '跟进', '立项', '上会', '投后', '废弃'],
			selectedTags: []
		},
		{
			name: '跟进状态',
			key: 'followStage',
			tags: ['暂无接触', '资料分析', '外围访谈', '高管访谈', 'CEO访谈', '业务尽调', '三方财法尽调'],
			selectedTags: []
		},
		{
			name: '主理人',
			key: 'main',
			tags: [],
			selectedTags: []
		},
		{
			name: '协理人',
			key: 'assistant',
			tags: [],
			selectedTags: []
		}
	]
})

const clickAll = (key) => {

}

const getData = () => {
	const promiseAll = []
	let promiseIndex = 0
	promiseAll[promiseIndex++] = getToolTip().then((res) => {
		state.tooltips = res.result || []
	}).finally(() => {
		return Promise.resolve()
	})

	Promise.all(promiseAll).then(() => {
		console.log('all')
	})
}

onMounted(() => {
	getData()
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

			.filter-tag {
				overflow-wrap: break-word;
				font-size: 13px;
				text-align: left;
				white-space: nowrap;
				margin: 0px 0 0 3px;
				color: #555;
				line-height: 30px;
				&.classic {
					width: 188px;
					flex: 0 0 188px;
				}
			}
		}
	}
}
</style>