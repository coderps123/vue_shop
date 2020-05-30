<template>
  <div>
    <el-button type="info" @click="backBtn">退出</el-button>
  </div>
</template>

<script>
  export default {
    name: "Home",
    methods: {
      backBtn() {
        // 清除token
        window.sessionStorage.clear()
        // 跳转到login
        this.$router.push('/login')
      }
    }
  }
</script>

<style scoped>

</style>
