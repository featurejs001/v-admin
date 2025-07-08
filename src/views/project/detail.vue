<template>
	<div class="detail-wrap">
		<a-affix :offset-top="20" :style="{ position: 'fixed', right: '0px', top: '80px', zIndex: 1000 }">
	      <a-button type="primary" @click="handleSave" class="save-button" :disabled="state.loading">
	        <SaveOutlined />
	      </a-button>
	    </a-affix>
		<a-form
			    :model="state.form"
			    name="basic"
				ref="formRef"
			    :label-col="{ flex: '100px' }"
			    :wrapper-col="{ flex: '1 1 calc(100% - 100px)' }"
				:wrap="false"
				:colon="false"
				:rules="state.rules"
				:disabled="state.loading"
			    autocomplete="off"
				class="form"
			>
			<a-card :bordered="false" class="table-card">
				<div class="title-container">
		          <div class="group_6"></div>
		          <span> 基本信息 </span>
		        </div>
				<a-row :gutter="state.rowGutter">
					<a-col :span="state.colSpan">
						<a-form-item
							label="项目名称"
							name="name"
						>
							<a-input v-if="state.form.projectId" v-model:value="state.form.name" placeholder="请输入项目名称" allowClear />
							<a-select
							 v-else 
							 v-model:value="state.form.name" 
							 placeholder="请选择项目名称" 
							 :options="state.projectList"
							 :filter-option="filterOption"
							 @select="getDetail"
							 allowClear>
							</a-select>
							<template v-if="!state.form.projectId && state.form.name && !state.loading" #extra>
								<span style="font-size: 13px; color: #a0093c;">{{ !state.form.projectId ? '这是一个新项目' : '' }}</span>
							</template>
						</a-form-item>
					</a-col>
					<a-col :span="state.colSpan">
						<a-form-item
							label="项目别名"
							name="alias"
						>
							<a-input v-model:value="state.form.alias" placeholder="请输入项目别名，用半角逗号分开" allowClear />
						</a-form-item>
					</a-col>
					<a-col :span="state.colSpan">
						<a-form-item
							label="项目主体"
							name="fullName"
						>
							<a-input v-model:value="state.form.fullName" placeholder="请输入项目主体" allowClear />
						</a-form-item>
					</a-col>
				</a-row>
				<a-row :gutter="state.rowGutter">
					<a-col :span="state.colSpan">
						<a-form-item
							label="成立时间"
							name="foundationDate"
						>
							<a-date-picker
							 v-model:value="state.form.foundationDate" 
							 valueFormat="YYYY-MM-DD"
							 class="w-full" 
							 placeholder="请选择成立时间"
							 allowClear
							 />
					 	</a-form-item>
					</a-col>
					<a-col :span="state.colSpan">
						<a-form-item
							label="省/市/区"
							name="code"
						>
							<a-cascader
							  v-model:value="state.form.code" 
							  :options="regionData" 
							  placeholder="请选择省/市/区" 
							  allowClear
							  class="mx"
							  />
						</a-form-item>
					</a-col>
					<a-col :span="state.colSpan">
						<a-form-item
							label="项目官网"
							name="website"
						>
							<a-input v-model:value="state.form.website" placeholder="请输入：https:// 或 http://，可双击跳转" allowClear />
						</a-form-item>
					</a-col>
				</a-row>
				<a-row>
					<a-col :span="21">
						<a-form-item
							label="项目简介"
							name="briefIntroduction"
						>
							<!-- <a-textarea v-model:value="state.form.briefIntroduction" placeholder="请输入项目简介" allowClear /> -->
							<QuillEditor 
							 v-model:content="state.form.briefIntroduction" 
							 :options="state.editorOptions"
							 contentType="html"
							 />
						</a-form-item>
					</a-col>
				</a-row>
				<a-row>
					<a-col :span="21">
						<a-form-item
							label="第三方链接"
							name="thirdLink"
						>
							<a-input v-model:value="state.form.thirdLink" placeholder="请输入：https:// 或 http://，可双击跳转" allowClear />
						</a-form-item>
					</a-col>
				</a-row>
				<div class="title-container">
		          <div class="group_6"></div>
		          <span> 跟进信息 </span>
		        </div>
				<a-row :gutter="state.rowGutter">
					<a-col :span="state.colSpan">
						<a-form-item
							label="项目阶段"
							name="stage"
						>
							<a-select v-model:value="state.form.stage" placeholder="请选择项目阶段" allowClear >
								<a-select-option v-for="item in state.stageList" :key="item.value" :value="item.value">{{ item.label }}</a-select-option>
							</a-select>
						</a-form-item>
					</a-col>
					<a-col :span="state.colSpan">
						<a-form-item
							label="跟进状态"
							name="followStage"
						>
							<a-select v-model:value="state.form.followStage" placeholder="请选择跟进状态" allowClear >
								<a-select-option v-for="item in state.followStageList" :key="item.value" :value="item.value">{{ item.label }}</a-select-option>
							</a-select>
						</a-form-item>
					</a-col>
					<a-col :span="state.colSpan">
						<a-form-item
							label="融资窗口"
							name="financeTag"
						>
							<a-range-picker v-model:value="state.form.financeTag" picker="month" />
						</a-form-item>
					</a-col>
				</a-row>
				<a-row :gutter="state.rowGutter" v-for="(domain, index) in state.form.industryInfo" :key="index">
					<a-col :span="state.colSpan">
						<a-form-item
						    label="一级赛道"
						    :name="['industryInfo', index, 'domain1']"
						    :rules="[{ required: true, message: '请选择一级赛道' }]"
						>
						    <a-select v-model:value="domain.domain1" placeholder="请选择一级赛道" @change="handleChangeDomain1(index)" allowClear>
								<a-select-option v-for="item in domain1Options" :key="item" :value="item">{{ item }}</a-select-option>
							</a-select>
						</a-form-item>
					</a-col>
					<a-col :span="state.colSpan">
						<a-form-item
						    label="二级赛道"
						    :name="['industryInfo', index, 'domain2']"
						    :rules="[{ required: true, message: '请选择二级赛道' }]"
						>
						    <a-select v-model:value="domain.domain2" placeholder="请选择二级赛道" @change="handleChangeDomain2(index)" allowClear>
								<a-select-option v-for="item in domain2Options(domain.domain1)" :key="item" :value="item">{{ item }}</a-select-option>
							</a-select>
						</a-form-item>
					</a-col>
					<a-col :span="state.colSpan">
						<a-form-item
						    label="三级赛道"
						    :name="['industryInfo', index, 'domain3']"
						    :rules="[{ required: true, message: '请选择三级赛道' }]"
						>
						    <a-select v-model:value="domain.domain3" placeholder="请选择三级赛道" allowClear>
								<a-select-option v-for="item in domain3Options(domain.domain1, domain.domain2)" :key="item" :value="item">{{ item }}</a-select-option>
							</a-select>
						</a-form-item>
					</a-col>
					<a-col :span="24 - state.colSpan * 3">
						<a-button class="btn" type="primary" ghost v-if="Number(index) === 0" @click="handleAdd">+</a-button>
						<a-button class="btn" danger v-else @click="handleDel(index)">-</a-button>
					</a-col>
				</a-row>
				<a-row :gutter="state.rowGutter">
					<a-col :span="state.colSpan">
						<a-form-item
							label="标签"
							name="tags"
						>
							<a-select v-model:value="state.form.tags" placeholder="请选择标签" mode="multiple" allowClear ></a-select>
						</a-form-item>
					</a-col>
				</a-row>
				<a-row :gutter="state.rowGutter" v-for="(memoInfo, index) in state.form.memoInfo" :key="index">
					<a-col :span="13">
						<a-form-item
							:label="memoInfo.memo_create_by"
							:name="['memoInfo', index, 'feishu_link']"
						>
							<a-input v-model:value="memoInfo.feishu_link" placeholder="请输入飞书链接" allowClear />
						</a-form-item>
					</a-col>
					<a-col :span="8">
						<a-form-item
							label=""
							:name="['memoInfo', index, 'memo']"
						>
							<a-input v-model:value="memoInfo.memo" placeholder="请输入备注" allowClear />
						</a-form-item>
					</a-col>
				</a-row>
				<div class="title-container">
		          <div class="group_6"></div>
		          <span> 投资信息 </span>
		        </div>
				<a-row>
					<a-col :span="21">
						<Table
							:tableProps="{
								scrollToFirstRowOnChange: true,
								loading: state.loading,
								pagination: false,
								dataSource: state.records,
								columns: state.columns,
								bordered: true,
								scroll: { x: '100%'}
							}"
							:isFixedMaxHeight="false"
							:isShowColumnSetting="false"
						>
						</Table>
					</a-col>
				</a-row>
			</a-card>
		</a-form>
	</div>
