<template>
	<div class="industry-wrap">
		<div
		    v-if="state.dragTooltip.visible"
		    class="drag-tooltip"
		    :class="`drag-tooltip-${state.dragTooltip.type}`"
		    :style="{ left: state.dragTooltip.x + 'px', top: state.dragTooltip.y + 'px' }"
		  >
		    {{ state.dragTooltip.message }}
		  </div>
		<div class="header">
			<div>
				<div class="first_introduction_text">
		            <span class="">行业等级</span>
		            <a-tooltip v-if="state.tooltips.length" placement="right" overlayClassName="1">
		              <template #title>
		                <div v-html="getToolHint(state.tooltips, '行业中心', '行业等级说明').replace(/\|/g, '<br/>')"></div>
		              </template>
		              <InfoCircleOutlined class="info-circle" />
		            </a-tooltip>
		        </div>
				<div style="display: flex; align-items: center; flex-grow: 1">
	              <a-checkable-tag
				    v-for="tag in state.priorityTags"
	                :checked="state.selectedPriorityTags.includes(tag)"
	                :id="tag"
					:key="tag"
	                :class="[getClassForTag(tag), state.selectedPriorityTags.includes(tag) ? 'checked' : '', state.globalMode === 'edit' ? 'disabled' : '']"
	                @change="(checked) => handlePriorityChange(tag, checked)"
	              >
	                <span>{{ tag }}</span><span>({{ state.distinctNames[tag] || 0 }})</span>
	              </a-checkable-tag>

		        </div>
				<div
		            id="config"
		            style="display: flex; align-items: center; margin-left: auto; margin-top: 6px"
		            :class="state.globalMode === 'edit' ? 'disabled' : ''"
		          >
				  	<a-tooltip v-if="state.tooltips.length && hasPermission('industry_tree:manage')" :title="getToolHint(state.tooltips, '行业中心', '行业配置')">
		              <a-button type="primary" ghost :icon="h(SettingOutlined)" @click="toConfig">行业配置</a-button>
		            </a-tooltip>
					<div class="divider"></div>
					<a-tooltip placement="top">
			    		<template #title>
							<span>导入</span>
						</template>
						<ImportOutlined class="icon-wrapper mr" />
					</a-tooltip>
					<a-tooltip placement="top">
		        		<template #title>
							<span>导出</span>
						</template>
						<ExportOutlined class="icon-wrapper" />
					</a-tooltip>
					<div class="divider"></div>
					<FullScreen :customClass="'icon-wrapper mr'" />
					<a-tooltip placement="top">
		        		<template #title>
							<span>重新载入</span>
						</template>
						<Redo :customClass="'icon-wrapper'" :loading="state.loading" />
					</a-tooltip>
				</div>
			</div>
			<div v-if="state.isMgr">
				<div class="first_introduction_text">负责人</div>
				<div style="display: flex; align-items: center; flex-grow: 1">
					<a-checkable-tag
						v-for="tag in state.peopleTags"
						:key="tag"
		                :checked="state.selectedPeopleTags.includes(tag)"
		                :class="['text-wrapper_9 qita', state.selectedPeopleTags.includes(tag) ? 'checked' : '', state.globalMode === 'edit' ? 'disabled' : '']"
		                @change="(checked) => handlePeopleChange(tag, checked)"
		              >
		                <span>{{ tag }}</span><span>({{ state.distinctNames[tag] || 0 }})</span>
	              </a-checkable-tag>
				</div>
			</div>
			<div class="horizontal-line"></div>
		</div>
		
		<div class="industry-contariner">
			<div class="left-half">
				<div class="filter-group">
					<div style="flex: 1;">
						<a-input-search
				            v-model:value="state.searchValue"
				            enter-button
				            placeholder="输入关键字搜索"
				            style="min-width: 120px;width: 100%; "
				            @search="onSearch"
				            :class="state.globalMode === 'edit' ? 'disabled' : ''"
				          />
					</div>
					<div class="flex-col" style="margin-left: 10px;">
			            <a-tooltip v-if="state.tooltips.length" :title="getToolHint(state.tooltips, '行业中心', state.toggleShowProjectNumber ? '隐藏项目数' : '显示项目数')">
			              <NumberOutlined class="custom-icon" @click="state.toggleShowProjectNumber = !state.toggleShowProjectNumber" />
			            </a-tooltip>
			        </div>
					<div class="flex-col" style="margin-left: 10px;">
			            <a-tooltip v-if="state.tooltips.length" :title="getToolHint(state.tooltips, '行业中心', state.toggleShowAssigner ? '隐藏负责人' : '显示负责人')">
			              <UsergroupAddOutlined class="custom-icon" @click="state.toggleShowAssigner = !state.toggleShowAssigner" />
			            </a-tooltip>
			        </div>
					<div class="flex-col" style="margin-left: 10px;">
			            <a-tooltip v-if="state.tooltips.length" :title="getToolHint(state.tooltips, '行业中心', !state.toggleExpand ? '收起全部' : '展开全部')">
			              <NodeCollapseOutlined class="custom-icon" @click="onExpandAll" />
			            </a-tooltip>
			        </div>
					<div class="flex-col" style="margin-left: 10px;">
						<a-tooltip placement="top">
			        		<template #title>
								<span>重新载入</span>
							</template>
							<Redo :customClass="'custom-icon'" :loading="state.loading" />
						</a-tooltip>
					</div>
					<!-- <div class="flex-col" style="margin-left: 10px;" v-if="!state.isEdit">
						<a-button type="primary" ghost @click="state.isEdit = !state.isEdit">编辑</a-button>
					</div>
					<div class="flex-row" style="margin-left: 10px;" v-else>
						<a-button type="primary" ghost style="margin-right: 10px;">保存</a-button>
						<a-button @click="() => {state.isEdit = !state.isEdit;getData()}">取消</a-button>
					</div> -->
				</div>
				<div class="tree-container">
				<a-spin v-if="state.loading" />
		        <a-tree
					v-else
		            ref="atree"
		            :auto-expand-parent="state.autoExpandParent"
		            :expanded-keys="state.expandedKeys"
		            :show-icon="false"
		            :show-line="true"
		            :tree-data="state.gData"
		            block-node
		            class="draggable-tree"
		            :draggable="state.isEdit"
		            :allow-drop="allowDrop"
		            treeDefaultExpandAll="true"
		            @click="handleClick"
		            @dragstart="onDragStart"
		            @dragenter="onDragEnter"
		            @drop="onDrop"
		            @dragend="onDragEnd"
		            @expand="onExpand"
		            @select="onSelect"
		          >
		            <template #title="{ key: treeKey, data, title }">
		              <span @click="!data.editing && handleTagClick(data)" @dblclick="!data.editing && handleNodeDblClick(data)">
		                <a-dropdown :trigger="state.isEdit ? ['contextmenu'] : 'none'">
						  
		                  <span>
		                    <span v-if="!data.editing">
		                      <span>
		                        <span v-if="state.searchValue && title?.indexOf(state.searchValue) > -1">
		                          {{ getTitle(data).substr(0, getTitle(data).indexOf(state.searchValue)) }}
		                          <span style="color: #f50">{{ state.searchValue }}</span>
		                          {{ getTitle(data).substr(getTitle(data).indexOf(state.searchValue) + state.searchValue.length) }}
		                        </span>
		                        <span v-else :class="getClassForTagForTree(data, data.props?.priority)">
		                          <template v-if="data && data.children && data.children.length > 0">
		                            {{ getTitle(data) }}
		                          </template>
		                          <template v-else-if="data.level === 4">
		                            <span style="margin-left: 8px">{{ getTitle(data) }}</span>
		                          </template>
		                          <template v-else>
		                            <span style="margin-left: 22px">
		                              {{ getTitle(data) }}
		                            </span>
		                          </template>
		                          <!--                          {{ getTitle(data) }}-->
		                        </span>
		                        <span class="text_34">
		                          {{ showPeople(data) }}
		                        </span>
		                      </span>
		                    </span>
		                    <span v-else>
		                      <a-input
		                        v-if="data.editing"
		                        :ref="(el) => getRef(el, data)"
		                        :value="state.data_editedTitle"
		                        size="small"
		                        @blur="saveEditedNode(data, $event)"
		                        @input="updateEditedTitle(data, $event)"
		                        @keydown.stop="handleKeyPress(data, $event)"
		                        :style="getInputStyle(state.data_editedTitle)"
		                      />
		                    </span>
		                  </span>
		                  <template v-if="hasPermission('industry_tree:manage') && (data.level === 2 || data.level === 3)" #overlay>
		                    <a-menu @click="({ key: menuKey }) => onContextMenuClick(treeKey, menuKey, data)">
		                      <a-menu-item key="addSibling">新增本级节点</a-menu-item>
		                      <a-menu-item key="addChild">新增下级节点</a-menu-item>
		                      <a-menu-item key="edit">编辑节点名称</a-menu-item>
		                      <a-menu-item key="delete">删除节点</a-menu-item>
		                    </a-menu>
		                  </template>
		                  <template v-else-if="hasPermission('industry_tree:manage') && data.level === 4" #overlay>
		                    <a-menu @click="({ key: menuKey }) => onContextMenuClick(treeKey, menuKey, data)">
		                      <a-menu-item key="addSibling">新增本级节点</a-menu-item>
		                      <a-menu-item key="edit">编辑节点名称</a-menu-item>
		                      <a-menu-item v-if="data.level === 4" key="editInfos">编辑优先级/责任人</a-menu-item>
		                      <a-menu-item key="delete">删除节点</a-menu-item>
		                    </a-menu>
		                  </template>
		                  <template v-else-if="hasPermission('industry_tree:manage') && data.level === 1" #overlay>
		                    <a-menu @click="({ key: menuKey }) => onContextMenuClick(treeKey, menuKey, data)">
		                      <a-menu-item key="addChild">新增下级节点</a-menu-item>
		                    </a-menu>
		                  </template>
		                </a-dropdown>
		              </span>
		            </template>
		        </a-tree>
        </div>
			</div>
			<div class="right-half">
				<BarChart 
					:key="barKey"
					:dataProvided="onDataProvided()"
            		:nodeData="state.selected_node_title"
					:tags="barTags"
				/>
			</div>
		</div>
		<!-- 新的编辑信息对话框 -->
		<a-modal v-model:visible="state.editInfoModalVisible" centered title="编辑优先级/责任人" @cancel="onEditInfoCancel" @ok="handleEditInfoSubmit">
		    <a-form ref="editInfoFormRef" :model="state.formModel" class="antd-modal-form">
		      <a-row style="padding-left: 30px; padding-top: 20px">
		        <a-col :span="24">
		          <a-form-item :labelCol="state.labelCol" :wrapperCol="state.wrapperCol" label="请选择主理人" name="main">
					<a-select
					    v-model:value="state.formModel.main"
					    mode="multiple"
					    :options="userStore.userList"
						:fieldNames="{label: 'realname', value: 'realname'}"
						placeholder="请选择"
						allowClear
					  >
					</a-select>
		          </a-form-item>
		        </a-col>
		      </a-row>
		      <a-row style="padding-left: 30px; padding-top: 0">
		        <a-col :span="24">
		          <a-form-item :labelCol="state.labelCol" :wrapperCol="state.wrapperCol" label="请选择协理人" name="assistant">
					<a-select
					    v-model:value="state.formModel.assistant"
					    mode="multiple"
					    :options="userStore.userList"
						:fieldNames="{label: 'realname', value: 'realname'}"
						placeholder="请选择"
						allowClear
					  >
					</a-select>
		          </a-form-item>
		        </a-col>
		      </a-row>
		      <a-row style="padding-left: 30px; padding-top: 0">
		        <a-col :span="24">
		          <a-form-item :labelCol="state.labelCol" :wrapperCol="state.wrapperCol" label="请选择优先级" name="priority">
		            <a-select v-model:value="state.formModel.priority">
		              <a-select-option value="跟进">跟进</a-select-option>
		              <a-select-option value="关注">关注</a-select-option>
		              <a-select-option value="其他">其他</a-select-option>
		              <a-select-option value="投后">投后</a-select-option>
		            </a-select>
		          </a-form-item>
		        </a-col>
		      </a-row>
		    </a-form>
		</a-modal>
	</div>
