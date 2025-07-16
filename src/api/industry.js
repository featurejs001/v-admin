
import request from '@/utils/request';

export function getProjectList(params) {
	return request({
		url: '/gy-core/gy.gy/vProjectAllInfo/listFilteredStatus',
		method: 'get',
		params
	})
}

// 推送列表
export function getPushList(params) {
	return request({
		url: '/gy-core/gy.gy/vProjectAllInfo/pushList',
		method: 'get',
		params
	})
}

// 删除列表
export function getDeleteList(params) {
	return request({
		url: '/gy-core/gy.gy/vProjectAllInfo/recycleBin',
		method: 'get',
		params
	})
}

// 彻底删除 
export function deleteProject(params) {
	return request({
		url: '/gy-core/gy.gy/vProjectAllInfo/delete',
		method: 'DELETE',
		params,
		data: params
	})
}

// 删除
export function removeProject(params) {
	return request({
		url: '/gy-core/gy.gy/vProjectAllInfo/putRecycleBin',
		method: 'DELETE',
		params,
		data: params
	})
}

// 还原
export function restoreProject(params) {
	return request({
		url: '/gy-core/gy.gy/vProjectAllInfo/revertRecycleBin',
		method: 'PUT',
		data: params
	})
}

export function getCategoryList(params) {
	return request({
		url: '/gy-core/gy.gy/vIndustryAllInfo/list',
		method: 'get',
		params
	})
}

export function getToolTip() {
	return request({
		url: '/gy-core/api/common/getToolTip',
		method: 'get',
	})
}

export function getDomainNth() {
	return request({
		url: '/gy-core/gy.gy/vIndustryAllInfo/getResult/domain_nth_xhwe',
		method: 'get',
	})
}

export function getIndustrFieldValues(path, params) {
    return request({
        url: '/gy-core/gy.gy/vIndustryAllInfo/getResult/' + path,
        method: 'get',
		params
    })
}

export function uploadData(data) {
	return request({
		url: '/gy-core/api/common/upload',
		method: 'post',
		data,
		headers: {
        	'Content-Type': 'multipart/form-data',
      	},
	})
}

export function verifyProject(params) {
	return request({
		url: '/gy-core/api/common/verify',
		method: 'POST',
		params
	})
}

export function importProjectFromLocalFile(params) {
	return request({
		url: '/gy-core/gy.gy/vProjectAllInfo/importProjectFromLocal',
		method: 'POST',
		params
	})
}

export function importInvestmentFromLocalFile(params) {
	return request({
		url: '/gy-core/gy.gy/vProjectAllInfo/importInvestmentFromLocal',
		method: 'POST',
		params
	})
}

export function importMemoFromLocalFile(params) {
	return request({
		url: '/gy-core/gy.gy/vProjectAllInfo/importMemoAndLinksFromLocal',
		method: 'POST',
		params
	})
}

export function importThirdProjectFromLocalFile(params) {
	return request({
		url: '/gy-core/gy.gy/vProjectAllInfo/importThirdProjectFromLocal',
		method: 'POST',
		params
	})
}

// 推送
export function pushProject(data) {
	return request({
		url: '/gy-core/gy.gy/vProjectAllInfo/push',
		method: 'PUT',
		data
	})
}

// 批量修改阶段
export function updateProjectStage(data) {
	return request({
		url: '/gy-core/gy.gy/vProjectAllInfo/batchEditFollowStage',
		method: 'POST',
		data
	})
}

// 编辑
export function editProject(data) {
	return request({
		url: '/gy-core/gy.gy/vProjectAllInfo/edit',
		method: 'post',
		data
	})
}

// 新增项目
export function addProject(data) {
	return request({
		url: '/gy-core/gy.gy/vProjectAllInfo/add',
		method: 'post',
		data
	})
}

// 
export function getExtraInfoByName(params) {
	return request({
		url: '/gy-core/gy.gy/vProjectAllInfo/getExtraInfoByName',
		method: 'get',
		params
	})
}

// 投资信息
export function getInvestmentInfo(params) {
	return request({
		url: '/gy-core/gy.gy/vIndustryAllInfo/getResult/investments_alias_fffe',
		method: 'get',
		params
	})
}

// 项目阶段
export function getProjectStage() {
	return request({
		url: '/gy-core/sys/dict/getDictItems/project_stage',
		method: 'get',
	})
}

// 跟进阶段
export function getFollowStage() {
	return request({
		url: '/gy-core/sys/dict/getDictItems/follow_stage',
		method: 'get',
	})
}

// 项目名称
export function getProjectName() {
	return request({
		url: '/gy-core/sys/dict/loadDict/gy_projects,name,name',
		method: 'get',
	})
}

// 更新项目
export function getProjectDetail(params) {
	return request({
		url: '/gy-core/gy.gy/vProjectAllInfo/getProjectDetail',
		method: 'get',
		params
	})
}

export function getIndustryAssignerDeef(params) {
	return request({
		url: "/gy-core/gy.gy/vIndustryAllInfo/getResult/industry_assigner_deef",
		method: "get",
		params
	})
}

export function reportFilterBarChart(params) {
	return request({
		url: "/gy-core/query-domain-combinations",
		method: "get",
		params
	})
}

export function moveTreeNode(data) {
	return request({
		url: '/gy-core/gy.gy/vIndustryAllInfo/moveTreeNode',
		method: "post",
		data
	})
}

export function mergeTreeNode(data) {
	return request({
		url: "/gy-core/gy.gy/vIndustryAllInfo/mergeTreeNode",
		method: "post",
		data
	})
}

export function updateTreeNodeName(data) {
	return request({
		url: "/gy-core/gy.gy/vIndustryAllInfo/updateTreeNodeName",
		method: "put",
		data
	})
}

export function addTreeNode(data) {
	return request({
		url: "/gy-core/gy.gy/vIndustryAllInfo/addTreeNode",
		method: "post",
		data
	})
}

export function deleteTreeNode(data) {
	return request({
		url: "/gy-core/gy.gy/vIndustryAllInfo/deleteTreeNode",
		method: "delete",
		data
	})
}

export function updateTreeNodeInfo(data) {
	return request({
		url: "/gy-core/gy.gy/vIndustryAllInfo/updateTreeNodeInfo",
		method: "put",
		data
	})
}

export function domainConfigList(params) {
	return request({
		url: '/gy-core/gy.gy/vIndustryAllInfo/domainConfigList',
		method: 'get',
		params
	})
}

export function deleteIndustry(data) {
	return request({
		url: '/gy-core/gy.gy/vIndustryAllInfo/delete',
		method: 'delete',
		data,
		params: data
	})
}

export function saveIndustry(data) {
	return request({
		url: '/gy-core/gy.gy/vIndustryAllInfo/saveIndustry',
		method: 'post',
		data
	})
}