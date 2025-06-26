<template>
	<Modal v-model="state.open" title="批量编辑" :loading="state.loading" width="520px" @close="handleClose" @submit="handleOk">
		<div class="body">
			<a-tabs v-model:activeKey="state.activeTab">
			    <a-tab-pane key="项目阶段" tab="项目阶段">
					<div class="center">
						<span class="label">项目阶段</span>
						<a-select
					      v-model:value="state.stage"
						  class="flex-1"
					    >
					      <a-select-option v-for="item in $props.stageList" :key="item" :value="item">{{item}}</a-select-option>
					    </a-select>
					</div>
				</a-tab-pane>
			    <a-tab-pane key="跟进阶段" tab="跟进阶段">
					<div class="center">
						<span class="label">跟进阶段</span>
						<a-select
					      v-model:value="state.followStage"
						  class="flex-1"
					    >
					      <a-select-option v-for="item in $props.followStageList" :key="item" :value="item">{{item}}</a-select-option>
					    </a-select>
					</div>
				</a-tab-pane>
			  </a-tabs>
		</div>
	</Modal>
</template>

<script setup>
import { reactive, ref, watch } from 'vue';
import Modal from "@/components/Modal/index.vue";
import { message } from 'ant-design-vue';
import { updateProjectStage } from "@/api/industry";

const emits = defineEmits(['success'])

const props = defineProps({
	stageList: {
		type: Array,
		default: () => []
	},
	followStageList: {
		type: Array,
		default: () => []
	}
})

const state = reactive({
	open: false,
	loading: false,
	activeTab: '项目阶段',
	stage: '',
	followStage: '',
	ids: []
})

const handleClose = () => {
	state.stage = '';
	state.followStage = '';
	state.ids = [];
	state.loading = false;
	state.open = false;
}

const handleOpen = (params) => {
	state.ids = params?.ids || [];
	state.open = true;
}

const handleOk = () => {
	if (!state.stage && !state.followStage) {
		message.warning('请最少选择一个阶段');
		return;
	}
	state.loading = true;
	updateProjectStage({
		ids: state.ids,
		stage: state.stage,
		followStage: state.followStage
	}).then(res => {
		message.success(res.message);
		state.open = false;
		handleClose()
		emits('success')
	}).finally(() => {
		state.loading = false;
	})
}

defineExpose({
	handleOpen
})
</script>
<style lang="less">
.body {
	padding: 0px 20px;
	.center {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
		padding: 20px 30px 80px;
		.label {
			margin-right: 10px;
		}
		.flex-1 {
			flex: 1;
		}
	}
}
</style>