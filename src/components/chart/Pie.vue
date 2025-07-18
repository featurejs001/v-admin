<template>
  <div ref="chartRef" :style="{ height, width: '100%' }"></div>
</template>

<script lang="ts">
  import { defineComponent, PropType, reactive, Ref, ref, watch, watchEffect } from 'vue';
  import { cloneDeep } from 'lodash-es';
  import {followStageTagsOrder} from "@/utils/util1";

  import * as echarts from 'echarts';

  let chartObj = null // 图标实例

  export default defineComponent({
    name: 'Pie',
    props: {
      chartData: {
        type: Array,
        default: () => [],
      },
      size: {
        type: Object,
        default: () => ({}),
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
        default: '300px',
      },
    },
    emits: ['click'],
    setup(props, { emit }) {
      const chartRef = ref<HTMLDivElement | null>(null);
      
      const option = reactive({
        tooltip: {
          formatter: '{b} ({c})',
          textStyle: {
            fontSize: 12, // 这里的数字可以根据需要调整
          },
        },
        legend: {
          type: 'scroll', // 设置图例类型为滚动
          orient: 'vertical', // 设置图例方向为垂直
          left: '80%',
          top: '6%',
          itemWidth: 16, // 图例项宽度
          itemHeight: 16, // 图例项高度
          symbolSize: 6, // 图例符号大小
          textStyle: {
            color: '#555555', // 默认颜色
            fontWeight: 500,
          },
        },
        series: [
          {
            type: 'pie',
            radius: ['30%', '70%'], // 调整内外半径
            center: ['40%', '50%'], // 将饼图往左移
            data: [],
            labelLine: {
              length: 25,
              length2: 20,
              maxSurfaceAngle: 80
            },
            label: {
              show: true,
              formatter: '{name|{b}}({c})\n{time|{d}% }',
              color: '#555555',
              fontWeight: 500,
              position: 'outside',
              minMargin: 15,
              edgeDistance: 20,
              lineHeight: 15,
              rich: {
                time: {
                  fontSize: 12,
                  color: '#555'
                }
              }
            },
            emphasis: {
              // 开启阴影效果，模拟向外移动
              shadowBlur: 10,
              shadowOffsetX: 10,
              shadowOffsetY: 20,
              shadowColor: 'rgba(0, 0, 0, 0.5)',
              // 其他悬停时的样式设置
              itemStyle: {
                borderWidth: 2,
                borderColor: '#fff',
              },
            },
          },
        ],
      });

      const colors = [
        '#D1E8F8',
        '#7EA2FF',
        '#00D6B3',
        '#A1CDFF',
        '#14BDFF',
        '#3BE1EE',
        '#4389FF',
        // '#002c6a',
        // '#001c51',
        // '#000d38',
        // '#00001f',
        // '#000007',
      ];

      watchEffect(() => {
        props.chartData && initCharts();
      });

      watch(
        () => props.size,
        () => {
          chartObj?.resize?.(); 
        },
        {
          immediate: true,
        }
      );

      function initCharts() {
        if (props.option) {
          Object.assign(option, cloneDeep(props.option));
        }

        option.series[0].data = props.chartData.map((item, index) => {
          const colorIndex = followStageTagsOrder[item.name];
          const color = colors[colorIndex % colors.length]; // 从颜色表中循环取颜色
          return {
            ...item,
            itemStyle: {
              color: color, // 设置颜色
            },
          };
        });

        option.textStyle = {
          fontColor: '#888888',
          fontSize: '12',
          fontFamily: 'PingFangSC-Medium, segoe ui, sans-serif',
          fontWeight: '500',
        };

        if (chartRef.value) {
			console.log('chartRef', chartRef.value, props.chartData)
			chartObj = echarts.init(chartRef.value)
		}
		
		if (chartObj) {
	 		chartObj.clear()
			chartObj.setOption(option)
			chartObj.resize(); 

			chartObj.off('click', onClick);
        	chartObj.on('click', onClick);
		}

        
      }

      function onClick(params) {
        emit('click', params);
      }

      return { chartRef };
    },
  });
</script>

<style scoped>
  ::v-deep * {
    color: #555555 !important;
    font-weight: 400 !important;
  }
  * {
    font-family: 'PingFangSC-Medium', 'segoe ui', sans-serif;
  }
</style>
