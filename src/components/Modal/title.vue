<template>
	<div class="header">
		<div class="title">{{ title }}</div>
		<div>
			<FullscreenOutlined v-if="isShowFullcreen && !isFullscreen" @click.stop="handleFullscreen(true)" />
			<FullscreenExitOutlined v-else-if="isShowFullcreen" @click.stop="handleFullscreen(false)" />
			<CloseOutlined @click.stop="handleClose" />
		</div>
	</div>
</template>
<script setup>
import { ref, defineEmits, defineProps, toRefs } from "vue";
import { FullscreenOutlined, FullscreenExitOutlined, CloseOutlined } from '@ant-design/icons-vue';

const isFullscreen = ref(false);
const emits = defineEmits(['handleFullscreen', 'close'])
const props = defineProps({
	title: {
		type: String,
		default: ''
	},
	isShowFullcreen: {
		type: Boolean,
		default: true
	}
})
const { title } = toRefs(props);

const handleFullscreen = (flag) => {
	isFullscreen.value = flag;
	emits('handleFullscreen', flag)
}

const handleClose = () => {
	emits('close')
}

</script>
<style lang="less" scoped>
.header {
	display: flex;
	justify-content: space-between;
	.title {
		color: rgba(0, 0, 0, 0.88);
		font-size: 13.5px;
		font-weight: 500;
	}
	:deep(.anticon) {
		cursor: pointer;
		color: rgba(0, 0, 0, 0.45);
		&.anticon-close {
			margin-left: 20px;
		}
	}
}
</style>