</template>
<script setup>
import { useRoute, useRouter } from "vue-router";
import { reactive, onMounted, watch, computed, ref } from "vue";
import { SaveOutlined } from "@ant-design/icons-vue";
import {
    regionData
  } from '@/utils/areaDataUtil';
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css';
import { stageFilter, followStageFilter } from "@/utils/projectHelper";
import { 
	getCategoryList, 
	getInvestmentInfo, 
	getDomainNth, 
	getProjectStage, 
	getFollowStage, 
	getProjectName,
	getProjectDetail,
	getExtraInfoByName,
	getIndustryAssignerDeef,
	addProject,
	editProject
} from "@/api/industry";
import Table from "@/components/Table/index.vue"
import dayjs from "dayjs";
import { message } from "ant-design-vue";
import { useUser } from "@/store/user";
import { useApp } from "@/store/app";

const userStore = useUser();

const appStore = useApp();

const route = useRoute();
const router = useRouter();

const formRef = ref();
const initForm = () => {
	return {
	    name: null,
		alias: null,
		fullName: null,
		foundationDate: null,
		code: [],
		website: null,
		briefIntroduction: null,
		thirdLink: null,
		stage: null,
		followStage: null,
		financeTag: null,
		industryInfo: [{
			domain1: null,
			domain2: null,
			domain3: null
		}],
		memoInfo: [],
		tags: []
	}
}
const state = reactive({
	loading: false,
	rowGutter: 20,
	colSpan: 7,
	form: initForm(),
	rules: {
		name: [{ required: true, message: '请输入项目名称' }],
		stage: [{ required: true, message: '请选择项目阶段' }],
		followStage: [{ required: true, message: '请输入跟进状态' }],
	},
	editorOptions: {
		theme: "snow",
		placeholder: "请输入",
		modules: {
			toolbar: [
				['bold', 'italic', 'underline', 'strike'],        // toggled buttons
				  ['blockquote', 'code-block'],
				  ['link', 'image', 'formula'], // video

				  [{ 'header': 1 }, { 'header': 2 }],               // custom button values
				  [{ 'list': 'ordered'}, { 'list': 'bullet' }, { 'list': 'check' }],
				  [{ 'script': 'sub'}, { 'script': 'super' }],      // superscript/subscript
				  [{ 'indent': '-1'}, { 'indent': '+1' }],          // outdent/indent
				  [{ 'direction': 'rtl' }],                         // text direction

				//   [{ 'size': ['small', false, 'large', 'huge'] }],  // custom dropdown
				  [{ 'header': [1, 2, 3, 4, 5, 6, false] }],

				  [{ 'color': [] }, { 'background': [] }],          // dropdown with defaults from theme
				//   [{ 'font': [] }],
				  [{ 'align': [] }],

				  ['clean']        // remove formatting button
			]
		}
	},
	allDomain: [],
	columns: [
		{
			title: '投资时间',
		    align: 'center',
			width: 120,
		    dataIndex: 'invest_date',
		    customRender: ({ text }) => {
		      return !text ? '' : text.length > 10 ? text.substr(0, 10) : text;
		    },
		},
		{
			title: '轮次',
			width: 160,
		    align: 'center',
		    dataIndex: 'turn',
		},
		{
			title: '金额',
			width: 120,
		    align: 'center',
		    dataIndex: 'amount',
		},
		{
			title: '投资方',
		    align: 'left',
		    dataIndex: 'investor',
		    resizable: true,
			width: 400
		}
	],
	records: [],
	orderMap: {},
	stageList: [],
	followStageList: [],
	projectList: [],
	isNew: false,
	oldRow: {}
});

