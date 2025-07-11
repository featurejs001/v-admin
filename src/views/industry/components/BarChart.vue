<template>
	<div class="bar-chart-container">
		<div class="tag-container">
	      <span v-for="tag in $props.tags" :key="tag" class="righr_checked_item" :class="getClass(tag)">{{ tag }}</span>
	    </div>
		<div class="chart-section" :class="{ 'move-up': $props.tags.length }">
	      <div class="chart-title">
	        <div class="group_6"></div>
	        <span class="text_44 text_first_level">项目阶段</span>
	      </div>
	      <Bar :chartData="state.barData" />
	    </div>
		<div class="chart-section">
	      <div class="chart-title">
	        <div class="group_6"></div>
	        <span class="text_44 text_first_level">跟进进度</span>
	      </div>
	      <Pie :chartData="state.pieData" />
	    </div>
	</div>
</template>
<script setup>
import Bar from "@/components/chart/Bar.vue"
import Pie from "@/components/chart/Pie.vue"
import { reactive, onMounted } from 'vue'
import { reportFilterBarChart, getIndustrFieldValues } from '@/api/industry'
import { followStageTagsOrder, stageTagsOrder } from '@/utils/util1';

const props = defineProps({
  	nodeData: {
      type: String,
      required: true,
    },
    dataProvided: {
      type: Object,
      required: true,
	},
	tags: {
		type: Array,
		default: () => []
	}
})

const state = reactive({
	barData: [],
	pieData: []
})

const getClass = (tag) => {
  	let ret = '';
    if (/关注/.test(tag)) {
      ret = 'guanzhu';
    } else if (/跟进/.test(tag)) {
      ret = 'genjin';
    } else if (/投后/.test(tag)) {
      ret = 'touhou';
    } 

    ret += ' ant-tag checked';
    return ret;
}

onMounted(async () => {
    let arr2;
    let response;

    // first time
    if (props?.tags === '' && props?.dataProvided === undefined) {
      return;
    }

    if (props?.dataProvided || props?.dataProvided === undefined || props?.dataProvided === null) {

      if (props?.dataProvided) {
        response = await reportFilterBarChart(props?.dataProvided);
      } else if (props?.tags.length > 0) {
        response = await reportFilterBarChart({
			titles: props.tags.join(",")
		});
      } else {
        response = await reportFilterBarChart(props?.dataProvided);
      }
	  response = response?.result || {};

      arr2 = response.stage.filter((item) => item.stage !== null && item.stage !== undefined);
      const processedData = arr2.map((obj) => {
        return { name: obj.stage, value: Number(obj.distinct_name_count) };
      });

      // 确保有6个项目，不足的用隐藏占位符补充
      const fixedItemCount = 6;
      if (processedData.length < fixedItemCount) {
        const emptyCount = fixedItemCount - processedData.length;
        for (let i = 0; i < emptyCount; i++) {
          processedData.unshift({
            name: `hidden_placeholder_${i}`,
            value: 0,
            itemStyle: {
              opacity: 0,
              color: 'rgba(0,0,0,0)',
            },
            label: {
              show: false,
            },
            silent: true,
            tooltip: {
              show: false,
            },
            emphasis: {
              disabled: true,
              scale: false,
              itemStyle: {
                opacity: 0,
              },
              label: {
                show: false,
              },
            },
            blur: {
              itemStyle: {
                opacity: 0,
              },
              label: {
                show: false,
              },
            },
            select: {
              itemStyle: {
                opacity: 0,
              },
              label: {
                show: false,
              },
            },
          });
        }
      }

      state.barData = processedData.sort((b, a) => stageTagsOrder[a.name.split('(')[0]] - stageTagsOrder[b.name.split('(')[0]]);
      arr2 = response.follow_stage.filter((item) => item.follow_stage !== null && item.follow_stage !== undefined);
      state.pieData = arr2.map((obj) => {
        return { name: obj.follow_stage, value: Number(obj.distinct_name_count) };
      });
      state.pieData = state.pieData.sort((a, b) => followStageTagsOrder[a.name.split('(')[0]] - followStageTagsOrder[b.name.split('(')[0]]);
    } else {
      if (props.nodeData) {
        response = await getIndustrFieldValues('report_industry_stage_13x?params=' + props.nodeData);
        const processedData = response.map((obj) => {
          return { name: obj.stage, value: obj.count };
        });

        // 确保有6个项目，不足的用隐藏占位符补充
        const fixedItemCount = 6;
        if (processedData.length < fixedItemCount) {
          const emptyCount = fixedItemCount - processedData.length;
          for (let i = 0; i < emptyCount; i++) {
            processedData.unshift({
              name: `hidden_placeholder_${i}`,
              value: 0,
              itemStyle: {
                opacity: 0,
                color: 'rgba(0,0,0,0)',
              },
              label: {
                show: false,
              },
              silent: true,
              tooltip: {
                show: false,
              },
              emphasis: {
                disabled: true,
                scale: false,
                itemStyle: {
                  opacity: 0,
                },
                label: {
                  show: false,
                },
              },
              blur: {
                itemStyle: {
                  opacity: 0,
                },
                label: {
                  show: false,
                },
              },
              select: {
                itemStyle: {
                  opacity: 0,
                },
                label: {
                  show: false,
                },
              },
            });
          }
        }

        state.barData = processedData;
        response = await getIndustrFieldValues('report_industry_follow_stage_3g4', {params: props.nodeData});
        state.pieData = response.map((obj) => {
          return { name: obj.follow_stage, value: obj.count };
        });
      }
    }
});
</script>
<style lang="less" scoped>
.bar-chart-container {
	.tag-container {
		display: flex;
	    flex-wrap: wrap;
	    gap: 8px;
	    margin-bottom: 20px;
		.righr_checked_item {
			display: inline-flex;
		    align-items: center;
		    height: 26px;
		    padding: 0 10px;
			font-size: 13px;
			line-height: 26px;
		    border-radius: 4px;
		    white-space: nowrap;
		    transition: all 0.2s;
			color: rgb(22, 119, 255);
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

	.chart-section {
	    margin-top: 30px;
		&.move-up {
		    margin-top: -2px; /* 30px - 40px = -10px */
		}
		.chart-title {
		    display: flex;
		    align-items: center;
		    margin-bottom: 15px;
			.group_6 {
			    background-color: rgba(196, 220, 255, 1);
			    border-radius: 4px;
			    width: 4px;
			    height: 14px;
			}

			.text_44 {
				font-size: 13.5px;
			    color: #555555;
			    font-weight: 400;
			    margin-left: 8px;
			}
		}
	}
}
</style>