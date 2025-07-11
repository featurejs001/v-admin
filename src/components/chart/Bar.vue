<template>
  <div ref="chartRef" :style="{ height: $props.height, width: $props.width }" class="chart-container"></div>
</template>

<script>
  import { defineComponent, reactive, ref, watchEffect } from 'vue';
  import { cloneDeep } from 'lodash-es';
  import * as echarts from 'echarts';

  let chartObj = null // 图标实例
  export default defineComponent({
    name: 'Bar',
    props: {
      chartData: {
        type: Array,
        default: () => [],
      },
      option: {
        type: Object,
        default: () => ({}),
      },
      width: {
        type: String,
        default: '100%',
      },
      height: {
        type: String,
        default: '200px', // 修改图表高度
      },
    },
    setup(props) {
      const chartRef = ref(null);
      
      const option = reactive({
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow',
            shadowStyle: {
              color: 'rgba(77, 77, 99, 0.1)', // 设置阴影颜色为蓝色
            },
            label: {
              show: false,
              backgroundColor: '#333',
            },
          },
          formatter: function (params) {
            const param = params[0];
            return `${param.name}`;
          },
          textStyle: {
            fontSize: 12, // 这里的数字可以根据需要调整
          },
        },
        axisLabel: {
          width: 160,
          overflow: 'truncate',
          truncate: '...',
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          top: '3%', // 将图表往上靠
          containLabel: true,
        },
        yAxis: {
          type: 'category',
          data: [],
          axisLine: {
            show: false,
          },
          axisTick: {
            show: false,
          },
          axisLabel: {
            formatter: function (value) {
              // 隐藏占位符行的标签
              if (value.startsWith('hidden_placeholder_')) {
                return '';
              }
              return value;
            },
            textStyle: {
              color: '#555555', // 默认颜色
              fontWeight: 400,
            },
            rich: {},
          },
          emphasis: {
            // 新增emphasis配置
            itemStyle: {
              borderWidth: 10,
              // 设置高亮时的背景颜色
              color: 'rgba(0, 0, 255, 0.3)',
            },
          },
        },
        legend: {
          data: [],
          textStyle: {
            fontColor: '#888888',
            fontSize: 8,
            fontFamily: 'PingFangSC-Medium, segoe ui, sans-serif',
            fontWeight: '100',
          },
        },
        xAxis: {
          type: 'value',
          axisLine: {
            show: false,
          },
          splitLine: {
            show: false, // 不显示背景竖线
          },
          axisTick: {
            show: false,
          },
          axisLabel: {
            show: false,
          },
        },
        series: [
          {
            name: 'bar',
            type: 'bar',
            data: [],
            itemStyle: {
              color: '#5470C6',
            },
          },
          {
            name: 'background',
            type: 'bar',
            barGap: '-100%',
            barCategoryGap: '40%',
            data: [],
            itemStyle: {
              color: '#F4F9FC',
            },
            z: 1,
          },
        ],
      });

      watchEffect(() => {
        props.chartData && initCharts();
      });

      function initCharts() {
        if (props.option) {
          Object.assign(option, cloneDeep(props.option));
        }

        const maxValue = Math.max(...props.chartData.map((item) => item.value));
        const colorArray = [
          '#B1B1B1', // 废弃 - 灰色
          '#31BEE9', // 线索 - 最浅蓝
          '#33A3F0', // 跟进 - 浅蓝
          '#3591F6', // 立项 - 中蓝
          '#167FFF', // 上会 - 深蓝
          '#2A54E3', // 投后 - 最深蓝
        ]; // 定义颜色数组

        // 固定阶段与颜色的映射关系
        const stageColorMap = {
          废弃: colorArray[0], // 灰色
          线索: colorArray[1], // 最浅蓝
          跟进: colorArray[2], // 浅蓝
          立项: colorArray[3], // 中蓝
          上会: colorArray[4], // 深蓝
          投后: colorArray[5], // 最深蓝
        };

        let seriesData = props.chartData.map((item) => {
          // 为占位符设置完全透明的样式
          if (item.name.startsWith('hidden_placeholder_')) {
            return {
              value: 0,
              itemStyle: {
                color: 'rgba(0,0,0,0)',
                opacity: 0,
              },
              label: {
                show: false,
              },
              emphasis: {
                itemStyle: {
                  opacity: 0,
                },
                label: {
                  show: false,
                },
              },
              silent: true,
              z: -10, // 确保占位符在最底层
            };
          }

          // 获取阶段名称（去除括号内的数字）
          const stageName = item.name.split('(')[0];

          // 正常数据项 - 使用固定的颜色映射
          return {
            value: item.value,
            itemStyle: {
              color: stageColorMap[stageName] || colorArray[0], // 如果找不到映射，默认使用灰色
            },
          };
        });

        let xAxisData = props.chartData.map((item) => item.name);

        // 设置背景条
        let backgroundData = props.chartData.map((item) => {
          if (item.name.startsWith('hidden_placeholder_')) {
            return {
              value: 0,
              itemStyle: {
                color: 'rgba(0,0,0,0)',
                opacity: 0,
              },
              silent: true,
              z: -10, // 确保占位符在最底层
            };
          }
          return {
            value: maxValue,
            itemStyle: {
              opacity: 0.1,
            },
          };
        });

        option.series[0].data = seriesData;
        option.series[1].data = backgroundData;

        // 设置Y轴标签，占位符使用空字符串
        option.yAxis.data = props.chartData.map((item) => {
          if (item.name.startsWith('hidden_placeholder_')) {
            return '';
          } else {
            return item.name + '(' + item.value + ')';
          }
        });

        // 只显示非占位符的图例
        const visibleItems = props.chartData.filter((item) => !item.name.startsWith('hidden_placeholder_'));
        option.legend.data = visibleItems.map((item) => item.name + '(' + item.value + ')');

        option.textStyle = {
          fontColor: '#888888',
          fontSize: '8px',
          fontFamily: 'PingFangSC-Medium, segoe ui, sans-serif',
          fontWeight: '100',
        };

		if (!chartObj && chartRef.value) {
			console.log('chartRef', chartRef.value, props.chartData)
			chartObj = echarts.init(chartRef.value)
		}
		
		if (chartObj) {
	 		chartObj.clear()
			chartObj.setOption(option)
			chartObj.resize(); 
		}
      }
	  

      return { chartRef };
    },
  });
</script>

<style scoped>
  /*
.chart-container {
box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}
*/

  :deep(.chart-container) {
    -webkit-tap-highlight-color: blue !important; /* 修改 tap highlight 颜色为蓝色 */
  }

  /* 使用CSS隐藏占位项 */
  :deep([data-name^='hidden_placeholder_']) {
    display: none !important;
    visibility: hidden !important;
    opacity: 0 !important;
  }

  /* 隐藏占位符的整行 */
  :deep(.ec-element[data-name^='hidden_placeholder_']),
  :deep(.ec-element[data-name^='hidden_placeholder_'] ~ *),
  :deep(.ec-element[data-name^='hidden_placeholder_'] + *),
  :deep(g:has([data-name^='hidden_placeholder_'])) {
    display: none !important;
    visibility: hidden !important;
    opacity: 0 !important;
  }

  * {
    margin: 0;
    padding: 0;
  }
  /* 其他样式 */
</style>
