<template>
	<div class="search">
		<div>
			<a-input-search
		      v-model:value="state.value"
		      placeholder="全文搜索"
		      style="width: 300px"
		      @search="onSearch"
		    />
			<a-button type="primary" class="ml-2" :icon="h(RedoOutlined)" @click="clearSearch">重置搜索</a-button>
		</div>
		<div class="right">
			<Import @success="handleSuccess" />
			<a-tooltip placement="top">
        		<template #title>
					<span>导出</span>
				</template>
				<ExportOutlined @click="handleExport" />
			</a-tooltip>
			<FullScreen />
		</div>
	</div>
</template>
<script setup>
import { h, reactive, defineEmits } from 'vue';
import { ExportOutlined, RedoOutlined, ImportOutlined, FullscreenOutlined, FullscreenExitOutlined } from '@ant-design/icons-vue';
import { useApp } from "@/store/app";
import Import from "./import.vue";
import FullScreen from "@/components/common/fullScreen.vue";

const emits = defineEmits(['search', 'success', 'export']);

const state = reactive({
	value: ''   
})

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