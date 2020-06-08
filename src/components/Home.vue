<template>
  <div class="home">
    <el-container class="home_1">
      <!--头部-->
      <el-header>
        <h1>电商管理系统</h1>
        <el-button type="info" @click="backBtn">退出</el-button>
      </el-header>
      <el-container>
        <!--侧边栏-->
        <el-aside :width="isfold ? '64px' : '200px'">
          <!--折叠区-->
          <div class="clickBtn" @click="clickBtn">|&nbsp|&nbsp|</div>
          <el-menu
            background-color="#333744"
            text-color="#fff"
            active-text-color="#409BFF"
            v-if="menuList.length !== 0"
            :unique-opened="true"
            :collapse="isfold"
            :collapse-transition="false"
            :router="true"
            :default-active="$route.path">
            <!--一级菜单-->
            <el-submenu :index="item.id + '' " v-for="item in menuList" :key="item.id">
              <template slot="title">
                <i :class="iconObj[item.id]"></i>
                <span>{{item.authName}}</span>
              </template>
                <!--二级菜单-->
                <el-menu-item :index=" '/' + im.path" v-for="im in item.children" :key="im.id">
                  <template slot="title">
                    <i class="el-icon-menu"></i>
                    <span>{{im.authName}}</span>
                  </template>
                </el-menu-item>
            </el-submenu>
          </el-menu>
        </el-aside>
        <!--右侧内容-->
        <el-main>
          <!--welcome路由占位符-->
          <router-view></router-view>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script>
  export default {
    name: "Home",
    data() {
      return {
        menuList: [],
        iconObj: {
          '125': 'el-icon-user-solid',
          '103': 'el-icon-unlock',
          '101': 'el-icon-goods',
          '102': 'el-icon-tickets',
          '145': 'el-icon-s-data'
        },
        // 是否折叠
        isfold: false
      }
    },
    methods: {
      backBtn() {
        // 清除token
        window.sessionStorage.clear()
        // 跳转到login
        this.$router.push('/login')
      },
      getMenuList() {
        this.$http.get('menus').then(res=> {
          // console.log(res.data.data);
          this.menuList = res.data.data
        })
      },
      // 左侧折叠函数
      clickBtn() {
        this.isfold = !this.isfold
      }
    },
    created() {
      this.getMenuList()
    }
  }
</script>

<style scoped>
  .el-header{
    background-color: #373b41;
    position: relative;
  }
  .el-header h1{
    color: #f0f0f0;
    font-family: Arial;
    margin: 14px 0;
  }
  .el-button{
    position: absolute;
    right: 20px;
    top: 50%;
    transform: translate(0, -50%);
  }
  .el-aside{
    background-color: #333744;
  }
  .el-main{
    background-color: #eaedf1;
  }
  .home, .home_1{
    height: 100%;
  }

  .el-menu{
    border-right: 0px ;
  }
  .clickBtn{
    text-align: center;
    line-height: 30px;
    background-color: #4A5064;
    color: #ffffff;
    /*显示小手*/
    cursor: pointer;
  }

</style>