const filterOption = (input, option) => {
  return option.value.toLowerCase().indexOf(input.toLowerCase()) >= 0;
};

const getAssignerDeef = (memoInfo = []) => {
	const domain3List = state.form.industryInfo.filter(item => item.domain3).map(item => item.domain3);
	getIndustryAssignerDeef({
		params: domain3List.join(',')
	}).then(res => {
		if (!res?.result?.length) {
			return;
		}
		let assigners = res.result[0].assigner.split(',');

		if (['毛振华', '笑容'].includes(userStore.userInfo.realname)) {
			const tempInfo = [];
			for (const assigner of assigners) {
				if (['毛振华', '笑容'].includes(assigner)) {
					continue;
				}
				const memoItem = memoInfo.find(item => item.memo_create_by === assigner);
				if (!memoItem) {
					tempInfo.push({
						memo: '',
						memo_create_by: assigner,
						feishu_link: '',
					})
				} else {
					tempInfo.push({
						memo: "",
						feishu_link: "",
						...memoItem
					})
				}
			}
			state.form.memoInfo = tempInfo;
		} else {
			// 只能修改自己的备注
			const index = memoInfo.findIndex((item) => item.memo_create_by === userStore.userInfo.realname);
			if (-1 === index) {
				state.form.memoInfo = [{
					memo: "",
					memo_create_by: userStore.userInfo.realname,
					feishu_link: "",
				}]
			} else {
				state.form.memoInfo = [{
				    memo: memoInfo[index].memo || "",
					memo_create_by: userStore.userInfo.realname,
					feishu_link: memoInfo[index].feishu_lin || ""
				}]
			}
		}
		// console.log(state.form.memoInfo)
	})
}

