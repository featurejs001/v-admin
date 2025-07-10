<template>
	<a-tooltip placement="top" v-if="!isDomFullscreen">
		<template #title>
			<span>最大化</span>
		</template>
		<FullscreenOutlined @click="handleFullscreen" :class="customClass" />
	</a-tooltip>
	<a-tooltip placement="top" v-else>
		<template #title>
			<span>最小化</span>
		</template>
		<FullscreenExitOutlined  @click="handleFullscreen" :class="customClass" />
	</a-tooltip>
</template>
<script setup>
import { FullscreenOutlined, FullscreenExitOutlined } from "@ant-design/icons-vue";
import { useApp } from "@/store/app";
import { storeToRefs } from "pinia";

const props = defineProps({
	customClass: {
		type: String,
		default: ''
	}
})

const appStore = useApp();
const { isDomFullscreen } = storeToRefs(appStore);

const handleFullscreen = () => {
	appStore.setDomFullScreen(!isDomFullscreen.value);
}
</script>