</template>
<script setup>
import { 
	InfoCircleOutlined, 
	SettingOutlined, 
	ImportOutlined, 
	ExportOutlined, 
	RedoOutlined,
	NumberOutlined,
	UsergroupAddOutlined,
	NodeCollapseOutlined
} from '@ant-design/icons-vue';
import { Modal, message as Message } from 'ant-design-vue';
import Redo from "@/components/common/redo.vue"; 
import { h, reactive, onMounted, ref, computed, nextTick, onBeforeUnmount } from "vue";
import { getToolHint } from "@/utils/helper"
import { 
	getToolTip, 
	getIndustrFieldValues, 
	reportFilterBarChart,
	mergeTreeNode,
	moveTreeNode,
	updateTreeNodeName,
	addTreeNode,
	deleteTreeNode,
	updateTreeNodeInfo
} from '@/api/industry'
import { PeopleOrder, prioritiesOrder } from "@/utils/util1";
import { usePermission } from "@/utils/usePermission.ts";
import FullScreen from "@/components/common/fullScreen.vue";
import { useRouter } from "vue-router";
import BarChart from "./components/BarChart.vue"; 
import { useUser } from "@/store/user";

const router = useRouter();

const { hasPermission } = usePermission();

const userStore = useUser();

let selectItem = null;
let selected_node = null;
let gDeletedNodes = [];
const inputRefs = ref({});
const state = reactive({
	loading: false,
	isMgr: false,
	tooltips: [],
	priorityTags: Object.keys(prioritiesOrder),
	selectedPriorityTags: ['跟进'],
	peopleTags: Object.keys(PeopleOrder),
	selectedPeopleTags: [],
	globalMode: 'filter',
	searchValue: '',
	selected_node_title: [],
	orderMap: {},
	distinctNames: {},
	toggleShowProjectNumber: true,
	toggleShowAssigner: true,
	toggleExpand: false,
	autoExpandParent: true,
	expandedKeys: [],
	gData: [],
	allKeys: [],
	currentDragNode: null,
	currentDragNodeLevel: null,
	currentDropMode: {
		dropToGap: true, // 默认为间隙模式
	    dropPosition: 0, // 0: 无, -1: 上方, 1: 下方
	    targetNode: null, // 目标节点
	},
	dragTooltip: {
		visible: false,
	    x: 0,
	    y: 0,
	    type: '', // 'move', 'merge', 'child', 'invalid'
	    message: '',
	},
	draggedOverNode: null,
	overlapNode: null,
	data_editedTitle: '',
	editMode: false,
	formModel: {
		main: [],
	    assistant: [],
	    other: [],
	    priority: 0,
	    // 可以在这里添加更多的表单字段
	},
	labelCol: { xs: { span: 24 }, sm: { span: 5 } },
    wrapperCol: { xs: { span: 24 }, sm: { span: 16 } },
	editInfoModalVisible: false,
	modal2Visible: false,
	modal3Visible: false,
	isEdit: true
})

const barTags = computed(() => {
	return [...state.selectedPriorityTags, ...state.selectedPeopleTags, ...state.selected_node_title].filter(v => v)
})

const barKey = computed(() => {
	return barTags.value.join(',')
})

function setMode(mode) {
    state.globalMode = mode;
    if (mode === 'click') {
    }
    if (mode === 'search') {
      state.selectedPriorityTags = [];
      state.selectedPeopleTags = [];
    }
    if (mode === 'filter') {
      state.searchValue = '';
      state.selected_node_title = [];
    }
    if (mode === 'edit') {
    }
}

const handlePriorityChange = (tag, checked) => {
	const index = state.selectedPriorityTags.indexOf(tag);
	if (-1 === index) {
		state.selectedPriorityTags.push(tag);
	} else {
		state.selectedPriorityTags.splice(index, 1);
	}

    setMode('filter');
	getData()
};

const handlePeopleChange = (tag, checked) => {
	const index = state.selectedPeopleTags.indexOf(tag);
	if (-1 === index) {
		state.selectedPeopleTags.push(tag);
	} else {
		state.selectedPeopleTags.splice(index, 1);
	}

    setMode('filter');
	getData();
};

const getTagClass = (tag) => {
    // 实现根据tag动态生成类名的逻辑，这里假设直接返回tag作为类名简化示例
    if (/关注/.test(tag)) return 'text-wrapper_10 flex-col';
    else if (/跟进/.test(tag)) return 'text-wrapper_9 flex-col';
    else return '';
};

const getClassForTreeTitle = (data, tag) => {
    if (data.level < 2) {
      return 'father-title'
    }
}

const getClassForTagForTree = (data, tag) => {
    if (data.level === 4) {
      let ret = '';
      if (/关注/.test(tag)) {
        ret = 'text_32 text-wrapper_19 flex-col tab-text-col-guanzhu-tree guanzhu_checked_style';
      } else if (/跟进/.test(tag)) {
        ret = 'text_30 text-wrapper_18 flex-col tab-text-col genjin_checked_style';
      }else if (/投后/.test(tag)) {
        ret = 'text_36 text-wrapper_101 touhou_item_tree_node';
      } else {
        ret = 'text_36 text-wrapper_101 ';
      }
      if (data.selected) {
        ret += ' checked';
      }
      return ret;
    }
    if (data.selected) {
      return 'node checked';
    }
    if (data.level <= 2) {
      return 'text_first_level'
    }
    if (data.level === 3) {
      return 'text_third_level'
    }
};

const getClassForTag = (tag) => {
	if (/关注/.test(tag)) {
	  return 'text-wrapper_9 guanzhu';
	} else if (/跟进/.test(tag)) {
	  return 'text-wrapper_9 genjin';
	} else if (/投后/.test(tag)) {
	  return 'text-wrapper_9 touhou';
	} else {
	  return 'text-wrapper_9 qita';
	}
};

const toConfig = () => {
	router.push({
		path: "/gy/industry/config",
	})
}

function sumDistinctNamesByPerson(data) {
    let combinedSums = {};

    data.forEach((domain) => {
      const priority = domain.priority;
      combinedSums[priority] = (combinedSums[priority] || 0) + 1;
      //domain.distinct_name_count;

      ['main', 'assistant', 'other'].forEach((role) => {
        const peopleList = domain[role] ? domain[role].split(',') : [];
        peopleList.forEach((person) => {
          if (person.trim()) {
            combinedSums[person.trim()] = (combinedSums[person.trim()] || 0) + 1;
            // domain.distinct_name_count;
          }
        });
      });
    });

    return combinedSums;
}

// 判断拖放位置
function getDragPosition(info) {
    if (!info.dropToGap) {
      return '重叠/合并'; // 直接拖到节点上
    }

    const dropPos = info.node.pos.split('-');
    const dropPosition = info.dropPosition - Number(dropPos[dropPos.length - 1]);

    // 判断是放在节点的上方还是下方
    if (dropPosition < 0) {
      return '上方'; // 放在目标节点上方
    } else if (dropPosition > 0) {
      return '下方'; // 放在目标节点下方
    } else {
      // 如果 dropPosition = 0，通常表示放在目标节点内部（作为子节点）
      return '内部';
    }
}

// 允许拖放的判断函数
const allowDrop = (info) => {
	// console.log("allowDrop L", info?.dragNode?.level, info?.dropNode?.level)
	// return info && info.dropNode && info.dragNode && info.dragNode.level === info.dropNode.level ? true : false;
    // 在拖放过程的某些阶段，info可能不完整，我们默认允许拖放
    if (!info) {
      return true; // 如果info不存在，允许拖放，使用默认行为
    }

    // 如果dragNode或node不存在，允许拖放，使用默认行为
    if (!info.dragNode || !info.dropNode) {
      return true;
    }

    // 如果level属性不存在，允许拖放，使用默认行为
    if (typeof info.dragNode.level === 'undefined' || typeof info.dropNode.level === 'undefined') {
      return true;
    }

    const dragLevel = info.dragNode.level;
    const targetLevel = info.dropNode.level;
    const isSameLevel = dragLevel === targetLevel;

    // 如果是同级节点，允许任何拖放模式（间隙或重叠）
    if (isSameLevel) {
      return true;
    } else if (dragLevel - targetLevel === 1) { // 如果不是同级节点，检查特殊情况
		return { dropToGap: false };
	}

    // 其他情况不允许拖放
    return false;
};