const getDetail = () => {
	// return new Promise((resolve) => {
		// if (!state.form.name) {
		// 	state.form.name = route.params.name;
		// }

		const promiseAll = []
		let promiseIndex = 0;
		promiseAll[promiseIndex++] = getInvestmentInfo({
			params: route.params.name
		}).then(res => {
			state.records = res?.result || [];
		}).finally(() => {
			return Promise.resolve([])
		})

		promiseAll[promiseIndex++] = getExtraInfoByName({
		    projName: route.params.name
		}).then(res => {
			if (res.result?.industryInfo?.length) {
				state.form.industryInfo = res.result.industryInfo.map(item => {
					return {
						domain1: item.domain1,
						domain2: item.domain2,
						domain3: item.domain3
					}
				})
				
			}

			getAssignerDeef(res?.result?.memoInfo || [])
		}).finally(() => {
			return Promise.resolve([])
		})

		promiseAll[promiseIndex++] = getProjectDetail({
			name: route.params.name
		}).then(res => {
			const detail = res?.result || {};
			state.oldRow = {...detail};
			state.form.projectId = detail.projectId;
			for (const key in state.form) {
				if (['industryInfo'].includes(key)) {
					continue
				}
				if ('financeTag' === key) {
					let financeTag = []
					if (detail.financingWindowStartTime && detail.financingWindowEndTime) {
						financeTag = [dayjs(detail.financingWindowStartTime, 'YYYY-MM'), dayjs(detail.financingWindowEndTime, 'YYYY-MM')];
					}
					state.form.financeTag = financeTag;
				} else if ("undefined" !== detail[key]) {
					state.form[key] = ['code', 'tags'].includes(key) ? (detail[key] ? detail[key].split(',') : []) : detail[key];
				}
			}
		}).finally(() => {
			return Promise.resolve([])
		})

		promiseAll[promiseIndex++] = userStore.getUserList()

		Promise.all(promiseAll).then((res) => {}).finally(() => {
			return Promise.resolve(true)
		})
	// })
}

