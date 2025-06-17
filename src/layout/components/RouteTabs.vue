<template>
	<a-tabs
      :activeKey="state.activeKey"
      tab-position="top"
	  type="editable-card"
	  class="tabs"
	  @tabClick="handleTabClick"
	  @edit="handleDelClick"
    >
      <a-tab-pane v-for="item in historyRoutes" :key="item.name" :tab="item.meta.title" />
    </a-tabs>
</template>
<script setup>
import { onMounted, reactive, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useApp } from "@/store/app";
import { storeToRefs } from 'pinia';

const router = useRouter();
const curRoute = useRoute();

const appStore = useApp();
const { historyRoutes } = storeToRefs(appStore);

const state = reactive({
	activeKey: ''
});

watch(() => curRoute.name, (newVal) => {
	state.activeKey = newVal;
}, {immediate: true})

const handleTabClick = (val) => {
	router.push({ name: val });
}

const handleDelClick = (targetKey) => {
	const targetIndex = historyRoutes.value.findIndex((item) => item.name === targetKey);
	const routes = historyRoutes.value.filter((item) => item.name !== targetKey);
	appStore.setHistoryRoutes(routes);

	if (state.activeKey === targetKey) {
		const nextKey = routes[targetIndex - 1]?.name || routes[targetIndex]?.name || 'home';
		router.push({ name: nextKey })
	}
}
</script>
<style lang="less" scoped>
.tabs {
	padding: 0px 12px;
	height: 30px;
	line-height: 30px;
	overflow: hidden;
	:deep(.ant-tabs-nav) {
		margin-bottom: 0px;
		height: 100%;
		.ant-tabs-tab {
		    padding: 0px 10px;
			border-radius: 2px 2px 0px 0px;
			background: none;
			border: none;
			.ant-tabs-tab-btn {
				font-size: 12.5px;
				line-height: 26px;
				color: rgba(0,0,0,0.88);
			}
			.ant-tabs-tab-remove {
				padding: 0px;
				visibility: hidden;
				.anticon {
					width: 7px;
				}
			}
			&:hover {
				.ant-tabs-tab-remove {
			    	visibility: visible;
				}
			}
			&.ant-tabs-tab-active {
				background: var(--active-color);
				.ant-tabs-tab-remove {
					color: #FFF;
					visibility: visible;
				}
				.ant-tabs-tab-btn {
					color: #FFF;
					font-size: 13px;
				}
			}
		}
		.ant-tabs-nav-add {
			display: none;
		}
	}
}
</style>