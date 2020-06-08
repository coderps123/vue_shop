<template>
  <div>
    <!--面包屑区域-->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>
      <!--卡片区域-->
      <el-card>
        <el-row>
          <el-col :span="10">
            <!--查询接口有问题-->
            <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getOrderList">
              <el-button slot="append" icon="el-icon-search" @click="queryClick"></el-button>
            </el-input>
          </el-col>
        </el-row>
        <!--表格区域-->
        <el-table
          :data="orderList"
          border
          style="width: 100%; margin: 20px 0px">
          <!--索引列-->
          <el-table-column type="index" label="#" width="80"></el-table-column>
          <el-table-column prop="order_number" label="订单编号"></el-table-column>
          <el-table-column prop="order_price" label="订单价格" width="80"></el-table-column>
          <el-table-column label="是否付款" width="80">
            <template v-slot="prop">
              <el-tag type="danger" v-if="prop.row.order_pay === '0'">未付款</el-tag>
              <el-tag type="success" v-else>已付款</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="is_send" label="是否发货" width="80"></el-table-column>
          <el-table-column label="下单时间" width="180">
            <template v-slot="prop">
              {{ prop.row.create_time | formatData }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="120">
            <template>
              <el-button type="primary" icon="el-icon-edit" size="mini"></el-button>
              <el-button type="success" icon="el-icon-location-outline" size="mini" @click="showKuaiDi"></el-button>
            </template>
          </el-table-column>
        </el-table>
        <!--分页区域-->
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="queryInfo.pagenum"
          :page-sizes="[5, 10, 20, 40]"
          :page-size="queryInfo.pagesize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total">
        </el-pagination>
      </el-card>
    <!--对话框区域-->
    <el-dialog
      title="物流信息"
      :visible.sync="kuaiDiDialogVisible"
      width="50%">
      <!--时间线组件-->
      <el-timeline>
        <el-timeline-item
          v-for="(item, index) in timelineData"
          :key="index"
          :timestamp="item.time">
          {{item.context}}
        </el-timeline-item>
      </el-timeline>
    </el-dialog>
  </div>
</template>

<script>
  export default {
    name: "Order",
    data() {
      return {
        // 订单数据列表
        orderList: [],
        // 获取订单信息的请求体
        queryInfo: {
          query: '',
          pagenum: 1,
          pagesize: 5
        },
        // 总条数
        total: 0,
        // 控制快递对话框的显隐
        kuaiDiDialogVisible: false,
        // 时间线数据源
        timelineData: []
      }
    },
    filters: {
      // 转化时间戳
      formatData(value){
        let date = new Date(value*1000);//如果date为13位不需要乘1000
        let Y = date.getFullYear() + '-';
        let M = (date.getMonth()+1 < 10 ? '0'+(date.getMonth()+1) : date.getMonth()+1) + '-';
        let D = (date.getDate() < 10 ? '0' + (date.getDate()) : date.getDate()) + ' ';
        let h = (date.getHours() < 10 ? '0' + date.getHours() : date.getHours()) + ':';
        let m = (date.getMinutes() <10 ? '0' + date.getMinutes() : date.getMinutes()) + ':';
        let s = (date.getSeconds() <10 ? '0' + date.getSeconds() : date.getSeconds());
        return Y+M+D+h+m+s;
      }
    },
    methods: {
      // 获取订单列表数据
      getOrderList() {
        this.$http.get('orders', {params: this.queryInfo}).then(res => {
          console.log(res);
          if (res.data.meta.status !== 200) return this.$message.error('获取订单数据失败')
          this.orderList = res.data.data.goods
          this.total = res.data.data.total
        }).catch(err => {
          console.log(err);
        })
      },
      // 搜索函数
      queryClick() {
        this.getOrderList()
      },
      handleSizeChange(val) {
        // console.log(`每页 ${val} 条`);
        this.queryInfo.pagesize = val
        this.getOrderList()
      },
      handleCurrentChange(val) {
        // console.log(`当前页: ${val}`);
        this.queryInfo.pagenum = val
        this.getOrderList()
      },
      // 展示快递信息
      showKuaiDi() {
        this.kuaiDiDialogVisible = true
        this.$http.get('/kuaidi/' + 1106975712662).then(res => {
          // console.log(res);
          this.timelineData = res.data.data
        }).catch(err => {
          console.log(err);
        })
      }
    },
    created() {
      this.getOrderList()
    }
  }
</script>

<style scoped>

</style>
