<template>
	<a-modal
	 class="sys-modal" 
	 v-model:open="open" 
	 title="修改密码" 
	 :confirmLoading="loading"
	 @ok="handleOk" 
	 @cancel="handleCancel" 
	 width="600px">
	 	<template #title>
			<div>修改密码111</div>
		</template>
		<a-form
		    :model="formState"
		    name="basic"
			ref="formRef"
		    :label-col="{ span: 4 }"
		    :wrapper-col="{ span: 20 }"
			:rules="formRules"
			:colon="false"
		    autocomplete="off"
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
		    </a-form-item>

			<a-form-item
		      label="确认新密码"
		      name="confirmpassword"
		    >
		      <a-input-password v-model:value="formState.confirmpassword" allow-clear />
		    </a-form-item>
		</a-form>
	</a-modal>
</template>
<script setup>
import { h, reactive, ref } from "vue";
import { editPwd } from "@/api/user";
import { message } from "ant-design-vue";
import { useUser } from "@/store/user";
import { storeToRefs } from 'pinia';
import { FullscreenOutlined, FullscreenExitOutlined, CloseOutlined } from '@ant-design/icons-vue';

const userStore = useUser();
const { userInfo } = storeToRefs(userStore);

const formRef = ref(null);
const open = ref(false);
const loading = ref(false);
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

const closeSvg = {
  template: `<svg viewBox="0 0 24 24" style="enable-background:new 0 0 24 24;">
        <path class="st0" d="M4.8,9C4.5,9,4.3,8.7,4.3,8.5c0-0.1,0.1-0.3,0.2-0.4l4.2-3.9C8.8,4,9.1,4,9.3,4.2c0.2,0.2,0.2,0.5,0,0.7 L5.1,8.8C5,8.9,4.9,9,4.8,9L4.8,9z M4.9,22.5c-1.3,0-2.4-1-2.5-2.3l-0.8-8c-0.1-1.4,0.9-2.6,2.2-2.7l14.9-1.5 c1.4-0.1,2.6,0.9,2.7,2.2l0.8,8c0.1,1.4-0.9,2.6-2.2,2.7L5.2,22.5C5.1,22.5,5,22.5,4.9,22.5L4.9,22.5z M19.1,9.1c-0.1,0-0.1,0-0.2,0 L4,10.5c-0.8,0.1-1.4,0.8-1.3,1.6l0.8,8c0.1,0.8,0.8,1.4,1.6,1.3c0,0,0,0,0,0L20,20c0.8-0.1,1.4-0.8,1.3-1.6l-0.8-8 C20.5,9.7,19.8,9.1,19.1,9.1L19.1,9.1z M10.8,4.5C10,4.5,9.3,3.8,9.3,3s0.7-1.5,1.5-1.5s1.5,0.7,1.5,1.5C12.3,3.8,11.6,4.5,10.8,4.5 z M10.8,2.5c-0.3,0-0.5,0.2-0.5,0.5s0.2,0.5,0.5,0.5s0.5-0.2,0.5-0.5S11.1,2.5,10.8,2.5C10.8,2.5,10.8,2.5,10.8,2.5z M12.7,4.3 C12.6,4,12.8,3.8,13,3.7c0.1,0,0.3,0,0.4,0.1l4.8,3c0.2,0.1,0.3,0.5,0.2,0.7c-0.1,0.2-0.5,0.3-0.7,0.2l-4.8-3 C12.8,4.5,12.7,4.4,12.7,4.3L12.7,4.3z"/>
        <text transform="matrix(0.995 -0.1001 0.1001 0.995 3.7525 18.9285)">CLOSE</text>
    </svg>`
}

const closeIcon = h("div", {}, [
	h('FullscreenOutlined'),
	h('FullscreenExitOutlined'),
	h('CloseOutlined')
])

defineExpose({
	handleOpen
})
</script>
<style lang="less" scoped>
:deep(.ant-modal-body) {
	padding-left: 5px 40px;
}
</style>