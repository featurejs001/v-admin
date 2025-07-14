<template>
	<a-tooltip placement="top">
		<template #title>
			<span>重新载入</span>
		</template>
		<RedoOutlined :spin="$props.loading" :class="$props.customClass" @click="handleReload" />
	</a-tooltip>
</template>
<script setup>
import { RedoOutlined } from '@ant-design/icons-vue';
import { useApp } from "@/store/app";

const appStore = useApp();
const props = defineProps({
    customClass: {
        type: String,
        default: ''
    },
	loading: {
		type: Boolean,
		default: false
	}
})

const handleReload = () => {
    appStore.setRefreshPage()
}
</script>