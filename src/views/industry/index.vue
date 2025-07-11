<template>
	<div class="industry-wrap">
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
	                <span>{{ tag }}</span><span v-if="Number(state.distinctNames[tag]) > 0">({{ state.distinctNames[tag] }})</span>
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
						<RedoOutlined class="icon-wrapper" />
					</a-tooltip>
				</div>
			</div>
			<div>
				<div class="first_introduction_text">负责人</div>
				<div style="display: flex; align-items: center; flex-grow: 1">
					<a-checkable-tag
						v-for="tag in state.peopleTags"
						:key="tag"
		                :checked="state.selectedPeopleTags.includes(tag)"
		                :class="['text-wrapper_9 qita', state.selectedPeopleTags.includes(tag) ? 'checked' : '', state.globalMode === 'edit' ? 'disabled' : '']"
		                @change="(checked) => handlePeopleChange(tag, checked)"
		              >
		                {{ tag }}
	              </a-checkable-tag>
				</div>
			</div>
			<div class="horizontal-line"></div>
		</div>
		
		<div class="industry-contariner">
			<div class="left-half">
				<div class="filter-group">
					<a-input-search
			            v-model:value="state.searchValue"
			            enter-button
			            placeholder="输入关键字搜索"
			            style="width: 300px; flex: 1;"
			            @search="onSearch"
			            :class="state.globalMode === 'edit' ? 'disabled' : ''"
			          />
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
				</div>
				<div class="tree-container">
		        <a-tree
		            ref="atree"
		            :auto-expand-parent="state.autoExpandParent"
		            :expanded-keys="state.expandedKeys"
		            :show-icon="false"
		            :show-line="true"
		            :tree-data="state.gData"
		            block-node
		            class="draggable-tree"
		            draggable
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
		              <span @click="handleTagClick(data)" @dblclick="handleNodeDblClick(data)">
		                <a-dropdown :trigger="['contextmenu']">
						  
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
		                        :value="data_editedTitle"
		                        size="small"
		                        @blur="saveEditedNode(data, $event)"
		                        @input="updateEditedTitle(data, $event)"
		                        @keydown.stop="handleKeyPress(data, $event)"
		                        :style="getInputStyle(data_editedTitle)"
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
import { h, reactive, onMounted, ref, computed } from "vue";
import { getToolHint } from "@/utils/helper"
import { getToolTip, getIndustrFieldValues, reportFilterBarChart } from '@/api/industry'
import { PeopleOrder, prioritiesOrder } from "@/utils/util1";
import { usePermission } from "@/utils/usePermission.ts";
import FullScreen from "@/components/common/fullScreen.vue";
import { useRouter } from "vue-router";
import BarChart from "./components/BarChart.vue"; 

const router = useRouter();

const { hasPermission } = usePermission();

let selectItem = null;
let selected_node = null;
const inputRefs = ref({});
const state = reactive({
	tooltips: [],
	priorityTags: Object.keys(prioritiesOrder),
	selectedPriorityTags: ['跟进'],
	peopleTags: Object.keys(PeopleOrder),
	selectedPeopleTags: [],
	globalMode: 'filter',
	searchValue: '',
	selected_node_title: '',
	orderMap: {},
	distinctNames: {},
	toggleShowProjectNumber: true,
	toggleShowAssigner: true,
	toggleExpand: false,
	autoExpandParent: true,
	expandedKeys: [],
	gData: [],
	allKeys: []
})

const barTags = computed(() => {
	return [...state.selectedPriorityTags, ...state.selectedPeopleTags, state.selected_node_title].filter(v => v)
})

const barKey = computed(() => {
	return barTags.value.join(',')
})

