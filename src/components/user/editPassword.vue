<template>
	<Modal v-model="open" :title="'修改密码'" :loading="loading" @close="handleClose" @submit="handleOk">
		<a-form
		    :model="formState"
		    name="basic"
			ref="formRef"
		    :label-col="{ span: 5 }"
		    :wrapper-col="{ span: 19 }"
			:rules="formRules"
			:colon="false"
		    autocomplete="off"
			class="form"
		>
			<a-form-item
		      label="旧密码"
		      name="oldpassword"
		    >
		      <a-input-password v-model:value="formState.oldpassword" allow-clear />
		    </a-form-item>

		    <a-form-item
		      label="新密码"
		      name="password"
		    >
		      <a-input-password v-model:value="formState.password" allow-clear />
			  <!-- <div class="strength-bar"></div> -->
			  <a-progress :percent="pwdStrength" :steps="5" :showInfo="false" :strokeColor="strokeColor" />
		    </a-form-item>

			<a-form-item
		      label="确认新密码"
		      name="confirmpassword"
		    >
		      <a-input-password v-model:value="formState.confirmpassword" allow-clear />
		    </a-form-item>
		</a-form>
	</Modal>
</template>
<script setup>
import { h, reactive, ref, computed, watch } from "vue";
import { editPwd } from "@/api/user";
import { message } from "ant-design-vue";
import { useUser } from "@/store/user";
import { storeToRefs } from 'pinia';
import { zxcvbn } from '@zxcvbn-ts/core';
import Modal from "@/components/Modal/index.vue";

const userStore = useUser();
const { userInfo } = storeToRefs(userStore);

const formRef = ref(null);
const open = ref(false);
const loading = ref(false);
const strokeColor = ref('#e74242');
const formState = reactive({
	oldpassword: "",
	password: "",
	confirmpassword: "",
})
const formRules = reactive({
	oldpassword: [{ required: true, message: '请输入旧密码' }],
	password: [
		{ required: true, message: '请输入新密码' }
	],
	confirmpassword: [{required: true, message: '请输入确认密码'},
		{ validator: (rule, value) => {
			if (formState.password !== value) {
				return Promise.reject('两次密码不一致')
			} else {
				return Promise.resolve()
			}
		  }
		}]
})
const pwdStrength = computed(() => {
	const score = formState.password ? zxcvbn(formState.password).score : -1;
	const precent = 20 * (score + 1);
	// console.log("precent :", precent, score)
	switch(score) {
		case 0:
			strokeColor.value = '#e74242';
			break;
		case 1:
			strokeColor.value = '#ED6F6F';
			break;
		case 2:
			strokeColor.value = '#EFBD47';
			break;
		case 3:
			strokeColor.value = 'rgba(85, 209, 135, 0.5)';
			break;
		case 4:
			strokeColor.value = '#55D187';
			break;
	}
	return precent;
})

const handleSubmit = () => {
	loading.value = false;
	editPwd({
		username: userInfo.value.username,
		...formState
	}).then(res => {
		message.success("修改成功")
		handleClose()
	})
}

const handleOpen = () => {
	open.value = true;
}

const handleClose = () => {
	open.value = false;
}

const handleOk = () => {
	formRef.value.validate().then(nameList => {
		handleSubmit();
	}).catch(e => {
	})
}

const handleCancel = () => {
	formRef.value.resetFields();
	open.value = false;
}

defineExpose({
	handleOpen
})
</script>
<style lang="less" scoped>
:deep(.ant-modal-body) {
	padding-left: 5px 40px;
}
:deep(.ant-progress-steps-item) {
	margin-inline-end: 6px;
	width: calc(20% - 6px) !important;
	height: 6px !important;
	&:first-child {
		border-radius: 6px 0px 0px 6px;
	}
	&:last-child {
		border-radius: 0px 6px 6px 0px;
	}
}
:deep(.ant-form), .form {
	max-width: 500px;
}
</style>