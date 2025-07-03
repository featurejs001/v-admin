<template>
	<div class="header">
		<div class="title">{{ title }}</div>
		<div>
			<a-tooltip placement="bottom" v-if="isShowFullcreen && !isFullscreen">
				<template #title>
					最大化
				</template>
				<FullscreenOutlined  @click.stop="handleFullscreen(true)" />
			</a-tooltip>
			<a-tooltip placement="bottom" v-if="isShowFullcreen && isFullscreen">
				<template #title>
					还原
				</template>
				<FullscreenExitOutlined  @click.stop="handleFullscreen(false)" />
			</a-tooltip>
			<a-tooltip placement="bottom">
				<template #title>
					关闭
				</template>
				<CloseOutlined @click.stop="handleClose" />
			</a-tooltip>
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
		color: #555;
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