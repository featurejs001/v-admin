import router from "@/router/index";
import { h, nextTick } from "vue";
import { useUser } from "@/store/user";
import settings from "@/settings";
import NProgress from "nprogress"; // progress bar
import "nprogress/nprogress.css"; // progress bar style
import logo from "@/assets/img/loading-logo.png";
import { useApp } from "@/store/app";

NProgress.configure({ 
	// parent: "#app",
	template: `<div class="custom-nprogress">
			<div role="bar"></div>
			<div role="spinner"></div>
			<img class="logo" src="${logo}" />
			<div class="dots">
                <span class="dot dot-spin"><i></i><i></i><i></i><i></i></span>
            </div>
			<div class="title">光跃投资智能平台</div>
		</div>`,
	showSpinner: false 
}); // NProgress Configuration

const whiteList = ["/login", "/404"]; // no redirect whitelist

router.beforeEach(async (to, from, next) => {
	// console.log("beforeEach", router)
	if (['/login', '/'].includes(from.path)) {
		NProgress.configure({ 
			parent: "body",
			template: `<div class="custom-nprogress">
					<div role="bar"></div>
					<div role="spinner"></div>
					<img class="logo" src="${logo}" />
					<div class="dots">
		                <span class="dot dot-spin"><i></i><i></i><i></i><i></i></span>
		            </div>
					<div class="title">光跃投资智能平台</div>
				</div>`,
			showSpinner: false 
		});
	} else {
		NProgress.configure({ 
			parent: "body",
			showSpinner: false,
			template: '<div class="bar" role="bar"><div class="peg"></div></div><div class="spinner" role="spinner"><div class="spinner-icon"></div></div>'
		})
	}
	NProgress.start();

	// set page title
	document.title = settings.title;

	// determine whether the user has logged in

	const userStore = useUser();

	const hasToken = await userStore.checkToken(); //
	// console.log("___token :", hasToken);

	if (hasToken) {
		if (whiteList.includes(to.path)) {
			next();
			NProgress.done();
		} else if (userStore.permissionRoutes?.length) {
			next();
		} else {
			try {
				const dynamicRoutes = await userStore.generateRoutes(to.path);
				let routeName = to.name;
				dynamicRoutes.forEach((route) => {
					if (!router.hasRoute(route.name)) {
						router.addRoute(route)
					}
					if (route.path === to.path) {
						routeName = route.name
					} else if (route.children && route.children.length) {
						route.children.forEach((child) => {
							if (child.path === to.path) {
								routeName = child.name
							}
						})
					}
				})
				await nextTick();
				// console.log("hasRoute", router.hasRoute(routeName), to, to.path)
				
				if (router.hasRoute(routeName)) {
					next({
						name: routeName,
						replace: to.name ? false : true
					})
				} else if (dynamicRoutes.length) {
					next({
						name: dynamicRoutes[0].name,
						path: dynamicRoutes[0].path,
						replace: true
					})
				} else {
					next("/404");
				}
			} catch(e) {
				console.log("555", e)
				userStore.reset();
				next(`/login?redirect=${to.path}`);
				// NProgress.done();
			}
			
		}
	} else {
		/* has no token*/
		if (whiteList.includes(to.path)) {
			// console.log("____whiteList :", to.path);
			// in the free login whitelist, go directly
			next();
		} else {
			// other pages that do not have permission to access are redirected to the login page.
			next(`/login?redirect=${to.path}`);
			// NProgress.done();
		}
		
	}
});

router.afterEach((to) => {
	const appStore = useApp();
	appStore.setHistoryRoutes({...to});
	// finish progress bar
	NProgress.done();
});
