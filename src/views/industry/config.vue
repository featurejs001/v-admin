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
				<div style="display: flex; align-items: center; flex-grow: 1; flex-wrap: wrap;">
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
							<a-upload class="flex" v-if="hasPermission('project_list:import')" :customRequest="(file) => handleImportFile(file)" :showUploadList="false" name="file">
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
							<ExportOutlined class="icon-wrapper" @click="handleExport" />
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
				<div style="display: flex; align-items: center; flex-grow: 1; flex-wrap: wrap;">
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
				<template #editCommon="{ column, record, index, text }">
					<div v-if="!record.isEdit" class="w-full min-h-22 custor-pointer" @click="handleEdit(record)">{{ record[column.dataIndex] }}</div>
					<a-select
					 v-else 
					 class="w-full"
					 v-model:value="record[column.dataIndex]"
					 :showSearch="['priority'].includes(column.dataIndex) ? false : true"
					 :mode="Array.isArray(record[column.dataIndex]) ? 'multiple' : 'combobox'"
					 :options="getOptions(column.dataIndex)"
					 @search="($event) => state.selectSearch[column.dataIndex] = $event"
					/>
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
		<AddIndustry
		 v-model="state.showAdd" 
		 @success="() => {state.showAdd = false; state.params.pageNo = 1; getData();}"
		/>
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
	saveIndustry,
	importIndustryExcel,
	exportIndustry
} from '@/api/industry';
import { usePermission } from "@/utils/usePermission.ts";
import FullScreen from "@/components/common/fullScreen.vue";
import Redo from "@/components/common/redo.vue"; 
import { useUser } from "@/store/user";
import { getIndustryColumns } from "@/utils/industryHelper";
import Table from "@/components/Table/index.vue";
import { message as Message } from 'ant-design-vue';
import AddIndustry from "./components/addIndustry.vue";

const { hasPermission } = usePermission();
const userStore = useUser();

const state = reactive({
	loading: false,
	showAdd: false,
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
	selectedRowKeys: [],
	options: {
		domain1: [],
		domain2: [],
		domain3: [],
		main: [],
		assistant: [],
		other: [],
		priority: [],
	},
	selectSearch: {
		domain1: '',
		domain2: '',
		domain3: '',
	}
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
	if (!params.column) {
		params.column = 'createTime';
		params.order = 'desc';
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
	Message.loading({ content: '正在保存...', duration: 0, key: 'saving' });
	if (null === records || !Array.isArray(records)) {
		records = state.filterRecords.filter(v => state.selectedRowKeys.includes(v.industryId));
	}
	const saveRecords = records.map(record => {
	    return {
			...record,
			main: record.main?.join?.(",") || "",
			assistant: record.assistant?.join?.(",") || "",
			other: record.other?.join?.(",") || ""
		}
	})
    saveIndustry(saveRecords).then(res => {
		Message.success(res.message || "保存成功")
		getData()
	}).finally(() => {
		Message.destroy('saving');
	})
}

const handleAdd = () => {
	state.showAdd = true;
}

const handleImportFile = (data) => {
	console.log("handleImportFile :", data)
	const formData = new FormData();
	formData.append('file', data.file);
	importIndustryExcel(formData).then(res => {
	    Message.success(res.message || "导入成功")
		getData()
	})
}

const handleExport = () => {
	exportIndustry({
		column: 'createTime',
		order: 'desc',
	}, 'v_industry_all_info')
}

const handleEdit = (record) => {
	console.log("edit: ", {...record}, state.options)
	record.main = record.main ? record.main?.split?.(",") : [];
	record.assistant = record.assistant ? record.assistant?.split?.(",") : [];
	record.other = record.other ? record.other?.split?.(",") : [];
	record.domain1 = record.domain1 || "";
	record.domain2 = record.domain2 || "";
	record.domain3 = record.domain3 || "";
	record.priority = record.priority || "";
	record.isEdit = true;
	getIndustrFieldValues('domain1_name_xgdh').then(res => {
		state.options.domain1 = (res.result || []).map(item => {
			return {
				value: item.domain1,
				label: item.domain1
			}
		});
	})
	getIndustrFieldValues('domain2_name_axeh').then(res => {
		state.options.domain2 = (res.result || []).map(item => {
			return {
				value: item.domain2,
				label: item.domain2
			}
		});
	})
	getIndustrFieldValues('domain3_name_zghf').then(res => {
	    state.options.domain3 = (res.result || []).map(item => {
			return {
				value: item.domain3,
				label: item.domain3
			}
		});
	})
}

const getOptions = computed(() => {
	return (dataIndex) => {
		const options = state.options[dataIndex]
		console.log("options :", dataIndex, options)
		if (!dataIndex.includes('domain')) {
			return [...options]
		}
		const check = options.findIndex(item => item.value === state.selectSearch[dataIndex]);
		if (-1 === check) {
			return [
				...options, 
				{
					value: state.selectSearch[dataIndex], 
					label: state.selectSearch[dataIndex]
				}
			]
		}
		return [...options]
	}
})

const filterOption = (input, option) => {
    return option.value.toLowerCase().indexOf(input.toLowerCase()) >= 0;
}
onMounted(async () => {
	getToolTip().then(res => {
		state.tooltips = res.result || []
	})

	const userList = (await userStore.getUserList()).map(item => {
		return {
			value: item.realname,
			label: item.realname
		}
	});
	state.options.main = [...userList];
	state.options.assistant = [...userList];
	state.options.other = [...userList];

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

    state.priorityTags = [...priorityTags];

	state.options.priority = priorityTags.filter(v => v).map(item => {
		return {
			value: item,
			label: item
		}
	})

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
		// padding: 0.5rem 0.5rem 0px;
		> div {
			display: flex;
			align-items: flex-start;
			margin-bottom: 4px;
			.first_introduction_text {
				position: relative;
				width: 60px;
				font-size: 13.5px;
				line-height: 26px;
				margin-right: 11px;
				color: rgba(0, 0, 0, 0.7);
				flex-shrink: 0;
				flex-grow: 0;
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