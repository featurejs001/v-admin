<template>
	<Modal
	 v-model="state.open" 
	 :title="$props.title" 
	 :loading="state.loading" 
	 :width="$props.width" @close="handleClose" @submit="handleOk">
	 	<a-select
		 v-if="['provinceMap', 'cityMap', 'regionMap'].includes($props.field)"
		 v-model:value="state.value"
		 ></a-select>
		<div v-if="$props.field.includes('domain')">
			
		</div>
	 	<a-textarea
		  v-else
	      v-model:value="state.value"
	      placeholder="请输入"
	      :rows="4"
	    />
	</Modal>
</template>
<script setup>
import { reactive, defineEmits, defineProps, watch } from 'vue';
import Modal from "@/components/Modal/index.vue";
import { message } from 'ant-design-vue';

const emits = defineEmits(["ok", "close"])
const props = defineProps({
	title: {
		type: String,
		default: ''
	},
	width: {
		type: String,
		default: '520px'
	},
	modelValue: {
		type: Boolean,
		default: false
	},
	field: {
		type: String,
		default: ''
	},
	record: {
		type: Object,
		default: () => ({})
	}
})

const state = reactive({
	open: false,
	loading: false,
	value: ''
})

watch(() => props.modelValue, (val) => {
	state.open = val;
	state.value = props.record[props.field];
}, {immediate: true})
const handleOk = () => {
	emits("ok", state.value)
}

const handleClose = () => {
	emits("close", false)
}
</script>