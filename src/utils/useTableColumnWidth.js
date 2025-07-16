// src/utils/useTableColumnWidth.js

/**
 * 通用表格列宽本地持久化工具
 * @param {Array} columns 响应式 columns 数组（ref/响应式对象）
 * @param {String} tableKey 当前表格唯一标识
 * @param {String} username 当前用户名
 */
export function useTableColumnWidth(columns, tableKey, username) {
    function saveColumnWidths(cols) {
      const widths = cols.map(col => ({ dataIndex: col.dataIndex, width: col.width }))
      localStorage.setItem(`columnWidths-${tableKey}-${username}`, JSON.stringify(widths))
    }
    function applyColumnWidths(cols) {
      const str = localStorage.getItem(`columnWidths-${tableKey}-${username}`)
      if (!str) return
      try {
        const widths = JSON.parse(str)
        cols.forEach(col => {
          const found = widths.find(w => w.dataIndex === col.dataIndex)
          if (found && found.width) col.width = found.width
        })
      } catch {}
    }
    return { saveColumnWidths, applyColumnWidths }
  }