<template>
  <div id="Roles">
    <!--面包屑区域-->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
      <!--卡片区域-->
    <el-card class="box-card">
      <!--添加角色部分-->
      <el-button type="primary" @click="addRolesVisible = true">添加角色</el-button>
      <!--角色列表部分-->
      <el-table
        :data="rolesData"
        style="width: 100%; margin-top: 20px" border>
        <!--展开列-->
        <el-table-column type="expand">
          <template v-slot="slot">
            <el-row v-for="(item1, i1) in slot.row.children"
                    :key="item1.id"
                    :class="['bdBottom', 'vcenter', i1 === 0 ? 'bdTop' : '']">
              <!--渲染一级权限-->
              <el-col :span="5">
                <el-tag class="margin1" closable @close="deleteRolesRight(slot.row, item1.id)">{{item1.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!--渲染二级和三级权限-->
              <el-col :span="19">
                <el-row v-for="(item2, i2) in item1.children"
                        :key="item2.id" :class="['vcenter', i2 === 0 ? '' : 'bdTop']">
                  <el-col :span="6">
                    <el-tag type="success" class="margin1" closable @close="deleteRolesRight(slot.row, item2.id)">{{item2.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <el-tag type="warning"
                            v-for="(item3, i3) in item2.children"
                            :key="item3.id"
                            class="margin1 tag" closable @close="deleteRolesRight(slot.row, item3.id)">
                      {{item3.authName}}
                    </el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <!--索引列-->
        <el-table-column
          label="#"
          type="index">
        </el-table-column>
        <el-table-column
          label="角色名称"
          prop="roleName" width="180px">
        </el-table-column>
        <el-table-column
          label="角色描述"
          prop="roleDesc">
        </el-table-column>
        <el-table-column
          label="操作" width="180px">
          <template v-slot="slots">
            <el-tooltip content="修改" placement="top-start">
              <el-button type="primary" icon="el-icon-edit" size="mini" @click="getRolesInfo(slots.row.id)"></el-button>
            </el-tooltip>
            <el-tooltip content="删除" placement="top-start">
              <el-button type="danger" icon="el-icon-delete" size="mini" @click="openDeleteRoles(slots.row.id)"></el-button>
            </el-tooltip>
            <el-tooltip content="管理角色权限" placement="top-start">
              <el-button type="warning" icon="el-icon-setting" size="mini" @click="setRoles(slots.row)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!--添加角色对话框区域-->
    <el-dialog
      title="添加角色"
      :visible.sync="addRolesVisible"
      width="50%">
      <el-form :model="rolesInfo" :rules="rolesRules" ref="rolesRef" label-width="80px" class="demo-ruleForm">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="rolesInfo.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="rolesInfo.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addRolesVisible = false">取 消</el-button>
        <el-button type="primary" @click="addRoles">确 定</el-button>
      </span>
    </el-dialog>
    <!--修改角色对话框-->
    <el-dialog
      title="修改角色信息"
      :visible.sync="editRolesVisible"
      width="50%">
      <el-form :model="getIdRolesInfo" :rules="rolesRules" ref="editRolesRef" label-width="80px" class="demo-ruleForm">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="getIdRolesInfo.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="getIdRolesInfo.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editRolesVisible = false">取 消</el-button>
        <el-button type="primary" @click="editRolesInfo">确 定</el-button>
      </span>
    </el-dialog>
    <!--管理权限设置-->
    <el-dialog
      title="权限设置"
      :visible.sync="setRolesdialogVisible"
      width="50%">
      <!--树形控件-->
      <el-tree :data="treeRights"
               show-checkbox
               node-key="id"
               ref="treeRef"
               default-expand-all
               :props="treeRightsProps"
               :default-checked-keys="defKey">
      </el-tree>
      <span slot="footer" class="dialog-footer">
    <el-button @click="setRolesdialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="setRightClick">确 定</el-button>
  </span>
    </el-dialog>
  </div>
</template>

<script>
  export default {
    name: "Roles",
    data() {
      return {
        // 角色列表
        rolesData: [],
        // 控制添加角色对话框的状态
        addRolesVisible: false,
        // 角色信息
        rolesInfo: {},
        // 角色的验证规则
        rolesRules: {
          roleName: [
            { required: true, message: '请输入角色名称', trigger: 'blur' },
            { min: 3, max: 11, message: '长度在 3 到 11 个字符', trigger: 'blur' }
          ],
          roleDesc: [
            { message: '请输入角色描述', trigger: 'blur' },
            { min: 3, max: 16, message: '长度在 3 到 16 个字符', trigger: 'blur' }
          ]
        },
        // 控制修改角色对话框的状态
        editRolesVisible: false,
        // 获取到的单条信息
        getIdRolesInfo: {},
        // 控制管理权限对话框的显隐
        setRolesdialogVisible: false,
        // 保存树形权限数据
        treeRights: [],
        treeRightsProps: {
          children: 'children',
          label: 'authName'
        },
        // 默认勾选状态的id值
        defKey: [],
        // 权限 id 列表
        rids: [],
        // 本地保存的角色id
        rolesId: 0,
      }
    },
    created() {
      this.getRolesList()
    },
    methods: {
      // 请求角色列表
      getRolesList() {
        this.$http.get('roles').then(res => {
          if (res.data.meta.status !== 200) return
          this.rolesData = res.data.data
          // console.log(this.rolesData);
          // console.log(this.rolesData);
        }).catch(err => {
          console.log(err);
        })
      },
      // 添加角色按钮
      addRoles() {
        // 表单预校验
        this.$refs.rolesRef.validate(valid => {
          if (!valid) return this.$message.error('添加失败')
          // 实现添加角色功能
          this.$http.post('roles/', {
            roleName: this.rolesInfo.roleName,
            roleDesc: this.rolesInfo.roleDesc
          }).then(res => {
            if (res.data.meta.status === 201) {
              this.$message.success('添加成功')
              this.addRolesVisible = false
              this.getRolesList()
            } else {
              this.$message.error('添加失败')
            }
          }).catch(err => {
            console.log(err);
          })
        })
      },
      // 根据 id 查询角色信息
      getRolesInfo(id) {
        this.$http.get('roles/' + id).then(res => {
          this.getIdRolesInfo = res.data.data
          // console.log(typeof this.getIdRolesInfo.roleId);
        }).catch(err => {
          console.log(err);
        })
        this.editRolesVisible = true
      },
      // 修改角色信息
      editRolesInfo() {
        // 表单的预校验
        this.$refs.editRolesRef.validate(valid => {
          if (!valid) return this.$message.error('表单数据不合法')
          this.$http.put('roles/' + this.getIdRolesInfo.roleId,
            {
              roleName: this.getIdRolesInfo.roleName,
              roleDesc: this.getIdRolesInfo.roleDesc
            }).then(res => {
            // console.log(res);
          }).catch(err => {
            console.log(err);
          })
          this.editRolesVisible = false
          this.getRolesList()
        })
      },
      // 删除角色弹窗
      openDeleteRoles(id) {
        this.$confirm('此操作将永久删除该角色, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }).then(() => {
          /*这里存在的问题: 删除数据比跟新角色列表慢,
          导致本地存储的数据是删除前的数据, 从而导致页面不刷新,
            解决方法: 1.将 getRolesList() 放入 删除函数内部执行 :不行
                     2.在删除函数中设置条件 条件符合 更新函数才能执行 : 不行
                     3.在删除函数获取到成功状态后执行更新函数 : 可以*/
          this.deleteRolesInfo(id)
          this.$message({
            type: 'success',
            message: '删除成功!'
          })
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          })
        })
      },
      // 删除角色
      deleteRolesInfo(id) {
        this.$http.delete('roles/' + id).then(res => {
          // console.log(res);
          if (res.data.meta.status === 200) return this.getRolesList()
          this.$message.error('所要删除的用户不存在')
        }).catch(err => {
          console.log(err);
        })
      },
      // 删除角色的指定权限
      deleteRolesRight(role, rightId) {
        this.$http.delete(`roles/${role.id}/rights/${rightId}`).then(res => {
          if (res.data.meta.status !== 200) return this.$message.error('删除失败')
          this.$message.success('删除成功')
          // 将删除后获取到的最新的数据保存到 role 的children中
          role.children = res.data.data
        }).catch(err => {
          console.log(err);
        })
      },
      // 管理角色权限
      setRoles(roles) {
        // 本地保存角色id
        this.rolesId = roles.id
        // 点击完成后等下一次点击需要先将defKey赋值为空数组
        // console.log(this.rolesId);
        this.defKey = []
        this.setRolesdialogVisible = true
        // 获取权限数据
        this.$http.get('rights/tree').then(res => {
          // console.log(res);
          this.treeRights = res.data.data
          this.getRolesKey(roles, this.defKey)
          console.log(this.defKey);
          if (res.data.meta.status !== 200) return this.$message.error('获取权限数据失败')

          this.$message.success('获取数据成功')
        }).catch(err => {
          console.log(err);
        })
      },
      // 定义递归函数获取所有的三级权限并保存到新的数组中
      getRolesKey(node, arr) {
        if (!node.children) {
          // 判断没有子节点才将该节点 id 保存到arr中
          arr.push(node.id)
        } else {
          node.children.forEach(item => {
            this.getRolesKey(item, arr)
          })
        }
      },
      // 管理权限设置的点击事件
      setRightClick() {
        // 调用el-tree组件的方法
        /*获取到全选和半选状态下的id*/
        this.rids = [
          ...this.$refs.treeRef.getCheckedKeys(),
          ...this.$refs.treeRef.getHalfCheckedKeys()
        ].join(',')
        /*修改角色权限*/
        this.$http.post(`roles/${this.rolesId}/rights`, {rids: this.rids})
          .then(res => {
            // 重置角色id
            this.rolesId = 0
            // 更新数据
            this.getRolesList()
            if (res.data.meta.status === 200) return this.$message.success('设置权限成功')
            this.$message.error("设置权限失败")
          }).catch(err => {
          console.log(err);
        })
      }
      // 返回目前被选中的节点组成的数组
    }
  }
</script>

<style scoped>
  .bdTop{
    border-top: 1px solid #eaedf1;
  }
  .bdBottom{
    border-bottom: 1px solid #eaedf1;
  }
  .margin1{
    margin: 10px 0;
  }
  .tag{
    margin: 10px 5px;
  }
  .vcenter{
    display: flex;
    align-items: center;
  }
</style>
