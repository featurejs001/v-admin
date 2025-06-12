<template>
	<div class="navbar">
		<div>
			<Avatar v-if="isFullscreen" />
			<hamburger
				:is-active="sidebar.opened"
				class="hamburger-container"
				@toggleClick="toggleSideBar"
			/>
		</div>
		<div class="right-menu">
			<FullscreenExitOutlined class="full-icon" v-if="isFullscreen"  @click="handleFullscreen" />
			<FullscreenOutlined class="full-icon" v-else @click="handleFullscreen" />
			
		</div>
	</div>
</template>
<script setup>
import { storeToRefs } from "pinia";
import { useApp } from "@/store/app";
import { useUser } from "@/store/user";
import Hamburger from "@/components/Hamburger/index.vue";
import Avatar from "@/layout/components/Avatar.vue";
import { FullscreenOutlined, FullscreenExitOutlined } from '@ant-design/icons-vue';

const appStore = useApp();
const { sidebar, isFullscreen } = storeToRefs(appStore);

const userStore = useUser();
const { userInfo } = storeToRefs(userStore);

const toggleSideBar = () => {
	appStore.toggleSideBar()
}

const logout = () => {
	userStore.logout();
}

const handleCommand = (command) => {
	switch(command) {
		case 'editInfo':
			break;
		case 'logout':
			logout();
			return;
	}
}

const handleFullscreen = () => {
	appStore.setFullscreen(!isFullscreen.value)
}

</script>
<style lang="less" scoped>
.navbar {
	height: 100%;
	overflow: hidden;
	position: relative;
	box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
	color: var(--text-color);
	display: flex;
	justify-content: space-between;

	.hamburger-container {
		line-height: 46px;
		height: 100%;
		float: left;
		cursor: pointer;
		transition: background 0.3s;
		-webkit-tap-highlight-color: transparent;

		&:hover {
			background: rgba(0, 0, 0, 0.025);
		}
	}

	.right-menu {
		height: 100%;
		line-height: 50px;
		padding-right: 20px;

		&:focus {
			outline: none;
		}

		.right-menu-item {
			display: inline-block;
			padding: 0 8px;
			height: 100%;
			font-size: 18px;
			color: #5a5e66;
			vertical-align: text-bottom;

			&.hover-effect {
				cursor: pointer;
				transition: background 0.3s;

				&:hover {
					background: rgba(0, 0, 0, 0.025);
				}
			}
		}

		.avatar-container {
			margin-right: 30px;
			height: 100%;

			.avatar-wrapper {
				position: relative;
				height: 100%;
				display: flex;
				align-items: center;

				.user-avatar {
					cursor: pointer;
					width: 40px;
					height: 40px;
					border-radius: 10px;
				}

				.user-name {
					margin-right: 5px;
					cursor: pointer;
				}
			}
			
		}
		.full-icon {
			width: 20px;
			height: 20px;
			:deep(svg) {
				width: 100%;
				height: 100%;
			}
		}
	}
}
</style>