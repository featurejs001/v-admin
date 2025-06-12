import {
	createRouter,
	createWebHistory,
	createWebHashHistory,
} from "vue-router";
import { h } from "vue";
import { AppstoreAddOutlined, FundViewOutlined } from '@ant-design/icons-vue';

import Layout from "@/layout/index.vue";

export const constantRoutes = [
	{
		path: "/login",
		name: "login",
		hidden: true,
		component: () => import("@/views/login/index.vue"),
	},
	{path: "/", redirect: "/gy/industry", hidden: true},
	{
		path: "/gy/industry",
		// route level code-splitting
		// this generates a separate chunk (about.[hash].js) for this route
		// which is lazy-loaded when the route is visited.
		component: Layout,
		children: [
			{
				path: "",
				name: "industry",
				component: () => import("@/views/home/index.vue"),
				meta: {
					title: '行业中心',
					icon: () => h(AppstoreAddOutlined)
				}
			},
		]
	},
	{
		path: "/gy/projects",
		component: Layout,
		children: [
			{
				path: "",
				name: "industry",
				component: () => import("@/views/home/index.vue"),
				meta: {
					title: '项目中心',
					icon: () => h(FundViewOutlined)
				}
			},
		]
	},
	// {
	// 	path: '/404',
	// 	name: '404',
	// 	hidden: true,
	// 	component: () => import("@/views/404.vue"),
	// },
	// { path: "*", redirect: "/404", hidden: true },
]

export const dynamicRoutes = []

const router = createRouter({
	history: createWebHistory(),
	// history: createWebHashHistory(),
	routes: constantRoutes.concat(dynamicRoutes),
});

export default router;