<template>
  <div class="Login_warp">
    <!-- 头部头像区域 -->
    <div class="Login_box">
      <div class="Login_img_box">
        <img src="../assets/img/1.png" alt="">
      </div>

      <!--登陆表单区域-->
      <el-form label-width="0"
               class="Login_from"
               :model="login_from"
               :rules="rules"
               ref="login_from_ref">
        <!--用户名区域-->
        <el-form-item prop="username">
          <el-input prefix-icon="el-icon-user" v-model="login_from.username" ></el-input>
        </el-form-item>

        <!--密码表单区域-->
        <el-form-item prop="password">
          <el-input prefix-icon="el-icon-lock" v-model="login_from.password" type="password"></el-input>
        </el-form-item>

        <!--按钮区域-->
        <el-form-item class="From_botton">
          <el-button type="primary" @click="loginFromValidate">登录</el-button>
          <el-button type="info" @click="loginFromReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
  export default {
    name: "Login",
    data() {
      return {
        login_from: {
          username: "admin",
          password: '123456',
        },
        rules: {
          username: [
            { required: true, message: '请输入用户名', trigger: 'blur' },
            { min: 2, max: 10, message: '长度在 2 到 10 个字符', trigger: 'blur' }
          ],
          password: [
            { required: true, message: '请输入密码', trigger: 'blur' },
            { min: 6, max: 15, message: '长度在 6 到 16 个字符', trigger: 'blur' }
          ]
        },
        adminData: {}
      }
    },
    methods: {
      loginFromReset() {
        // console.log(this)
        // elemeent-ui 内部提供很多可用的表单方法
        this.$refs.login_from_ref.resetFields()
      },
      loginFromValidate() {
        this.$refs.login_from_ref.validate(valid =>{
          if (!valid) return
          this.$http.post('login', this.login_from).then(res => {
            console.log(res.data);
            this.adminData = res.data
            if (this.adminData.meta.status !== 200) return this.$message.error('登录失败')
            this.$message({
              message: '登录成功',
              type: 'success'
            })
            window.sessionStorage.setItem('token', res.data.data.token)
            this.$router.push('/home')
          })
        })
      }
    }
  }
</script>

<style scoped>
  .Login_warp{
    width: 100%;
    height: 100%;

    display: flex;
    justify-content: center;
    align-items: center;
  }
  .Login_box{
    width: 450px;
    height: 300px;
    background-color: #f8f8f8;

    position: relative;
  }
  .Login_img_box{
    width: 130px;
    height: 130px;
    border-radius: 50%;
    padding: 10px;
    background-color: #fff;

    position: absolute;
    left: 50%;
    transform: translate(-50%, -50%);


    /*添加阴影效果, x 偏移量  y 偏移量  模糊半径  颜色*/
    box-shadow: 0 0 5px #f2f2f2;
  }
  .Login_img_box img{
    width: 100%;
    height: 100%;
    border-radius: 50%;
  }

  .Login_from{
    width: 80%;

    position: absolute;
    bottom: 0px;
    left: 50%;
    transform: translate(-50%);
  }
  .From_botton{
    display: flex;
    justify-content: flex-end;
  }
</style>
