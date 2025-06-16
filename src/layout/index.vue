<template>
	<a-layout class="wrap">
	  <a-layout-sider :class="['aside']" :width="isSidebarOpened?'var(--sideBarWidth)':'80px'"  >
      	<Sliderbar  />
	  </a-layout-sider>
      <a-layout class="container">
        <a-layout-header class="header" >
			<Navbar />
			<RouteTabs />
		</a-layout-header>
        <a-layout-content class="main">
			<router-view />
		</a-layout-content>
      </a-layout>
    </a-layout>
</template>
<script setup>
import { useApp } from "@/store/app"
import { storeToRefs } from 'pinia'
import Sliderbar from "@/layout/components/Slidebar/index.vue"
import Navbar from "@/layout/components/Navbar.vue"
import RouteTabs from "@/layout/components/RouteTabs.vue"

const appStore = useApp();
const { isSidebarOpened } = storeToRefs(appStore);

</script>
<style lang="less" scoped>
.wrap {
	width: 100%;
	height: 100%;
	overflow: hidden;
	.header {
		height: 60px;
		padding: 0px;
		background: var(--headerBg);
		box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
	}
	.aside {
		background: var(--sideBarBg);
		color: rgba(255, 255, 255, 0.7);
	}
}
</style>