const findNodeByTitle = (data, targetKey) => {
    for (let i = 0; i < data.length; i++) {
      if (data[i].title === targetKey) {
        return data[i];
      }
      if (data[i].children) {
        const result = findNodeByTitle(data[i].children, targetKey);
        if (result) {
          return result;
        }
      }
    }
    return null;
};

const handleClick = (_, info) => {
    console.info('node..', info);
    selectItem = info.title;
    selected_node = findNodeByTitle(state.gData, selectItem);
    // iterate each node of tree to find the selected one, data.selected = true

    // Function to find all selected nodes
    const findSelectedNodes = (node) => {
      let selectedNodes = [];

      const traverse = (currentNode) => {
        if (currentNode.selected) {
          selectedNodes.push(currentNode);
        }

        if (currentNode.children) {
          for (let child of currentNode.children) {
            traverse(child);
          }
        }
      };

      traverse(node);
      return selectedNodes;
	}

	// Usage
    const selectedNodes = findSelectedNodes(state.gData[0]);
    const selectedNodeTitles = selectedNodes.map((node) => node.title);
    state.selected_node_title = selectedNodeTitles;

    // state.selected_node_title = info.title;
    if (state.globalMode === 'edit') {
      return; // ignore
    }
    setMode('click');
 };

let observer = null;

function handleNativeDragStart(event) {
  // 1. 获取拖拽节点的文本，按行分割
  const lines = event.target.innerText.split('\n');

  // 2. 创建一个自定义拖影 DOM
  const dragDiv = document.createElement('div');
  dragDiv.style.position = 'absolute';
  dragDiv.style.top = '-9999px'; // 屏幕外
  dragDiv.style.left = '-9999px';
  dragDiv.style.padding = '4px 12px';
  dragDiv.style.background = 'transparent';
  dragDiv.style.color = '#1677ff';
  dragDiv.style.fontSize = '14px';
  dragDiv.style.fontWeight = '400';
  dragDiv.style.border = '1px solid #1677ff';
  dragDiv.style.borderRadius = '4px';
  // dragDiv.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
  dragDiv.style.pointerEvents = 'none';
  dragDiv.style.zIndex = '9999';

  // 3. 拼接 HTML
  if (lines.length > 1) {
    // 第一行正常，后面每行用小号蓝色
    dragDiv.innerHTML =
      `<span>${lines[0]}</span>` +
      lines.slice(1).map(line =>
        `<span style="font-size:12px;color:#167FFF;">${line}</span>`
      ).join('');
  } else {
    dragDiv.innerText = lines[0];
  }

  // 4. 添加到 body
  document.body.appendChild(dragDiv);

  // 5. 设置为拖影
  event.dataTransfer.setDragImage(dragDiv, dragDiv.offsetWidth / 2, dragDiv.offsetHeight / 2);

  // 6. 拖拽结束后移除
  setTimeout(() => {
    document.body.removeChild(dragDiv);
  }, 0);
}

function bindAllDragStart() {
  document.querySelectorAll('.ant-tree-node-content-wrapper[draggable="true"]').forEach(node => {
    node.removeEventListener('dragstart', handleNativeDragStart, true);
    node.addEventListener('dragstart', handleNativeDragStart, true);
  });
}

// 拖动开始时的处理
const onDragStart = (info) => {
    // 保存当前拖动的节点信息
    state.currentDragNode = info.node;
    state.currentDragNodeLevel = info.node?.level || info.node?.dataRef?.level;

    // 重置拖放模式状态
    state.currentDropMode = {
      dropToGap: true,
      dropPosition: 0,
      targetNode: null,
    };

    // 初始化提示框状态
    state.dragTooltip = {
      visible: false,
      x: 0,
      y: 0,
      type: '',
      message: '',
    };

    // 添加鼠标移动事件监听器，用于更新提示框位置
    document.addEventListener('mousemove', updateTooltipPosition);

    console.log('拖动开始 - 保存拖动节点信息:', '节点:', state.currentDragNode, '级别:', state.currentDragNodeLevel);
	// 
};
// 判断拖拽是否有效的函数
const isValidDrag = (dragLevel, targetLevel) => {
    // 不允许将level3的节点拖到level4的节点
    // 不允许向下一级拖拽
    if (dragLevel < targetLevel) {
      return false;
    }

    // 不允许向上拖拽超过1级（只能level3拖到level2，不能拖到level1）
    if (dragLevel - targetLevel > 1) {
      return false;
    }

    return true;
};

const isNToNMinusOne = (dragLevel, targetLevel) => {
    return dragLevel === targetLevel + 1;
};
  
  // 更新提示框位置的函数
const updateTooltipPosition = (event) => {
    if (state.dragTooltip.visible) {
      // 设置提示框位置在鼠标右下方15px处
      state.dragTooltip.x = event.clientX + 15;
      state.dragTooltip.y = event.clientY + 15;
    }
};

// 查找节点并执行操作
  const findNodeAndOperate = (tree, title, callback) => {
    for (let i = 0; i < tree.length; i++) {
      if (tree[i].title === title) {
        return callback(tree[i], i, tree);
      }
      if (tree[i].children) {
        findNodeAndOperate(tree[i].children, title, callback);
      }
    }
  };

async function mergeTreeAction(info) {
    Message.loading({ content: '正在合并...', duration: 0, key: 'merge' });

    try {
      const { result } = await mergeTreeNode({ level: info.node.level - 1, fromDomain: info.dragNode.title, toDomain: info.node.title });

      if (typeof result === 'string' && result.includes('成功')) {
        // window.location.reload();
		refreshPage()
      } else {
        Message.error(typeof result === 'string' ? result : result.message || '合并失败');
      }
    } catch (error) {
      Message.error('合并失败: ' + (error.message || '未知错误'));
    } finally {
      Message.destroy('merge');
    }
}

async function moveTreeAction(info, moveInfo, skipConfirm = false) {
    console.log('Move action performed with the following details:');
    console.log('Dragged node:', moveInfo.sourceNode?.title);
    console.log('Target node:', moveInfo.targetNode?.title);
    console.log('Target node title (from tooltip):', moveInfo.targetNodeTitle);
    console.log('Drop position:', moveInfo.dropPosition);

    // 准备移动操作的函数
    const performMoveAction = async () => {
      try {
        Message.loading({ content: '正在移动...', duration: 0, key: 'move' });

        // 根据节点级别和位置确定正确的参数
        let level = info.dragNode.level - 1; // 级别从0开始计算

        // 一级节点特殊处理
        if (moveInfo.sameLevel === true && moveInfo.sourceParentKey === '' && moveInfo.targetParentKey === undefined) {
          level = 0; // 一级节点对应level=0
        }

        // 二级节点特殊处理
        if (info.dragNode.level === 3) {
          level = 1; // 二级节点对应level=1
        }

        // 特殊情况处理
        if (info.dragNode.level === 4 && info.node.level === 3) {
          moveInfo.newIndex = 0;
          moveInfo.targetParentKey = info.node.title;
        }

        // 从dragTooltip中提取目标节点名称和方向信息
        let targetNodeTitle = info.node.title;
        let dropPosition = info.dropPosition;

        // 尝试从state.dragTooltip.message中提取信息
        if (state.dragTooltip && state.dragTooltip.message) {
          // 提取目标节点名称
          const regex = /【(.+?)】/;
          const match = state.dragTooltip.message.match(regex);
          if (match && match[1]) {
            targetNodeTitle = match[1];
          }

          // 确定方向（上方或下方）
          if (state.dragTooltip.message.includes('上方')) {
            dropPosition = '-1';
          } else if (state.dragTooltip.message.includes('下方')) {
            dropPosition = '1';
          }
        }

		// console.log('移动节点', dropPosition, targetNodeTitle, info.dragNode.title)
		/*
		const fromNode = findNodeByTitle(state.gData, info.dragNode.title);
		if (!fromNode) {
			console.log("获取移动原始节点失败");
			return;
		}
		// console.log("移动原始节点----》", fromNode)
		
		// 删除节点
		deleteNode(info.dragNode.title, true);
		const targetParent = findParentNodeByTitle(state.gData, targetNodeTitle);
		// console.log("移动目标节点----》", targetParent)
		if (!targetParent?.children) {
			console.log("获取移动目标节点失败");
			return;
		}
		if (-1 === Number(dropPosition)) {
			// 移动到上方
			targetParent.children = [fromNode, ...targetParent.children]
		} else if (1 === Number(dropPosition)) {
			// 移动到下方
			targetParent.children = [...targetParent.children, fromNode]
		}
		// console.log("移动后：", targetParent)
		
		return;*/

        // 调用统一的moveTreeNode API
        await moveTreeNode({
          level: info.dragNode.level - 1,
          fromDomain: info.dragNode.title,
          toDomain: targetNodeTitle,
          direction: dropPosition, // 1表示上方，-1表示下方
        });

        console.log('移动成功');
        // 刷新数据
        // window.location.reload();
		refreshPage()
      } catch (error) {
        console.error('移动节点时出错:', error);
        Message.error('移动失败: ' + (error.message || '未知错误'));
      } finally {
        Message.destroy('move');
      }
    };

    // 根据 skipConfirm 参数决定是否显示确认对话框
    if (skipConfirm) {
      // 直接执行移动操作，不显示确认对话框
      await performMoveAction();
    } else {
      // 显示确认对话框
	  console.log("======>", info)
	  let content = `你确定要将【${info.dragNode.title}】移动到【${info.node.title}】${info.dropPosition === -1 ? '上方' : '下方'}吗？`;
	  if (info.dragNode.level - 1 === info.node.level) {
		content = `你确定要将【${info.dragNode.title}】移动到【${info.node.children?.[0]?.title || info.node.title}】${info.node.children?.length || info.dropPosition === -1 ? '上方' : '下方'}吗？`;
	  }
	  
      Modal.confirm({
        title: '移动确认',
        content: content,
        onOk: performMoveAction,
        onCancel: () => {
          console.log('Operation canceled, node not moved');
        },
      });
    }
}

