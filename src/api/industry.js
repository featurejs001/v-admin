
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