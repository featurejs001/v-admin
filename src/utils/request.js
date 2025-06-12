import axios from 'axios';
import { notification } from 'ant-design-vue';
import { useUser } from '@/store/user';
import signMd5Utils from '@/utils/signMd5Utils';
import router from '@/router'
// import { getToken } from "@/utils/auth";

// create an axios instance
const service = axios.create({
	baseURL: import.meta.env.VITE_APP_BASE_API, // url = base url + request url
	// withCredentials: true, // send cookies when cross-domain requests
	timeout: 10000 // request timeout
});

// request interceptor
service.interceptors.request.use(
	(config) => {
		// do something before request is sent
		// config.headers['X-Parse-Application-Id'] = 'parse-api'
		// config.headers['X-Parse-REST-API-Key'] = 'bNW5xllHFHyzpAfG_byWc8su9FSkjYta'

		// if (store.getters.token) {
		//   // let each request carry token
		//   // ['X-Token'] is a custom headers key
		//   // please modify it according to the actual situation
		// console.log("____store token :", store.getters.token);
		const userStore = useUser();

		if (userStore.token) {
			let tenantId = userStore.userInfo.loginTenantId || 0;
			if (userStore.userInfo?.shareTenantId) {
				tenantId = userStore.userInfo?.shareTenantId
			}
			config.headers['Authorization'] = '' + userStore.token;
			config.headers['X-Access-Token'] = userStore.token;
			config.headers['X-TIMESTAMP'] = signMd5Utils.getTimestamp();;
			config.headers['X-Sign'] = signMd5Utils.getSign(config.url, config.params);;
			config.headers['X-Tenant-Id'] = tenantId;
			config.headers['X-Version'] = 'v3';

			console.log("---->", router)
			let routeParams = router.currentRoute.value.params;
			if (routeParams.appId) {
				config.headers['X-Low-App-ID'] = routeParams.appId;
				// lowApp自定义筛选条件
				if (routeParams.lowAppFilter) {
				  config.params = { ...config.params, ...JSON.parse(routeParams.lowAppFilter)};
				  delete routeParams.lowAppFilter;
				}
			}
		}

		if (config.method && config.method.toLocaleLowerCase() === 'get') {
			if (!config.params) {
				config.params = {}
			}
			config.params._t = Date.now();
		}

		// }
		// if (config.newBaseURL) {
		// 	config.baseURL = config.newBaseURL;
		// }
		console.log('config', config); // for debug
		return config;
	},
	(error) => {
		// do something with request error
		console.log(error); // for debug
		return Promise.reject(error);
	}
);

// response interceptor
service.interceptors.response.use(
	/**
	 * If you want to get http information such as headers or status
	 * Please return  response => response
	 */

	/**
	 * Determine the request status by custom code
	 * Here is just an example
	 * You can also judge the status by HTTP Status Code
	 */
	(response) => {
		const res = response.data;

		//兼容车川接口
		if (res.head && res.body) {
			return response;
		}
		// return res;
		// console.log("___response :", res);
		// if the custom code is not 20000, it is judged as an error. 602: 错误弹框提示（有确认、取消操作按钮）
		if (![0, 200].includes(res.code)) {

			notification.error({
				message: '错误提示',
    			description:res.message || 'Error'
			})

			// // 50008: Illegal token; 50012: Other clients logged in; 50014: Token expired;
			// if (res.code === 50008 || res.code === 50012 || res.code === 50014) {
			//   // to re-login
			//   MessageBox.confirm(
			//     'You have been logged out, you can cancel to stay on this page, or log in again',
			//     'Confirm logout',
			//     {
			//       confirmButtonText: 'Re-Login',
			//       cancelButtonText: 'Cancel',
			//       type: 'warning'
			//     }
			//   ).then(() => {
			//     store.dispatch('user/resetToken').then(() => {
			//       location.reload()
			//     })
			//   })
			// }
			return Promise.reject(new Error(res.message || 'Error'));
		} else {
			return res;
		}
	},
	(error) => {
		console.log('err :', error); // for debug
		notification.error({
			message: '错误提示',
			description: error?.response?.data?.message || error.message || 'Error'
		});
		return Promise.reject(error);
	}
);

export default service;