// 拖动进入时的处理
  const onDragEnter = (info) => {
    // 获取节点的 DOM 元素
    const nodeElement = info.event.target.closest('.ant-tree-treenode');
    if (nodeElement) {
      // 获取节点的宽度和鼠标的 X 坐标
      const nodeRect = nodeElement.getBoundingClientRect();
      const mouseX = info.event.clientX;

      // 判断鼠标是在节点的左半部分还是右半部分
      const isLeft = mouseX < nodeRect.left + nodeRect.width / 2;
      // 判断鼠标是在节点的上半部分还是下半部分
      const nodeHeight = nodeElement.offsetHeight;
      const mouseY = info.event.clientY - nodeElement.getBoundingClientRect().top;
      const isTop = mouseY < nodeHeight / 4; // 上四分之一区域
      const isBottom = mouseY > (nodeHeight * 3) / 4; // 下四分之一区域
      const isMiddle = !isTop && !isBottom; // 中间区域 - 现在是中间一半

      console.log('调试 - 鼠标区域判断:', '鼠标Y坐标:', mouseY, '节点高度:', nodeHeight, '上部:', isTop, '中间:', isMiddle, '下部:', isBottom);

      console.log('鼠标位置:', isLeft ? '左侧' : '右侧', isTop ? '上方' : isBottom ? '下方' : '中间');

      // 清除其他节点的样式
      document.querySelectorAll('.ant-tree-treenode').forEach((node) => {
        if (node !== nodeElement) {
          node.classList.remove('drop-target-gap-top', 'drop-target-gap-bottom', 'drop-target-overlap');
          node.style.backgroundColor = '';
          node.style.border = '';

          // 清除内容区域的样式
          const contentWrapper = node.querySelector('.ant-tree-node-content-wrapper');
          if (contentWrapper) {
            contentWrapper.style.backgroundColor = '';
            contentWrapper.style.border = '';
          }
        }
      });

      // 获取节点和拖动节点的数据引用
      const nodeDataRef = info.node?.dataRef;
      const dragNodeDataRef = info.dragNode?.dataRef;

      // 从dataRef中获取级别信息，这在某些情况下比直接从node对象获取更可靠
      const nodeLevel = nodeDataRef?.level || info.node?.level;

      // 使用保存的拖动节点级别信息
      const dragNodeLevel = state.currentDragNodeLevel || dragNodeDataRef?.level || info.dragNode?.level;

      console.log(
        '调试 - 节点级别信息:',
        '目标节点级别:',
        nodeLevel,
        '拖动节点级别:',
        dragNodeLevel,
        '保存的拖动节点级别:',
        state.currentDragNodeLevel,
        '节点数据:',
        nodeDataRef,
        '拖动节点数据:',
        dragNodeDataRef
      );

	//   if (dragNodeLevel !== nodeLevel) {
	// 	console.log("非同级不允许拖拽，隐藏拖拽线")
	// 	 // 隐藏拖拽横线
	// 	  console.log("隐藏拖拽横线", document.querySelectorAll(".ant-tree-drop-indicator"))
	// 	  document.querySelectorAll(".ant-tree-drop-indicator").forEach((node) => {
	// 			node.classList.add("hidden")
	// 	  })
	//   }
 
      // 判断是否为同级节点 - 使用更可靠的级别信息
      const isSameLevel = nodeLevel !== undefined && dragNodeLevel !== undefined && nodeLevel === dragNodeLevel;

      console.log('调试 - 是否同级节点:', isSameLevel);

      // 如果是同级节点
      if (isSameLevel) {
        // 根据鼠标位置决定是上方、下方还是重叠
        if (isTop) {
          // 上方 - 间隙模式
          console.log('同级节点拖放，设置为上方间隙模式');
          info.dropPosition = -1;
          info.dropToGap = true;

          // 更新拖放模式状态
          state.currentDropMode = {
            dropToGap: true,
            dropPosition: -1,
            targetNode: info.node,
          };

          // 添加样式类
          nodeElement.classList.add('drop-target-gap-top');
          nodeElement.classList.remove('drop-target-gap-bottom', 'drop-target-overlap');

          // 显示提示框
          state.dragTooltip = {
            visible: true,
            x: info.event.clientX + 15,
            y: info.event.clientY + 15,
            type: 'move',
            message: `将放置在【${info.node.title}】的上方`,
          };
        } else if (isBottom) {
          // 下方 - 间隙模式
          console.log('同级节点拖放，设置为下方间隙模式');
          info.dropPosition = 1;
          info.dropToGap = true;

          // 更新拖放模式状态
          state.currentDropMode = {
            dropToGap: true,
            dropPosition: 1,
            targetNode: info.node,
          };

          // 添加样式类
          nodeElement.classList.add('drop-target-gap-bottom');
          nodeElement.classList.remove('drop-target-gap-top', 'drop-target-overlap');

          // 显示提示框
          state.dragTooltip = {
            visible: true,
            x: info.event.clientX + 15,
            y: info.event.clientY + 15,
            type: 'move',
            message: `将放置在【${info.node.title}】的下方`,
          };
        } else {
          // 中间 - 重叠模式
          console.log('同级节点拖放，设置为重叠模式');

          info.dropPosition = 0;
          info.dropToGap = false;

          // 更新拖放模式状态
          state.currentDropMode = {
            dropToGap: false,
            dropPosition: 0,
            targetNode: info.node,
          };

          // 移除间隙样式类，添加重叠样式类
          nodeElement.classList.remove('drop-target-gap-top', 'drop-target-gap-bottom');
          nodeElement.classList.add('drop-target-overlap');

          // 添加内联样式以确保颜色变化 - 使用更明显的红色
        //   nodeElement.style.backgroundColor = 'rgba(255, 0, 0, 0.3)';
        //   nodeElement.style.border = '2px solid #ff4d4f';

          // 直接修改节点内容区域的样式 - 这是最关键的部分
          const contentWrapper = nodeElement.querySelector('.ant-tree-node-content-wrapper');
          if (contentWrapper) {
            // contentWrapper.style.backgroundColor = 'rgba(255, 0, 0, 0.3)';
            // contentWrapper.style.border = '2px solid #ff4d4f';
            contentWrapper.style.borderRadius = '4px';
            contentWrapper.style.transition = 'all 0.3s';
            console.log('重叠模式 - 内容区域样式已修改:', contentWrapper);
          }

          // 显示悬浮提示框
          state.dragTooltip = {
            visible: true,
            x: info.event.clientX + 15,
            y: info.event.clientY + 15,
            type: 'merge',
            message: `将与【${info.node.title}】合并`,
          };
        }
      }
      // 如果是不同级节点或级别信息不完整
      else {
        // 检查拖拽是否有效
        const isValid = isValidDrag(dragNodeLevel, nodeLevel);
        console.log('拖拽有效性检查:', '拖动节点级别:', dragNodeLevel, '目标节点级别:', nodeLevel, '是否有效:', isValid);

        // 如果拖拽无效，隐藏提示框并禁止拖放
        if (!isValid) {
          // 隐藏提示框
          state.dragTooltip.visible = false;

          // 清除样式
          nodeElement.classList.remove('drop-target-gap-top', 'drop-target-gap-bottom', 'drop-target-overlap');

          // 设置为无效拖放
          info.dropPosition = null;
          info.dropToGap = false;

          return;
        }

        // 强制使用间隙模式，禁止重叠/合并
        console.log('不同级节点拖放或级别信息不完整，强制使用间隙模式');

        // 检查是否是N级节点拖到N-1级节点
        const isNToNMinusOneDrag = isNToNMinusOne(dragNodeLevel, nodeLevel);

        // 根据鼠标位置决定是放在上方还是下方
        if (isTop || (isMiddle && isLeft)) {
          // 上方或左侧 - 放在上方
          info.dropPosition = -1;
          nodeElement.classList.add('drop-target-gap-top');
          nodeElement.classList.remove('drop-target-gap-bottom');

          // 更新拖放模式状态
          state.currentDropMode = {
            dropToGap: true,
            dropPosition: -1,
            targetNode: info.node,
          };

          // 只有当不是N级拖到N-1级时才显示提示框
          if (!isNToNMinusOneDrag) {
            // 显示提示框
            state.dragTooltip = {
              visible: true,
              x: info.event.clientX + 15,
              y: info.event.clientY + 15,
              type: 'move',
              message: `将放置在【${info.node.title}】的上方`,
            };
          } else {
            // N级拖到N-1级，不显示提示框
            state.dragTooltip.visible = false;
          }
        } else {
          // 下方或右侧 - 放在下方
          info.dropPosition = 1;
          nodeElement.classList.add('drop-target-gap-bottom');
          nodeElement.classList.remove('drop-target-gap-top');

          // 更新拖放模式状态
          state.currentDropMode = {
            dropToGap: true,
            dropPosition: 1,
            targetNode: info.node,
          };

          // 只有当不是N级拖到N-1级时才显示提示框
          if (!isNToNMinusOneDrag) {
            // 显示提示框
            state.dragTooltip = {
              visible: true,
              x: info.event.clientX + 15,
              y: info.event.clientY + 15,
              type: 'move',
              message: `将放置在【${info.node.title}】的下方`,
            };
          } else {
            // N级拖到N-1级，不显示提示框
            state.dragTooltip.visible = false;
          }
        }

        // 强制设置为间隙模式
        info.dropToGap = true;
      }

      // 检查是否重叠
      if (!info.dropToGap) {
        console.log('设置重叠节点:', info.node);
        state.overlapNode = info.node;
        if (info.node.dataRef && info.node.dataRef.props) {
          info.node.dataRef.props.class = 'overlap';
        }
      }

      // 设置被拖拽悬停节点的背景颜色
      if (state.draggedOverNode) {
        state.draggedOverNode.style.backgroundColor = '';
      }
      state.draggedOverNode = nodeElement;
      if (state.draggedOverNode && info.dropToGap) {
        state.draggedOverNode.style.backgroundColor = '#e6f7ff';
      }
    }

    console.log(info);
    if (info.node && info.node.dataRef && info.node.dataRef.props) {
      console.log(info.node.dataRef.props);
    }

    // expandedKeys 需要展开时
    // expandedKeys.value = info.expandedKeys;
    // expandAllNodes();
 };

