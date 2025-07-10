<template>
	<a-tabs
      :activeKey="state.activeKey"
      :tab-position="tabPosition"
	  type="editable-card"
	  :class="['tabs', isSidebarOpened ? 'inline' : 'vertical']"
	  @tabClick="handleTabClick"
	  @edit="handleDelClick"
    >
      <a-tab-pane v-for="item in historyRoutes" :key="item.path"  >
		<template #tab>
			<ContainerOutlined />
			<span class="title">{{ item.meta.title }}</span>
		</template>
	  </a-tab-pane>
    </a-tabs>
</template>
<script setup>
import { onMounted, reactive, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useApp } from "@/store/app";
import { storeToRefs } from 'pinia';
import { ContainerOutlined } from '@ant-design/icons-vue';

const router = useRouter();
const curRoute = useRoute();

const appStore = useApp();
const { isSidebarOpened, historyRoutes } = storeToRefs(appStore);

const props = defineProps({
    tabPosition: {
      type: String,
      default: 'top'
	}
})

const state = reactive({
	activeKey: ''
});

watch(() => curRoute.path, (newVal) => {
	state.activeKey = newVal;
}, {immediate: true})

const handleTabClick = (val) => {
	router.push({ path: val });
}

const handleDelClick = (targetKey) => {
	const targetIndex = historyRoutes.value.findIndex((item) => item.path === targetKey);
	const routes = historyRoutes.value.filter((item) => item.path !== targetKey);
	appStore.setHistoryRoutes(routes);

	if (state.activeKey === targetKey) {
		const nextKey = routes[targetIndex - 1]?.path || routes[targetIndex]?.path || '/';
		router.push({ path: nextKey })
	}
}
</script>
<style lang="less" scoped>
.tabs {
	&.ant-tabs-top {
		padding: 0px 12px;
		height: 30px;
		line-height: 30px;
		overflow: hidden;
	}
	:deep(.ant-tabs-nav) {
		margin-bottom: 0px;
		height: 100%;
		.ant-tabs-tab {
		    padding: 0px 10px;
			border-radius: 2px 2px 0px 0px;
			background: none;
			border: none;
			height: 26px;
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
	&.ant-tabs-left {
		border-top: 1px solid rgb(112 112 112 / 65%);
		margin-top: 10px;
		padding-top: 10px;
		flex: 1;
		overflow: hidden;
	    :deep(.ant-tabs-nav) {
			width: 100%;
			color: rgba(255, 255, 255, 0.65);
			.ant-tabs-tab {
				padding: 0px 16px;
				border-radius: 0px;
				display: flex;
				justify-content: space-between;
				.ant-tabs-tab-btn, .ant-tabs-tab-remove {
					color: rgba(255, 255, 255, 0.65);
				}
				.ant-tabs-tab-btn {
				    overflow: hidden;
				    text-overflow: ellipsis;
					.title {
						overflow: hidden;
				    	text-overflow: ellipsis;
						margin-inline-start: 10px;
					}
					.anticon {
						margin-right: 0px;
					}
				}
			}
			.ant-tabs-content-holder {
				display: none;
			}
		}
		&.vertical {
			:deep(.ant-tabs-nav) {
				.ant-tabs-tab {
					height: 48px;
					padding: 6px 0px;
					display: flex;
					justify-content: center;
					position: relative;
					.ant-tabs-tab-btn {
						display: flex;
						flex-direction: column;
						align-items: center;
						justify-content: space-around;
						.title {
							margin-inline-start: 0px;
							line-height: 1;
							margin: 0.25rem 0px 0px;
						}
					}
					.ant-tabs-tab-remove {
						position: absolute;
						    right: 8px;
						    z-index: 1;
						    top: 0px;
					}
				}
			}
		}
	}
}

</style>