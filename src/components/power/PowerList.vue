<template>
  <div id="PowerList">
<!--头部面包屑区域-->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>权限列表</el-breadcrumb-item>
    </el-breadcrumb>
<!--卡片区域-->
    <el-card class="box-card">
      <el-table
        :data="tableData"
        border
        style="width: 100%">
        <el-table-column
          prop="authName"
          label="权限名称">
        </el-table-column>
        <el-table-column
          prop="path"
          label="路径">
        </el-table-column>
        <el-table-column
          label="权限等级">
          <template v-slot="slot">
            <el-tag v-if="slot.row.level === '0'">一级</el-tag>
            <el-tag type="success" v-else-if="slot.row.level === '1'">二级</el-tag>
            <el-tag type="warning" v-else-if="slot.row.level === '2'">三级</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script>
  export default {
    name: "PowerList",
    data() {
      return {
        tableData: [],
        type: 'list',
      }
    },
    methods: {
      // 获取权限列表
      getPowerList() {
        this.$http.get('rights/' + this.type).then(res => {
          // console.log(res);
          if (res.data.meta.status !== 200) return this.$message.error('获取权限列表失败')
          this.tableData = res.data.data
        }).catch(err => {
          console.log(err);
        })
      }
    },
    created() {
      this.getPowerList()
    }
  }
</script>

<style scoped>

</style>
