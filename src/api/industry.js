
import request from '@/utils/request';
export function getIndustryList() {
	return request({
		url: '/gy-core/gy.gy/vIndustryAllInfo/list',
		method: 'get',
	})
}

export function getToolTip() {
	return request({
		url: '/gy-core/api/common/getToolTip',
		method: 'get',
	})
}

export function getIndustryNth() {
	return request({
		url: '/gy-core/gy.gy/vIndustryAllInfo/getResult/domain_nth_xhwe',
		method: 'get',
	})
}

export function getIndustrFieldValues() {
    return request({
        url: '/gy-core/gy.gy/vIndustryAllInfo/getResult/report_project_field_values_proj_center_gsh',
        method: 'get',
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