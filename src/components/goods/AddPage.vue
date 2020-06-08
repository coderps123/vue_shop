<template>
  <div>
    <!--面包屑区域-->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>
    <!--卡片区域-->
    <el-card>
      <!--头部提示区域-->
      <el-alert title="添加商品信息" type="info" center :closable="false" show-icon></el-alert>
      <!--步骤条区域-->
      <el-steps :space="200" :active="activeIndex - 0" finish-status="success" align-center	>
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>
      <el-form :model="addGoodsForm" :rules="addGoodsFormRules" ref="addGoodsFormRef" label-width="100px" label-position="top">
        <!--tabs标签页区域-->
        <!--v-model绑定的是下方选项卡中的name值-->
        <el-tabs :tab-position="'left'" v-model="activeIndex" :before-leave="tabsBeforeLeave" @tab-click="tabClick">
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addGoodsForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model.number="addGoodsForm.goods_price"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model.number="addGoodsForm.goods_number"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model.number="addGoodsForm.goods_weight"></el-input>
            </el-form-item>
            <el-form-item label="商品分类">
              <!--级联选择器区域-->
              <el-cascader
                v-model="cascaderValue"
                :options="cascaderOptions"
                :props="{ value: 'cat_id', expandTrigger: 'hover', label: 'cat_name', children: 'children' }"
                @change="handleChange">
              </el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <el-form-item :label="item.attr_name" v-for="item in manyData" :key="item.attr_id">
              <!--多选框区域-->
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox border :label="im" v-for="(im, index) in item.attr_vals" :key="index" @change="checkBoxChange(im)" class="paramsCheckbox"></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <el-form-item :label="item.attr_name" v-for="item in onlyData" :key="item.attr_id">
              <!--多选框区域-->
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox border :label="im" v-for="(im, index) in item.attr_vals" :key="index" @change="checkBoxChange(im)" class="paramsCheckbox"></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <!--上传图片区域-->
            <!--action 表示图片要上传到的后台api地址-->
            <el-upload
              :action="uploadURL"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              :on-success="handleSuccess"
              :headers="headersObj"
              list-type="picture">
              <el-button size="small" type="primary">点击上传</el-button>
              <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <!--富文本编辑器区域-->
            <quill-editor
              v-model="addGoodsForm.goods_introduce">
            </quill-editor>
            <!--添加商品的按钮-->
            <el-button type="primary" class="addGoodsBtn" @click="addGoodsClick">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
      <!--上传图片对话框区域 ----实现预览功能-->
      <el-dialog
        title="图片预览"
        :visible.sync="duploaDialogVisible">
        <img :src="imgURL" alt="" class="imgStyle">
      </el-dialog>
    </el-card>
  </div>
</template>


