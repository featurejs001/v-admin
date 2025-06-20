<template>
	<div>
		<a-dropdown>
			<a-tooltip placement="top">
	    		<template #title>
					<span>导入</span>
				</template>
				<ImportOutlined />
			</a-tooltip>
			<template #overlay>
				<a-menu @click="onImportClick">
			        <a-menu-item v-for="(title, index) in state.menuMaps" :key="index">{{ title }}</a-menu-item>
			    </a-menu>
			</template>
		</a-dropdown>
		<a-modal
		 :class="['sys-modal', state.isFullscreeen?'full-modal':'']" 
		 v-model:open="state.open"
		 :confirmLoading="state.loading"
		 :width="'520px'"
		 centered
		 :title="state.menuMaps[state.importType]"
		 @ok="handleOk" 
		 @cancel="handleCancel" 
		 >
			<div class="model-container">
				<div style="padding: 30px 30px 0;width: 100%;">
					<a-steps :current="state.step" :items="state.stepItems" style="width: 100%;" class="steps"></a-steps>
				</div>
				<div style="margin: 30px 0" class="action-container">
			      <a-upload v-model:file-list="state.fileList" :customRequest="customUpload" :show-upload-list="true">
			        <a-button type="primary">
			          <upload-outlined />
			          上传
			        </a-button>
			      </a-upload>
			      <template v-if="state.step === 0">
			        <span>预处理中...</span>
			      </template>
			      <template v-else-if="state.step === 1">
			        <span>验证中...</span>
			      </template>
			      <template v-else-if="state.step === 2">
			        <span>导入中...</span>
			      </template>
			      <a-spin v-if="state.loading" />
			    </div>
				<div v-if="state.errorMessage" style="color: red">{{ state.errorMessage }}</div>
				<div style="margin-top: 20px">
					<a-button type="link" @click="downloadTemplate">点击下载模版</a-button>
				</div>
			</div>
		</a-modal>
	</div>
</template>
<script setup>
import { Modal } from 'ant-design-vue';
import { ImportOutlined, UploadOutlined } from '@ant-design/icons-vue';
import { h, reactive, watch, defineEmits } from 'vue';
import { 
	preFetchProjectData, 
	preFetchInvestmentData, 
	preFetchMemoAndLinkData, 
	preFetchThirdProjectData,
} from '@/utils/projectCenterProcess.ts';
import { 
	uploadData, 
	verifyProject,
	importProjectFromLocalFile,
	importInvestmentFromLocalFile,
	importMemoFromLocalFile,
	importThirdProjectFromLocalFile
} from '@/api/industry';

const emits = defineEmits(['success'])

const state = reactive({
	importType: '',
	open: false,
	loading: false,
	step: -1,
	stepItems: [
		{
			title: '预处理',
		},
		{
			title: '验证',
		},
		{
			title: '导入',
		}
	],
	menuMaps: {
		'1': '导入项目表',
		'2': '导入投资事件表',
		'3': '导入备注和飞书链接表',
		'4': '导入第三方项目表',
	},
	fileList: [],
	errorMessage: ''
})

const onImportClick = ({ key }) => {
	state.importType = key;
	state.errorMessage = '';
	state.fileList = [];
	state.open = true;
    // console.log("key", key)
	// switch(key) {
	// 	
	// }
}

const uploadFileHook = async (file) => {
	console.info(file);

	const formData = new FormData();
	formData.append('file', file);

	return await uploadData(formData);
}

