import { defineStore } from "pinia";
import { Login, getUserInfo, queryAllDictItems, logout } from "@/api/user";
import { getToken, setToken } from "@/utils/auth";
import { constantRoutes, dynamicRoutes} from "@/router";
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
		allDictItems: []
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
			setToken("");
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
			return new Promise((resolve) => {
				this.permissionRoutes = [...constantRoutes, ...dynamicRoutes]
				resolve();
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