const getData = () => {
	state.loading = true;
	const promiseAll = [];
	let promiseIndex = 0;
	promiseAll[promiseIndex++] = getCategoryList({
		pageNo: 1,
		pageSize: 100000
	}).then(res => {
		state.allDomain = res?.result?.records || [];
	}).finally(() => {
		return Promise.resolve()
	})

	promiseAll[promiseIndex++] = getDomainNth().then(res => {
		let orderMap = {}
		const nthList = res?.result || [];
		nthList.forEach(item => {
			orderMap[item.name] = {
				...item,
				nth: item.nth === 0 || item.name === '未分类I' ? 100000 : item.nth,
			}
		})
		state.orderMap = orderMap;
	}).finally(() => {
		return Promise.resolve()
	})

	promiseAll[promiseIndex++] = getProjectStage().then(res => {
		state.stageList = res?.result || [];
	}).finally(() => {
		return Promise.resolve()
	})

	promiseAll[promiseIndex++] = getFollowStage().then(res => {
		state.followStageList = res?.result || [];
	})

	if (route.params.name && route.params.name !== 'newnew') {
		state.isNew = false;
		promiseAll[promiseIndex++] = getDetail();
	} else {
		state.isNew = true;
		promiseAll[promiseIndex++] = getProjectName().then(res => {
			state.projectList = res?.result || [];
		})
	}

	Promise.all(promiseAll).then((res) => {
		state.loading = false;
	}).catch(() => {
		state.loading = false;
	})
	
}

watch(() => route.params.name, (newVal) => {
  console.log(newVal);
  state.records = []
  state.oldRow = {};
  state.form = initForm();

  getData();
}, {immediate: true});

const handleAdd = () => {
	state.form.industryInfo.push({
		domain1: null,
		domain2: null,
		domain3: null
	})
}

function sortDomainTags(domainTags) {
	return domainTags?.sort((a, b) => {
	  let orderA = state.orderMap[a] ? state.orderMap[a].nth : Infinity;
	  let orderB = state.orderMap[b] ? state.orderMap[b].nth : Infinity;
	  return orderA - orderB;
	});
}

const domain1Options = computed(() => {
	const arr = state.allDomain.map(item => item.domain1);
	return sortDomainTags(Array.from(new Set(arr)));
})

const domain2Options = computed(() => {
	return (domain1) => {
		if (!domain1) {
			return []
		}
		const arr = state.allDomain.filter(item => item.domain1 === domain1).map(item => item.domain2);
		return sortDomainTags(Array.from(new Set(arr)));
	}
})

const domain3Options = computed(() => {
	return (domain1, domain2) => {
		if (!domain1 || !domain2) {
			return []
		}
		const arr = state.allDomain.filter(item => item.domain1 === domain1 && item.domain2 === domain2).map(item => item.domain3);
		return sortDomainTags(Array.from(new Set(arr)));	
	}
})

const handleDel = (index) => {
	state.form.industryInfo.splice(index, 1)
}

const handleChangeDomain1 = (index) => {
	state.form.industryInfo[index].domain2 = null
	state.form.industryInfo[index].domain3 = null
}

