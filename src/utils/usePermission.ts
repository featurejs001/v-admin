import type { RouteRecordRaw } from 'vue-router';

import { useApp } from '@/store/app';
import { useUser } from '@/store/user';

import router, { resetRouter } from '@/router';
// import { RootRoute } from '/@/router/routes';

import { PermissionModeEnum } from '@/enums/appEnum';
import { RoleEnum } from '@/enums/roleEnum';

import { intersection } from 'lodash-es';

// User permissions related operations
export function usePermission() {
  const userStore = useUser();
  const appStore = useApp();
  //动态加载流程节点表单权限
  let formData: any = {};
  function initBpmFormData(_bpmFormData) {
	formData = _bpmFormData;
  }

  const closeAll = () => {
	appStore.setHistoryRoutes([]);
  }

  //==================================工作流权限判断-begin=========================================
  function hasBpmPermission(code, type) {
	// 禁用-type=2
	// 显示-type=1
	let codeList: string[] = [];
	let permissionList = formData.permissionList;
	if (permissionList && permissionList.length > 0) {
	  for (let item of permissionList) {
		if (item.type == type) {
		  codeList.push(item.action);
		}
	  }
	}
	return codeList.indexOf(code) >= 0;
  }
  //==================================工作流权限判断-end=========================================

  /**
   * Change permission mode
   */
  async function togglePermissionMode() {
	appStore.setProjectConfig({
	  permissionMode: appStore.projectSetting.permissionMode === PermissionModeEnum.BACK ? PermissionModeEnum.ROUTE_MAPPING : PermissionModeEnum.BACK,
	});
	location.reload();
  }

  /**
   * Reset and regain authority resource information
   * @param id
   */
  async function resume() {
	resetRouter();
	const routes = await userStore.buildRoutesAction();
	routes.forEach((route) => {
	  router.addRoute(route as unknown as RouteRecordRaw);
	});
	userStore.setLastBuildMenuTime();
	closeAll();
  }

  /**
   * 确定是否存在权限
   */
  function hasPermission(value?: RoleEnum | RoleEnum[] | string | string[], def = true): boolean {
	// Visible by default
	if (!value) {
	  return def;
	}

	const permMode = appStore.projectSetting.permissionMode;

	if ([PermissionModeEnum.ROUTE_MAPPING, PermissionModeEnum.ROLE].includes(permMode)) {
	  if (!Array.isArray(value)) {
		return userStore.gUserRoles?.includes(value as RoleEnum);
	  }
	  return (intersection(value, userStore.gUserRoles) as RoleEnum[]).length > 0;
	}

	if (PermissionModeEnum.BACK === permMode) {
	  const allCodeList = userStore.premissionCodeList as string[];
	  if (!Array.isArray(value) && allCodeList && allCodeList.length > 0) {
		//=============================工作流权限判断-显示-begin==============================================
		if (formData) {
		  let code = value as string;
		  if (hasBpmPermission(code, '1') === true) {
			return true;
		  }
		}
		//=============================工作流权限判断-显示-end==============================================
		return allCodeList.includes(value);
	  }
	  return (intersection(value, allCodeList) as string[]).length > 0;
	}
	return true;
  }
  /**
   * 是否禁用组件
   */
  function isDisabledAuth(value?: RoleEnum | RoleEnum[] | string | string[], def = true): boolean {
	//=============================工作流权限判断-禁用-begin==============================================
	if (formData) {
	  let code = value as string;
	  if (hasBpmPermission(code, '2') === true) {
		return true;
	  }
	  //update-begin-author:taoyan date:2022-6-17 for: VUEN-1342【流程】编码方式 节点权限配置好后，未生效
	  if (isCodingButNoConfig(code) == true) {
		return false;
	  }
	  //update-end-author:taoyan date:2022-6-17 for: VUEN-1342【流程】编码方式 节点权限配置好后，未生效
	}
	//=============================工作流权限判断-禁用-end==============================================
	return !hasPermission(value);
  }

  /**
   * Change roles
   * @param roles
   */
  async function changeRole(roles: RoleEnum | RoleEnum[]): Promise<void> {
	if (appStore.projectSetting.permissionMode !== PermissionModeEnum.ROUTE_MAPPING) {
	  throw new Error('Please switch PermissionModeEnum to ROUTE_MAPPING mode in the configuration to operate!');
	}

	if (!Array.isArray(roles)) {
	  roles = [roles];
	}
	userStore.setRoleList(roles);
	await resume();
  }

  /**
   * refresh menu data
   */
  async function refreshMenu() {
	resume();
  }

  //update-begin-author:taoyan date:2022-6-17 for: VUEN-1342【流程】编码方式 节点权限配置好后，未生效
  /**
   * 判断是不是 代码里写了逻辑但是没有配置权限这种情况
   */
  function isCodingButNoConfig(code) {
	let all = userStore.allAuthList;
	if (all && all instanceof Array) {
	  let temp = all.filter((item) => item.action == code);
	  if (temp && temp.length > 0) {
		if (temp[0].status == '0') {
		  return true;
		}
	  } else {
		return true;
	  }
	}
	return false;
  }
  //update-end-author:taoyan date:2022-6-17 for: VUEN-1342【流程】编码方式 节点权限配置好后，未生效

  return { changeRole, hasPermission, togglePermissionMode, refreshMenu, isDisabledAuth, initBpmFormData };
}
