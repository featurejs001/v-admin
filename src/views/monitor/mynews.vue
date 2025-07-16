<template>
	<div class="my_news_center">
		<div>
			<a-input-search v-model:value="state.value" placeholder="全文搜索" style="width: 300px" @search="onSearch" allowClear />
			<a-select v-model:value="state.msgCategory" style="width: 160px; height: 36px;margin: 0 18px;">
				<a-select-option value="null">所有类型</a-select-option>
				<a-select-option value="4">项目变动</a-select-option>
				<a-select-option value="3">行业变动</a-select-option>
			</a-select>
			<a-select v-model:value="state.readFlag" style="width: 160px; height: 36px;">
				<a-select-option value="0">未读</a-select-option>
				<a-select-option value="1">已读</a-select-option>
			</a-select>
		</div>
		<Table :tableProps="{
					scrollToFirstRowOnChange: true,
					loading: state.loading,
					pagination: false,
					dataSource: state.dataSource,
					columns: getNewsColumns(),
					bordered: true,
				}" 
				:isShowColumnSetting="false"
				:isFixedMaxHeight="true"
				:pagination="{
					total: state.params.total,
					current: state.params.pageNo,
					pageSize: state.params.pageSize,
					showTotal: (total) => `共 ${total} 条数据`,
					showSizeChanger: true,
					showQuickJumper: true,
					onChange: onPageChange,
					onShowSizeChange: onPageSizeChange,
				}"
				@search="onSearch"
				@change="onTableChange"
		>
		<template #titile="{ record }">
			<span class="clickable-title" @click="showDetail(record)">{{ record.titile }}</span>
		</template>
		<template #readFlag="{ text }">
			<span :class="['read-flag', text === 0 ? 'unread' : 'read']">
				{{ text === 0 ? '未读' : '已读' }}
			</span>
		</template>
		</Table>
		<a-modal
			v-model:visible="detailVisible"
			:footer="null"
			:title="customModalTitle"
			width="480px"
			wrapClassName="custom-detail-modal"
		>
			<div class="modal-content">
				<div class="modal-row"><span class="modal-label">内容标题：</span><span class="modal-value">{{ detailData?.titile }}</span></div>
				<div class="modal-row"><span class="modal-label">发布人：</span><span class="modal-value">{{ detailData?.sender }}</span></div>
				<div class="modal-row"><span class="modal-label">发布时间：</span><span class="modal-value">{{ detailData?.sendTime }}</span></div>
				<div class="modal-row"><span class="modal-label">内容：</span></div>
				<div class="modal-content-html" v-html="cleanedMsgContent" />
				<a
					
					class="manual-detail-link"
					@click="goToDetail(detailData)"
				>
					点击查看详情
				</a>
			</div>
		</a-modal>
	</div>
</template>
<script setup>
import { h, reactive, defineEmits, onMounted, watch, ref, nextTick, onBeforeUnmount, computed } from 'vue';
import { useApp } from "@/store/app";
import { storeToRefs } from "pinia";
import Table from "@/components/Table/index.vue"
import { getMyAnnouncementSend, editCementSend, syncNotic } from "@/api/user";
import { useRouter } from 'vue-router';

const emits = defineEmits(['search', 'success', 'export']);

const appStore = useApp();
const { isDomFullscreen } = storeToRefs(appStore);

const state = reactive({
  value: '',
  msgCategory: 'null',
  readFlag: '0',
  loading: false,
  dataSource: [],
  params: {
    total: 0,
    pageNo: 1,
    pageSize: 50,
    column: 'createTime',
    order: 'desc',
    logType: 1,
    titile: undefined,
    msgCategory: undefined,
    readFlag: '0',
  },
})

const detailVisible = ref(false)
const detailData = ref({})
const router = useRouter()
const customModalTitle = '查看详情'

const showDetail = (record) => {
  let anntId = record?.anntId || null;
    editCementSend({ anntId: anntId }).then((res) => {
      getData();
      syncNotic({ anntId: anntId });
    });
  detailData.value = record
  detailVisible.value = true
}
const goToDetail = () => {
  // 提取msgContent中的h3标签括号内的文本
  let projectName = '';
  if (detailData.value && detailData.value.msgContent) {
    const match = detailData.value.msgContent.match(/<h3[^>]*>.*?（([\s\S]*?)）.*?<\/h3>/i);
    if (match && match[1]) {
      projectName = match[1].trim();
    }
  }
  if (projectName) {
    router.push(`/project-detail/${encodeURIComponent(projectName)}`);
    detailVisible.value = false;
  } else {
    router.push('/gy/industry');
  }
};
// 计算属性，去除msgContent中的“点击查看详情”
const cleanedMsgContent = computed(() => {
  if (!detailData.value || !detailData.value.msgContent) return '';
  // 匹配“点击查看详情”及其包裹的a/span/div标签
  return detailData.value.msgContent.replace(/<a[^>]*>\s*点击查看详情\s*<\/a>|<span[^>]*>\s*点击查看详情\s*<\/span>|<div[^>]*>\s*点击查看详情\s*<\/div>|点击查看详情/g, '');
});