const handleChangeDomain2 = (index) => {
	state.form.industryInfo[index].domain3 = null
}


const handleSave = () => {
  console.log("保存");
  formRef.value.validate().then(() => {
    
	let obj = {
		...state.form,
	};
	console.log(obj);
	if (state.form.financeTag.length === 2) {
		// console.log(state.form.financeTag[0].$d.toGMTString())
		obj.financeTag = state.form.financeTag.join(",");
		obj.financingWindowEndTime = dayjs(state.form.financeTag[0]).format("YYYY-MM-DD");
		obj.financingWindowStartTime = dayjs(state.form.financeTag[1]).format("YYYY-MM-DD");
	} else {
		obj.financeTag = null;
		obj.financingWindowStartTime = null;
		obj.financingWindowEndTime = null;
	}

	if (state.form.code.length === 3) {
		obj.code = state.form.code.join(',')
	} else {
		obj.code = null;
	}
	if (state.form.tags.length) {
		obj.tags = state.form.tags.join(',')
	} else {
		obj.tags = null;
	}
	if (state.form.memoInfo.length) {
		obj.memoInfo = state.form.memoInfo.map(item => {
			const user = userStore.userList.find(v => v.realname === item.memo_create_by)
			return {
				...item,
				memo_create_by: user?.username,
				create_time: new Date(),
			}
		})
	}

	let func = null
	if (state.form.projectId) {
		func = editProject;
	} else {
		func = addProject;
	}
	state.loading = true;
	func(obj).then((res) => {
		message.success(res.message || '保存成功');
		if (route.params.name === 'newnew') {
			route.push({
				path: "/project-detail/" + encodeURIComponent(state.form.name),
			})
		} else if (route.params.name !== 'newnew' && route.params.name !== state.form.name) {
			// 查询当前路由，更新路由信息
			const tempRoutes = [...appStore.historyRoutes];
			const routeIndex = tempRoutes.findIndex(item => item.path === route.path);
			if (routeIndex !== -1) {
				tempRoutes.splice(routeIndex, 1, {
					path: "/project-detail/" + encodeURIComponent(state.form.name),
					name: "project_detail-@id",
					meta: {
						title: state.form.name,
					},
					params: {
						name: state.form.name,
					}
				})
			}
			console.log(tempRoutes);
			appStore.setHistoryRoutes(tempRoutes);

			router.replace({
				name: "project_detail-@id",
				params: {
					name: state.form.name
				},
			})
		}
		
		state.loading = false;
	}).catch((e) => {
		state.loading = false;
	})
	console.log("验证通过", obj);
  }).catch((error) => {
    console.log("验证失败", error);
  })
}

onMounted(() => {
	console.log('detail route :', route)
})
</script>
<style lang="less" scoped>
.detail-wrap {
	.save-button {
	    width: 40px; /* 设置宽度和高度相等 */
	    height: 40px;
	    display: flex;
	    font-size: 17px; /* 设置按钮的字体大小 */
	    align-items: center;
	    justify-content: center;
	    border-radius: 20% 0 0 10%; /* 设置圆角，左上和左下为圆角 */
	}

	.table-card {
	    padding: 0;
		:deep(.ant-card-body) {
			padding: 0px;
		}
		.title-container {
		    display: flex;
		    align-items: center; /* 垂直居中对齐 */
			min-height: 56px;
		    font-size: 13.5px;
		    font-weight: 400;
		    font-family: 'PingFangSC-Medium', 'segoe ui', sans-serif !important;
		    color: rgba(0, 0, 0, 0.7);
			.group_6 {
			    background-color: #c4dcff;
			    border-radius: 4px;
			    width: 4px;
			    height: 14px;
			    margin-top: 0px;
			    border: none;
			    margin-left: 6px;
			    margin-right: 8px;
			    /* padding-left: 10px;*/
			}
		}

		.btn {
			width: 32px;
			padding: 0px;
		}
	}
}
</style>