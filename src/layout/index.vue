<template>
	<a-layout class="wrap">
	  <a-layout-sider class="aside" width="var(--sideBarWidth)" >
      	<Sliderbar  />
	  </a-layout-sider>
      <a-layout class="container">
        <a-layout-header class="header" >
			<Navbar />
		</a-layout-header>
        <a-layout-content class="main">
			<router-view />
		</a-layout-content>
      </a-layout>
    </a-layout>
</template>
<script setup>
import Sliderbar from "@/layout/components/Slidebar/index.vue"
import Navbar from "@/layout/components/Navbar.vue"

</script>
<style lang="less" scoped>
.wrap {
	width: 100%;
	height: 100%;
	overflow: hidden;
	.header {
		height: 50px;
		padding: 0px;
		background: var(--headerBg);
	}
	.aside {
		background: var(--sideBarBg);
		color: rgba(255, 255, 255, 0.7);
	}
}
</style>