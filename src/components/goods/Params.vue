<template>
  <div>
    <!--面包屑区域-->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>分类参数</el-breadcrumb-item>
    </el-breadcrumb>
    <!--卡片区域-->
    <el-card>
      <!--警告提示区域-->
      <el-alert
        :closable="false"
        title="注意: 只允许为第三级分类设置相关参数!"
        type="warning"
        show-icon>
      </el-alert>
      <!--级联选择器区域-->
      <el-form label-width="100px">
        <el-form-item label="选择商品分类:">
          <el-cascader
            v-model="selectKeys"
            :options="cateInfoOptions"
            :props="cateInfoProps"
            @change="handleChange">
          </el-cascader>
        </el-form-item>
      </el-form>
      <!--tabs标签页区域-->
      <el-tabs v-model="activeName" @tab-click="handleClick">
        <el-tab-pane label="动态参数" name="many">
          <el-button type="primary" size="mini" :disabled="isBtnDisabled" @click="addBtnParams">添加参数</el-button>
        </el-tab-pane>
        <el-tab-pane label="静态属性" name="only">
          <el-button type="primary" size="mini" :disabled="isBtnDisabled" @click="addBtnParams">添加属性</el-button>
        </el-tab-pane>
      </el-tabs>
      <!--表格区域-->
      <el-table
        :data="paramsList"
        border
        style="width: 100%; margin: 20px 0">
        <!--展开行-->
        <el-table-column type="expand" width="60">
          <template v-slot="slot">
            <!--tag标签页-->
            <el-tag closable @close="tagClose(slot.row)" v-for="(item, index) in slot.row.attr_vals" :key="index" :class="item === '' ? 'Tag' : ''">{{item}}</el-tag>
            <!--tag添加按钮与输入框区域-->
            <el-input
              class="input-new-tag"
              v-if="slot.row.inputVisible"
              v-model.trim="slot.row.inputValue"
              ref="TagInputRef"
              size="small"
              @keyup.enter.native="handleInputConfirm(slot.row)"
              @blur="handleInputConfirm(slot.row)">
            </el-input>
            <el-button v-else class="button-new-tag" size="small" @click="showInput(slot.row)">+ New Tag</el-button>
          </template>
        </el-table-column>
        <!--索引列-->
        <el-table-column label="#" type="index" width="60"></el-table-column>
        <el-table-column
          prop="attr_name"
          :label="isTitleText + '名称'">
        </el-table-column>
        <el-table-column
          label="操作"
          width="150">
          <template v-slot="props">
            <el-button type="primary" size="mini" @click="showEditDialog(props.row.attr_id)">修改</el-button>
            <el-button type="danger" size="mini" @click="deleteParams(props.row.attr_id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <!--添加参数/属性对话框区域-->
      <el-dialog
        :title="'添加' + isTitleText"
        :visible.sync="addParamsDialogVisible"
        width="50%" @close="addFormColse">
        <el-form :model="addForm" :rules="addRules" ref="addRef" label-width="90px" class="demo-ruleForm">
          <el-form-item :label="isFormLabel" prop="attr_name">
            <el-input v-model="addForm.attr_name"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="addParamsDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="addParams">确 定</el-button>
        </span>
      </el-dialog>
      <!--修改参数 对话框区域-->
      <el-dialog
        :title="'修改' + isTitleText"
        :visible.sync="editParamsDialogVisible"
        width="50%" @close="editFormColse">
        <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="120px" class="demo-ruleForm">
          <el-form-item :label="isFormLabel" prop="attr_name">
            <el-input v-model="editForm.attr_name"></el-input>
          </el-form-item>
          <el-form-item label="所具有的属性" prop="attr_vals">
            <el-input v-model="editForm.attr_vals" disabled></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="editParamsDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="editParams">确 定</el-button>
        </span>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
  export default {
    name: "Params",
    data() {
      return {
        // 级联选择器input保存的值
        selectKeys: [],
        // 分类信息的数据存储对象
        cateInfoOptions: [],
        cateInfoProps: {
          expandTrigger: 'hover',
          // 指定显示的标签
          label: 'cat_name',
          // 指定选项的值
          value: 'cat_id',
          // 指定子节点
          children: 'children'
        },
        // 级联选择器选中的 id 值 : 3级分类 id
        selectId: null,
        // tabs标签页激活页的name值
        activeName: 'many',
        // 获取到的参数列表
        paramsList: [],
        // 控制添加对话框的显隐
        addParamsDialogVisible: false,
        // 添加对话框中  表单数据对象
        addForm: {},
        // 添加对话框中  表单的验证规则
        addRules: {
          attr_name: [
            { required: true, message: '请输入名称', trigger: 'blur' },
            { min: 2, max: 11, message: '长度在 2 到 11 个字符', trigger: 'blur' }
          ]
        },
        // 控制修改参数对话框的显隐
        editParamsDialogVisible: false,
        // 修改表单数据对象
        editForm: {},
        // 修改表单数据的验证规则
        editFormRules: {
          attr_name: [
            { required: true, message: '请输入名称', trigger: 'blur' },
            { min: 2, max: 11, message: '长度在 2 到 11 个字符', trigger: 'blur' }
          ],
          attr_vals: [
            { message: '请输入属性', trigger: 'blur' }
          ]
        },
        // 修改参数时的参数id
        attrId: null,
      }
    },
    created() {
      this.getCateGoryList()
    },
    methods: {
      // 获取所有的分类数据列表
      getCateGoryList() {
        this.$http.get('categories').then(res => {
          // console.log(res);
          if (res.data.meta.status !== 200) return this.$message.error('获取分类数据列表失败')
          this.cateInfoOptions = res.data.data
          // console.log(this.cateInfoOptions);
        }).catch(err => {
          console.log(err);
        })
      },
      // 级联选择器改变状态时的回调
      handleChange() {
        this.getParamsData()
      },
      // tabs标签页发生变化时的回调
      handleClick() {
        console.log(this.activeName);
        this.getParamsData()
      },
      // 获取参数的列表数据
      getParamsData() {
        if (this.selectKeys.length !== 3) {
          // 不是三级分类则将 绑定的值赋为空
          this.selectKeys = []
          this.selectId = null
          this.$message.warning('请选择三级分类')
          // 将form表单数据清空
          this.paramsList = []
        } else {
          //
          this.selectId = this.selectKeys[2]
          // 请求参数列表
          this.$http.get(`categories/${this.selectId}/attributes`, {params: {sel: this.activeName}})
            .then(res => {
              // console.log(res);
              if (res.data.meta.status !== 200) return this.$message.error('获取参数列表失败')
              res.data.data.forEach(item => {
                // 在每一个item上加两个属性:
                item.inputVisible = false
                item.inputValue = ''
                item.attr_vals = item.attr_vals.split(' ')
              })
              this.paramsList = res.data.data
              console.log(this.paramsList);
            }).catch(err => {
            console.log(err);
          })
        }
      },
      // 点击添加按钮, 打开添加对话框
      addBtnParams() {
        this.addParamsDialogVisible = true
      },
      // 添加对话框关闭时的回调
      addFormColse() {
        // 将文本内容清空
        this.addForm = {}
        // 移除验证规则的结果
        this.$refs.addRef.clearValidate()
      },
      // 添加参数实现函数
      addParams() {
        // 先进行表单的预验证
        this.$refs.addRef.validate(valid => {
          if (!valid) return this.$message.error('表单数据有误, 请重新输入')
          this.$http.post(`categories/${this.selectId}/attributes`, {attr_name: this.addForm.attr_name, attr_sel: this.activeName})
            .then(res => {
              if (res.data.meta.status !== 201) return this.$message.error('添加数据失败')
              this.$message.success('添加数据成功')
              this.getParamsData()
              this.addParamsDialogVisible = false
            }).catch(err => {
            console.log(err);
          })
        })
      },
      // 点击按钮 显示修改对话框
      showEditDialog(id) {
        this.editParamsDialogVisible = true
        // 将 id 保存到本地 供editParams()使用
        this.attrId = id
        // 获取数据在表单中展示
        this.$http.get(`categories/${this.selectId}/attributes/${id}`, {params: {attr_sel: this.activeName}}).then(res => {
          if (res.data.meta.status !== 200) return this.$message.error('获取数据失败')
          this.editForm = res.data.data
          // console.log(this.editForm);
        }).catch(err => {
          console.log(err);
        })
      },
      // 修改对话框关闭时的回调
      editFormColse() {
        // 重置表单
        this.$refs.editFormRef.resetFields()
      },
      // 修改参数
      editParams() {
        // 先进行表单预校验
        this.$refs.editFormRef.validate(valid => {
          if (!valid) return this.$message.error('表单验证失败')
          this.$http.put(`categories/${this.selectId}/attributes/${this.attrId}`, {attr_name: this.editForm.attr_name, attr_sel: this.editForm.attr_sel, attr_vals: this.editForm.attr_vals})
            .then(res => {
              // console.log(res);
              if (res.data.meta.status !== 200) return this.$message.error('修改数据失败')
              this.$message.success('修改数据成功')
              this.getParamsData()
              this.editParamsDialogVisible = false
            }).catch(err => {
            console.log(err);
          })
        })
      },
      // 删除参数
      deleteParams(attrid) {
        this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.$http.delete(`categories/${this.selectId}/attributes/${attrid}`).then(res => {
            if (res.data.meta.status !== 200) return this.$message.error('删除失败')
            this.$message.success('删除成功')
            this.getParamsData()
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
      // 关闭tag标签所触发的回调函数
      tagClose(row) {
      },
      // 按下键盘Enter触发的事件或input失去焦点时
      handleInputConfirm(row) {
        // input输入框预校验
        if (row.inputValue === '') {
          return row.inputVisible = false
        } else {
          row.attr_vals.push(row.inputValue)
          row.inputValue = ''
          row.inputVisible = false
          // 将本地保存的数据传到服务器
          this.$http.put(`categories/${this.selectId}/attributes/${row.attr_id}`, {
            attr_name: row.attr_name,
            attr_sel: row.attr_sel,
            // 此处注意: attr_vals在服务器是字符串类型 而本地存储数据是数组需要转化
            attr_vals: row.attr_vals.join(' ')
          }).then(res => {
            console.log(res);
            if (res.data.meta.status !== 200) return this.$message.error('添加失败')
            this.$message.success('添加成功')
          }).catch(err => {
            console.log(err);
          })
        }
      },
      // 显示input输入框
      showInput(row) {
        row.inputVisible = true
        this.$nextTick(_ => {
          this.$refs.TagInputRef.$refs.input.focus();
        });
      },
    },
    computed: {
      // 控制tabs标签页按钮的能否点击
      isBtnDisabled() {
        if (this.selectKeys.length === 3) {
          return false
        }
        return true
      },
      isTitleText() {
        if (this.activeName === 'many') {
          return '参数'
        }
        return '属性'
      },
      // 添加参数/属性对话框中 label 的切换
      isFormLabel() {
        if (this.activeName === 'many') {
          return '动态参数'
        }
        return '静态属性'
      },
    }
  }
</script>

<style scoped>
  /*警告提示区域*/
  .el-alert{
    margin-bottom: 20px;
  }
  .Tag{
    display: none;
  }
  .el-tag{
    margin: 8px 8px;
  }
  .input-new-tag{
    width: 120px;
  }
</style>
