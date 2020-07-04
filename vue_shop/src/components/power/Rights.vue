<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class='el-icon-arrow-right'>
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>权限列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card class='box-card'>
      <el-table :data="rightsList" border stripe style='width: 100%' >
        <el-table-column type="index"></el-table-column>
        <el-table-column prop="authName" label="权限名称"></el-table-column>
        <el-table-column prop="path" label="路径"></el-table-column>
        <el-table-column prop="level" label="权限等级">
          <template v-slot='scope'>
            <el-tag v-if="scope.row.level==='1'">一级</el-tag>
            <el-tag v-else-if="scope.row.level==='2'" type="success">二级</el-tag>
            <el-tag v-else type="warning">三级</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'Rights',
  created () {
    this.getRightsList()
  },
  data () {
    return {
      // 权限列表
      rightsList: []
    }
  },
  methods: {
    getRightsList () {
      this.$http.get('rights/list').then(res => {
        if (res.data.meta.status === 200) {
          this.rightsList = res.data.data
        } else {
          this.$message.error(res.data.meta.msg)
        }
      })
    }
  }
}
</script>

<style scoped>

</style>
