<template>
	<MyModal v-model="state.open" title="批量编辑" :loading="state.loading" width="800px" @close="handleClose" @submit="handleOk">
		<div class="body">
			<a-tabs v-model:activeKey="state.activeTab" class="my-batch-tabs">
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
			    <a-tab-pane key="跟进阶段" tab="跟进状态">
					<div class="center">
						<span class="label">跟进状态</span>
						<a-select
					      v-model:value="state.followStage"
						  class="flex-1"
					    >
					      <a-select-option v-for="item in $props.followStageList" :key="item" :value="item">{{item}}</a-select-option>
					    </a-select>
					</div>
				</a-tab-pane>
				<a-tab-pane key="赛道" tab="赛道">
					<div class="">
						<Domain ref="domainRef" :domains="state.industryInfo" :allDomain="allDomain" />
					</div>
				</a-tab-pane>
			  </a-tabs>
		</div>
	</MyModal>
</template>

<script setup>
import { reactive, ref, watch } from 'vue';
import MyModal from "@/components/Modal/index.vue";
import { Modal, message } from 'ant-design-vue';
import { updateProjectStage } from "@/api/industry";
import Domain from "@/components/domain/index.vue";
import { editProject } from "@/api/industry";

const emits = defineEmits(['success'])

const props = defineProps({
	stageList: {
		type: Array,
		default: () => []
	},
	followStageList: {
		type: Array,
		default: () => []
	},
	allDomain: {
		type: Array,
		default: () => []
	}
})

const domainRef = ref(null);
const state = reactive({
	open: false,
	loading: false,
	activeTab: '项目阶段',
	stage: '',
	followStage: '',
	industryInfo: [
		{
			domain1: '',
			domain2: '',
			domain3: ''
		}
	],
	ids: [],
	rows: []
})

const handleClose = () => {
	state.stage = '';
	state.followStage = '';
	state.industryInfo = [{
		domain1: '',
		domain2: '',
		domain3: ''
	}]
	state.ids = [];
	state.loading = false;
	state.open = false;
}

const handleOpen = (params) => {
	state.ids = params?.ids || [];
	state.rows = params?.rows || [];
	state.open = true;
}

const handleOk = async () => {
    if (!state.stage) {
		message.warning('请选择项目阶段');
		return;
	} else if (!state.followStage) {
		message.warning('请选择跟进阶段');
		return;
	}

	let params;
	try {
		const industryInfo = await domainRef.value.validate();
		if (state.rows.length === 1) {
			params = {
				...state.rows[0],
				stage: state.stage,
				followStage: state.followStage,
				industryInfo,
				memoInfo: null
			}
		} else {
			params = state.rows.map(item => {
				return {
					...item,
					stage: state.stage,
					followStage: state.followStage,
					industryInfo,
					memoInfo: null
				}
			})
		}
	} catch(e) {
		message.warning('请选择赛道');
		return;
	}

	Modal.confirm({
        title: '确定保存',
        content: `是否确认保存${state.ids.length}条项目信息？`,
        onOk: () => {
			
			state.loading = true;
			editProject(params).then(res => {
				message.success(res.message);
				state.open = false;
				handleClose()
				emits('success')
			}).finally(() => {
				state.loading = false;
			})
		},
        onCancel: () => {
        },
      });
}

const handleOkOld = async () => {
	let func = updateProjectStage;
	let params = {
		ids: state.ids,
		stage: state.stage,
		followStage: state.followStage
	};
	if (state.activeTab.includes('赛道')) {
		func = editProject;
		const industryInfo = await domainRef.value.validate();
		if (state.rows.length === 1) {
			params = {
				...state.rows[0],
				industryInfo,
				memoInfo: null
			}
		} else {
			params = state.rows.map(item => {
				return {
					...item,
					industryInfo,
					memoInfo: null
				}
			})
		}

	} else if (!state.stage && !state.followStage) {
		message.warning('请最少选择一个阶段');
		return;
	}
	
	Modal.confirm({
        title: '确定保存',
        content: `是否确认保存${state.ids.length}条项目信息？`,
        onOk: () => {
			
			state.loading = true;
			func(params).then(res => {
				message.success(res.message);
				state.open = false;
				handleClose()
				emits('success')
			}).finally(() => {
				state.loading = false;
			})
		},
        onCancel: () => {
        },
      });
	
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
			color: #555;
		}
		.flex-1 {
			flex: 1;
		}
	}
}
body .my-batch-tabs .ant-tabs-tab-btn {
  color: #555 !important;
}
</style>