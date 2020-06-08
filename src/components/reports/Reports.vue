<template>
  <div>
    <!-- 2.为ECharts准备一个具备大小（宽高）的Dom -->
    <div id="main" style="width: 600px;height:400px;"></div>
  </div>
</template>

<script>
  // 1.导入
  import echarts from 'echarts'
  export default {
    name: "Reports",
    data() {
      return {
        reportsData: {},
        option: {
          title: {
            text: 'ECharts 入门示例'
          },
          tooltip: {},
          legend: {
            data:['销量']
          },
          xAxis: {
            data: ["衬衫","羊毛衫","雪纺衫","裤子","高跟鞋","袜子"]
          },
          yAxis: {},
          series: [{
            name: '销量',
            type: 'bar',
            data: [5, 20, 36, 10, 10, 20]
          }]
        }
      }
    },
    // 此时页面中的dom元素已经渲染好
    mounted() {
      // 3.基于准备好的dom，初始化echarts实例
      let myChart = echarts.init(document.getElementById('main'));


      // 获取接口数据
      this.$http.get('reports/type/1').then(res => {
        console.log(res);

        // 4.指定图表的配置项和数据
        let obj = Object.assign({}, this.option, res.data.data);

        // 5.使用刚指定的配置项和数据显示图表。
        myChart.setOption(obj);

      }).catch(err => {
        console.log(err);
      })
    },
    methods: {
    },
    created() {
    }
  }
</script>

<style scoped>

</style>
