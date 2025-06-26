<template>
	<Modal v-model="state.open" :title="$props.title" :loading="state.loading" width="900px" @close="handleClose" @submit="handleOk">
		<div class="body">
		    <div class="search-div">
				<div class="label">账号</div>
				<a-input v-model:value="state.username" placeholder="请输入账号" allowClear />
				<div class="label">姓名</div>
				<a-input v-model:value="state.realname" placeholder="请输入姓名" allowClear />
				<a-button type="primary" class="btn" :icon="h(SearchOutlined)" @click="handleFilter">查询</a-button>
				<a-button class="btn reset" :icon="h(ReloadOutlined)" @click="handleReset">重置</a-button>
			</div>
			<Table
			 :isHideLeft="true"
			 :tableProps="{
				loading: state.loading,
				pagination: {
					total: state.dataSource.length,
					showTotal: (total) => `共 ${total} 条数据`,
					showQuickJumper: true
			 	},
				dataSource: state.dataSource,
				columns: state.columns,
				bordered: true,
				scroll: {x: '100%', y: '500px'}
				
			 }"
			 :isFixedMaxHeight="false">
			 	<template #titleCheckbox="column">
					<a-checkbox
				      v-model:checked="state.checkAll"
				      :indeterminate="state.indeterminate"
					  class="custom-checkbox"
				      @change="onCheckAllChange"
				    />
				</template>
			 	<template #checkbox="{record}">
					<a-checkbox
				      :checked="state.selectedRowKeys.includes(record.id)"
					  class="custom-checkbox"
				      @change="onSelectChange(record.id)"
				    />
				</template>
			</Table>
			<a-row v-if="$props.showShare" style="margin-top: 12px">
	            <a-col :span="24">
	              <a-radio-group v-model:value="state.shareType">
	                <a-radio value="share">共享</a-radio>
	                <a-radio value="push">移交</a-radio>
	              </a-radio-group>
	            </a-col>
	          </a-row>
		</div>
	</Modal>
</template>
<script setup>
import Modal from "@/components/Modal/index.vue";
import { defineProps, defineExpose, h, reactive, ref } from "vue";
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons-vue';
import { getSystemUsers } from "@/api/user";
import Table from "@/components/Table/index.vue"
import { message } from 'ant-design-vue';

const emits = defineEmits(['ok'])

const props = defineProps({
	title: {
		type: String,
		default: '选择用户'
	},
	showShare: {
		type: Boolean,
		default: false,
	}
})
const state = reactive({
	open: false,
	loading: false,
	search: {
		username: '',
		realname: ''
	},
	otherParmas: {},
	shareType: 'share',
	checkAll: false,
	indeterminate: false,
	selectedRowKeys: [],
	allData: [],
	dataSource: [],
	columns: [{
		title: '选择',
		align: 'center',
		dataIndex: 'checkbox',
		slot: 'checkbox',
		titleSlot: 'titleCheckbox',
		width: 80,
	}, {
		title: '序号',
		align: 'center',
		dataIndex: 'rowIndex',
		slot: 'commonRowIndex',
		width: 80
	}, {
		title: '用户账号',
		align: 'center',
		dataIndex: 'username',
	}, {
		title: '用户姓名',
		align: 'center',
		dataIndex: 'realname',
	}, {
		title: '手机号码',
		align: 'center',
		dataIndex: 'phone',
	}, {
		title: '邮箱',
		align: 'center',
		dataIndex: 'email',
	}]
})

const handleFilter = () => {
	let list = [...state.allData];
    if (state.username) {
		list = list.filter(item => item.username.indexOf(state.username) > -1);
	}

	if (state.realname) {
		list = list.filter(item => item.realname.indexOf(state.realname) > -1);
	}

	state.dataSource = list;
}

const handleReset = () => {
    state.username = '';
	state.realname = '';
	handleFilter()
}

const handleOpen = (params) => {
	state.otherParmas = params;
	state.open = true;

	state.loading = true;
	getSystemUsers({
		pageNo: 1,
		pageSize: 10000,
	}).then(res => {
		state.dataSource = res?.result?.records || [];
		state.allData = res?.result?.records || [];
		state.loading = false;
	}).catch(() => {
		state.loading = false;
	})
}

const onSelectChange = (id) => {
	const index = state.selectedRowKeys.indexOf(id);
	if (index > -1) {
		state.selectedRowKeys.splice(index, 1);
	} else {
		state.selectedRowKeys.push(id);
	}

	Object.assign(state, {
		indeterminate: !!state.selectedRowKeys.length && state.selectedRowKeys.length < state.dataSource.length,
		checkAll: state.selectedRowKeys.length === state.dataSource.length,
	})
}

const onCheckAllChange = () => {
	Object.assign(state, {
		indeterminate: false,
		selectedRowKeys: state.checkAll ? state.dataSource.map((item) => item.id) : [],
	})
}

const handleClose = () => {
	state.selectedRowKeys = [];
	state.checkAll = false;
	state.indeterminate = false;
	state.open = false;
}

const handleOk = () => {
	if (!state.selectedRowKeys.length) {
		message.warning('请选择最少一个用户');
		return;
	}

    emits('ok', {
		userIds: state.selectedRowKeys,
		shareType: state.shareType,
		...state.otherParmas
	})
}

defineExpose({
    handleOpen,
	handleClose
})
</script>
<style lang="less" scoped>
.body {
	padding: 0px 20px;
	.search-div {
		display: flex;
		align-items: center;
		margin-bottom: 30px;
		.label {
			width: max-content;
			flex-shrink: 0;
			flex-grow: 0;
			padding: 0px 10px;
		}
		:deep(.ant-input-affix-wrapper) {
			width: 160px;
			margin-right: 10px;
		}
		.btn {
			margin-left: 0.5rem;
		}
		.reset {
			color: #888888;
		}
	}
}
</style>