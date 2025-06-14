<template>
	<a-modal
	 :class="['sys-modal', state.isFullscreeen?'full-modal':'']" 
	 v-model:open="state.open"
	 :confirmLoading="loading"
	 :closable="false"
	 :width="width"
	 @ok="handleOk" 
	 @cancel="handleCancel" 
	 >
	 	<template #title>
			<ModalTitle :title="title" :isShowFullcreen="isShowFullcreen" @close="handleCancel" @handleFullscreen="handleFullscreen" />
		</template>
	 	<slot></slot>
	</a-modal>
</template>
<script setup>
import { ref, defineProps, defineEmits, toRefs, watch, reactive } from "vue";
import ModalTitle from "@/components/Modal/title.vue"

const props = defineProps({
	title: {
		type: String,
		default: ''
	},
	loading: {
		type: Boolean,
		default: false
	},
	width: {
		type: Boolean,
		default: '600px'
	},
	modelValue: {
		type: Boolean,
		default: false
	},
	isShowFullcreen: {
		type: Boolean,
		default: true
	}
})
const emits = defineEmits(['close', 'submit'])
const { title, loading, width, modelValue, isShowFullcreen } = toRefs(props);

const state = reactive({
	open: false,
	isFullscreeen: false
})
watch(modelValue, (newVal) => {
	state.open = newVal;
})

const handleFullscreen = (flag) => {
	state.isFullscreeen = flag;
}

const handleCancel = () => {
	emits('close');
}

const handleOk = () => {
	emits('submit')
}
</script>
<style lang="less" scoped>

</style>