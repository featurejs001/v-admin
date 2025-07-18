<template>
	<MyModal
	 title="新增"
	 width="800px"
	 v-model="state.open"
	 :loading="state.loading"
	 @close="handleClose" 
	 @submit="handleOk"
	>
		<a-form
		    :model="state.form"
			:rules="state.rules"
		    name="basic"
			ref="formRef"
		    :label-col="{ flex: '90px' }"
		    :wrapper-col="{ flex: '1 1 calc(100% - 90px)' }"
			:colon="false"
		    autocomplete="off"
			class="form"
		>
			<a-row :gutter="20">
				<a-col :span="12">
					<a-form-item
					    label="一级赛道"
					    name="domain1"
					>
					    <a-input v-model:value="state.form.domain1" placeholder="请输入一级赛道" allowClear />
					</a-form-item>
				</a-col>
				<a-col :span="12">
					<a-form-item
					    label="二级赛道"
					    name="domain2"
					>
					    <a-input v-model:value="state.form.domain2" placeholder="请输入二级赛道" allowClear />
					</a-form-item>
				</a-col>
				<a-col :span="12">
					<a-form-item
					    label="三级赛道"
					    name="domain3"
					>
					    <a-input v-model:value="state.form.domain3" placeholder="请输入三级赛道" allowClear />
					</a-form-item>
				</a-col>
				<a-col :span="12">
					<a-form-item
					    label="优先级"
					    name="priority"
					>
					    <a-select v-model:value="state.form.priority" :options="state.priorityList" placeholder="请选择优先级" allowClear />
					</a-form-item>
				</a-col>
				<a-col :span="12">
					<a-form-item
					    label="主理人"
					    name="main"
					>
					    <a-select
						 v-model:value="state.form.main" 
						 mode="multiple"
						 :options="state.userList" 
						 placeholder="请选择主理人" 
						 allowClear />
					</a-form-item>
				</a-col>
				<a-col :span="12">
					<a-form-item
					    label="协理人"
					    name="assistant"
					>
					    <a-select
						 v-model:value="state.form.assistant" 
						 mode="multiple"
						 :options="state.userList" 
						 placeholder="请选择协理人" 
						 allowClear />
					</a-form-item>
				</a-col>
				<a-col :span="12">
					<a-form-item
					    label="其他人"
					    name="other"
					>
					    <a-select
						 v-model:value="state.form.other" 
						 mode="multiple"
						 :options="state.userList" 
						 placeholder="请选择其他人" 
						 allowClear />
					</a-form-item>
				</a-col>
			</a-row>
		</a-form>
	</MyModal>
</template>
<script setup>
import { defineProps, reactive, ref, watch } from "vue";
import MyModal from '@/components/Modal/index.vue'
import { getDictItems, addIndustry } from "@/api/industry";
import { message as Message } from 'ant-design-vue';

const emits = defineEmits(['success', 'update:modelValue'])
const props = defineProps({
	modelValue: {
		type: Boolean,
		default: false
	}
})

const formRef = ref(null);
const state = reactive({
	loading: false,
	open: false,
	form: {
		domain1: '',
		domain2: '',
		domain3: '',
		priority: '',
		main: [],
		assistant: [],
		other: []
	},
	rules: {
		domain1: [{ required: true, message: '请选择一级赛道' }],
		domain2: [{ required: true, message: '请选择二级赛道' }],
		domain3: [{ required: true, message: '请选择三级赛道' }],
		main: [{required: true, message: '请选择主理人'}]
	},
	priorityList: [],
	userList: []
})

watch(() => props.modelValue, (val) => {
    state.open = val;
	if (val) {
		getDictItems('priority2').then(res => {
			state.priorityList = res.result || []
		})
		getDictItems('sys_user,realname,realname').then(res => {
			state.userList = res.result || []
		})
	} else {
		formRef.value?.resetFields?.()
	}
})

const handleClose = () => {
	emits('update:modelValue', false)
}

const handleOk = async () => {
	await formRef.value.validate();
	state.loading = true;
	const obj = {
		...state.form,
		main: state.form.main.join(','),
		assistant: state.form.assistant.join(','),
		other: state.form.other.join(',')
	}
	addIndustry(obj).then(res => {
		Message.success(res.message || '新增成功');
		emits('success');
	}).finally(() => {
		state.loading = false;
	})
}

</script>
<style lang="less" scoped>
.form {
	padding: 16px;
	width: 100%;
	margin: 0px;
}
</style>