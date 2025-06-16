<template>
	<div class="custom-nprogress">
		<div role="bar"></div>
		<div role="spinner"></div>
		<img class="logo" :src="logo" />
		<div class="dots">
            <span class="dot dot-spin"><i></i><i></i><i></i><i></i></span>
        </div>
		<div class="title">光跃投资智能平台</div>
	</div>
</template>
<script setup>
import logo from "@/assets/img/loading-logo.png";
</script>