function setMode(mode) {
    state.globalMode = mode;
    if (mode === 'click') {
      // state.selected_node_title = random(100000);
      // state.selectedPriorityTags = [];
      // state.selectedPeopleTags = [];
    }
    if (mode === 'search') {
      state.selectedPriorityTags = [];
      state.selectedPeopleTags = [];
      // state.selected_node_title = random(100000);
    }
    if (mode === 'filter') {
      state.searchValue = '';
      state.selected_node_title = '';
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

const toConfig = () => {}

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

// 允许拖放的判断函数
const allowDrop = (info) => {
    // 在拖放过程的某些阶段，info可能不完整，我们默认允许拖放
    if (!info) {
      return true; // 如果info不存在，允许拖放，使用默认行为
    }

    // 如果dragNode或node不存在，允许拖放，使用默认行为
    if (!info.dragNode || !info.node) {
      return true;
    }

    // 如果level属性不存在，允许拖放，使用默认行为
    if (typeof info.dragNode.level === 'undefined' || typeof info.node.level === 'undefined') {
      return true;
    }

    const dragLevel = info.dragNode.level;
    const targetLevel = info.node.level;
    const isSameLevel = dragLevel === targetLevel;

    // 如果是同级节点，允许任何拖放模式（间隙或重叠）
    if (isSameLevel) {
      return true;
    }

    // 如果不是同级节点，检查特殊情况

    // Level 3 节点可以拖放到 Level 2 节点（成为其子节点）
    if (dragLevel === 3 && targetLevel === 2) {
      // 强制设置为非间隙模式，表示成为子节点
      return { dropToGap: false };
    }

    // Level 4 节点可以拖放到 Level 3 节点（成为其子节点）
    if (dragLevel === 4 && targetLevel === 3) {
      // 强制设置为非间隙模式，表示成为子节点
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
    const selectedNodeTitles = selectedNodes.map((node) => node.title).join(',');
    state.selected_node_title = selectedNodeTitles;

    // state.selected_node_title = info.title;
    if (state.globalMode === 'edit') {
      return; // ignore
    }
    setMode('click');
 };

// 拖动开始时的处理
const onDragStart = (info) => {
    // 保存当前拖动的节点信息
    currentDragNode.value = info.node;
    currentDragNodeLevel.value = info.node?.level || info.node?.dataRef?.level;

    // 重置拖放模式状态
    currentDropMode.value = {
      dropToGap: true,
      dropPosition: 0,
      targetNode: null,
    };

    // 初始化提示框状态
    dragTooltip.value = {
      visible: false,
      x: 0,
      y: 0,
      type: '',
      message: '',
    };

    // 添加鼠标移动事件监听器，用于更新提示框位置
    document.addEventListener('mousemove', updateTooltipPosition);

    console.log('拖动开始 - 保存拖动节点信息:', '节点:', currentDragNode.value, '级别:', currentDragNodeLevel.value);
};

  // 更新提示框位置的函数
const updateTooltipPosition = (event) => {
    if (dragTooltip.value.visible) {
      // 设置提示框位置在鼠标右下方15px处
      dragTooltip.value.x = event.clientX + 15;
      dragTooltip.value.y = event.clientY + 15;
    }
};

const onDragEnter = () => {}

const onDrop = () => {}

const onDragEnd = () => {}

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
      return ` ${data.props?.main?.split(',')?.join('、') || '-'}/${data.props?.assistant?.split(',')?.join('、') || '-'}`;
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

const saveEditedNode = () => {}

const updateEditedTitle = () => {}

const handleKeyPress = () => {}

const getInputStyle = () => {}

const onContextMenuClick = () => {}


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
	const res = await reportFilterBarChart({
		assigner: state.selectedPeopleTags.length ? state.selectedPeopleTags.join(",") : "",
		priority: state.selectedPriorityTags.length ? state.selectedPriorityTags.join(",") : "",
	});
	if (res?.result?.domain) {
		state.distinctNames = sumDistinctNamesByPerson(res.result.domain);
		state.gData = convertToTreeData2(res.result.domain);
		let parentKeys;
	    let domain3 = res.result.domain.map((obj) => obj.domain3).filter((obj) => obj);
	    parentKeys = findParentKeysWithMatchingChildren(state.gData, domain3);
	    // or match domain3 with level 4 and set others level4 to be invisible?

	    state.expandedKeys = parentKeys;
	    state.autoExpandParent = true;
	}
}

const onSearch = () => {}

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
		titles: getTitlesFromKeys(gData.value, expandedKeys.value).join(',')
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
}

onMounted(() => {
	getToolTip().then(res => {
		state.tooltips = res.result || []
	})

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
})
</script>
<style lang="less" scoped>
.industry-wrap {
	height: 100%;
	display: flex;
	flex-direction: column;
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
				width: 301px;
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

				.tab-text-col, .tab-text-col-guanzhu-tree {
				    font-weight: 400;
				    color: #555;
				}

				.text-wrapper_101[data-v-1842a936] {
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
				}

				.text_36 {
					overflow-wrap: break-word;
					font-size: 13px;
				    font-weight: 400;
				    text-align: left;
				    white-space: nowrap;
				    line-height: 20px;
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
			color: var(--active-color);
		}
	}
}
</style>