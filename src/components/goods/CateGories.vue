<template>
  <div>
    <!--面包屑区域-->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <!--卡片区域-->
    <el-card>
      <!--添加商品分类区域-->
      <el-button type="primary" @click="addClick">添加商品分类</el-button>
      <!--form表格区域-->
      <el-table
        :data="cateList"
        border
        :indent="40"
        row-key="cat_id"
        style="width: 100%; margin: 20px 0">
        <!--索引列-->
        <el-table-column
          type="index"
          label="#">
        </el-table-column>
        <el-table-column
          prop="cat_name"
          label="分类名称">
        </el-table-column>
        <el-table-column
          label="是否有效" width="100">
          <template v-slot="prop">
<!--            {{prop.row}}-->
              <i class="el-icon-success" v-if="!prop.row.cat_deleted"></i>
              <i class="el-icon-error" v-else></i>
          </template>
        </el-table-column>
        <el-table-column
          label="排序" width="100">
          <template v-slot="props">
            <el-tag v-if="props.row.cat_level === 0">一级</el-tag>
            <el-tag type="success" v-else-if="props.row.cat_level === 1">二级</el-tag>
            <el-tag type="warning" v-else-if="props.row.cat_level === 2">三级</el-tag>
          </template>
        </el-table-column>
        <el-table-column
          label="操作" width="180">
          <template v-slot="slot">
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="selectCateName(slot.row.cat_id)">修改</el-button>
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteCate(slot.row.cat_id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <!--分页区域-->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[2, 5, 10, 15]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>
      <!--添加分类对话框-->
      <el-dialog
        title="添加分类"
        :visible.sync="addCateDialogVisible"
        width="50%"
        @close="closeAddCateDialogVisible">
        <el-form :model="addCateForm" :rules="addCateRules" ref="addCateRef" label-width="100px">
          <!--prop: 将验证规则传入到组件中-->
          <el-form-item label="分类名称" prop="cat_name">
            <el-input v-model="addCateForm.cat_name"></el-input>
          </el-form-item>
          <el-form-item label="父级分类">
            <!--级联选择器-->
            <el-cascader
              v-model="selectIdKeys"
              :options="selectOptions"
              :props="selectProps"
              clearable
              @change="selectHandleChange">
            </el-cascader>
          </el-form-item>
        </el-form>
        <span slot="footer">
          <el-button @click="addCateDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="addCate">确 定</el-button>
        </span>
      </el-dialog>
      <!--修改分类对话框-->
      <el-dialog
        title="修改分类"
        :visible.sync="editCateDialogVisible"
        width="50%">
        <el-form :model="editCateName" :rules="editCateRules" ref="editCateRef" label-width="90px">
          <el-form-item label="分类名称" prop="cat_name">
            <el-input v-model="editCateName.cat_name"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="editCateDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="editCate">确 定</el-button>
        </span>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
  export default {
    name: "CateGories",
    data() {
      return {
        // 请求体 查询条件
        queryInfo: {
          type: 3,
          pagenum: 1,
          pagesize: 5
        },
        // 商品分类数据列表
        cateList: [],
        // 总条数
        total: 0,
        // 控制修改分类对话框的显隐
        editCateDialogVisible: false,
        // 根据id查询到的单条分类数据
        editCateName: {},
        // 修改分类表单验证规则
        editCateRules: {
          cat_name: [
            { required: true, message: '请输入分类名称', trigger: 'blur' },
            { min: 2, max: 5, message: '长度在 2 到 11 个字符', trigger: 'blur' }
          ]
        },
        // 控制添加分类对话框的显隐
        addCateDialogVisible: false,
        // 添加分类表单提交请求参数数据对象
        addCateForm: {
          // 父级id
          cat_pid: 0,
          // 分类名称  表单传过来的分类名称
          cat_name: '',
          // 分类层次, 0: 1级, 1: 2级, 2: 3级
          cat_level: 0
        },
        // 添加分类表单验证规则
        addCateRules: {
          cat_name: [
            { required: true, message: '请输入分类名称', trigger: 'blur' },
            { min: 2, max: 11, message: '长度在 2 到 11 个字符', trigger: 'blur' }
          ]
        },
        // 用Id 作为级联选择器中的key值
        selectIdKeys: [],
        // 级联选择器要显示的分类列表
        selectOptions: [],
        // 级联选择器的props配置
        selectProps: {
          // 指定选项标签为选项对象的某个属性值
          label: 'cat_name',
          //
          expandTrigger: 'hover',
          checkStrictly: true,
          // 指定选项的值为选项对象的某个属性值
          value: 'cat_id',
          // 指定选项的子选项为选项对象的某个属性值
          children: 'children'
        },
      }
    },
    methods: {
      // 获取分类列表
      getCateList() {
        this.$http.get('categories', {params: this.queryInfo}).then(res => {
          if (res.data.meta.status !== 200) return this.$message.error('请求数据失败')
          this.cateList = res.data.data.result
          this.total = res.data.data.total
          // console.log(this.cateList);
        }).catch(err => {
          console.log(err);
        })
      },
      /*分页函数*/
      handleSizeChange(val) {
        // console.log(`每页 ${val} 条`);
        this.queryInfo.pagesize = val
        this.getCateList()
      },
      /*分页函数*/
      handleCurrentChange(val) {
        // console.log(`当前页: ${val}`);
        this.queryInfo.pagenum = val
        this.getCateList()
      },
      // 查询分类的name值, 并在对话框中渲染
      selectCateName(id) {
        this.$http.get('categories/' + id).then(res => {
          // console.log(res);
          if (res.data.meta.status !== 200) return this.$message.error('请求数据失败')
          this.editCateName = res.data.data
          this.editCateDialogVisible = true
        }).catch(err => {
          console.log(err);
        })
      },
      //  编辑提交分类
      editCate() {
        // 先进行表单的预校验
        this.$refs.editCateRef.validate((valid) => {
          if (!valid) return this.$message.error('请输入正确的分类名')
          this.$http.put('categories/' + this.editCateName.cat_id, {cat_name: this.editCateName.cat_name})
            .then(res => {
              // console.log(res);
              if (res.data.meta.status === 200) {
                this.$message.success('修改成功')
                this.getCateList()
                this.editCateDialogVisible = false
              } else{
                this.$message.error('修改失败')
              }
          }).catch(err => {
            console.log(err);
          })
        })
      },
      // 删除分类
      deleteCate(id) {
        this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.$http.delete('categories/' + id).then(res => {
            // console.log(res);
            if (res.data.meta.status !== 200) return this.$message.error('删除失败')
            this.getCateList()
            this.$message.success('删除成功')
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
      // 添加分类按钮
      addClick() {
        this.addCateDialogVisible = true
        // 获取要显示的表单数据
        // 获取所有的二级分类数据
        this.$http.get('categories', {params: {type: 2}}).then(res => {
          if (res.data.meta.status !== 200) return this.$message.error('获取数据失败')
          this.selectOptions = res.data.data
        }).catch(err => {
          console.log(err);
        })
      },
      // 级联选择器 当选中节点发生变化时 触发的函数
      selectHandleChange(val) {
        // 级联选择器将选中节点的值绑定到 selectIdKeys 中
        this.selectIdKeys = val
        // console.log(this.selectIdKeys);
        // 确定分类的等级
        this.addCateForm.cat_level = this.selectIdKeys.length
        // 确定 父级id
        if (this.selectIdKeys.length > 0) {
          this.addCateForm.cat_pid = this.selectIdKeys[this.selectIdKeys.length - 1]
        } else {
          this.addCateForm.cat_pid = 0
        }
        // console.log(this.addCateForm);
      },
      // 关闭添加分类对话框
      closeAddCateDialogVisible() {
        this.selectIdKeys = []
        // 清空数据 :将父级id 分类名称 分类等级都重新进行赋值
        this.addCateForm.cat_pid = 0
        this.addCateForm.cat_name = ''
        this.addCateForm.cat_level = 0
      },
      // 添加分类
      addCate() {
        this.$http.post('categories', this.addCateForm).then(res => {
          if (res.data.meta.status !== 201) return this.$message.error('添加分类失败')
          this.$message.success('添加分类成功')
          this.addCateDialogVisible = false
          this.getCateList()
        }).catch(err => {
          console.log(err);
        })
      }
    },
    created() {
      this.getCateList()
    }
  }
</script>

<style scoped>

</style>
