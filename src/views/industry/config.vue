<template>
	<div class="industry-wrap">
		<div class="header">
			<div>
				<div class="first_introduction_text">
		            <span class="">行业等级</span>
		            <a-tooltip v-if="state.tooltips.length" placement="right" overlayClassName="1">
		              <template #title>
		                <div v-html="getToolHint(state.tooltips, '行业中心', '行业等级说明').replace(/\|/g, '<br/>')"></div>
		              </template>
					  <template #default>
		              	<InfoCircleOutlined class="info-circle" />
					   </template>
		            </a-tooltip>
		        </div>
				<div style="display: flex; align-items: center; flex-grow: 1">
	              <a-checkable-tag
				    v-for="tag in state.priorityTags"
	                :checked="state.selectedPriorityTags.includes(tag)"
	                :id="tag"
					:key="tag"
	                :class="[getClassForTag(tag), state.selectedPriorityTags.includes(tag) ? 'checked' : '']"
	                @change="(checked) => handlePriorityChange(tag, checked)"
	              >
	                <span>{{ tag }}</span><span>({{ state.distinctNames[tag] }})</span>
	              </a-checkable-tag>

		        </div>
				<div
		            id="config"
		            style="display: flex; align-items: center; margin-left: auto; margin-top: 6px"
		            :class="state.globalMode === 'edit' ? 'disabled' : ''"
		          >
					<a-tooltip placement="top">
			    		<template #title>
							<span>导入</span>
						</template>
						<template #default>
							<a-upload v-if="hasPermission('project_list:import')" :customRequest="(file) => console.log(file)" :showUploadList="false" name="file">
                				<span class="jeecg-multiple-tabs-content__extra-fold">
									<ImportOutlined class="icon-wrapper mr" />
								</span>
							</a-upload>
						</template>
					</a-tooltip>
					<a-tooltip placement="top">
		        		<template #title>
							<span>导出</span>
						</template>
						<template #default>
							<ExportOutlined class="icon-wrapper" />
						</template>
					</a-tooltip>
					<div class="divider"></div>
					<FullScreen :customClass="'icon-wrapper mr'" />
					<a-tooltip placement="top">
		        		<template #title>
							<span>重新载入</span>
						</template>
						<template #default>
							<Redo :customClass="'icon-wrapper'" :loading="state.loading" />
						</template>
					</a-tooltip>
				</div>
			</div>
			<div v-if="state.isMgr">
				<div class="first_introduction_text">负责人</div>
				<div style="display: flex; align-items: center; flex-grow: 1">
					<a-checkable-tag
						v-for="tag in state.peopleTags"
						:key="tag"
		                :checked="state.selectedPeopleTags.includes(tag)"
		                :class="['text-wrapper_9 qita', state.selectedPeopleTags.includes(tag) ? 'checked' : '', state.globalMode === 'edit' ? 'disabled' : '']"
		                @change="(checked) => handlePeopleChange(tag, checked)"
		              >
		                <span>{{ tag }}</span><span>({{ state.distinctNames[tag] }})</span>
	              </a-checkable-tag>
				</div>
			</div>
		</div>
		<div class="industry-contariner">
			<Table
			 :tableProps="{
				scrollToFirstRowOnChange: true,
				loading: state.loading,
				pagination: false,
				dataSource: state.filterRecords,
				columns: getIndustryColumns(),
				bordered: true,
				rowSelection: {
					selectedRowKeys: state.selectedRowKeys,
					onChange: (selectedRowKeys) => state.selectedRowKeys = selectedRowKeys,
				},
				rowKey: 'industryId',
			 }"
			 :pagination="{
				total: state.total,
				current: state.params.pageNo,
				pageSize: state.params.pageSize,
				showTotal: (total) => `共 ${total} 条数据`,
				showSizeChanger: true,
				showQuickJumper: true,
			  }"
			 :isFixedMaxHeight="true"
			 @change="handleTableChange"
			 @pageChange="handlePageChange"
			>
				<template #header-left>
					<div style="display: flex; align-items: center;">
						<a-button type="primary" class="mr-8" ghost :icon="h(PlusOutlined)" @click="handleAdd">新增</a-button>
						<a-button type="primary" class="mr-8" ghost :icon="h(SaveOutlined)" :disabled="!state.selectedRowKeys.length" @click="handleSave()">保存</a-button>
						<a-input-search
				            v-model:value="state.params.searchKey"
				            enter-button
				            placeholder="输入关键字搜索"
				            style="width: 200px; "
							class="mr-8"
				            @search="getData"
				          />
					</div>
				</template>
				<template #action="{ column, record, index, text }">
					<a-popconfirm
					    title="是否确认删除?"
					    @confirm="() => handleRemove(record.industryId)"
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
					<a-tooltip placement="bottom" trigger="hover">
			          <template #title>
			            <span>保存</span>
			          </template>
					  <SaveOutlined class="action-btn save" @click="handleSave([record])" />
					</a-tooltip>
				</template>
			</Table>
		</div>
	</div>
