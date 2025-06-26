import { defineStore } from "pinia";
import Cookies from 'js-cookie';
import { getHistoryRoutes, setHistoryRoutes } from '@/utils/auth';	

const getDefaultState = () => {
	return {
		sidebar: {
		    opened: Cookies.get('sidebarStatus') ? !!+Cookies.get('sidebarStatus') : true,
		    withoutAnimation: false
		},
		device: 'desktop',
		lastPage: {},
		sidebarLogo: '',
		isFullscreen: false,
		isDomFullscreen: false,
		historyRoutes: getHistoryRoutes() || [],
	};
};

export const useApp = defineStore("app", {
	state: () => {
		return getDefaultState();
	},
	getters: {
		isSidebarOpened: (state) => state.sidebar.opened
	},
	actions: {
		toggleSideBar() {
		    this.sidebar.opened = !this.sidebar.opened
    		this.sidebar.withoutAnimation = false
			if (this.sidebar.opened) {
		      Cookies.set('sidebarStatus', 1)
		    } else {
		      Cookies.set('sidebarStatus', 0)
		    }
		},
		closeSideBar(withoutAnimation) {
		    commit('CLOSE_SIDEBAR', withoutAnimation)
			Cookies.set('sidebarStatus', 0)
		    this.sidebar.opened = false
		    this.sidebar.withoutAnimation = withoutAnimation
		},
		toggleDevice(device) {
		    this.device = device
		},
		setLastPath(value) {
			this.lastPage = this.lastPage
		},
		setFullscreen(value) {
			if (value) {
				const element = document.documentElement
				if (element.requestFullscreen) {
					element.requestFullscreen();
				} else if (element.mozRequestFullscreen) {
					element.mozRequestFullscreen()
				} else if (element.webkitRequestFullscreen) {
					element.webkitRequestFullscreen()
				} else if (element.msRequestFullscreen) {
					element.msRequestFullscreen()
				}
			} else {
				if (document.exitFullscreen) {
				    document.exitFullscreen();
				} else if (document.mozCancelFullScreen) { /* Firefox */
				    document.mozCancelFullScreen();
				} else if (document.webkitExitFullscreen) { /* Chrome, Safari and Opera */
				    document.webkitExitFullscreen();
				} else if (document.msExitFullscreen) { /* IE/Edge */
				    document.msExitFullscreen();
				}
			}
			this.isFullscreen = value;
		},
		setDomFullScreen(value) {
			this.isDomFullscreen = value;
		},
		setHistoryRoutes(route) {
			if (Array.isArray(route)) {
				this.historyRoutes = route;
				setHistoryRoutes(this.historyRoutes);
				return true;
			}
			if (['/login', '/404', '/'].includes(route.path) || !route.meta?.title) {
				return false;	
			}
			const check = this.historyRoutes.find(item => item.path === route.path);
			// console.log("setHistoryRoutes :", check, route)
			if (!check) {
			    this.historyRoutes.push(route);
				setHistoryRoutes(this.historyRoutes);
			}
		}
	}
})