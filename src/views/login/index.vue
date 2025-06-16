<template>
	<div class="login-wrap">
		<div class="image-text">
			<img src="@/assets/img/gy_logo.png" />
		</div>
		<a-form
		 class="login-card"
		 :model="loginForm"
		 :label-col="{ span: 0 }"
		 autocomplete="off"
		 @finish="handleLogin"
		>
			<div class="box">
				<div class="title">
					账户登录
				</div>
				<a-form-item label="">
					<a-input class="default-input" v-model:value="loginForm.username" placeholder="登录账户" @keyup.enter="handleLogin" />
				</a-form-item>
				<a-form-item label="">
					<a-input class="default-input" :type="showPwd ? 'text' : 'password'" v-model:value="loginForm.password" placeholder="密码" @keyup.enter="handleLogin">
						<template #suffix>
							<div class="view-pwd" @click.stop="showPwd = !showPwd">
								<EyeOutlined v-if="showPwd" />
								<EyeInvisibleOutlined v-else />
							</div>
						</template>
					</a-input>
				</a-form-item>
				<a-checkbox v-model="isRemember"  >记住我</a-checkbox>
				<a-form-item :wrapper-col="{ span: 24 }">
					<a-button type="primary"  html-type="submit" :loading="loading">登录</a-button>
				</a-form-item>
			</div>
		</a-form>
	</div>
</template>
<script setup>
import { reactive, ref } from "vue";
import { message } from 'ant-design-vue';
import { useUser } from "@/store/user";
import { useRouter } from 'vue-router';
import { EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons-vue';

const router = useRouter();

const userStore = useUser();

const loginForm = reactive({
	username: "",
	password: "",
	// checkKey: "",
	// captcha: ""
})
const showPwd = ref(false);
const isRemember = ref(false);
const loading = ref(false);

const handleLogin = () => {
	if (!loginForm.username) {
		message.warning('请输入账号');
		return;
	} else if (!loginForm.password) {
		message.warning('请输入密码')
		return;
	}

	loading.value = true;
	userStore.login({
		...loginForm
	}).then(res => {
		message.success('登录成功')
		router.replace("/");
		return;
	}).finally(() => {
		loading.value = false;
	})
}
</script>
<style lang="less" scoped>
.login-wrap {
	width: 100%;
	height: 100%;
	background: #FFF;
	display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    padding: 0 50px;
    gap: 100px;
	.image-text {
		width: 333px;
    	height: 75px;
		img {
			width: 100%;
			height: 100%;
			object-fit: contain;
		}
	}
	.login-card {
		
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.06);
		:deep(.el-card__body) {
			padding: 0px;
		}
		.box {
			width: 320px;
		    padding: 30px 30px;
		    background: #fff;
			box-shadow: 2px 9px 49px -17px rgba(0, 0, 0, 0.1);

			.title {
				color: #040404;
			    font-size: 17px;
			    font-weight: 500;
			    cursor: pointer;
				text-align: center;
    			padding-bottom: 20px;
				margin-bottom: 10px;
				position: relative;
				&:after {
					content: '';
				    position: absolute;
				    z-index: 0;
				    bottom: 10px;
				    left: 50%;
					transform: translateX(-50%);
				    width: 100px;
				    height: 4px;
				    background: #1b90ff;
				    border-radius: 100px;
				}
			}

			.login-form {
				margin-top: 20px;
			}


			.view-pwd {
				cursor: pointer;
				margin-right: 10px;
			}

			:deep(.ant-form-item) {
				margin-bottom: 20px;
			}

			:deep(.ant-input),:deep(.anticon) {
				color: #888888;
			}

			:deep(.ant-checkbox-wrapper) {
				font-size: 13px;
				color: var(--text-color);
				.ant-checkbox-inner {
					border-color: var(--input-border);
				}
			}

			:deep(.ant-btn-primary) {
				margin-top: 20px;
				width: 100%;
				font-size: 13px;
				border-radius: 4px;
			}
		}
	}
}
</style>