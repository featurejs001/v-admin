import router from "@/router/index";
import { useUser } from "@/store/user";
import settings from "@/settings";

const whiteList = ["/login", "/404"]; // no redirect whitelist

router.beforeEach(async (to, from, next) => {
	// set page title
	document.title = settings.title;

	// determine whether the user has logged in

	const userStore = useUser();

	const hasToken = await userStore.checkToken(); //
	// console.log("___token :", hasToken);

	if (hasToken) {
		console.log("111")
		if (whiteList.includes(to.path)) {
			next({path: "/"});
			console.log("222")
		} else {
			console.log("333")
			try {
				await userStore.generateRoutes(to.path);
				console.log("444")
				next();
			} catch(e) {
				console.log("555", e)
				userStore.reset();
				next(`/login?redirect=${to.path}`);
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
		}
	}
});

router.afterEach(() => {
	// finish progress bar
});
