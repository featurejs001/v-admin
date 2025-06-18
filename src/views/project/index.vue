<template>
	<div class="project-wrap">
		<div class="filter-container">
			<Search @success="handleSearch" @export="handleExport" />
			<Filter />
		</div>
	</div>
</template>
<script setup>
import Search from './components/search.vue'
import Filter from './components/filter.vue'
import { reactive } from "vue"

// 定义表头和字段映射
const headers = [
    { label: '项目名称', key: 'name' },
    { label: '项目ID', key: 'projectId' },
    { label: '行业ID', key: 'industryId' },
    { label: '创建时间', key: 'createTime' },
    { label: '更新时间', key: 'updateTime' },
    { label: '全名', key: 'fullName' },
    { label: '阶段', key: 'stage' },
    { label: '跟进阶段', key: 'followStage' },
    { label: '融资窗口开始时间', key: 'financingWindowStartTime' },
    { label: '融资窗口结束时间', key: 'financingWindowEndTime' },
    { label: '一级赛道', key: 'domain1' },
    { label: '二级赛道', key: 'domain2' },
    { label: '三级赛道', key: 'domain3' },
    { label: '优先级', key: 'priority' },
    { label: '标签', key: 'tags' },
    { label: '备注', key: 'memo' },
    { label: '主要负责人', key: 'main' },
    { label: '助理', key: 'assistant' },
    { label: '其他', key: 'other' },
    { label: '成立日期', key: 'foundationDate' },
    { label: '省份1', key: 'province' },
    { label: '城市1', key: 'city' },
    { label: '区域1', key: 'region' },
    { label: '飞书链接', key: 'feishuLink' },
    { label: '第三方链接', key: 'thirdPartyLink' },
    { label: '简介', key: 'briefIntroduction' },
    { label: '网站', key: 'website' },
    { label: '财务标签', key: 'financeTag' },
    { label: '代码', key: 'code' },
    { label: '投资日期', key: 'investDate' },
    { label: '轮次', key: 'turn' },
    { label: '轮次2', key: 'turn2' },
    { label: '金额', key: 'amount' },
    { label: '投资者', key: 'investor' },
    { label: '别名', key: 'alias' },
    { label: '操作1', key: 'op_1' },
    { label: '操作2', key: 'op_2' },
    { label: '操作时间', key: 'op_time' },
    { label: '操作状态', key: 'op_status' },
    { label: '推送时间', key: 'pushTime' },
    { label: '推送状态', key: 'pushStatus' },
    { label: '删除时间', key: 'delTime' },
    { label: '删除者UID', key: 'delByUid' },
    { label: '删除者用户名', key: 'delByUsername' },
    { label: '导入时间', key: 'importTime' },
    { label: '拒绝时间', key: 'rejectTime' },
    { label: '阻止时间', key: 'blockTime' },
    { label: '导入者UID', key: 'importByUid' },
    { label: '导入者用户名', key: 'importByUsername' },
    { label: '拒绝者UID', key: 'rejectByUid' },
    { label: '拒绝者用户名', key: 'rejectByUsername' },
    { label: '创建者', key: 'createBy' },
    { label: '更新者', key: 'updateBy' },
    { label: '省份', key: 'provinceMap' },
    { label: '城市', key: 'cityMap' },
    { label: '区域', key: 'regionMap' },
    { label: 'ID', key: 'id' },
  ];

  // 配置对象，选择需要导出的表头
  const selectedHeaders = headers
    .filter(
      (header) =>
        !['项目ID', '行业ID', '财务标签', '代码', 'ID', '操作1', '操作2', '操作时间', '操作状态', '省份1', '城市1', '区域1'].includes(header.label)
    )
    .map((header) => header.label);

   const state = reactive({
       params: {
           pageNo: 1,
           pageSize: 10,
	   }
   })

const handleSearch = () => {
	console.log("handleSearch")
}

const handleExport = async () => {
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