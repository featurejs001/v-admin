<template>
	<div :class="{'has-logo':showLogo}">
		<Avatar />
		<div class="scrollbar-wrapper">
			<a-menu
				v-model:openKeys="openKeys"
				v-model:selectedKeys="selectedKeys"
				mode="inline"
				:items="routes"
				:collapsed="!sidebar.opened"
				theme="dark"
				@click="handleMenuClick"
			>
			</a-menu>
		</div>
	</div>
</template>

<script setup>
import { mapState } from 'pinia'
import { useApp } from "@/store/app"
import { useUser } from "@/store/user"
import Avatar from "@/layout/components/Avatar.vue";
import { storeToRefs } from 'pinia'
import { computed, ref } from 'vue';

const openKeys = ref([]);
const selectedKeys = ref([]);

const appStore = useApp();
const { sidebar, sidebarLogo} = storeToRefs(appStore);

const userStore = useUser();
const { permissionRoutes } = storeToRefs(userStore)

const routes = computed(() => {
	const menus = permissionRoutes.value.filter(v => !v.hidden).map((item, index) => {
		let children;
		if (item.children?.length) {
			children = item.children.filter(v => !v.hidden).map((child, cindex) => {
				return {
					key: child.name || cindex,
					icon: child.meta?.icon,
					label: child.meta?.title,
					title: child.meta?.title,
					path: child.path
				}
			})
		}
		if (children.length === 1 && !item.isAwaysShow) {
			return children[0];
		}
		return {
			key: item.name || index,
			icon: item.meta?.icon,
			label: item.meta?.title,
			title: item.meta?.title,
			path: item.path,
			children
		}
	});
	
	return menus;
})

const handleMenuClick = (item) => {
	console.log(item)
}
</script>
<style lang="less" scoped>
:deep(.el-scrollbar__view) {
	height: 100%;
	.el-menu {
		height: 100%;
	}
}
.scrollbar-wrapper {
	width: 100%;
	height: calc(100% - 80px);
	overflow: hidden;
}
:deep(.ant-menu) {
	background: transparent;
	.ant-menu-item {
		padding-left: 16px !important;
		height: 52px;
		margin: 0px;
		width: 100%;
	}
}
</style>
