<template>
  <div>
<!--    面包屑区域-->
    <el-breadcrumb>
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>

<!--    卡片区域-->
    <el-card>
      <div class="addBox">
<!--    搜索区域-->
        <el-input placeholder="请输入用户名"
                  v-model="queryInfo.query"
                  :clearable="true"
                  @clear="getUserList">
          <el-button slot="append"
                     icon="el-icon-search"
                     @click="getUserList">
          </el-button>
        </el-input>

<!--     添加用户按钮-->
        <el-button type="primary" class="addUser" @click="addUser">添加用户</el-button>
      </div>

<!--    user列表区域-->
      <el-table
        :data="usersList.users"
        border
        style="width: 100%">
        <el-table-column prop="username" label="用户名"></el-table-column>
        <el-table-column prop="email" label="邮箱"></el-table-column>
        <el-table-column prop="mobile" label="电话"></el-table-column>
        <el-table-column prop="role_name" label="角色"></el-table-column>
        <el-table-column prop="mg_state" label="状态">
<!--          swicth开关 采用插槽 slot -->
          <template v-slot="slots">
<!--            {{slots.row}}-->
            <el-switch v-model="slots.row.mg_state" @change="stateChange(slots.row)"></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180px" class="caozuo">
          <template v-slot="slot">
<!--            修改信息-->
            <el-tooltip content="修改信息" placement="top-start" :enterable="false">
              <el-button type="primary" icon="el-icon-edit" size="mini" @click="editUserInfo(slot.row.id)"></el-button>
            </el-tooltip>
<!--            删除用户-->
            <el-tooltip content="删除用户" placement="top-start" :enterable="false">
              <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteUser(slot.row.id)"></el-button>
            </el-tooltip>
<!--            管理权限-->
            <el-tooltip content="分配角色" placement="top-start" :enterable="false">
              <el-button type="warning" icon="el-icon-s-tools" size="mini" @click="setRoles(slot.row)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

<!--  分页区域-->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 2, 5, 10]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>

<!--添加用户对话框区域-->
      <el-dialog
        title="添加用户"
        :visible.sync="isShowDialog"
        width="60%">
        <el-form ref="ruleFormRef"
                 label-width="90px"
                 :rules="addUserRules"
                 :model="addFrom">
          <el-form-item label="用户名" prop="username">
            <el-input v-model="addFrom.username"></el-input>
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input v-model="addFrom.password"></el-input>
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="addFrom.email"></el-input>
          </el-form-item>
          <el-form-item label="手机号" prop="mobile">
            <el-input v-model="addFrom.mobile"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="deleteData">取 消</el-button>
          <el-button type="primary"
                     @click="addUserPost">确 定
          </el-button>
        </span>
      </el-dialog>

