<template>
	<Modal
	 v-model="state.open" 
	 :title="$props.title" 
	 :loading="state.loading" 
	 :border="['briefIntroduction'].includes($props.field) ? false : true"
	 :width="$props.field.includes('domain') ? '1000px' : ['briefIntroduction'].includes($props.field) ? '800px' : '720px'" @close="handleClose" @submit="handleOk">
	 	<div :class="['modal-container', ['provinceMap', 'cityMap', 'regionMap', 'briefIntroduction'].includes($props.field) ? 'min-height' : '']">
			 <a-cascader
			  v-if="['provinceMap', 'cityMap', 'regionMap'].includes($props.field)"
			  v-model:value="state.value" 
			  :options="regionData" 
			  placeholder="请选择" 
			  allowClear
			  class="mx"
			  @change="handleValueChange"
			  />
			<div v-else-if="$props.field.includes('domain')" class="mx">
				<a-spin v-if="state.apiLoading" />
				<Domain v-else ref="domainRef" :domains="state.value" :allDomain="allDomain" />
			</div>
			<QuillEditor 
			 v-else-if="['briefIntroduction'].includes($props.field)" 
			 v-model:content="state.value" 
			 :options="state.editorOptions"
			 contentType="html"
			 style="height: 100%"
			 />
		 	<a-textarea
			  v-else
		      v-model:value="state.value"
		      placeholder="请输入"
		      :rows="4"
		    />
		</div>
	</Modal>
</template>
<script setup>
import { reactive, defineEmits, defineProps, watch, computed, ref, nextTick } from 'vue';
import Modal from "@/components/Modal/index.vue";
import { message } from 'ant-design-vue';
import { getExtraInfoByName, editProject } from "@/api/industry";
import Domain from "@/components/domain/index.vue";
import {
    regionData,
	getTextByCode
  } from '@/utils/areaDataUtil';
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css';
// import '@vueup/vue-quill/dist/vue-quill.bubble.css';

const emits = defineEmits(["success", "close"])
const props = defineProps({
	title: {
		type: String,
		default: ''
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
	},
	allDomain: {
		type: Array,
		default: () => []
	}
})

const domainRef = ref(null);
const state = reactive({
	open: false,
	loading: false,
	apiLoading: false,
	value: '',
	editorOptions: {
		theme: "snow",
		placeholder: "请输入",
		modules: {
			toolbar: [
				['bold', 'italic', 'underline', 'strike'],        // toggled buttons
				  ['blockquote', 'code-block'],
				  ['link', 'image', 'formula'], // video

				  [{ 'header': 1 }, { 'header': 2 }],               // custom button values
				  [{ 'list': 'ordered'}, { 'list': 'bullet' }, { 'list': 'check' }],
				  [{ 'script': 'sub'}, { 'script': 'super' }],      // superscript/subscript
				  [{ 'indent': '-1'}, { 'indent': '+1' }],          // outdent/indent
				  [{ 'direction': 'rtl' }],                         // text direction

				//   [{ 'size': ['small', false, 'large', 'huge'] }],  // custom dropdown
				  [{ 'header': [1, 2, 3, 4, 5, 6, false] }],

				  [{ 'color': [] }, { 'background': [] }],          // dropdown with defaults from theme
				//   [{ 'font': [] }],
				  [{ 'align': [] }],

				  ['clean']        // remove formatting button
			]
		}
	}
})

const width = computed(() => {
	if (props.field.includes('domain')) {
		return '1000px'
	}
	return '520px'
})

const getData = () => {
	state.apiLoading = true;
	getExtraInfoByName({
		projName: props.record.name,
	}).then(res => {
		if (res.result?.industryInfo?.length) {
			state.value = res.result.industryInfo.map(item => {
				return {
					domain1: item.domain1,
					domain2: item.domain2,
					domain3: item.domain3
				}
			})
			// console.log('domains :', state.value)
		}
	}).finally(() => {
		state.apiLoading = false;
	})
}

watch(() => props.modelValue, (val) => {
	state.open = val;
	switch(props.field) {
		case 'provinceMap':
		case 'cityMap':
		case 'regionMap':
			if (props.record.province && props.record.city && props.record.region) {
				state.value = [props.record.province, props.record.city, props.record.region]
			} else {
				state.value = []
			}
			return;
		case 'domain1':
		case 'domain2':
		case 'domain3':
			state.value = [];
			break;
		case 'briefIntroduction':
			state.value = props.record.briefIntroduction;
			return;
		default:
			state.value = props.record[props.field];
			return;
	}
	
	if (val) {
		getData();
	}
}, {immediate: true})
const handleOk = async () => {
	state.loading = true;
	try {
		const record = {...props.record};
		if (['provinceMap', 'cityMap', 'regionMap'].includes(props.field)) {
			if (!state.value || !Array.isArray(state.value) && state.value.length < 3) {
				message.error("请完整选择省市区");
				return;
			}
			const [province, city, region] = state.value;
		    record.provinceMap = getTextByCode(province);
		    record.cityMap = getTextByCode(city);
		    record.regionMap = getTextByCode(region);
		    record.province = province;
		    record.city = city;
		    record.region = region;
		    record.code = `${province},${city},${region}`;

		    record.industryInfo = null;
		    record.memoInfo = null;
		    
		} else if (props.field.includes('domain')) {
		    record.memoInfo = null;
			record.industryInfo = await domainRef.value.validate();
			// console.log("domains :>> ", record.industryInfo);
		} else {
			record.industryInfo = null;
		    record.memoInfo = null;
			record[props.field] = state.value;
		}

		await editProject({
			...record
		});
		message.success("保存成功");
		emits("success", true)
	} catch(err) {}

	state.loading = false;
}

const handleClose = () => {
	emits("close", false)
}

const handleValueChange = (value) => {
	state.value = value;
}
</script>
<style lang="less" scoped>
.modal-container {
	padding: 0px 16px;
	&.min-height {
		min-height: 200px;
	}
	
	:deep(.ant-cascader) {
		width: 210px;
	}
}
.mx {
	margin: 0 20px;
}
</style>