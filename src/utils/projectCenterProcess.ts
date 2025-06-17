/**
 * ProjectCenter 预处理函数
 * 用于处理Excel文件上传前的预处理
 */

/**
 * 项目表预处理函数
 * @param file 上传的文件
 */
export async function preFetchProjectData(file: File) {
  console.log('预处理项目数据');

  try {
	// 导入预处理工具
	const { preProcessExcelFile } = await import('@/utils/excelPreProcessor');

	// 定义预期的表头
	const expectedHeaders = ['三级赛道', '项目', '项目主体', '项目阶段', '跟进阶段', '融资窗口开始时间', '融资窗口结束时间', '其他人', '别名'];

	// 执行预处理
	const result = await preProcessExcelFile(file, {
	  expectedHeaders,
	  keyColumnIndex: 1, // 项目名称是关键列，索引为0
	  ignoreEmptyTrailingRows: true,
	  checkUtf8Encoding: true,
	});

	if (!result.success) {
	  return Promise.reject(new Error(result.errorMessage));
	}

	console.log('项目数据解析结果:', result.data);

	return Promise.resolve(result.data);
  } catch (error) {
	console.error('解析Excel文件失败:', error);
	return Promise.reject(error);
  }
}

/**
 * 投资事件表预处理函数
 * @param file 上传的文件
 */
export async function preFetchInvestmentData(file: File) {
  console.log('预处理投资事件数据');

  try {
	// 导入预处理工具
	const { preProcessExcelFile } = await import('@/utils/excelPreProcessor');

	// 定义预期的表头
	const expectedHeaders = ['项目', '投资时间', '轮次', '金额', '投资方'];

	// 执行预处理
	const result = await preProcessExcelFile(file, {
	  expectedHeaders,
	  keyColumnIndex: 0, // 项目名称是关键列，索引为0
	  ignoreEmptyTrailingRows: true,
	  checkUtf8Encoding: true,
	});

	if (!result.success) {
	  return Promise.reject(new Error(result.errorMessage));
	}

	console.log('投资事件数据解析结果:', result.data);

	return Promise.resolve(result.data);
  } catch (error) {
	console.error('解析Excel文件失败:', error);
	return Promise.reject(error);
  }
}

/**
 * 备注和飞书链接表预处理函数
 * @param file 上传的文件
 */
export async function preFetchMemoAndLinkData(file: File) {
  console.log('预处理备注和飞书链接数据');

  try {
	// 导入预处理工具
	const { preProcessExcelFile } = await import('@/utils/excelPreProcessor');

	// 定义预期的表头
	const expectedHeaders = ['项目', '跟进', '备注', '飞书链接'];

	// 执行预处理
	const result = await preProcessExcelFile(file, {
	  expectedHeaders,
	  keyColumnIndex: 0, // 项目名称是关键列，索引为0
	  ignoreEmptyTrailingRows: true,
	  checkUtf8Encoding: true,
	});

	if (!result.success) {
	  return Promise.reject(new Error(result.errorMessage));
	}

	console.log('备注和飞书链接数据解析结果:', result.data);

	return Promise.resolve(result.data);
  } catch (error) {
	console.error('解析Excel文件失败:', error);
	return Promise.reject(error);
  }
}

/**
 * 第三方项目表预处理函数
 * @param file 上传的文件
 */
export async function preFetchThirdProjectData(file: File) {
  console.log('预处理第三方项目数据');

  try {
	// 导入预处理工具
	const { preProcessExcelFile } = await import('@/utils/excelPreProcessor');

	// 定义预期的表头
	const expectedHeaders = ['项目', '项目简介', '成立时间', '省市区', '官网', '第三方链接'];

	// 执行预处理
	const result = await preProcessExcelFile(file, {
	  expectedHeaders,
	  keyColumnIndex: 0, // 项目名称是关键列，索引为0
	  ignoreEmptyTrailingRows: true,
	  checkUtf8Encoding: true,
	});

	if (!result.success) {
	  return Promise.reject(new Error(result.errorMessage));
	}

	console.log('第三方项目数据解析结果:', result.data);

	return Promise.resolve(result.data);
  } catch (error) {
	console.error('解析Excel文件失败:', error);
	return Promise.reject(error);
  }
}