<!--  修改用户信息对话框区域   -->
      <el-dialog
        title="修改用户信息"
        :visible.sync="isShowInfoDialog"
        width="40%">
        <el-form ref="editFormRef"
                 label-width="90px"
                 :rules="changeFormRules"
                 :model="selectInfo" class="editUserInfo">
          <el-form-item label="用户名">
            <el-input v-model="selectInfo.username" :disabled="true"></el-input>
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="selectInfo.email"></el-input>
          </el-form-item>
          <el-form-item label="手机号" prop="mobile">
            <el-input v-model="selectInfo.mobile"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="callUserInfo">取 消</el-button>
          <el-button type="primary"
                     @click="changeUserInfo">确 定
          </el-button>
        </span>
      </el-dialog>
      <!--分配角色对话框-->
      <el-dialog
        title="分配角色"
        :visible.sync="SetRolesDialogVisible"
        width="50%" @close="setRolesclose">
        <div>
          <p>当前用户：{{userInfo.username}}</p>
          <p>当前角色：{{userInfo.role_name}}</p>
          <p>分配新角色：
            <!-- v-model：选中之后的那个值
                 v-model与 :value同步 -->
            <el-select v-model="selectRoleId" placeholder="请选择">
              <el-option
                v-for="item in rolesList"
                :key="item.id"
                :label="item.roleName"
                :value="item.id">
              </el-option>
            </el-select>
          </p>
        </div>
        <span slot="footer">
          <el-button @click="SetRolesDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="setRolesClick">确 定</el-button>
        </span>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
  export default {
    name: "User",
    data() {
      // 验证邮箱的校验规则
      let checkEmail = (rule, value, callback) => {
        // 验证邮箱的正则表达式
        const regEmail =  /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;

        if (regEmail.test(value)) {
          // 合法的邮箱
          return callback()
        }
        // 不合法的邮箱
        callback(new Error('请输入合法的邮箱'))
      }

      // 验证手机号的校验规则
      let checkMobile = (rule, value, callback) => {
        // 验证手机号的正则表达式
        const regMobile = /^1(3|4|5|6|7|8|9)\d{9}$/;

        if (regMobile.test(value)) {
          // 合法的手机号
          return callback()
        }
        // 不合法
        callback(new Error('请输入合法的手机号'))
      }

      return {
        queryInfo: {
          query: '',
          //当前页
          pagenum: 1,
          //每页多少条
          pagesize: 2
        },
        // 请求过来的用户列表
        usersList: {},
        total: 0,
        // 控制对话框的显示与隐藏
        isShowDialog: false,
        // 添加用户时的验证规则
        addUserRules: {
          username: [
            {required: true, message: '请输入用户名', trigger: 'blur'},
            {min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur'}
          ],
          password: [
            {required: true, message: '请输入密码', trigger: 'blur'},
            {min: 3, max: 15, message: '长度在 6 到 15 个字符', trigger: 'blur'}
          ],
          email: [
            {message: '请输入邮箱', trigger: 'blur'},
            {validator: checkEmail, trigger: 'blur'}
          ],
          // 手机号
          mobile: [
            {message: '请输入手机号', trigger: 'blur'},
            {validator: checkMobile, trigger: 'blur'}
          ]
        },
        // 添加用户的表单数据
        addFrom: {
          username: '',
          password: '',
          email: '',
          mobile: ''
        },

        // 控制修改页面的显示
        isShowInfoDialog: false,
        // 修改用户信息的验证规则
        changeFormRules: {
          email: [
            {message: '请输入邮箱', trigger: 'blur'},
            {validator: checkEmail, trigger: 'blur'}
          ],
          // 手机号
          mobile: [
            {message: '请输入手机号', trigger: 'blur'},
            {validator: checkMobile, trigger: 'blur'}
          ]
        },
        // 修改时根据id查询出来的数据信息
        selectInfo: {},
        // 修改时的 id
        editId: 0,
        // 控制分配角色对话框的显隐
        SetRolesDialogVisible: false,
        // 需要被分配角色的用户信息
        userInfo: {},
        // 获取到的所有的角色列表，供用户选择角色使用
        rolesList: [],
        // 选中的角色id值 供分配角色使用
        selectRoleId: ''
      }
    },
    methods: {
      // 获取用户列表
      getUserList() {
        this.$http.get('users', {params: this.queryInfo}).then(res=> {
          // console.log(res.data.data);
          this.usersList = res.data.data
          this.total = res.data.data.total
        })
      },
      // 每页多少条数据
      handleSizeChange(val) {
        // console.log("每页" + val + "条");
        this.queryInfo.pagesize = val
        this.getUserList()
      },
      // 前往页
      handleCurrentChange(val) {
        // console.log("前往:" + val);
        this.queryInfo.pagenum = val
        this.getUserList()
      },
      // 改变用户状态
      stateChange(userList) {
        // console.log(userList);
        // console.log(userList.mg_state);
        // 点击switch改变状态并改变本地数据中 mg_state 的值
        // 使用http的put方法将本地数据中的 mg_state 值替换服务器中的值
        // 使用es6的模板字符串写法
        this.$http.put(`users/${userList.id}/state/${userList.mg_state}`).then(res=> {
          console.log(res);
          if (res.status === 200) return this.$message.success('修改成功')
          this.$message.error('修改失败')
        })
      },
      // 添加用户
      addUser() {
        this.isShowDialog = true
      },
      // 重置添加用户表单中的数据
      deleteData() {
        this.isShowDialog = false
        for (let item in this.addFrom) {
          this.addFrom[item] = ''
        }
        // console.log(this.addFrom);
      },
      // 添加用户请求函数
      addUserPost() {
        // 在点击按钮后,应先预校验表单数据是否准确
        this.$refs.ruleFormRef.validate(valid => {
          // valid 为false时 返回
          if (!valid) return

          // valid为true 执行post
          this.isShowDialog = false
          // 调用上方弹窗
          this.$message.success('添加成功')
          this.$http.post('users', this.addFrom).then(res=> {
            this.getUserList()
          }).catch(err => {
            console.log(err);
          })
        })
      },
      // 修改用户信息---查询并渲染阶段
      editUserInfo(id) {
        this.editId = id
        // 根据id 请求数据见文档
        this.$http.get(`users/${id}`).then(res => {
          this.selectInfo = res.data.data
          // console.log(this.selectInfo);
          if (res.data.meta.status === 200) {
            this.isShowInfoDialog = true
          }
        }).catch(err => {
          console.log(err);
        })
      },
      // 修改用户信息 -- 点击修改按钮实现修改处理函数
      changeUserInfo() {
        // 发送请求前先进行表单预校验
        this.$refs.editFormRef.validate(valid => {
          if (!valid) return this.$message.error('邮箱或手机号不合法!')
          // 校验成功
          this.$http.put('users/' + this.selectInfo.id, {email: this.selectInfo.email, mobile: this.selectInfo.mobile}).then(res => {
            // console.log(res);
          }).catch(err => {
            console.log(err);
          })
          // 刷新用户列表
          this.getUserList()
          // 调用弹窗
          this.$message.success('修改成功')
          // 将对话框关闭
          this.isShowInfoDialog = false
          // 移除上次的校验结果
          this.$refs.editFormRef.clearValidate()
        })
      },
      // 修改用户信息-----取消修改
      callUserInfo() {
        // 将对话框关闭
        this.isShowInfoDialog = false
        // 移除上次的校验结果
        this.$refs.editFormRef.clearValidate()
      },

      // 删除用户按钮
      deleteUser(id) {
        this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          // 执行删除操作
          this.$http.delete('users/' + id).then(res => {
            // 刷新页面
            this.getUserList()
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
      // 管理用户角色点击事件
      setRoles(userInfo) {
        /*在打开对话框之前获取到所点击用户信息
        * 所要用到的用户信息到在作用域插槽中的slot.row中*/
        // 保存用户信息
        this.userInfo = userInfo
        // 获取角色列表
        this.$http.get('roles').then(res => {
          console.log(res);
          if (res.data.meta.status !== 200) return this.$message.error('获取角色列表失败')
          this.rolesList = res.data.data
          this.SetRolesDialogVisible = true
        }).catch(err => {
          console.log(err);
        })
      },
      // 分配用户角色的点击事件
      setRolesClick() {
        if (!this.selectRoleId) return this.$message.error('请选择要分配的角色')
        // 分配角色
        this.$http.put(`users/${this.userInfo.id}/role`, {rid: this.selectRoleId})
          .then(res => {
            if (res.data.meta.status !== 200) return this.$message.error('分配角色失败')
            this.$message.success('分配角色成功')
            console.log(res);
            this.getUserList()
            this.SetRolesDialogVisible = false
          }).catch(err => {
          console.log(err);
        })
      },
      // 监听分配角色对话框的 close 事件
      setRolesclose() {
        this.selectRoleId = ''
      }
    },
    created() {
      // 获取用户列表
      this.getUserList()
    }
  }
</script>

<style scoped>
  .el-input{
    width: 40%;
  }
  .addUser{
    margin-left: 20px;
  }
/*  users列表*/
  .el-table{
    margin-top: 20px;
  }
  .dialogFrom .el-form-item .el-input{
    width: 90%;
  }
  .editUserInfo .el-form-item .el-input{
    width: 90%;
  }
</style>