const getTemplateData = () => {
	const data = {};
	switch(state.importType) {
		case '1':
			// 导入项目表
			data.fileName = "光跃项目模版.xlsx"
			data.templateUrl = "https://gy-static-resource.oss-cn-beijing.aliyuncs.com/%E5%85%89%E8%B7%83%E9%A1%B9%E7%9B%AE%E6%A8%A1%E7%89%88.xlsx"
			data.preFetchApi = preFetchProjectData;
			data.uploadApi = uploadFileHook;
			data.validateType = 'project';
			data.importApi = importProjectFromLocalFile;
			break;
		case '2':
			// 导入投资事件表
			data.fileName = "光跃投资事件模版.xlsx"
			data.templateUrl = "https://gy-static-resource.oss-cn-beijing.aliyuncs.com/%E5%85%89%E8%B7%83%E6%8A%95%E8%B5%84%E4%BA%8B%E4%BB%B6%E6%A8%A1%E7%89%88.xlsx"
			data.preFetchApi = preFetchInvestmentData;
			data.uploadApi = uploadFileHook;
			data.validateType = 'investment';
			data.importApi = importInvestmentFromLocalFile;
			break;
		case '3':
			// 导入备注和飞书链接表
			data.fileName = "光跃项目备注和飞书链接模版.xlsx"
			data.templateUrl = "https://gy-static-resource.oss-cn-beijing.aliyuncs.com/%E5%85%89%E8%B7%83%E9%A1%B9%E7%9B%AE%E5%A4%87%E6%B3%A8%E9%93%BE%E6%8E%A5%E6%A8%A1%E7%89%88.xlsx"
			data.preFetchApi = preFetchMemoAndLinkData;
			data.uploadApi = uploadFileHook;
			data.validateType = 'memo';
			data.importApi = importMemoFromLocalFile;
		case '4':
			// 导入第三方项目表
			data.fileName = '第三方项目表模版.xlsx'
			data.templateUrl="https://gy-static-resource.oss-cn-beijing.aliyuncs.com/%E7%AC%AC%E4%B8%89%E6%96%B9%E9%A1%B9%E7%9B%AE%E4%BF%A1%E6%81%AF%E5%AF%BC%E5%85%A5%E6%A8%A1%E6%9D%BF.xlsx"
			data.preFetchApi = preFetchThirdProjectData;
			data.uploadApi = uploadFileHook;
			data.validateType = 'third_project';
			data.importApi = importThirdProjectFromLocalFile;
			break;
		default:
			break;
	}
	return data;   
}

const downloadTemplate = () => {
	// 下载模版
	const data = getTemplateData()
	let templateUrl = data.templateUrl;
	let fileName = data.fileName;
	
	const link = document.createElement('a');
	link.style.display = 'none';
	link.setAttribute('href', templateUrl); // window.URL.createObjectURL(blob);
    link.setAttribute('download', fileName || 'template.pdf');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // fetch(templateUrl)
    //   .then((response) => {
    //     if (!response.ok) throw new Error('网络响应错误');
    //     return response.blob();
    //   })
    //   .then((blob) => {
        // link.href = templateUrl; // window.URL.createObjectURL(blob);
        // link.download = fileName || 'template.pdf';
        // document.body.appendChild(link);
        // link.click();
        // document.body.removeChild(link);
    //   })
    //   .catch((error) => {
    //     console.error('下载失败:', error);
    //   });
}

const handleCancel = () => {
	state.fileList = [];
	state.step = -1;
	state.errorMessage = null;
	state.open = false;
}

const handleOk = () => {
	handleCancel()
}

// 自定义上传函数
const customUpload = async (options) => {
	const { file, onSuccess, onError } = options;

	try {
	  // 将文件添加到文件列表
	  state.fileList = [{ uid: '1', name: file.name, status: 'uploading', originFileObj: file }];
	  onSuccess(file);

	  // 开始预处理步骤
	  state.step = 0;
	} catch (error) {
	  state.errorMessage = '文件处理失败';
	  onError(new Error('File processing failed'));
	}
};

const updateStepStatus = () => {
	state.stepItems = state.stepItems.map((item, index) => ({
	  ...item,
	  status: index === state.step ? 'process' : index < state.step ? 'finish' : 'wait',
	}));
};

// 上传文件到服务器
const uploadFile = async (file) => {
    state.loading = true;
    state.errorMessage = null;

	const { uploadApi } = getTemplateData();

    try {
      // 上传文件并获取响应
      const response = await uploadApi(file);
      const { result: fileName } = response; // 从响应中提取文件名

      // 存储文件名，用于后续步骤
      if (state.fileList && state.fileList.length > 0) {
        state.fileList[0] = {
          ...state.fileList[0],
          fileName,
        };
      }

      return fileName;
    } catch (error) {
      state.errorMessage = '上传失败';
      throw error;
    } finally {
      state.loading = false;
    }
};

// 预处理函数
const performPreFetch = async (file) => {
	const { preFetchApi } = getTemplateData();
	if (!preFetchApi) {
	  // 如果没有提供预处理API，直接跳到验证步骤
	  state.step = 1;
	  return;
	}

	state.loading = true;
	state.errorMessage = null;

	try {
	  // 执行预处理
	  await preFetchApi(file.originFileObj || file);

	  // 预处理成功后，上传文件到服务器
	  await uploadFile(file.originFileObj || file);

	  // 上传成功，进入验证步骤
	  state.step = 1;
	} catch (error) {
	  state.errorMessage = '预处理失败';
	  // 预处理失败，回到初始状态
	  state.step = -1;
	  state.loading = false;
	} finally {
	  state.loading = false;
	}
};

