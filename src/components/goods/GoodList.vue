<template>
  <div id="goodList">
    <!--面包屑区域-->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!--卡片区域-->
    <el-card>
      <el-row :gutter="20">
        <el-col :span="10">
          <!--搜索区域-->
          <!--搜索时将input.value与后台提供的query绑定-->
          <el-input placeholder="请输入内容" v-model="goodsQuery.query" clearable @clear="getGoods">
            <el-button slot="append" icon="el-icon-search" @click="selectGoods"></el-button>
          </el-input>
        </el-col>
        <el-col :span="14">
          <!--添加商品区域-->
          <el-button type="primary" @click="goAddPage">添加商品</el-button>
        </el-col>
      </el-row>
      <!--表格区域-->
      <el-table
        :data="goods"
        border
        style="width: 100%; margin: 20px 0">
        <!--索引列-->
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column prop="goods_name" label="商品名称" width="180"></el-table-column>
        <el-table-column prop="goods_price" label="价格"></el-table-column>
        <el-table-column prop="goods_number" label="数量"></el-table-column>
        <el-table-column prop="goods_weight" label="重量"></el-table-column>
        <el-table-column label="创建日期">
          <template v-slot="prop">
            {{prop.row.add_time | time}}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120px">
          <template v-slot="props">
            <el-button type="primary" size="mini">
              <i class="el-icon-edit"></i>
            </el-button>
            <el-button type="danger" size="mini" @click="deleteGood(props.row.goods_id)">
              <i class="el-icon-delete"></i>
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <!--分页-->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="goodsQuery.pagenum"
        :page-sizes="[1, 2, 5, 10]"
        :page-size="2"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>
    </el-card>
  </div>
</template>

<script>
  export default {
    name: "GoodList",
    data () {
      return {
        // 商品列表
        goods: [],
        // 商品的请求体
        goodsQuery: {
          query: '',
          // 请求页码
          pagenum: 1,
          // 请求条数
          pagesize: 2
        },
        // 获取的总条数
        total: 0,
        //
      }
    },
    filters: {
      // 转化时间戳
      time(value){
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
    created() {
      this.getGoods()
    },
    methods: {
      // 请求商品数据
      getGoods() {
        this.$http.get('goods', {params: this.goodsQuery}).then(res => {
          this.goods = res.data.data.goods
          this.total = res.data.data.total
          // console.log(this.goods);
        }).catch(err => {
          console.log(err);
        })
      },
      // 每页多少条
      handleSizeChange(val) {
        this.goodsQuery.pagesize = val
        // console.log(val);
        this.getGoods()
      },
      // 当前页
      handleCurrentChange(val) {
        this.goodsQuery.pagenum = val
        this.getGoods()
      },
      // 搜索商品
      selectGoods() {
        this.getGoods()
      },
      // 删除商品
      deleteGood(g_id) {
        // console.log(g_id + '11111111111111');
        this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          // 删除数据
          this.$http.delete('goods/' + g_id).then(res => {
            if (res.data.meta.status !== 200) return this.$message.error('删除失败')
            this.getGoods()
            this.$message({
              type: 'success',
              message: '删除成功!'
            });
          }).catch(err => {
            console.log(err);
          })
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          });
        });
      },
      // 跳转到添加页面
      goAddPage() {
        this.$router.push('goods/addPage')
      }
    }
  }
</script>

<style scoped>

</style>
