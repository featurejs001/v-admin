import { defineStore } from "pinia";
import { Login, getUserInfo, queryAllDictItems, logout, getUserPermissionByToken, getCurrentUserRoles } from "@/api/user";
import { getToken, setToken, removeToken } from "@/utils/auth";
import { constantRoutes, dynamicRoutes} from "@/router";
import { filterAsyncRoutes } from "@/utils/permission";
/**
 * 用户信息
 * @methods setUserInfos 设置用户信息
 */

const getDefaultState = () => {
	return {
		token: "",
		userInfo: {
		},
		permissionRoutes: [],
		allDictItems: [],
		allAuthList: [],
		authList: [],
		premissionCodeList: [],
		sysSafeMode: false,
	};
};

export const useUser = defineStore("user", {
	state: () => {
		return getDefaultState();
	},
	actions: {
		setToken(value) {
			this.token = value;
		},
		reset() {
			removeToken();
			this.$reset()
		},
		login(data) {
			return new Promise((resolve, reject) => {
				Login(data)
					.then((res) => {
						setToken(res.result.token);
						this.token = res.result.token;
						this.userInfo = res.result.userInfo;
						resolve(res);
					})
					.catch((e) => {
						reject(e);
					});
			});
		},
		checkToken() {
			return new Promise((resolve) => {
				if (!this.token) {
					const token = getToken();
					if (!token) {
						resolve('');
						return;
					}
					this.token = token;
				}
				getUserInfo().then(res => {
					this.userInfo = res.result.userInfo;
					this.allDictItems = res.result.sysAllDictItems;
					resolve(this.token)
				}).catch((e) => {
					this.reset();
					resolve('')
				})
				
			});
		},
		logout() {
			return new Promise(async (resolve) => {
				if (this.token) {
					try {
						await logout()
					} catch(e) {}
					
				}

				this.reset();

				// router.push("/login");
				location.reload();
				resolve();
			});
		},
		generateRoutes() {
			return new Promise((resolve, reject) => {
				// resolve({ dynamicRoutes, isRedirect: true})
				Promise.all([getUserPermissionByToken(), getCurrentUserRoles()]).then(res => {
				    const systemPermission = res[0]?.result || {
						menu: []
					};
					const gUserRoles = res[1]?.result || [];

					if (!gUserRoles.includes('mgr') && !gUserRoles.includes('admin')) {
				        systemPermission.menu = systemPermission.menu.filter((menuItem) => menuItem.path !== '/gy/admin');
				    }

					if (gUserRoles.includes('mgr') && gUserRoles.includes('IR')) {
				        systemPermission.menu = systemPermission.menu.filter((menuItem) => menuItem.path !== '/gy/admin');
				    }
					
					this.premissionCodeList = systemPermission.codeList || [];
					this.authList = systemPermission.auth || [];
					this.allAuthList = systemPermission.allAuth || [];
					this.sysSafeMode = systemPermission.sysSafeMode || false;

					const asyncRoutes = filterAsyncRoutes( dynamicRoutes, systemPermission.menu)
					
					this.permissionRoutes = [...constantRoutes, ...asyncRoutes]
					resolve(asyncRoutes)
				}).catch(e => {
					reject(e)
				})
			})
		},
		queryAllDictItems() {
			return new Promise((resolve) => {
				queryAllDictItems().then(res => {
					this.allDictItems = res.result || []
					resolve(res.result || [])
				}).catch((e) => {
					resolve([])
				})
			})
		}
	},
});