</template>
<script setup>
import { 
	InfoCircleOutlined, 
	SettingOutlined, 
	ImportOutlined, 
	ExportOutlined, 
	PlusOutlined,
	SaveOutlined,
	DeleteOutlined
} from '@ant-design/icons-vue';
import { h, reactive, onMounted, ref, computed, nextTick } from "vue";
import { getToolHint } from "@/utils/helper"
import { PeopleOrder, prioritiesOrder } from "@/utils/util1";
import { 
	getToolTip,
	getIndustrFieldValues,
	domainConfigList,
	deleteIndustry,
	saveIndustry
} from '@/api/industry';
import { usePermission } from "@/utils/usePermission.ts";
import FullScreen from "@/components/common/fullScreen.vue";
import Redo from "@/components/common/redo.vue"; 
import { useUser } from "@/store/user";
import { getIndustryColumns } from "@/utils/industryHelper";
import Table from "@/components/Table/index.vue";
import { message as Message } from 'ant-design-vue';

const { hasPermission } = usePermission();
const userStore = useUser();

const state = reactive({
	loading: false,
	tooltips: [],
	priorityTags: [],
	selectedPriorityTags: [],
	peopleTags: [],
	selectedPeopleTags: [],
	isMgr: true,
	orderMap: {},
	distinctNames: {},
	total: 0,
	params: {
		pageNo: 1,
		pageSize: 50,
		searchKey: ''
	},
	filterRecords: [],
	selectedRowKeys: []
})

const getClassForTag = (tag) => {
	if (/关注/.test(tag)) {
	  return 'text-wrapper_9 guanzhu';
	} else if (/跟进/.test(tag)) {
	  return 'text-wrapper_9 genjin';
	} else if (/投后/.test(tag)) {
	  return 'text-wrapper_9 touhou';
	} else {
	  return 'text-wrapper_9 qita';
	}
};


const handlePriorityChange = (tag, checked) => {
	const index = state.selectedPriorityTags.indexOf(tag);
	if (-1 === index) {
		state.selectedPriorityTags.push(tag);
	} else {
		state.selectedPriorityTags.splice(index, 1);
	}
	getData()
};

const handlePeopleChange = (tag, checked) => {
	const index = state.selectedPeopleTags.indexOf(tag);
	if (-1 === index) {
		state.selectedPeopleTags.push(tag);
	} else {
		state.selectedPeopleTags.splice(index, 1);
	}

	getData();
};

const getData = () => {
	const params = {
		...state.params,
	}
	if (state.selectedPriorityTags.length > 0) {
		params.priority = state.selectedPriorityTags;
	}
	if (state.selectedPeopleTags.length > 0) {
		params.main_dictText = state.selectedPeopleTags;
		params.assistant_dictText = state.selectedPeopleTags;
		params.other_dictText = state.selectedPeopleTags;
	}
	state.loading = true;
	domainConfigList(params).then(res => {
		state.filterRecords = res?.result?.records || [];
		state.total = res?.result?.total || 0;
	}).finally(() => {
		state.loading = false;
	})
}

