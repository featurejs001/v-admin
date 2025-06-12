<template>
    <div>
		<a-dropdown class="sidebar-logo-container">
			<div @click.prevent>
				<img :src="userInfo.value?.avatar || defaultLogo" class="sidebar-logo">
	        	<span class="sidebar-title">{{ userInfo?.realname || '' }} </span>
			</div>
			<template #overlay>
				<a-menu class="avatar-menu" @click="handleClick" :items="items" />
			</template>
		</a-dropdown>
	</div>
</template>
<script setup>
import { h, reactive } from "vue"
import { storeToRefs } from 'pinia'
import { useUser } from "@/store/user"
import defaultLogo from "@/assets/img/logo.png"
import { EditOutlined, SyncOutlined, PoweroffOutlined } from '@ant-design/icons-vue';
import { refreshCache } from "@/api/user"
import { message, Modal } from 'ant-design-vue';

const userStore = useUser();
const { userInfo } = storeToRefs(userStore);

const items = reactive([
	{
		key: 'password',
		label: '密码修改',
		title: '密码修改',
		icon: () => h(EditOutlined)
	},
	{
		key: 'cache',
		label: '刷新缓存',
		title: '刷新缓存',
		icon: () => h(SyncOutlined)
	},
	{
		key: 'logout',
		label: '退出系统',
		title: '退出系统',
		icon: () => h(PoweroffOutlined)
	}
])

const handleClick = (item) => {
	switch(item.key) {
		case 'password':
			return;
		case 'cache':
			refreshCache().then(() => {
				message.success("刷新缓存完成！");
				userStore.queryAllDictItems();
			})
			return;
		case 'logout':
			Modal.confirm({
				title: '温馨提示',
				content: '是否确认退出系统?',
				centered: true,
				onOk() {
					userStore.logout()
				}
			})
			return ;
	}
}
</script>
<style lang="less" scoped>
.sidebar-logo-container {
  position: relative;
  width: max-content;
  height: 50px;
  line-height: 50px;
  overflow: hidden;
  padding: 0 0 0 8px;


    & .sidebar-logo {
      width: 24px;
      height: 24px;
      vertical-align: middle;
      margin-right: 6px;
    }

    & .sidebar-title {
      display: inline-block;
      margin: 0;
    //   color: rgba(255, 255, 255, 0.7);
      font-weight: 600;
      line-height: 50px;
      font-size: 12px;
      font-family: Avenir, Helvetica Neue, Arial, Helvetica, sans-serif;
      vertical-align: middle;
    }
  

  &.collapse {
    .sidebar-logo {
      margin-right: 0px;
    }
  }
}
:deep(.avatar-menu) {
	width: 120px
}
</style>