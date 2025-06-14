<template>
	<div >
		<Avatar />
		<div class="scrollbar-wrapper">
			<a-menu
				v-model:openKeys="openKeys"
				v-model:selectedKeys="selectedKeys"
				:mode="state.mode"
				theme="dark"
				:items="routes"
				:inlineIndent="16"
				:subMenuOpenDelay="0.2"
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
import { computed, ref, watch, reactive } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const openKeys = ref([]);
const selectedKeys = ref([]);

const appStore = useApp();
const { isSidebarOpened } = storeToRefs(appStore);

const userStore = useUser();
const { permissionRoutes } = storeToRefs(userStore)


const state = reactive({
	inlineCollapsed: false,
	mode: 'inline'
})
watch(isSidebarOpened, (newVal) => {
	console.log("sidebar :", newVal)
	state.inlineCollapsed = newVal;
	if (newVal) {
		state.mode = 'inline'
	} else {
		state.mode = 'vertical'
	}
}, {deep: true})


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
	router.push({
		name: item.key
	})
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
	font-size: 12px;
	.ant-menu-item {
		height: 52px;
		line-height: 52px;
		margin: 0px;
		width: 100%;
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
			height: 52px;
			line-height: 52px;
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