// 监听类型筛选
watch(() => state.msgCategory, (val) => {
  state.params.pageNo = 1;
  state.params.msgCategory = val === 'null' ? undefined : val;
  getData();
});
// 监听已读未读筛选
watch(() => state.readFlag, (val) => {
  state.params.pageNo = 1;
  state.params.readFlag = val;
  getData();
});

const onSearch = (value) => {
  state.params.pageNo = 1;
  state.params.titile = value ? value : undefined;
  getData();
};

const getData = () => {
  state.loading = true;
  getMyAnnouncementSend({
    pageNo: state.params.pageNo,
    pageSize: state.params.pageSize,
    column: state.params.column,
    order: state.params.order,
    logType: state.params.logType,
    titile: state.params.titile,
    msgCategory: state.params.msgCategory,
    readFlag: state.params.readFlag,
  })
    .then(res => {
      state.dataSource = res?.result?.records || [];
      state.params.total = res?.result?.total || 0;
      state.loading = false;
    })
    .catch(() => {
      state.loading = false;
    })
    .finally(() => {
      state.loading = false;
    });
};

const onPageChange = (page, pageSize) => {
  state.params.pageNo = page;
  state.params.pageSize = pageSize;
  getData();
};
const onPageSizeChange = (current, size) => {
  state.params.pageNo = 1;
  state.params.pageSize = size;
  getData();
};

// 表格排序、分页等变更
const onTableChange = ({ sorter }) => {
  if (sorter && sorter.field) {
    state.params.column = sorter.field;
    state.params.order = sorter.order === 'ascend' ? 'asc' : 'desc';
    state.params.pageNo = 1;
    getData();
  }
};

const getNewsColumns = () => {
  return [
    {
      title: '内容',
      dataIndex: 'titile',
      width: 100,
      align: 'center',
      resizable: true,
      sorter: true,
      slot: 'titile',
    },
    {
      title: '消息类型',
      dataIndex: 'msgCategory',
      width: 80,
      resizable: true,
      sorter: true,
      align: 'center',
      customRender: ({ text }) => {
        const map = {
          1: '通知公告',
          2: '系统消息',
          3: '行业变动',
          4: '项目变动',
        };
        return map[text] || text;
      },
    },
    {
      title: '来源',
      dataIndex: 'sender',
      resizable: true,
      align: 'center',
      sorter: true,
      width: 80,
    },
    {
      title: '发布时间',
      dataIndex: 'sendTime',
      resizable: true,
      sorter: true,
      align: 'center',
      width: 80,
    },
    {
      title: '阅读状态',
      dataIndex: 'readFlag',
      resizable: true,
      align: 'center',
      sorter: true,
      width: 80,
      slot: 'readFlag',
    },
  ]
}

onMounted(() => {
  getData();
});

</script>
<style lang="less" scoped>
.read-flag {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 4px;
  font-size: 13px;
  &.unread {
    background: #fff1f0;
    border: 1px solid #ffa39e;
    color: #ff4d4f;
  }
  &.read {
    border: 1px solid #d9d9d9;
    color: #555;
    background: #fff;
  }
}
.my_news_center :deep(.ant-input) {
  font-size: 13px;
  color: #555;
}
.clickable-title {
  color: #167FFF;
  cursor: pointer;
  &:hover {
    text-decoration: underline;
  }
}
:deep(.ant-modal-title) {
  font-size: 13px !important;
  color: #555 !important;
}
:deep(.custom-detail-modal .ant-modal-title) {
  font-size: 13px !important;
  color: #555 !important;
}
.modal-row {
  margin-bottom: 8px;
  font-size: 13px;
  color: #444;
  display: flex;
}
.modal-label {
  min-width: 70px;
  color: #888;
}
.modal-value {
  color: #222;
}
.modal-content-html {
  margin: 8px 0 12px 0;
  font-size: 13px;
  color: #555;
  line-height: 1.7;
}
.manual-detail-link {
  color: #1890ff;
  font-size: 13px;
  cursor: pointer;
  text-decoration: none;
  display: inline-block;
  margin-top: 8px;
}
.manual-detail-link:hover {
  text-decoration: underline;
}
</style>