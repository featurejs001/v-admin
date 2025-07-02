<template>
	<div class="slider-container">
		<Avatar />
		<div class="scrollbar-wrapper">
			<a-menu
				v-model:openKeys="state.openKeys"
				v-model:selectedKeys="state.selectedKeys"
				:mode="state.mode"
				theme="dark"
				:items="routes"
				:inlineIndent="16"
				:subMenuOpenDelay="0.2"
				@click="handleMenuClick"
			/>
			<RouteTabs :tabPosition="'left'" />
		</div>
		<div class="system-name" v-if="isSidebarOpened">光跃投资智能平台</div>
		<div class="system-name" v-else>光跃投资</div>
	</div>
</template>

<script setup>
import { mapState } from 'pinia'
import { useApp } from "@/store/app"
import { useUser } from "@/store/user"
import Avatar from "@/layout/components/Avatar.vue";
import { storeToRefs } from 'pinia'
import { computed, ref, watch, reactive, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import RouteTabs from "@/layout/components/RouteTabs.vue"

const router = useRouter();
const curRoute = useRoute();

const appStore = useApp();
const { isSidebarOpened } = storeToRefs(appStore);

const userStore = useUser();
const { permissionRoutes } = storeToRefs(userStore)


const state = reactive({
	inlineCollapsed: false,
	mode: 'inline',
	openKeys: [],
	selectedKeys: []
})
watch(isSidebarOpened, (newVal) => {
	state.inlineCollapsed = newVal;
	if (newVal) {
		state.mode = 'inline'
	} else {
		state.mode = 'vertical'
	}
}, {immediate: true})

watch(() => curRoute.name, (newVal) => {
	state.selectedKeys = [newVal];
}, {immediate: true})

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
					path: 0 === child.path.indexOf("/") ? item.path : item.path + child.path
				}
			})
		}
		if (children.length === 1 && !item.meta) {
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
	// console.log("menus :", menus)
	
	return menus;
})

const handleMenuClick = (item) => {
	console.log(item)
	router.push({
		name: item.key
	})
}

</script>
<style lang="less" scoped>
.slider-container {
	display: flex;
	flex-direction: column;
	height: 100%;

	.scrollbar-wrapper {
		width: 100%;
		height: calc(100% - 80px);
		overflow: hidden;
		flex: 1;
		display: flex;
		flex-direction: column;
	}

	.system-name {
		overflow: hidden;
	    text-overflow: ellipsis;
	    white-space: nowrap;
	    font-size: 12px;
	    color: rgba(255, 255, 255, 0.7);
	    text-align: center;
	}
}
:deep(.el-scrollbar__view) {
	height: 100%;
	.el-menu {
		height: 100%;
	}
}

:deep(.ant-menu) {
	background: transparent;
	font-size: 12px;
	.ant-menu-item {
		height: 32px;
		line-height: 32px;
		margin: 0px;
		width: 100%;
		border-radius: 0px;
	}

	.ant-menu-item-selected {
		border-radius: 0px;
	}

	> .ant-menu-submenu {
		padding: 0px !important;
		margin: 0px;
		width: 100%;
		.ant-menu-submenu-title {
			margin: 0px;
			width: 100%;
			height: 32px;
			line-height: 32px;
			padding: 14px 24px;
			border-radius: 0px;
		}
	}

	&.ant-menu-vertical {
		.ant-menu-item, .ant-menu-submenu-title {
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: space-around;
			padding: 6px 0px !important;
		}
		.ant-menu-submenu-arrow {
			display: none;
		}
		.ant-menu-title-content {
			height: max-content;
			line-height: 1;
			margin-top: 0.25rem;
			margin: 0.25rem 0px 0px;
		}
		
	}

}

</style>
