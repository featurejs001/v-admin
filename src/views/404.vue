<template>
	<div class="container">
		<a-result status="404" title="404" sub-title="抱歉，您访问的页面不存在。">
		    <template #extra>
		      <a-button type="primary">返回首页</a-button>
		    </template>
		</a-result>
	</div>
</template>
<style lang="less" scoped>
.container {
	width: 100%;
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	.link {
		color: var(--active-color);
	}
}
</style>