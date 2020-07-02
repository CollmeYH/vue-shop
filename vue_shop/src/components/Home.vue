<template>
  <el-container class="home-container">
    <!-- 头部区域 -->
    <el-header>
      <div>
        <img src="../assets/zhu.jpg" width=55px>
        <span>Vue实战练习</span>
      </div>
      <el-button @click="logout" type="info">退出</el-button>
    </el-header>
    <!-- 页面主体 -->
    <el-container>
      <!-- 侧边栏 -->
      <el-aside :width="menuWidth">
        <div class="toggle-button" @click="toggleCollapse">|||</div>
        <el-menu background-color="rgb(49,55,67)" :default-active="$route.path" :router="true" :unique-opened="true" :collapse="isCollapse" :collapse-transition="false" text-color="#fff" active-text-color="rgb(54,154,246)">
          <!-- 一级菜单 -->
          <el-submenu :index="item.id+''" v-for = "item in menuList" :key="item.id">
            <!-- 一级菜单模板区域 -->
            <template slot="title">
              <i :class="menuIcon[item.path]"></i>
              <span>{{item.authName}}</span>
            </template>
            <!-- 二级菜单 -->
            <el-menu-item :index="'/' + subItem.path" v-for = "subItem in item.children" :key="subItem.id">
              <!-- 二级菜单模板区域 -->
              <template>
                <i class="el-icon-menu"></i>
                <span>{{subItem.authName}}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <!-- 右侧内容 -->
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  name: 'Home',
  created () {
    this.getMenuList()
  },
  data: function () {
    return {
      // 左侧菜单数据
      menuList: [],
      menuIcon: {
        users: 'el-icon-user',
        rights: 'el-icon-lock',
        goods: 'el-icon-goods',
        orders: 'el-icon-document',
        reports: 'el-icon-data-line'
      },
      isCollapse: false,
      menuWidth: '200px'
    }
  },
  methods: {
    logout () {
      window.sessionStorage.clear()
      this.$router.push('/login')
    },
    getMenuList () {
      this.$http.get('menus').then(res => {
        if (res.data.meta.status !== 200) {
          this.$notify.error({
            title: '获取菜单数据失败',
            message: res.data.meta.msg
          })
        }
        this.menuList = res.data.data
      })
    },
    toggleCollapse () {
      // 菜单的折叠和展开
      this.isCollapse = !this.isCollapse
      if (this.isCollapse === false) {
        this.menuWidth = '200px'
      }
      if (this.isCollapse === true) {
        this.menuWidth = '64px'
      }
    }
  }
}
</script>

<style lang="less" scoped>
  .el-header {
    background-color: rgb(60,63,65);
    display: flex;
    justify-content: space-between;
    padding-left: 0;
    align-items: center;
    color: #fff;
    font-size: 20px;
    > div {
      display: flex;
      align-content: center;
      span {
        padding-top: 15px;
      margin-left: 15px;
      }
    }
  }
  .el-aside {
  background-color: rgb(49,55,67);
   .el-menu{
      border-right: none;
   }
  }
  .el-main {
    background-color: azure;
  }
  .home-container {
    height: 100%;
  }
  .toggle-button {
    background-color: rgb(71,81,100);
    font-size: 10px;
    line-height: 24px;
    color: #fff;
    text-align: center;
    letter-spacing: 0.2em;
    cursor: pointer;
  }
</style>
