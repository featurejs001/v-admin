import {
	createRouter,
	createWebHistory,
	createWebHashHistory,
} from "vue-router";
import { h } from "vue";
import { 
	AppstoreAddOutlined, 
	FundViewOutlined, 
	BlockOutlined, 
	SwapOutlined, 
	MessageOutlined, 
	ZhihuSquareFilled,
	ApartmentOutlined,
	UserSwitchOutlined,
	UserDeleteOutlined,
	TagsOutlined
} from '@ant-design/icons-vue';

import Layout from "@/layout/index.vue";

export const constantRoutes = [
	{
		path: "/login",
		name: "login",
		hidden: true,
		component: () => import("@/views/login/index.vue"),
	},
	// {path: "/", redirect: "/gy/industry", hidden: true},
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
				component: () => import("@/views/industry/index.vue"),
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
				name: "project",
				component: () => import("@/views/project/index.vue"),
				meta: {
					title: '项目中心',
					icon: () => h(FundViewOutlined)
				}
			},
		]
	},
	{
		path: "/",
		redirect: "/gy/industry",
		component: Layout,
		meta: {
			title: '信息处理中心',
			icon: () => h(BlockOutlined)
		},
		children: [
			{
				path: "gy/mid/option_project",
				name : "option_project",
				component: () => import("@/views/project/option.vue"),
				meta: {
					title: '备选项目',
					icon: () => h(SwapOutlined)
				}
			},
			{
				path: "monitor/mynews2",
				name: "mynews2",
				component: () => import("@/views/monitor/mynews.vue"),
				meta: {
					title: '我的消息',
					icon: () => h(MessageOutlined)
				}
			},
			{
				path: "info/collect",
				name: "infoCollect",
				component: () => import("@/views/monitor/collect.vue"),
				meta: {
					title: "信息爬取",
					icon: () => h(ZhihuSquareFilled)
				}
			}
		]
	},
	{
		path: "",
		name: "gy-admin",
		redirect: "/gy/system/role",
		component: Layout,
		meta: {
			title: '管理后台',
			icon: () => h(ApartmentOutlined)
		},
		children: [
			{
				path: "/gy/system/role",
				name: "systemRole",
				component: () => import("@/views/system/role.vue"),
				meta: {
					title: "功能/数据权限管理",
					icon: () => h(UserSwitchOutlined)
				}
			},
			{
				path: "/gy/admin/tag",
				name: "system",
				component: () => import("@/views/system/tag.vue"),
				meta: {
					title: "标签管理",
					icon: () => h(TagsOutlined)
				}
			},
			{
				path: "/system/user2",
				name: "systemUser",
				component: () => import("@/views/system/user.vue"),
				meta: {
					title: "用户管理",
					icon: () => h(UserDeleteOutlined)
				}
			}
		]
	}
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