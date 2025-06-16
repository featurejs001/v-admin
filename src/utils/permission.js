


export function hasPermission(route, menus) {
	if (!menus?.length) {
		return false;
	}

	let routeName = route.name;
	if (!route.meta && route.children?.length === 1) {
		routeName = route.children[0].name;
	}

	if (routeName) {
		const power = menus.find(v => v.name === routeName);

		return power?.name ? true : false;
	} else {
		return false; // 没有name的菜单，不显示
	}
}

export function filterAsyncRoutes(routes, menus) {
	const res = []; // 过滤路由
	if (!menus?.length) {
		return res;
	}

	routes.forEach((route) => {
		const tmp = { ...route };

		if (tmp.children && tmp.children.length > 1) {
			const childMenus = menus.find(v => v.name === tmp.name);
			if (!childMenus?.name || childMenus?.children?.length === 0) {
				console.log("没有权限", tmp.name, childMenus?.children?.length)
				return;
			}
			tmp.children = filterAsyncRoutes(tmp.children, childMenus.children);
			if (tmp.children && tmp.children.length) {
				res.push(tmp);
			}
		} else if (hasPermission(tmp, menus)) {
			res.push(tmp);
		}
	});

	return res;
}