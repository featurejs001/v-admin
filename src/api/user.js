import request from '@/utils/request';

export function Login(data) {
	return request({
		url: "/gy-core/sys/login",
		method: 'post',
		data
	});
}

export function logout() {
	return request({
		url: '/gy-core/sys/logout',
		method: "get"
	})
}

export function getUserInfo() {
	return request({
		url: "/gy-core/sys/user/getUserInfo",
		method: "get"
	})
}

export function refreshCache() {
	return request({
		url: '/gy-core/sys/dict/refleshCache',
		method: "get"
	})
}

export function queryAllDictItems() {
	return request({
		url: '/gy-core/sys/dict/queryAllDictItems',
		method: 'get'
	})
}

export function editPwd(data) {
	return request({
		url: '/gy-core/sys/user/updatePassword',
		method: 'PUT',
		data
	})
}