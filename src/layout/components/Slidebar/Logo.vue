<template>
  <div class="sidebar-logo-container" :class="{'collapse':collapse}">
    <transition name="sidebarLogoFade">
      <router-link v-if="collapse" key="collapse" class="sidebar-logo-link" to="/">
        <img v-if="logo" :src="logo" class="sidebar-logo">
        <h1 v-else class="sidebar-title">{{ title }} </h1>
      </router-link>
      <router-link v-else key="expand" class="sidebar-logo-link" to="/">
        <img v-if="logo" :src="logo" class="sidebar-logo">
        <h1 class="sidebar-title">{{ title }} </h1>
      </router-link>
    </transition>
  </div>
</template>

<script>
import { mapState } from 'pinia'
import { useUser } from "@/store/user"
import defaultLogo from "@/assets/img/logo.png"

export default {
  name: 'SidebarLogo',
  props: {
    collapse: {
      type: Boolean,
      required: true
    }
  },
  data() {
    return {
    }
  },
  computed: {
	...mapState(useUser, ['userInfo']),
	logo() {
		return this.userInfo?.avatar || defaultLogo
	},
	title() {
		return this.userInfo?.realname;
	}
  }
}
</script>

<style lang="less" scoped>
.sidebarLogoFade-enter-active {
  transition: opacity 1.5s;
}

.sidebarLogoFade-enter,
.sidebarLogoFade-leave-to {
  opacity: 0;
}

.sidebar-logo-container {
  position: relative;
  width: 100%;
  height: 50px;
  line-height: 50px;
  overflow: hidden;
  padding: 0 0 0 8px;

  & .sidebar-logo-link {
    height: 100%;
    width: 100%;

    & .sidebar-logo {
      width: 24px;
      height: 24px;
      vertical-align: middle;
      margin-right: 6px;
    }

    & .sidebar-title {
      display: inline-block;
      margin: 0;
      color: rgba(255, 255, 255, 0.7);
      font-weight: 600;
      line-height: 50px;
      font-size: 12px;
      font-family: Avenir, Helvetica Neue, Arial, Helvetica, sans-serif;
      vertical-align: middle;
    }
  }

  &.collapse {
    .sidebar-logo {
      margin-right: 0px;
    }
  }
}
</style>