// 拖放时的处理
 const onDrop = (info) => {
    console.log('onDrop 被触发', info);

    // 检查是否是不同级别的节点拖拽
    if (info.dragNode && info.node) {
      const dragLevel = info.dragNode.level;
      const targetLevel = info.node.level;

      // 检查是否是N级节点拖到N-1级节点
      const isNToNMinusOneDrag = isNToNMinusOne(dragLevel, targetLevel);

      // 如果是N级拖到N-1级，直接执行移动操作，不弹出确认对话框
      if (isNToNMinusOneDrag) {
        console.log('N级节点拖到N-1级节点，直接执行移动操作');

        // 清除所有拖放样式
        document.querySelectorAll('.ant-tree-treenode').forEach((node) => {
          node.classList.remove('drop-target-gap-top', 'drop-target-gap-bottom', 'drop-target-overlap');
          if (node.style) {
            node.style.backgroundColor = '';
            node.style.border = '';
          }

          // 清除内容区域的样式
          const contentWrapper = node.querySelector('.ant-tree-node-content-wrapper')
          if (contentWrapper && contentWrapper.style) {
            contentWrapper.style.backgroundColor = '';
            contentWrapper.style.border = '';
            contentWrapper.style.borderRadius = '';
          }
        });

        // 执行移动操作
        const dropPosition = info.dropPosition;
        moveTreeAction(
          info,
          {
            sourceNode: info.dragNode,
            targetNode: info.node,
            dropPosition: dropPosition,
            targetNodeTitle: info.node.title,
          },
          false
        );

        return false;
      }

      // 如果不是同级节点，且不是N级拖到N-1级，直接返回，不执行后续操作
      if (dragLevel !== targetLevel && !isNToNMinusOneDrag) {
        console.log('不同级别节点拖拽，操作被取消');
        return false;
      }
    }

    // 清除所有拖放样式
    document.querySelectorAll('.ant-tree-treenode').forEach((node) => {
      node.classList.remove('drop-target-gap-top', 'drop-target-gap-bottom', 'drop-target-overlap');
      if (node.style) {
        node.style.backgroundColor = '';
        node.style.border = '';
      }

      // 清除内容区域的样式
      const contentWrapper = node.querySelector('.ant-tree-node-content-wrapper');
      if (contentWrapper && contentWrapper.style) {
        contentWrapper.style.backgroundColor = '';
        contentWrapper.style.border = '';
        contentWrapper.style.borderRadius = '';
      }
    });

    // 获取当前的拖拽提示信息
    const currentTooltip = state.dragTooltip;
    // 隐藏提示框
    state.dragTooltip.visible = false;

    // 根据当前tooltip的类型和消息构建确认消息
    let confirmMessage = '';
    let operationType = '';

    // 从tooltip消息中提取目标节点名称
    let targetNodeTitle = '';
    const regex = /【(.+?)】/;
    const match = currentTooltip.message.match(regex);
    if (match && match[1]) {
      targetNodeTitle = match[1];
    } else {
      targetNodeTitle = info.node.title;
    }

    // 直接使用tooltip的内容，不做任何转换或解释
    if (currentTooltip.type === 'move') {
      // 使用tooltip中的原始消息来确定操作
      confirmMessage = `确定要将【${info.dragNode.title}】${currentTooltip.message.replace('将放置', '移动')}吗？`;

      // 根据tooltip消息确定是上方还是下方
      if (currentTooltip.message.includes('上方')) {
        operationType = 'top';
      } else if (currentTooltip.message.includes('下方')) {
        operationType = 'bottom';
      }
    } else if (currentTooltip.type === 'merge') {
      confirmMessage = `确定要将【${info.dragNode.title}】${currentTooltip.message}吗？`;
      operationType = 'merge';
    } else {
      // 默认情况，使用currentDropMode来判断
      console.log('警告：无法从tooltip中确定操作类型，使用备用方法');
      return false; // 如果无法确定操作类型，则取消操作
    }

    console.log('操作类型:', operationType, '确认消息:', confirmMessage, '目标节点:', targetNodeTitle);

    // 显示确认对话框
    Modal.confirm({
      title: '确认操作',
      content: confirmMessage,
      okText: '确定',
      cancelText: '取消',
      onOk: () => {
        // 执行原有的拖拽逻辑
        const data = [...state.gData];

        // 查找拖拽节点和目标节点
        let dragObj;
        findNodeAndOperate(data, info.dragNode.key, (item, index, arr) => {
          arr.splice(index, 1);
          dragObj = item;
        });

        if (operationType === 'merge') {
          // 如果是合并操作
          mergeTreeAction(info);
        } else {
          // 如果是移动操作
          const dropPosition = operationType === 'top' ? -1 : 1;
          moveTreeAction(
            info,
            {
              sourceNode: info.dragNode,
              targetNode: info.node,
              dropPosition: dropPosition,
              targetNodeTitle: targetNodeTitle, // 传递从tooltip提取的目标节点名称
            },
            true
          ); // 设置为true跳过确认，因为我们已经确认过了
        }
      },
      onCancel: () => {
        console.log('用户取消了拖拽操作');
      },
    });

    return false; // 阻止默认行为
};

// 拖动结束时清除保存的拖动节点信息
const onDragEnd = () => {
    // 清除所有节点的样式
    document.querySelectorAll('.ant-tree-treenode').forEach((node) => {
      node.classList.remove('drop-target-gap-top', 'drop-target-gap-bottom', 'drop-target-overlap');
      node.style.backgroundColor = '';
      node.style.border = '';

      // 清除内容区域的样式
      const contentWrapper = node.querySelector('.ant-tree-node-content-wrapper');
      if (contentWrapper) {
        contentWrapper.style.backgroundColor = '';
        contentWrapper.style.border = '';
        contentWrapper.style.borderRadius = '';
      }
    });

    // 清除引用
    if (state.draggedOverNode) {
      state.draggedOverNode.style.backgroundColor = '';
      state.draggedOverNode = null;
    }

    state.currentDragNode = null;
    state.currentDragNodeLevel = null;
    state.overlapNode = null;

    // 重置拖放模式状态
    state.currentDropMode = {
      dropToGap: true,
      dropPosition: 0,
      targetNode: null,
    };

    // 隐藏提示框
    state.dragTooltip.visible = false;

    // 移除鼠标移动事件监听器
    document.removeEventListener('mousemove', updateTooltipPosition);

    console.log('拖动结束 - 清除拖动节点信息');
};

const getParentKey = (key, tree) => {
    let parentKey;

    for (let i = 0; i < tree.length; i++) {
      const node = tree[i];
      if (node.children) {
        if (node.children.some((item) => item.key === key)) {
          parentKey = node.key;
        } else if (getParentKey(key, node.children)) {
          parentKey = getParentKey(key, node.children);
        }
      }
    }
    return parentKey;
};

const onExpand = (keys) => {
	state.expandedKeys = keys;
    state.autoExpandParent = false;
}

const onSelect = () => {}

function handleTagClick(data) {
    data.selected = !data.selected; // allow multi-selection // TODO
    if (state.globalMode === 'edit') {
      return; // ignore
    }
    // toggleSelectByTitle(state.gData, data.title);
}

const handleNodeDblClick = async (data) => {
    if (state.globalMode === 'edit') {
      return; // ignore
    }
    // console.error('Double clicked on node: with data:', data);

    // let response = await listFilteredStatus();

    // await router.push({ path: '/gy-core/gy.gy/VProjectAllInfo/listFilteredStatus', query: { type: 2, title: data.title, pageNo: 1, pageSize: 10 } });
    const level = parseInt(data.level) - 1;
    const query = {
      type: 1,
      title: data.title,
      pageNo: 1,
      pageSize: 10,
      level: level,
    };

    if (level === 1) {
      query.domain1 = data.props.domain1;
    } else if (level === 2) {
      query.domain1 = data.props.domain1;
      query.domain2 = data.props.domain2;
    } else if (level === 3) {
      query.domain1 = data.props.domain1;
      query.domain2 = data.props.domain2;
      query.domain3 = data.props.domain3;
    }

    await router.push({
      path: '/gy/projects',
      query,
    });

    // 在这里添加你的双击处理逻辑
};

function showPeople(data) {
    if (state.toggleShowAssigner && data.level === 4) {
      return ` ${data.props?.main?.split?.(',')?.join?.('、') || '-'}/${data.props?.assistant?.split?.(',')?.join?.('、') || '-'}`;
    } else {
      return '';
    }
}

function getTitle(data) {
    let title = data.title;

    if (state.toggleShowProjectNumber) {
      title += `(${data?.projNumber || 0})`;
    }

    return title;
}

function getRef(el, data) {
    inputRefs.value[data.key] = el;
}

function hasTwoChineseCharacters(str) {
    // 匹配汉字的正则表达式
    const chineseRegex = /[\u4e00-\u9fa5]/g;

    // 使用正则表达式匹配字符串中的汉字，并统计匹配到的数量
    const matches = str.match(chineseRegex);

    // 如果匹配到的数量大于等于1，则返回true，否则返回false
    return matches && matches.length >= 2;
}

