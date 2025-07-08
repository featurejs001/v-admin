<template>
	<div class="search">
		<div>
			<a-input-search
		      v-model:value="state.value"
		      placeholder="全文搜索"
		      style="width: 300px"
		      @search="onSearch"
		    />
			<a-button type="primary" class="ml-2" :icon="h(RedoOutlined)" @click="clearSearch">重新搜索</a-button>
		</div>
		<div class="right">
			<Import @success="handleSuccess" />
			<a-tooltip placement="top">
        		<template #title>
					<span>导出</span>
				</template>
				<ExportOutlined @click="handleExport" />
			</a-tooltip>
			<a-tooltip placement="top" v-if="!isDomFullscreen">
        		<template #title>
					<span>最大化</span>
				</template>
				<FullscreenOutlined @click="handleFullscreen" />
			</a-tooltip>
			<a-tooltip placement="top" v-else>
        		<template #title>
					<span>最小化</span>
				</template>
				<FullscreenExitOutlined  @click="handleFullscreen" />
			</a-tooltip>
		</div>
	</div>
</template>
<script setup>
import { h, reactive, defineEmits } from 'vue';
import { ExportOutlined, RedoOutlined, ImportOutlined, FullscreenOutlined, FullscreenExitOutlined } from '@ant-design/icons-vue';
import { useApp } from "@/store/app";
import { storeToRefs } from "pinia";
import Import from "./import.vue";

const emits = defineEmits(['search', 'success', 'export']);

const appStore = useApp();
const { isDomFullscreen } = storeToRefs(appStore);

const state = reactive({
	value: ''   
})

const handleFullscreen = () => {
	appStore.setDomFullScreen(!isDomFullscreen.value);
}

const onSearch = (value) => {
	console.log(value);
	emits('search', value);
};

const clearSearch = () => {
	state.value = '';
	emits('clearSearch');
}

const handleSuccess = () => {
	emits('success');
}


const handleExport = () => {
	emits("export")
}

</script>
<style lang="less" scoped>
.search {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.25rem;
  .right {
	  display: flex;
	  align-items: center;
	  :deep(.anticon) {
		margin-left: 8px;
		width: 30px;
		height: 30px;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		svg {
			width: 18px;
			height: 18px;
			color: #888;
		}
  }
  }
}
</style>