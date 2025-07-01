<template>
	<a-form
	    :model="state.form"
	    name="basic"
		ref="formRef"
	    :label-col="{ span: 8 }"
	    :wrapper-col="{ span: 16 }"
		:colon="false"
	    autocomplete="off"
		class="form"
	>
		
		<a-row :gutter="20" v-for="(domain, index) in state.form.domains" :key="index">
			<a-col :span="7">
				<a-form-item
				    label="一级赛道"
				    :name="['domains', index, 'domain1']"
				    :rules="[{ required: true, message: '请选择一级赛道' }]"
				>
				    <a-select v-model:value="domain.domain1" placeholder="请选择一级赛道" @change="handleChangeDomain1(index)" allowClear>
						<a-select-option v-for="item in domain1Options" :key="item" :value="item">{{ item }}</a-select-option>
					</a-select>
				</a-form-item>
			</a-col>
			<a-col :span="7">
				<a-form-item
				    label="二级赛道"
				    :name="['domains', index, 'domain2']"
				    :rules="[{ required: true, message: '请选择二级赛道' }]"
				>
				    <a-select v-model:value="domain.domain2" placeholder="请选择二级赛道" @change="handleChangeDomain2(index)" allowClear>
						<a-select-option v-for="item in domain2Options(domain.domain1)" :key="item" :value="item">{{ item }}</a-select-option>
					</a-select>
				</a-form-item>
			</a-col>
			<a-col :span="7">
				<a-form-item
				    label="三级赛道"
				    :name="['domains', index, 'domain3']"
				    :rules="[{ required: true, message: '请选择三级赛道' }]"
				>
				    <a-select v-model:value="domain.domain3" placeholder="请选择三级赛道" allowClear>
						<a-select-option v-for="item in domain3Options(domain.domain1, domain.domain2)" :key="item" :value="item">{{ item }}</a-select-option>
					</a-select>
				</a-form-item>
			</a-col>
			<a-col :span="3">
				<a-button class="btn" type="primary" ghost v-if="Number(index) === 0" @click="handleAdd">+</a-button>
				<a-button class="btn" danger v-else @click="handleDel(index)">-</a-button>
			</a-col>
		</a-row>
	</a-form>
</template>
<script setup>
import { reactive, ref, onMounted, watch, computed } from "vue";

const props = defineProps({
	allDomain: {
		type: Array,
		default: () => []
	},
	domains: {
		type: Array,
		default: () => []
	}
})

const formRef = ref(null);
const state = reactive({
	form: {
		domains: []
	},
})

watch(() => props.domains, (newVal) => {
	// console.log("watch domains :", newVal)
	state.form.domains = JSON.parse(JSON.stringify(newVal))
}, {
	immediate: true
})

const domain1Options = computed(() => {
	const arr = props.allDomain.map(item => item.domain1);
	return Array.from(new Set(arr));
})

const domain2Options = computed(() => {
	return (domain1) => {
		if (!domain1) {
			return []
		}
		const arr = props.allDomain.filter(item => item.domain1 === domain1).map(item => item.domain2);
		return Array.from(new Set(arr));
	}
})

const domain3Options = computed(() => {
	return (domain1, domain2) => {
		if (!domain1 || !domain2) {
			return []
		}
		const arr = props.allDomain.filter(item => item.domain1 === domain1 && item.domain2 === domain2).map(item => item.domain3);
		return Array.from(new Set(arr));	
	}
})

const handleAdd = () => {
	state.form.domains.push({
		domain1: null,
		domain2: null,
		domain3: null
	})
}

const handleDel = (index) => {
	state.form.domains.splice(index, 1)
}

const handleChangeDomain1 = (index) => {
	state.form.domains[index].domain2 = null
	state.form.domains[index].domain3 = null
}

const handleChangeDomain2 = (index) => {
	state.form.domains[index].domain3 = null
}

const validate = () => {
	return new Promise((resolve, reject) => {
		formRef.value.validate().then(() => {
			resolve(JSON.parse(JSON.stringify(state.form.domains)))
		}).catch((error) => {
			reject(error)
		})
	})
}

defineExpose({
    validate
})
</script>
<style lang="less" scoped>
:deep(.ant-select) {
	width: 100%;
}
.btn {
	width: 32px;
	padding: 0px;
}
</style>