const saveEditedNode = async (node, event) => {
    const value = event.target.value;
    if (value.includes('待') || !hasTwoChineseCharacters(value)) {
      // 保持编辑状态
      nextTick(() => {
        if (inputRefs.value[node.key]) {
          inputRefs.value[node.key].focus();
        }
      });
    } else {
      const params = {};

      if (!node.key.startsWith('NEW_')) {
        // 编辑现有节点
        params.domain1 = node.props.domain1;
        params.domain2 = node.props.domain2;
        params.domain3 = node.props.domain3;
        params.industryId = node.props.industry_id;
        params.level = node.level - 1;
        params.toName = value;

		/*node.title = value;
		node.props[`domain${params.level}`] = value;
		node.props.domain_path = [node.props.domain1, node.props.domain2, node.props.domain3].join("-");
		node.editing = false;
		return;*/

        try {
          const { result } = await updateTreeNodeName(params);
          if (result && result.includes('成功')) {
            // Message.success('节点更新成功！');
			refreshPage();
            // setTimeout(() => {
            //   window.location.reload();
            // }, 3000);
          } else {
            Message.error('更新失败: ' + (result || '未知错误'));
          }
        } catch (error) {
          console.error('调用更新API时出错:', error);
          // message.error('更新失败: ' + error.message);
        }
      } else {
        // 新建节点
        params.domain1 = node.props?.domain1;
        params.domain2 = node.props?.domain2;
        params.domain3 = node.props?.domain3;
        params.industryId = node.props?.industry_id;
        params.level = node.level - 1;
        params.toName = value;
		// console.log(node);
		/*node.title = value;
		node.editing = false;
		node.props[`domain${params.level}`] = value;
		switch(params.level) {
			case 1:
				node.props.domain2 = node.title + '二级';
				node.props.domain3 = node.title + '三级';
				node.children = [
					{ 
						title: node.title + '二级', 
						key: 'NEW_' + generateGUID(), 
						level: node.level,
						projNumber: 0,
						props: {
							assistant: "",
							distinct_name_count: 0,
							domain1: node.props.domain1,
							domain2: node.props.domain2,
							domain3: node.props.domain3,
							domain_path: [node.props.domain1, node.props.domain2, node.props.domain3].join("-"),
							main: "",
							other: "",
							priority: "其他"
						},
						children: [{
							title: node.title + '三级', 
							key: 'NEW_' + generateGUID(), 
							level: Number(node.level) + 1,
							projNumber: 0,
							props: {
								assistant: "",
								distinct_name_count: 0,
								domain1: node.props.domain1,
								domain2: node.props.domain2,
								domain3: node.props.domain3,
								domain_path: [node.props.domain1, node.props.domain2, node.props.domain3].join("-"),
								main: "",
								other: "",
								priority: "其他"
							}
						}]
					},
				]
				break;
			case 2:
				node.props.domain3 = node.title + '三级';
				node.children = [
					{
						title: node.title + '三级', 
						key: 'NEW_' + generateGUID(), 
						level: Number(node.level) + 1,
						projNumber: 0,
						props: {
							assistant: "",
							distinct_name_count: 0,
							domain1: node.props.domain1,
							domain2: node.props.domain2,
							domain3: node.props.domain3,
							domain_path: [node.props.domain1, node.props.domain2, node.props.domain3].join("-"),
							main: "",
							other: "",
							priority: "其他"
						}
					}
				]
				break;
		}
		node.props.domain_path = [node.props.domain1, node.props.domain2, node.props.domain3].join("-")
		console.log(node)
		return;*/

        try {
          const { result } = await addTreeNode(params);
          if (result && result.includes('成功')) {
            // Message.success('节点添加成功！');
			refreshPage()
            // setTimeout(() => {
            //   window.location.reload();
            // }, 3000);
          } else {
            Message.error('添加失败: ' + (result || '未知错误'));
          }
        } catch (error) {
          console.error('调用添加节点API时出错:', error);
          // message.error('添加失败: ' + error.message);
        }
      }
    }
};

const updateEditedTitle = (node, event) => {
    state.data_editedTitle = event.target.value;
};

const handleKeyPress = (node, event) => {
	console.log('handleKeyPress :',event)
	if (event.key === 'Escape' || event.keyCode === 27) {
		event.stopPropagation();
		event.preventDefault();
		const parentNode = findParentNodeByTitle(state.gData, node.title);
		// console.log("parentNode :", parentNode)
		parentNode.children = parentNode.children.filter((child) => !child.editing);
	} else if (event.key === 'Enter' || event.keyCode === 13) {
		saveEditedNode(node, event)
	}
}

const getInputStyle = (value) => {
	if (value.includes('value') || !hasTwoChineseCharacters(value)) {
      return { borderColor: 'red' };
    }
    return {};
}

const insertNodeIntoTree = (gData, parentNodeKey) => {
    const parentNode = findNodeByTitle(gData, parentNodeKey);

    let randomNum = Math.floor(Math.random() * 100) + 1;
    let num = `待编辑节点-${randomNum}`;

    const newNode = { title: num, key: 'NEW_' + generateGUID(), editing: true, level: parseInt(parentNode?.level) + 1, priority: '其他' };

    // 如果没有提供父节点 key，则将新节点添加到根节点列表
    if (!parentNodeKey) {
      gData.push(newNode);
      return num;
    }

    for (const parent of gData) {
      if (parent.title === parentNodeKey) {
        // 找到父节点后，在其 children 数组中插入新节点
        if (!parent.children) {
          parent.children = [newNode];
        } else {
          parent.children.push(newNode);
        }
        return num;
      } else if (parent.children) {
        let result = insertNodeIntoTree(parent.children, parentNodeKey);
        // 如果返回值存在，则直接返回，避免继续遍历
        if (result) {
          return result;
        }
      }
    }
};

const resetEditingStatus = (node) => {
    if (Array.isArray(node)) {
      for (const item of node) {
        item.editing = false;

        if (item.children) {
          resetEditingStatus(item.children);
        }
      }
    }
};

const findParentNodeByTitle = (gData, node_key, nodeField = 'title') => {
    if (!node_key) {
      return null;
    }
    for (const parent of gData) {
      if (parent.children) {
        const childMatch = parent.children.find((child) => child[nodeField] === node_key);
        if (childMatch) {
          return parent;
        } else {
          // 递归检查子节点的子树
          const recursiveResult = findParentNodeByTitle(parent.children, node_key);
          if (recursiveResult) {
            return recursiveResult;
          }
        }
      }
    }
    return null; // 如果没有找到，则返回 null
};

const inputFocus = (node) => {
    nextTick(() => {
      setTimeout(() => {
        if (inputRefs.value[node.key]) {
          inputRefs.value[node.key].focus();
        }
      }, 0);
    });
};

const startEdit = (node, nodeType = null) => {
    // nodeType 可以是 null, 'child', 'sibling'
    resetEditingStatus(state.gData);

    // 如果是新节点，设置 props
    if (node.key.startsWith('NEW_')) {
      if (nodeType === 'child') {
        const parentNode = findParentNodeByTitle(state.gData, node.title);
        if (parentNode) {
          // 子节点继承父节点的 domain 属性
          node.props = {
            ...parentNode.props,
            industry_id: parentNode.props?.industry_id,
          };
        }
      } else if (nodeType === 'sibling') {
        // const siblingNode = findNodeByTitle(state.gData, node.title);
        // if (siblingNode) {
        //   // 根据节点级别设置 domain
        //   node.props = {
        //     domain1: node.level === 2 ? siblingNode.title : siblingNode.props?.domain1,
        //     domain2: node.level === 3 ? siblingNode.title : siblingNode.props?.domain2,
        //     domain3: node.level === 4 ? siblingNode.title : siblingNode.props?.domain3,
        //     industry_id: siblingNode.props?.industry_id,
        //   };
        // }
        const parentNode = findParentNodeByTitle(state.gData, node.title);
        if (parentNode) {
          // 子节点继承父节点的 domain 属性
          node.props = {
            ...parentNode.props,
            industry_id: parentNode.props?.industry_id,
          };
        }
      }
    }

    node.editing = true;
    state.data_editedTitle = node.title;
    state.editMode = true;

    let ele = document.querySelector('.ant-tooltip');
    if (ele) {
      ele.style.display = 'none';
    }

    inputFocus(node);
};

// 添加子节点
const addChildNode = (parentNode_key) => {
    let num = insertNodeIntoTree(state.gData, parentNode_key);

    let node = findNodeByTitle(state.gData, num);
    if (node) {
      nextTick(() => {
        startEdit(node, 'child'); // 指定为子节点
      });
    }

    state.expandedKeys.push(num);
    state.autoExpandParent = true;
};

const expandAndCollapse = (treeData, targetKey) => {
    const collapseAllExcept = (nodes, currentParent) => {
      nodes.forEach((node) => {
        if (node.key !== currentParent) {
          node.expanded = false;
          if (node.children) {
            collapseAllExcept(node.children, currentParent);
          }
        }
      });
    };

    // 遍历所有节点，将非当前节点父节点的子节点都设置为收缩状态
    collapseAllExcept(treeData, targetKey);

    // 展开当前节点的父节点
    const parentNode = findNodeByTitle(treeData, targetKey);
    if (parentNode) {
      parentNode.expanded = true;
    }
};

// 添加兄弟节点
const addSiblingNode = (node_key) => {
    const parentNode = findParentNodeByTitle(state.gData, node_key);
    let newNode;
    let randomNum = Math.floor(Math.random() * 100) + 1;
    let num = `待编辑节点-${randomNum}`;

    if (parentNode) {
      newNode = { title: num, key: 'NEW_' + generateGUID(), level: parseInt(parentNode?.level) + 1, priority: '其他' };
      parentNode.children.push(newNode);
    } else {
      newNode = { title: num, key: 'NEW_' + generateGUID(), level: 1, priority: '其他' };
      state.gData.push(newNode);
      expandAndCollapse(state.gData, null);
    }

    startEdit(newNode, 'sibling'); // 指定为兄弟节点
    state.autoExpandParent = true;
};

const deleteNodeNew = async (node_key, isMove = false) => {
	// console.log('deleteNode :', node_key);
	let parentNode = findParentNodeByTitle(state.gData, node_key);
	if (parentNode && parentNode?.children?.length === 1) {
		const isConfirmed = !isMove ? await new Promise((resolve) => {
	        Modal.confirm({
	          title: '确认删除',
	          content: '该节点是唯一的子节点，删除它将导致父节点也被删除。是否继续？',
	          okText: '确定',
	          cancelText: '取消',
	          onOk: () => resolve(true),
	          onCancel: () => resolve(false),
	        });
	    }) : true;
		// 如果用户取消，则中止删除操作
	    if (!isConfirmed) {
	        return;
	    }
		// 继续查到上级是否只有一个子节点
		while(parentNode?.title) {
			const lastTitle = parentNode.title;
			parentNode = findParentNodeByTitle(state.gData, lastTitle);
			if (parentNode?.children?.length !== 1) {
				parentNode.children = parentNode.children.filter((child) => child.title !== lastTitle);
				break;
			}
		}
	} else if (parentNode?.children?.length) {
		// 删除对应的节点
		parentNode.children = parentNode.children.filter((child) => child.title !== node_key);
	}
	// console.log("parentNode", parentNode)
}

