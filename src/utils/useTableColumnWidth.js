// src/utils/useTableColumnWidth.js

/**
 * 通用表格列宽本地持久化工具
 * @param {Array} columns 响应式 columns 数组（ref/响应式对象）
 * @param {String} tableKey 当前表格唯一标识
 * @param {String} username 当前用户名
 */
export function useTableColumnWidth(columns, tableKey, username = 'guest') {
    // 保存列宽到 localStorage
    function saveColumnWidths() {
      const widths = columns.value.map(col => ({
        dataIndex: col.dataIndex,
        width: col.width
      }));
      localStorage.setItem(`tableWidths-${username}-${tableKey}`, JSON.stringify(widths));
    }
  
    // 从 localStorage 应用列宽
    function applyColumnWidths() {
      const widthsStr = localStorage.getItem(`tableWidths-${username}-${tableKey}`);
      if (widthsStr) {
        try {
          const widths = JSON.parse(widthsStr);
          widths.forEach(({ dataIndex, width }) => {
            const col = columns.value.find(c => c.dataIndex === dataIndex);
            if (col && width) col.width = width;
          });
        } catch (e) {}
      }
    }
  
    // 清除本地列宽
    function clearColumnWidths() {
      localStorage.removeItem(`tableWidths-${username}-${tableKey}`);
    }
  
    return {
      saveColumnWidths,
      applyColumnWidths,
      clearColumnWidths
    }
  }