async function validateApi(file) {
    console.log(file);

	const { validateType } = getTemplateData();
    const result = await verifyProject({
		filename: file,
		type: validateType
	});

    // 检查响应是否失败
    if (validateType === 'project' && result && result.success === false && result.message.includes('(2)验证失败')) {
      // 使用 createConfirmSync 创建确认对话框
      const confirmResult = await Modal.confirm({
		centered: true,
        title: '验证失败',
        content: result.message,
        okButtonProps: { style: { display: 'none' } },
        cancelText: '终止导入',
      });

      // 如果用户选择了"立刻终止"（返回false），则返回一个带有终止标记的结果
      if (!confirmResult) {
        return {
          ...result,
          terminated: true,
        };
      }
    } else if (result && result.success === false) {
      // 使用 createConfirmSync 创建确认对话框
      const confirmResult = await Modal.confirm({
        title: '验证失败',
        content: result.message,
        okText: '继续',
        cancelText: '终止导入',
      });

      // 如果用户选择了"提前终止"（返回false），则返回一个带有终止标记的结果
      if (!confirmResult) {
        return {
          ...result,
          terminated: true,
        };
      }
    }

    return result;
}

// 验证函数
const validate = async () => {
    if (!state.fileList || state.fileList.length === 0 || !state.fileList[0].fileName) {
      state.errorMessage = '没有可验证的文件';
      state.step = -1; // 返回初始状态
      return;
    }

    state.loading = true;
    try {
      const result = await validateApi(state.fileList[0].fileName); // Pass the filename

      // 检查是否有 terminated 标记，表示用户选择了"立刻终止"
      if (result && result.terminated === true) {
        state.errorMessage = '用户已终止验证过程';
        // state.open = false; // 发送关闭事件
        state.step = -1; // 返回初始状态
        return;
      }

      state.step = 2;
    } catch (error) {
		console.log("error :", error)
	  state.loading = false;
      state.errorMessage = '验证失败.';
      state.step = -1; // 返回初始状态
    } finally {
      state.loading = false;
    }
};

// 导入函数
const importData = async () => {
    if (!state.fileList || state.fileList.length === 0 || !state.fileList[0].fileName) {
      state.errorMessage = '没有可导入的文件';
      state.step = -1; // 返回初始状态
      return;
    }

    state.loading = true;
    try {
	  const { importApi } = getTemplateData();
      const response = await importApi({
		fileName: state.fileList[0].fileName
	  }); // Pass the filename
      state.step = 3; // 完成所有步骤

      // 关闭当前对话框
      handleCancel();

      // 显示导入成功的消息对话框
      Modal.success({
        title: '导入成功',
        content: response.result || '数据导入成功',
        okText: '确定',
      });

      // 触发成功事件，可以传递导入结果
      emits('success', response);
    } catch (error) {
      state.errorMessage = '导入失败';
      state.step = -1; // 返回初始状态
    } finally {
      state.loading = false;
    }
};

 // 监听 step 的变化
watch(() => state.step, () => {
	updateStepStatus();
	if (state.step === 0) {
	  // 预处理步骤
	  if (state.fileList && state.fileList.length > 0) {
	    performPreFetch(state.fileList[0]);
	  }
	} else if (state.step === 1) {
	  // 验证步骤
	  validate();
	} else if (state.step === 2) {
	  // 导入步骤
	  importData();
	}
});

</script>
<style lang="less" scoped>
.model-container {
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	.steps {
		width: 100%;
		:deep(.ant-steps-item) {
			.ant-steps-item-icon {
			    width: 28px;
			    height: 28px;
			    line-height: 28px;
			    border-radius: 28px;
				// background-color: #ffffff;
				// border-color: rgba(0, 0, 0, 0.25);
				// .ant-steps-icon {
				// 	color: rgba(0, 0, 0, 0.88);
				// }
			}

			&.ant-steps-item-wait {
				.ant-steps-item-icon {
					background-color: #ffffff;
					border-color: rgba(0, 0, 0, 0.25);
					.ant-steps-icon {
						color: rgba(0, 0, 0, 0.88);
					}
				}
			}
			
			.ant-steps-item-title {
				color: rgba(0, 0, 0, 0.88);
			}
		}
	}

	:deep(.ant-upload-wrapper) {
		display: flex;
		flex-direction: column;
		align-items: center;
	}
	:deep(.ant-btn-link) {
		border: none;
	}
}
</style>