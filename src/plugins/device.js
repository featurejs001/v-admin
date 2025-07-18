export default {
  install(app) {
    const isWindows = navigator.userAgent.indexOf('Windows') !== -1;

    // 加载 Windows 样式
    if (isWindows) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      // 使用绝对路径，从根目录开始引入
      link.href = '/src/assets/windows.css';
      document.head.appendChild(link);
      
      // 添加错误处理
      link.onerror = () => {
        console.error('Failed to load windows.css');
      };
      
      // 添加加载成功处理
      link.onload = () => {
        console.log('Windows styles loaded successfully');
      };
    }
  },
};