const handleTableChange = (params) => {
	console.log('tableChange :', params)
	if (params.sorter?.field && params.sorter?.order) {
		state.params.column = params.sorter.field;
		state.params.order = params.sorter.order === 'ascend' ? 'asc' : 'desc';
		getData()
	}
}

const handlePageChange = (params) => {
	state.params.pageNo = params.current;
	state.params.pageSize = params.pageSize;
	getData()
}

const handleRemove = (id) => {
	deleteIndustry({
		id
	}).then(res => {
		Message.success(res.message || "删除成功")
		getData()
	})
}

const handleSave = (records = null) => {
	if (null === records || !Array.isArray(records)) {
		records = state.filterRecords.filter(v => state.selectedRowKeys.includes(v.industryId));
	}
    saveIndustry(records).then(res => {
		Message.success(res.message || "保存成功")
		getData()
	})
}

const handleAdd = () => {}

onMounted(async () => {
	getToolTip().then(res => {
		state.tooltips = res.result || []
	})

	if (userStore.gUserRoles.includes('mgr') && userStore.gUserRoles.includes('admin')) {
		state.isMgr = false
	} else {
		state.isMgr = true
	}

	let res = await getIndustrFieldValues('realname_industry_count_23e');

    state.peopleTags = res.result.filter((obj) => obj.realname != '管理员rootroot').map((obj) => {
		state.distinctNames[obj.realname] = obj.industry_count;
		return obj.realname
	});
	
	if (state.isMgr) {
      res = await getIndustrFieldValues('priority_industry_count_fde');
    } else {
      res = await getIndustrFieldValues('touyan_priority_industry_count_ghw');
    }

    const priorityTags = res.result.map((obj) => {
		state.distinctNames[obj.priority] = obj.industry_count;
		return obj.priority
	});

    priorityTags.sort((a, b) => {
		return prioritiesOrder[a] - prioritiesOrder[b];
	});

    state.priorityTags = [...priorityTags]

	getData()
})

</script>
<style lang="less" scoped>
.industry-wrap {
	height: 100%;
	display: flex;
	flex-direction: column;
	.header {
		flex-shrink: 0;
		flex-grow: 0;
		padding: 0.5rem 0.5rem 0px;
		> div {
			display: flex;
			align-items: center;
			.first_introduction_text {
				position: relative;
				width: 60px;
				font-size: 13.5px;
				line-height: 26px;
				margin-right: 11px;
				color: rgba(0, 0, 0, 0.7);
				.info-circle {
				    color: #167FFF; 
					cursor: pointer; 
					position: absolute;
					top: 4px; 
					right: -6px;
					font-size: 10px
				}
			}

			.divider {
				margin-right: 12px; 
				margin-left: 12px;
				background-color: rgba(215, 215, 215, 1);
			    width: 1px;
			    height: 20px;
			}

			:deep(.icon-wrapper), .icon-wrapper {
				height: 100%;
				line-height: 30px;
    			color: #888888;
				text-align: center;
				cursor: pointer;
				:deep(svg) {
					font-size: 18px;
				}
				svg {
					font-size: 18px;
				}
				&.mr {
					margin-right: 12px;
				}
			}

			.text-wrapper_9 {
				background-color: inherit;
				color:  #555;
			    border-radius: 4px;
			    height: 26px;
			    margin-left: 16px;
			    width: 75px;
				display: flex;
			    justify-content: center;
			    align-items: center;
				font-size: 13px;
				&.checked {
					color: rgb(22, 119, 255);
				}
				&.genjin {
					background-color: #ffe6da;
				}
				&.guanzhu {
					background-color: #E1F0F9;
				}
				&.touhou {
					background-color: rgba(220, 229, 250, .7);
				}
			}
		}
	}

	.industry-contariner {
		margin-top: 10px;
		.action-btn {
			padding: 0px 7px;
			cursor: pointer;
			&.danger {
				color: #ED6F6F;
			}
			&.save {
				color: #55D187;
			}
		}
	}
}
</style>