import request from '@/utils/request';
const newsCenter =  {
  list: '/gy-core/sys/sysAnnouncementSend/getMyAnnouncementSend',
  editCementSend: '/gy-core/sys/sysAnnouncementSend/editByAnntIdAndUserId',
  syncNotic: '/gy-core/sys/annountCement/syncNotic',
}
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

export function getUserPermissionByToken() {
	return request({
		url: '/gy-core/sys/permission/getUserPermissionByToken',
		method: 'get'
	})
}

export function getCurrentUserRoles() {
	return request({
		url: '/gy-core/gy.gy/vIndustryAllInfo/getCurrentUserRoles',
		method: 'get'
	})
}

export function getSystemUsers(params) {
	return request({
		url: '/gy-core/sys/user/list',
		method: 'get',
		params
	})
}
export function getMyAnnouncementSend(params) {
	return request({
		url: newsCenter.list,
		method: 'get',
		params
	})
}
export function editCementSend(data) {
	return request({
		url: newsCenter.editCementSend,
		method: 'PUT',
		data
	})
}
export function syncNotic(params) {
	return request({
		url: newsCenter.syncNotic,
		method: 'get',
		params
	})
}