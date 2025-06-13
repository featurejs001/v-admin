import router from "@/router/index";
import { h } from "vue";
import { useUser } from "@/store/user";
import settings from "@/settings";
import NProgress from "nprogress"; // progress bar
import "nprogress/nprogress.css"; // progress bar style
import logo from "@/assets/img/loading-logo.png";

NProgress.configure({ 
	parent: "#app",
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
	NProgress.start();

	// set page title
	document.title = settings.title;

	// determine whether the user has logged in

	const userStore = useUser();

	const hasToken = await userStore.checkToken(); //
	// console.log("___token :", hasToken);

	if (hasToken) {
		if (whiteList.includes(to.path)) {
			next({path: "/"});
			NProgress.done();
		} else {
			try {
				await userStore.generateRoutes(to.path);
				next();
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
			console.log("____whiteList :", to.path);
			// in the free login whitelist, go directly
			next();
		} else {
			// other pages that do not have permission to access are redirected to the login page.
			next(`/login?redirect=${to.path}`);
			// NProgress.done();
		}
		
	}
});

router.afterEach(() => {
	// finish progress bar
	NProgress.done();
});
