export function getToolHint(tooltip, module_name, key_name) {
	if (!tooltip || !Array.isArray(tooltip)) {
		return key_name;
	}
  // 使用 find 方法查找第一个符合条件的对象
  const result = tooltip.find(item =>
      item.module_name === module_name && item.key_name === key_name
  );

  // 如果找到了匹配的对象，则返回其 value 属性，否则返回 null 或者自定义的默认值
  return result ? result.value : key_name;
}