const deleteNode = async (node_key) => {
    const parentNode = findParentNodeByTitle(state.gData, node_key);
    let deletedNode = null;

    // 检查是否是唯一的子节点
    if (parentNode && parentNode.children && parentNode.children.length === 1) {
      // 如果是唯一的子节点，显示确认对话框
      const isConfirmed = await new Promise((resolve) => {
        Modal.confirm({
          title: '确认删除',
          content: '该节点是唯一的子节点，删除它将导致父节点也被删除。是否继续？',
          okText: '确定',
          cancelText: '取消',
          onOk: () => resolve(true),
          onCancel: () => resolve(false),
        });
      });

      // 如果用户取消，则中止删除操作
      if (!isConfirmed) {
        return;
      }
    }

    if (parentNode) {
      // 找到要删除的节点
      deletedNode = parentNode.children.find((child) => child.title === node_key);

      // Remove the target node from its parent's children array
      parentNode.children = parentNode.children.filter((child) => child.title !== node_key);
    } else {
      // 如果是根节点，直接从gData中删除
      deletedNode = state.gData.find((item) => item.title === node_key);
      state.gData = state.gData.filter((item) => item.title !== node_key);
    }

	// return;

    // 如果找到了要删除的节点，记录它的key
    if (deletedNode && !deletedNode.key.startsWith('NEW_')) {
      // deleted.push({ path: obj1.path, key: obj1.key, title: titles, props: obj1.props });
      gDeletedNodes.push({ path: deletedNode?.path, key: deletedNode.key, title: deletedNode.title, props: deletedNode.props });

      // 调用后端API删除节点
      try {
        // 准备请求参数
        const payload = {
          domain1: deletedNode.props?.domain1 || deletedNode.title,
          domain2: deletedNode.props?.domain2 || '',
          domain3: deletedNode.props?.domain3 || '',
          level: deletedNode.level - 1 || 0,
        };

        // 调用删除API
        const { result } = await deleteTreeNode(payload);

        // 处理响应结果
        if (result.includes('成功')) {
          console.log('节点删除成功:', result.message);

          // API调用成功后重新加载页面
		  refreshPage()
        //   window.location.reload();
        } else {
          console.error('节点删除失败:', result?.message || '未知错误');
        }
      } catch (error) {
        console.error('调用删除API时出错:', error);
      }
    }

    state.autoExpandParent = true;
};

function editPriority() {
    state.formModel.priority = selected_node?.props?.priority || '';
    state.modal3Visible = true;
}

const onContextMenuClick = (treeKey, menuKey, data) => {
    console.log(`treeKey: ${treeKey}, menuKey: ${menuKey}`);
    if (menuKey === 'addChild') {
      addChildNode(data.title);
      setMode('edit');
      // expandAllNodes();
    } else if (menuKey === 'addSibling') {
      // resetEditingStatus(state.gData);
      addSiblingNode(data.title);
      setMode('edit');
    } else if (menuKey === 'delete') {
      // resetEditingStatus(state.gData);
      deleteNode(data.title);
      setMode('edit');
    } else if (menuKey === 'edit') {
      // resetEditingStatus(state.gData);
      let node = findNodeByTitle(state.gData, data.title);
      startEdit(node); // 不传或传入 false，表示是普通编辑
      setMode('edit');
    } else if (menuKey === 'editInfos') {
      // 新的合并菜单项
      // 找到选中的节点
      selected_node = findNodeByTitle(state.gData, data.title);

      // 设置表单模型的值
      state.formModel.main = selected_node.props?.main?.join?.(",") || [];
      state.formModel.assistant = selected_node.props?.assistant?.join?.(",") || [];
      state.formModel.other = selected_node.props?.other?.join?.(",") || [];
      state.formModel.priority = selected_node.props?.priority || "";

      // 显示对话框
      state.editInfoModalVisible = true;
      setMode('edit');
    } else if (menuKey === 'editPeople') {
      // resetEditingStatus(state.gData);
      selected_node = findNodeByTitle(state.gData, data.title);
      state.modal2Visible = true;
      state.formModel.main = selected_node.props?.main?.join?.(",") || [];
      state.formModel.assistant = selected_node.props?.assistant?.join?.(",") || [];
      state.formModel.other = selected_node.props?.other?.join?.(",") || [];
      setMode('edit');
    } else if (menuKey === 'editPriority') {
      selected_node = findNodeByTitle(state.gData, data.title);
      editPriority();
      setMode('edit');
    }
};

// 取消编辑
const onEditInfoCancel = () => {
    state.editInfoModalVisible = false;
    state.formModel = {
      main: [],
      assistant: [],
      priority: '',
    };
};

const handleEditInfoSubmit = async () => {
	if (!selected_node) {
		return;
	}
      // 更新节点的属性
    selected_node.props = {
        ...selected_node.props,
        main: state.formModel.main.join(","),
        assistant: state.formModel.assistant.join(","),
        other: state.formModel.other.join(","),
        priority: state.formModel.priority,
    };
	// console.log("====>gData :", state.gData)
	// state.editInfoModalVisible = false;
	// return;

      // 准备请求参数
    const payload = {
        domain1: selected_node.props?.domain1 || (selected_node.level === 2 ? selected_node.title : ''),
        domain2: selected_node.props?.domain2 || (selected_node.level === 3 ? selected_node.title : ''),
        domain3: selected_node.props?.domain3 || (selected_node.level === 4 ? selected_node.title : ''),
        level: selected_node.level - 1 || 0,
        main: state.formModel.main.join(","),
        assistant: state.formModel.assistant.join(","),
        other: state.formModel.other.join(","),
        priority: state.formModel.priority,
	};

    try {
        // 调用 API 更新节点信息
        const { result } = await updateTreeNodeInfo(payload);

        // 处理响应结果
        if (result.includes('成功')) {
          console.log('节点信息更新成功');
          refreshPage()
          state.editInfoModalVisible = false;
        } else {
          console.error('更新失败: ' + (result?.message || '未知错误'));
        }
    } catch (error) {
        console.error('调用更新API时出错:', error);
        // message.error('更新失败: ' + error.message);
    }
    
}

function getAllKeys(node) {
    if (node && node.children) {
      node.children.forEach((child) => getAllKeys(child));
    }
    state.allKeys.push(node?.key);
}

const collectLevelTwoKeys = (nodeList, keys = []) => {
    nodeList.forEach((node) => {
      if (node.level === 1) {
        keys.push(node.key);
      }
      if (node.children && node.children.length > 0) {
        collectLevelTwoKeys(node.children, keys);
      }
    });
    return keys;
};

const onExpandAll = () => {
    getAllKeys(state.gData[0]);
    const levelTwoKeys = collectLevelTwoKeys(state.gData);
    state.toggleExpand = !state.toggleExpand;
    if (!state.toggleExpand) {
      state.expandedKeys = Array.from(new Set(state.allKeys));
    } else {
      state.expandedKeys = levelTwoKeys;
    }
};

function generateGUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      let r = (Math.random() * 16) | 0,
        v = c == 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
}

function sortTree(treeData_x, orderMap_x) {
    // 排序函数，根据 orderMap 中的 nth 值进行排序
    function compare(a, b, level) {
      const orderA = orderMap_x[a.title] ? orderMap_x[a.title].nth : Infinity;
      const orderB = orderMap_x[b.title] ? orderMap_x[b.title].nth : Infinity;
      return orderA - orderB;
    }

    // 递归函数，对树的每一层进行排序
    function sortNode(node, level) {
      if (!node.children || node.children.length === 0) {
        return;
      }

      const nextLevel = level + 1;

      // 对当前节点的子节点进行排序
      node.children.sort((a, b) => compare(a, b, nextLevel));

      // 递归地对子节点进行排序
      for (const child of node.children) {
        sortNode(child, nextLevel);
      }
    }

    // 对树的根节点进行排序
    treeData_x.sort((a, b) => compare(a, b, 1));

    // 对树的每个根节点的子节点进行递归排序
    for (const node of treeData_x) {
      sortNode(node, 1);
    }

    return treeData_x;
}

function convertToTreeData2(dbObj) {
    const treeDataMap = {};
    let treeData = [
      {
        key: 'GY_ROOT',
        projNumber: 0,
        title: '',
        level: 1,
        props: {},
        children: [],
      },
    ];

    dbObj.forEach((item) => {
      const { domain1, domain2, domain3, industry_id, distinct_name_count } = item;

      if (domain1) {
        if (!treeDataMap[domain1]) {
          treeDataMap[domain1] = {
            key: generateGUID(),
            projNumber: 0,
            title: domain1,
            level: 2,
            props: item,
            children: [],
          };
          treeData[0]?.children?.push(treeDataMap[domain1]);
        }
      }

      if (domain2) {
        if (!treeDataMap[domain2]) {
          treeDataMap[domain2] = {
            key: generateGUID(),
            projNumber: 0,
            title: domain2,
            level: 3,
            props: item,
            children: [],
          };
          treeDataMap[domain1]?.children?.push(treeDataMap[domain2]);
        }
      }

      if (domain3) {
        if (!treeDataMap[domain3]) {
          treeDataMap[domain3] = {
            key: industry_id,
            projNumber: distinct_name_count,
            title: domain3,
            level: 4,
            props: item,
            children: [],
          };
          treeDataMap[domain2]?.children?.push(treeDataMap[domain3]);
        }
      }
    });

    // 计算父节点的 projNumber
    function calculateProjNumber(node) {
      if (node.children.length > 0) {
        node.projNumber = node.children.reduce((sum, child) => sum + calculateProjNumber(child), 0);
      }
      return node.projNumber;
    }

    treeData = sortTree(treeData, state.orderMap);

    // 从根节点开始计算所有节点的 projNumber
    calculateProjNumber(treeData[0]);

    return treeData;
}

function findParentKeysWithMatchingChildren(nodes, titlesArray) {
    const result = [];

    function traverse(node) {
      if (node.children && node.children.length > 0) {
        for (const child of node.children) {
          if (titlesArray.includes(child.title) && node.level === 3) {
            result.push(node.key);
          }
          traverse(child); // 递归遍历子节点，可能会有更多的匹配项
        }
      }
    }

    nodes.forEach(traverse);

    return result;
}
const getData = async () => {
	state.loading = true;
	try {
		const res = await reportFilterBarChart({
			assigner: state.selectedPeopleTags.length ? state.selectedPeopleTags.join(",") : "",
			priority: state.selectedPriorityTags.length ? state.selectedPriorityTags.join(",") : "",
		});
		if (res?.result?.domain) {
			state.distinctNames = sumDistinctNamesByPerson(res.result.domain);
			state.gData = convertToTreeData2(res.result.domain);console.log('--------->', state.gData)
			let parentKeys;
		    let domain3 = res.result.domain.map((obj) => obj.domain3).filter((obj) => obj);
		    parentKeys = findParentKeysWithMatchingChildren(state.gData, domain3);
		    // or match domain3 with level 4 and set others level4 to be invisible?

		    state.expandedKeys = parentKeys;
		    state.autoExpandParent = true;
		}
	} catch(e) {
	}
	state.loading = false;
}

let dataList = [];