<script>
  export default {
    name: "AddPage",
    data() {
      return {
        // 步骤条激活状态下的index
        activeIndex: '0',
        // 添加商品表单数据对象
        addGoodsForm: {
          goods_name: '',
          goods_price: 0,
          goods_number: 1,
          goods_weight: 0,
          pics: [],
          goods_introduce: '',
          goods_cat: '',
          attrs: []
        },
        // 添加商品表单的验证规则
        addGoodsFormRules: {
          goods_name: [
            { required: true, message: '请输入商品名称', trigger: 'blur' }
          ],
          goods_price: [
            { required: true, message: '请输入商品价格', trigger: 'blur' }
          ],
          goods_number: [
            { required: true, message: '请输入商品数量', trigger: 'blur' }
          ],
          goods_weight: [
            { required: true, message: '请输入商品重量', trigger: 'blur' }
          ]
        },
        /*级联选择器区域*/
        // 商品分类数据源对象
        cascaderOptions: [],
        // 选中的 value 数组
        cascaderValue: [],
        // 动态参数数据
        manyData: [],
        // 静态参数数据
        onlyData: [],
        // 图片要上传到的URL地址
        uploadURL: 'https://www.liulongbin.top:8888/api/private/v1/upload',
        // 设置上传图片的请求头
        headersObj: {
          Authorization: window.sessionStorage.getItem('token')
        },
        // 控制图片预览对话框的显隐
        duploaDialogVisible: false,
        // 图片预览的 URL
        imgURL: '',
      }
    },
    methods: {
      // 获取商品分类的所有数据
      getGoodsCate() {
        this.$http.get('categories').then(res => {
          // console.log(res);
          if (res.data.meta.status !== 200) return this.$message.error('获取商品分类数据失败')
          this.cascaderOptions = res.data.data
        }).catch(err => {
          console.log(err);
        })
      },
      // 当级联选择器选中节点发生变化时触发
      handleChange(val) {
        // console.log(val);
        console.log(this.cascaderValue);
        if (this.cascaderValue.length !== 3) {
          return this.cascaderValue = []
        }
      },
      // 切换tabs标签之前的钩子函数
      tabsBeforeLeave(activeName, oldActiveName) {
        console.log('将要到达的name:' + activeName);
        console.log('现在所在的name:' + typeof oldActiveName);
        if (oldActiveName === "0" && this.cascaderValue.length !== 3) {
          return false
        }
      },
      // 点击tab标签时触发
      tabClick(val) {
        console.log(val.name);
        // 当选中的 name 值为 1  并且级联选择器 value 值的长度是 3 才获取参数数据
        /**
         *  获取商品参数数据
         **/
        if (val.name === '1' && this.cascaderValue.length === 3) {
          this.$http.get(`categories/${this.cascaderValue[2]}/attributes`, {params: {sel: "many"}})
            .then(res => {
              if (res.data.meta.status !== 200) return this.$message.error('获取参数失败')
              // 将传过来的 attr_vals 进行进一步操作,
              // 如果 attr_vals 长度为空,即为空字符串 则直接赋为空对象,
              // 否则使用split函数分割字符串为一个数组
              res.data.data.forEach(item => {
                item.attr_vals = item.attr_vals.length === 0 ? [] : item.attr_vals.split(' ')
              })
              this.manyData = res.data.data
              console.log(this.manyData);
            }).catch(err => {
            console.log(err);
          })
        }
        /**
         * 获取商品属性数据
         */
        if (val.name === '2' && this.cascaderValue.length === 3) {
          this.$http.get(`categories/${this.cascaderValue[2]}/attributes`, {params: {sel: "only"}})
            .then(res => {
              if (res.data.meta.status !== 200) return this.$message.error('获取参数失败')
              // 将传过来的 attr_vals 进行进一步操作,
              // 如果 attr_vals 长度为空,即为空字符串 则直接赋为空对象,
              // 否则使用split函数分割字符串为一个数组
              res.data.data.forEach(item => {
                item.attr_vals = item.attr_vals.length === 0 ? [] : item.attr_vals.split(' ')
              })
              this.onlyData = res.data.data
              console.log(this.onlyData);
            }).catch(err => {
            console.log(err);
          })
        }
      },
      // 当checkbox值发生变化时触发
      checkBoxChange(im) {
        console.log(im);
      },
      // 点击文件列表中已上传的文件时的钩子
      handlePreview(file) {
        this.imgURL = file.response.data.url
        this.duploaDialogVisible = true
      },
      // 图片移除时触发的的钩子函数
      handleRemove(file) {
        console.log(file);
        // 找到将要删除的照片的 index
        const index = this.addGoodsForm.pics.findIndex(item => {
          return item.pic === file.response.data.tmp_path
        })
        console.log(index);
        // 调用数组的splice方法删除下标为index的对象
        this.addGoodsForm.pics.splice(index, 1)
        console.log(this.addGoodsForm.pics)
      },
      // 监听图片上传成功时的勾走函数
      handleSuccess(response) {
        // 将图片的临时路径拼接成一个对象
        const picsObj = {pic: response.data.tmp_path}
        this.addGoodsForm.pics.push(picsObj)
      },
      // 添加商品的点击事件
      addGoodsClick() {
        // 进行表单的预校验
        this.$refs.addGoodsFormRef.validate(valid => {
          if (!valid) {
            this.$message.error('请将商品信息添加完整')
          } else {
            // 将级联选择器中存储的value值传到addGoodsForm表单中
            this.addGoodsForm.goods_cat = this.cascaderValue.join(',')
            // console.log(this.addGoodsForm);
            // console.log(this.cascaderValue);
            // 处理动态参数和静态属性
            // console.log(this.manyData);
            // console.log(this.onlyData);
            // 处理动态参数
            this.manyData.forEach(item => {
              const newInfo = {
                attr_id: item.attr_id,
                attr_vals: item.attr_vals
              }
              this.addGoodsForm.attrs.push(newInfo)
            })
            // 处理静态属性
            this.onlyData.forEach(item => {
              const newInfo = {
                attr_id: item.attr_id,
                attr_vals: item.attr_vals
              }
              this.addGoodsForm.attrs.push(newInfo)
            })
            console.log(this.addGoodsForm.attrs);
            // 发起添加请求
            this.$http.post('goods', this.addGoodsForm).then(res => {
              console.log(res);
              if (res.data.meta.status !== 201) return this.$message.error('请求数据失败')
              this.$message.success('添加数据成功')
              this.addGoodsForm.attrs = []
            }).catch(err => {
              console.log(err);
            })
          }
        })
      }
    },
    created() {
      this.getGoodsCate()
    }
  }
</script>

<style scoped>
  /*步骤条区域样式*/
  .el-steps{
    margin: 10px 0;
  }
  .paramsCheckbox{
    margin: 5px 8px !important;
  }
  .imgStyle{
    width: 100%;
  }
  .addGoodsBtn{
    margin-top: 20px;
  }

</style>
