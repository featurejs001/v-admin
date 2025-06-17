import { Modal } from 'ant-design-vue';

/**
 * Excel预处理函数接口
 */
export interface ExcelPreProcessorOptions {
  /**
   * 期望的表头列表，顺序很重要
   */
  expectedHeaders: string[];
  
  /**
   * 关键列的索引（从0开始）
   */
  keyColumnIndex: number;
  
  /**
   * 是否忽略末尾的空行（key列为空的行）
   */
  ignoreEmptyTrailingRows?: boolean;
  
  /**
   * 是否检查UTF-8编码
   */
  checkUtf8Encoding?: boolean;
}

/**
 * 预处理结果接口
 */
export interface PreProcessResult {
  /**
   * 是否成功
   */
  success: boolean;
  
  /**
   * 错误信息
   */
  errorMessage?: string;
  
  /**
   * 处理后的数据
   */
  data?: any[];
  
  /**
   * 原始数据
   */
  rawData?: any[];
}

/**
 * 检查字符串是否为有效的UTF-8编码
 * @param str 要检查的字符串
 * @returns 是否为有效的UTF-8编码
 */
function isValidUtf8(str: string): boolean {
  try {
    // 尝试将字符串编码为UTF-8，然后解码回来
    // 如果过程中出现错误，则说明不是有效的UTF-8编码
    const encoder = new TextEncoder();
    const decoder = new TextDecoder('utf-8', { fatal: true });
    const encoded = encoder.encode(str);
    decoder.decode(encoded);
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Excel预处理函数
 * @param file Excel文件
 * @param options 预处理选项
 * @returns 预处理结果
 */
export async function preProcessExcelFile(file: File, options: ExcelPreProcessorOptions): Promise<PreProcessResult> {
  try {
    // 导入xlsx库
    const { read, utils } = await import('xlsx');
    
    // 读取文件内容
    const data = await new Promise<ArrayBuffer>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target) {
          resolve(e.target.result as ArrayBuffer);
        } else {
          reject(new Error('读取文件失败'));
        }
      };
      reader.onerror = (e) => reject(e);
      reader.readAsArrayBuffer(file);
    });
    
    // 解析Excel文件
    const workbook = read(data, { type: 'array' });
    
    // 获取第一个工作表
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    
    // 将工作表转换为JSON
    const jsonData = utils.sheet_to_json(worksheet, { header: 1 });
    
    // 验证数据非空
    if (!jsonData || jsonData.length === 0) {
      Modal.error({
        title: '预处理失败',
        content: '文件内容为空',
      });
      return { success: false, errorMessage: '文件内容为空' };
    }
    
    // 获取表头
    const headers = jsonData[0] as string[];
    
    // 验证表头
    if (headers.length !== options.expectedHeaders.length) {
      Modal.error({
        title: '模板错误',
        content: `表头列数不匹配，期望 ${options.expectedHeaders.length} 列，实际 ${headers.length} 列`,
      });
      return { 
        success: false, 
        errorMessage: `表头列数不匹配，期望 ${options.expectedHeaders.length} 列，实际 ${headers.length} 列` 
      };
    }
    
    // 验证表头顺序和名称
    for (let i = 0; i < options.expectedHeaders.length; i++) {
      if (headers[i] !== options.expectedHeaders[i]) {
        Modal.error({
          title: '模板错误',
          content: `表头第 ${i + 1} 列不匹配，期望 "${options.expectedHeaders[i]}"，实际 "${headers[i]}"`,
        });
        return { 
          success: false, 
          errorMessage: `表头第 ${i + 1} 列不匹配，期望 "${options.expectedHeaders[i]}"，实际 "${headers[i]}"` 
        };
      }
    }
    
    // 获取数据行
    const rows = jsonData.slice(1) as any[][];
    
    // 收集所有错误
    const errors: { type: string; rows: number[] }[] = [];
    const { keyColumnIndex } = options;
    
    // 找到最后一个非空行的索引（用于判断尾部空行）
    let lastNonEmptyRowIndex = -1;
    if (options.ignoreEmptyTrailingRows) {
      for (let i = rows.length - 1; i >= 0; i--) {
        const row = rows[i];
        if (row.length > keyColumnIndex && 
            row[keyColumnIndex] !== undefined && 
            row[keyColumnIndex] !== null && 
            String(row[keyColumnIndex]).trim() !== '') {
          lastNonEmptyRowIndex = i;
          break;
        }
      }
    }
    
    // 1. 验证key列非空
    const emptyKeyRows: number[] = [];
    
    rows.forEach((row, index) => {
      // 检查行是否有足够的列
      if (row.length <= keyColumnIndex) {
        emptyKeyRows.push(index + 2); // +2 是因为索引从0开始，而且有表头行
        return;
      }
      
      // 检查key列是否为空
      const keyValue = row[keyColumnIndex];
      if (keyValue === undefined || keyValue === null || String(keyValue).trim() === '') {
        emptyKeyRows.push(index + 2);
      }
    });
    
    // 如果有空的key列且不是尾部空行，添加到错误列表
    if (emptyKeyRows.length > 0 && options.ignoreEmptyTrailingRows) {
      // 筛选出非尾部的空行
      const nonTrailingEmptyRows = emptyKeyRows.filter(rowNum => {
        const rowIndex = rowNum - 2; // 转换回数组索引
        return rowIndex <= lastNonEmptyRowIndex; // 只保留在最后一个非空行之前或当前的空行
      });
      
      if (nonTrailingEmptyRows.length > 0) {
        errors.push({
          type: '关键列为空',
          rows: nonTrailingEmptyRows
        });
      } else {
        // 所有空行都在尾部，可以忽略
        console.log('忽略尾部空行:', emptyKeyRows);
      }
    } else if (emptyKeyRows.length > 0) {
      // 不忽略尾部空行，所有空行都算作错误
      errors.push({
        type: '关键列为空',
        rows: emptyKeyRows
      });
    }
    
    // 2. 检查UTF-8编码
    if (options.checkUtf8Encoding) {
      const invalidUtf8Rows: number[] = [];
      
      rows.forEach((row, index) => {
        for (let i = 0; i < row.length; i++) {
          const value = row[i];
          if (typeof value === 'string' && !isValidUtf8(value)) {
            invalidUtf8Rows.push(index + 2); // +2 是因为索引从0开始，而且有表头行
            break;
          }
        }
      });
      
      if (invalidUtf8Rows.length > 0) {
        errors.push({
          type: '非UTF-8编码',
          rows: invalidUtf8Rows
        });
      }
    }
    
    // 3. 显示所有错误
    if (errors.length > 0) {
      // 构建错误信息
      const errorMessages = errors.map(error => {
        return `${error.type}：第 ${error.rows.join('、')} 行`;
      });
      
      const errorContent = errorMessages.join('\n');
      
      Modal.error({
        title: '数据错误',
        content: errorContent + '\n请先修改再导入',
      });
      
      return { 
        success: false, 
        errorMessage: errorContent
      };
    }
    
    // 处理数据，移除尾部空行
    let processedRows = rows;
    if (options.ignoreEmptyTrailingRows) {
      // 找到最后一个非空行的索引
      lastNonEmptyRowIndex = -1;
      for (let i = rows.length - 1; i >= 0; i--) {
        const row = rows[i];
        if (row.length > keyColumnIndex && row[keyColumnIndex] !== undefined && 
            row[keyColumnIndex] !== null && String(row[keyColumnIndex]).trim() !== '') {
          lastNonEmptyRowIndex = i;
          break;
        }
      }
      
      // 只保留到最后一个非空行
      if (lastNonEmptyRowIndex >= 0) {
        processedRows = rows.slice(0, lastNonEmptyRowIndex + 1);
      } else {
        // 所有行都是空的
        processedRows = [];
      }
    }
    
    // 将处理后的数据转换为对象数组
    const result = processedRows.map(row => {
      const obj: Record<string, any> = {};
      headers.forEach((header, index) => {
        obj[header] = index < row.length ? row[index] : null;
      });
      return obj;
    });
    
    return {
      success: true,
      data: result,
      rawData: jsonData
    };
  } catch (error) {
    console.error('解析Excel文件失败:', error);
    Modal.error({
      title: '预处理失败',
      content: `解析Excel文件失败: ${error instanceof Error ? error.message : String(error)}`,
    });
    return { 
      success: false, 
      errorMessage: `解析Excel文件失败: ${error instanceof Error ? error.message : String(error)}` 
    };
  }
}