const generateList = (data) => {
    for (let i = 0; i < data.length; i++) {
      const node = data[i];
      const key = node.key;
      dataList.push({ key, title: node.title });
      if (node.children) {
        generateList(node.children);
      }
    }
};

const onSearch = async () => {
	setMode('search');

    dataList = [];

	let response = await reportFilterBarChart({});
    state.distinctNames = sumDistinctNamesByPerson(response.result.domain);
    state.gData = convertToTreeData2(response.result.domain);
    generateList(state.gData);
    const expanded = dataList
      .map((item) => {
        if (item.title.indexOf(state.searchValue) > -1) {
          return getParentKey(item.key, state.gData);
        }
        return null;
      })
      .filter((item, i, self) => item && self.indexOf(item) === i);

    state.expandedKeys = expanded;

    // expandAllNodes();

    state.autoExpandParent = true;
}

function getTitlesFromKeys(treeData, keysToFind) {
    const titles = [];

    function traverse(nodes) {
      nodes.forEach((node) => {
        if (keysToFind.includes(node.key)) {
          titles.push(node.title);
        }
        if (node.children) {
          traverse(node.children);
        }
      });
    }

    traverse(treeData);
    return titles;
}

function onDataProvided() {

    if (state.globalMode === 'click') {
      return null;
    }
    if (state.globalMode === 'search') {
      return {
		titles: getTitlesFromKeys(state.gData, state.expandedKeys).join(',')
	  };
    }
    if (state.globalMode === 'filter') {
      if (state.selectedPriorityTags.length > 0 || state.selectedPeopleTags.length > 0) {
        let req = {
			assigner: state.selectedPeopleTags.join(','),
			priority: state.selectedPriorityTags.join(',')
		};
        // await handleTreeResult(req);
        return req;
      } else {
        return null;
      }
    }
	return null;
}

const refreshPage = () => {
	
	getIndustrFieldValues('domain_nth_xhwe').then(res => {
		if (res?.result) {
			const orderMap = {}
			for (const order of res.result) {
				orderMap[order.name] = {
			        nth: order.nth === 0 ? 100000 : order.nth,
			        level: order.level,
			    };
			}
			state.orderMap = orderMap;
		}
	})

	getData()
}

const handleKeyDown = (e) => {
    console.log('----handleKeyDown', e)
}
onMounted(async () => {
	getToolTip().then(res => {
		state.tooltips = res.result || []
	})
	await userStore.getUserList();

	if (userStore.gUserRoles.includes('mgr') && userStore.gUserRoles.includes('admin')) {
		state.isMgr = false
	} else {
		state.isMgr = true
	}

	refreshPage()
	// 初始绑定
	bindAllDragStart();
	// 监听 DOM 变化
	const tree = document.querySelector('.ant-tree');
	if (tree) {
		observer = new MutationObserver(() => {
		  bindAllDragStart();
		});
		observer.observe(tree, { childList: true, subtree: true });
		document.addEventListener('dragstart', handleNativeDragStart, true);
	}
});
onBeforeUnmount(() => {
  if (observer) observer.disconnect();
  document.querySelectorAll('.ant-tree-node-content-wrapper').forEach(node => {
    node.removeEventListener('dragstart', handleNativeDragStart, true);
  });
  document.removeEventListener('dragstart', handleNativeDragStart, true);
});

</script>
<style lang="less" scoped>
.industry-wrap {
	height: 100%;
	display: flex;
	flex-direction: column;
	.drag-tooltip {
	    position: fixed;
	    padding: 8px 12px;
	    border-radius: 4px;
	    font-size: 14px;
	    z-index: 9999;
	    pointer-events: none;
	    white-space: nowrap;
	    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
	    transition: opacity 0.2s;
	    background-color: #167FFF;
	    color: white;
	    border: 1px solid #096dd9;
	  }

	/* 所有类型都使用主色调蓝色 */
	.drag-tooltip-move,
	.drag-tooltip-merge,
	.drag-tooltip-child,
	.drag-tooltip-invalid {
	    background-color: #167FFF;
	    color: white;
	    border: 1px solid #096dd9;
	}
	.header {
		flex-shrink: 0;
		flex-grow: 0;
		padding: 0.5rem 0.5rem 0px;
		> div {
			display: flex;
			align-items: center;
			.first_introduction_text {
				position: relative;
				width: 60px;
				font-size: 13.5px;
				line-height: 26px;
				margin-right: 11px;
				color: rgba(0, 0, 0, 0.7);
				.info-circle {
				    color: #167FFF; 
					cursor: pointer; 
					position: absolute;
					top: 4px; 
					right: -6px;
					font-size: 10px
				}
			}

			.divider {
				margin-right: 12px; 
				margin-left: 12px;
				background-color: rgba(215, 215, 215, 1);
			    width: 1px;
			    height: 20px;
			}

			:deep(.icon-wrapper), .icon-wrapper {
				height: 100%;
				line-height: 30px;
    			color: #888888;
				text-align: center;
				cursor: pointer;
				:deep(svg) {
					font-size: 18px;
				}
				svg {
					font-size: 18px;
				}
				&.mr {
					margin-right: 12px;
				}
			}

			.text-wrapper_9 {
				background-color: inherit;
				color:  #555;
			    border-radius: 4px;
			    height: 26px;
			    margin-left: 16px;
			    width: 75px;
				display: flex;
			    justify-content: center;
			    align-items: center;
				font-size: 13px;
				&.checked {
					color: rgb(22, 119, 255);
				}
				&.genjin {
					background-color: #ffe6da;
				}
				&.guanzhu {
					background-color: #E1F0F9;
				}
				&.touhou {
					background-color: rgba(220, 229, 250, .7);
				}
			}
		}
	}

	.horizontal-line {
		width: 100%;
	    height: 1px;
	    background-color: rgba(0, 0, 0, 0.15);
	    margin: 0 auto;
		margin-top: 0.5rem;
	    margin-bottom: 30px;
	}

	.industry-contariner {
		display: grid;
	    grid-template-columns: 1fr 1.2fr;
	    grid-gap: 0 30px;
	    padding: 0 8px;
		flex: 1;
		overflow: hidden;
		.left-half {
			width: 100%;
			height: 100%;
			overflow: hidden;
			display: flex;
			flex-direction: column;
			.filter-group {
				width: 100%;
				padding-right: 20px;
				flex-shrink: 0;
				flex-grow: 0;
				// width: 301px;
			    height: 32px;
			    margin-bottom: 10px;
			    margin-left: 2px;
				display: flex;
				flex-direction: row;
				align-items: center;
				.custom-icon {
					font-size: 18px;
					color: #888888;
				}
				:deep(.custom-icon) {
					font-size: 18px;
					color: #888888;
				}
				:deep(.ant-input-search-button) {
					border-radius: 0px 2px 2px 0px;
				}
			}

			.tree-container {
			    width: 100%; /* 搜索容器和树容器宽度100%，即左半部分的宽度 */
				height: 100%;
				flex: 1;
			    overflow-y: auto;
				:deep(.ant-tree-switcher-noop) {
					display: none;
				}

				.text_first_level, .text_third_level {
					font-size: 13.5px;
					font-weight: 400;
					color: #555;
				}

				.tab-text-col, .tab-text-col-guanzhu-tree {
				    font-weight: 400;
				    color: #555;
					span {
						color: #555;
					}
				}

				.text-wrapper_101 {
				    display: inline-flex;
				    flex-direction: row;
				    border-radius: 4px;
				    height: 22px;
				    min-width: 60px;
				    padding: 0 8px 0 0px;
				    margin-left: 6px;
				    align-items: center;
				    white-space: nowrap;
				    background-color: rgba(255, 255, 255, 1);
					&.checked {
						color: rgb(22, 119, 255);
					}

				}

				.text-wrapper_18 {
					display: inline-flex;
				    flex-direction: row;
				    background-color: #ffe6da;
				    border-radius: 4px;
				    height: 26px;
				    min-width: 60px;
				    padding: 0 8px 0 0px;
				    margin-left: 6px;
				    align-items: center;
				    white-space: nowrap;
					&.checked {
						color: rgb(22, 119, 255);
					}
				}
				
				.text-wrapper_19 {
					display: inline-flex;
				    flex-direction: row;
				    background-color: #E1F0F9;
				    border-radius: 4px;
				    height: 26px;
				    min-width: 60px;
				    padding: 0 8px 0 0px;
				    margin-left: 6px;
				    align-items: center;
				    white-space: nowrap;
					&.checked {
						color: rgb(22, 119, 255);
					}
				}

				.touhou_item_tree_node {
					background-color: rgba(220, 229, 250, .7);
				    color: #555;
				    height: 22px;
				}

				.text_30 {
					height: 22px;
				    overflow-wrap: break-word;
				    color: rgba(34, 34, 34, 1);
				    font-size: 13px;
				    font-weight: 400;
				    text-align: left;
				    white-space: nowrap;
				    line-height: 20px;
					&.checked {
						color: rgb(22, 119, 255);
					}
				}

				.text_32 {
					height: 22px;
				    overflow-wrap: break-word;
				    color: rgba(34, 34, 34, 1);
				    font-size: 13px;
				    font-weight: 400;
				    text-align: left;
				    white-space: nowrap;
				    line-height: 20px;
					&.checked {
						color: rgb(22, 119, 255);
					}
				}

				.text_34 {
					font-size: 12px;
				    font-weight: 400;
				    text-align: left;
				    white-space: nowrap;
				    line-height: 12px;
				    margin-top: 8px;
				    margin-left: 8px;
					overflow-wrap: break-word;
				}

				.text_36 {
					overflow-wrap: break-word;
					font-size: 13px;
				    font-weight: 400;
				    text-align: left;
				    white-space: nowrap;
				    line-height: 20px;
					&.checked {
						color: rgb(22, 119, 255);
					}
				}

				.genjin_checked_style {
					&.checked {
						color: #167FFF;
						background-color: #FFE6DA;
					}
				}
				.node.checked {
					border-radius: 4px;
					font-size: 13.5px;
					font-style: normal;
				    font-weight: 400;
				    color: #167FFF;
				}
				
			}
		}
		.right-half {
			width: 100%;
			height: 100%;
    		padding-top: 3px;
		}
	}
}
:deep(.ant-tree) {
	.ant-tree-node-content-wrapper {
		&:hover {
			background-color: transparent;
		}
		&.ant-tree-node-selected {
			background-color: transparent;
		}
		
	}
}

</style>