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
	// {
	// 	path: '/:pathMatch(.*)*',
	// 	name: '404',
	// 	hidden: true,
	// 	component: () => import("@/views/404.vue"),
	// },
	{
		path: "/login",
		name: "login",
		hidden: true,
		component: () => import("@/views/login/index.vue"),
	},
	{
		path: "/", 
		name: 'home',
		redirect: "/gy/industry",
		hidden: true, 
	},
	// {
	// 	path: '/404',
	// 	name: '404',
	// 	hidden: true,
	// 	component: () => import("@/views/404.vue"),
	// },
	
]

export const dynamicRoutes = [{
	path: "/industry",
	name: "industry",
	redirect: "/gy/industry",
	component: Layout,
	children: [
		{
			path: "/gy/industry",
			name: "industry-center",
			component: () => import("@/views/industry/index.vue"),
			meta: {
				title: '行业中心',
				icon: () => h(AppstoreAddOutlined)
			}
		},
	]
},
{
	path: "/projects",
	name: "projects",
	redirect: "/gy/projects",
	component: Layout,
	children: [
		{
			path: "/gy/projects",
			name: "project-center",
			component: () => import("@/views/project/index.vue"),
			meta: {
				title: '项目中心',
				icon: () => h(FundViewOutlined)
			}
		}
	]
},
{
	path: "/project-detail",
	name: "project_detail",
	redirect: "/project-detail/new",
	component: Layout,
	hidden: true,
	children: [{
		path: "/project-detail/:name",
		name: "project_detail-@id",
		component: () => import("@/views/project/detail.vue"),
	}]
},
{
	path: "/mid",
	name: "mid",
	redirect: "/gy/mid/option_project",
	component: Layout,
	meta: {
		title: '信息处理中心',
		icon: () => h(BlockOutlined)
	},
	children: [
		{
			path: "/gy/mid/option_project",
			name : "info-center",
			component: () => import("@/views/project/option.vue"),
			meta: {
				title: '备选项目',
				icon: () => h(SwapOutlined)
			}
		},
		{
			path: "/monitor/mynews2",
			name: "monitor-mynews2",
			component: () => import("@/views/monitor/mynews.vue"),
			meta: {
				title: '我的消息',
				icon: () => h(MessageOutlined)
			}
		},
		{
			path: "/info/collect",
			name: "info-collect",
			component: () => import("@/views/monitor/collect.vue"),
			meta: {
				title: "信息爬取",
				icon: () => h(ZhihuSquareFilled)
			}
		}
	]
},
{
	path: "/gy/admin",
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
			name: "system-role",
			component: () => import("@/views/system/role.vue"),
			meta: {
				title: "功能/数据权限管理",
				icon: () => h(UserSwitchOutlined)
			}
		},
		{
			path: "/gy/admin/tag",
			name: "tagManagement",
			component: () => import("@/views/system/tag.vue"),
			meta: {
				title: "标签管理",
				icon: () => h(TagsOutlined)
			}
		},
		{
			path: "/system/user2",
			name: "system-user",
			component: () => import("@/views/system/user.vue"),
			meta: {
				title: "用户管理",
				icon: () => h(UserDeleteOutlined)
			}
		}
	]
}]

const router = createRouter({
	history: createWebHistory(),
	// history: createWebHashHistory(),
	routes: constantRoutes, // .concat(dynamicRoutes),
});

export default router;