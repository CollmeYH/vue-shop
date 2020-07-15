<template>
    <div>
      <!-- 面包屑导航 -->
      <el-breadcrumb separator-class='el-icon-arrow-right'>
        <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>商品管理</el-breadcrumb-item>
        <el-breadcrumb-item>商品列表</el-breadcrumb-item>
      </el-breadcrumb>
      <!-- 卡片视图 -->
      <el-card class='box-card'>
        <el-row :gutter='20'>
          <el-col :span='2' style='margin-top: 8px'>商品名称:</el-col>
          <el-col :span="8">
            <el-input v-model="queryInfo.query" clearable placeholder="请输入内容">
              <el-button @click='getGoodsList()' slot="append" icon="el-icon-search">搜索</el-button>
            </el-input>
          </el-col>
          <el-col :span="4">
            <el-button type="primary" @click="goAddGoodsPage()">添加商品</el-button>
          </el-col>
        </el-row>
        <!-- 表格区-->
        <el-table :data="goodsList" border>
          <el-table-column type="index"></el-table-column>
          <el-table-column prop="goods_name" label="商品名称"></el-table-column>
          <el-table-column prop="goods_price" label="商品价格(元)" width="120px"></el-table-column>
          <el-table-column prop="goods_number" label="商品数量" width="100px"></el-table-column>
          <el-table-column prop="goods_weight" label="商品重量" width="100px"></el-table-column>
          <el-table-column prop="goods_state" label="商品状态" width="100px">
            <template v-slot='scope'>
              <el-tag v-if="scope.row.goods_state===0">已审核</el-tag>
              <el-tag v-else-if="scope.row.goods_state===1" type="success">审核中</el-tag>
              <el-tag v-else type="warning">未通过</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="add_time" label="创建时间" width="240px">
            <template v-slot:default='scop'>
              {{scop.row.add_time | dateFormat}}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="150px">
            <template v-slot='scope'>
              <!-- 编辑按钮-->
              <el-button type='primary' size='mini' icon='el-icon-edit'></el-button>
              <!-- 刪除按钮-->
              <el-button type='danger' @click='deleteGoods(scope.row.goods_id)' size='mini' icon='el-icon-delete'></el-button>
            </template>
          </el-table-column>
        </el-table>
        <!-- 分页控件-->
        <el-pagination
          @size-change='handleSizeChange'
          @current-change='handleCurrentChange'
          :current-page='queryInfo.pagenum'
          :page-sizes='[5, 10, 15, 20]'
          :page-size='queryInfo.pagesize'
          layout='total, sizes, prev, pager, next, jumper'
          :total='total'>
        </el-pagination>
      </el-card>
    </div>
</template>

<script>
export default {
  name: 'List',
  created () {
    this.getGoodsList()
  },
  data () {
    return {
      // 用来查询的对象
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      total: 0,
      goodsList: []
    }
  },
  methods: {
    // 监听pageSize的改变
    handleSizeChange (newSize) {
      this.queryInfo.pagesize = newSize
      this.getGoodsList()
    },
    // 监听pageNum改变事件
    handleCurrentChange (newNum) {
      this.queryInfo.pagenum = newNum
      this.getGoodsList()
    },
    // 监听状态开关事件
    goodsStateChange (userInfo) {
      // this.$http.put('users/' + userInfo.id + '/state/' + userInfo.mg_state).then(res => {
      //   console.log(res)
      //   if (res.data.meta.status !== 200) {
      //     userInfo.mg_state = !userInfo.mg_state
      //     return this.$message.error('更新用户状态失败!')
      //   }
      //   this.$message.success('更新用户状态成功!')
      // })
    },
    getGoodsList () {
      this.$http.get('goods', { params: this.queryInfo }).then(res => {
        if (res.data.meta.status !== 200) {
          return this.$message.error('获取商品列表失败')
        }
        this.goodsList = res.data.data.goods
        this.total = res.data.data.total
      })
    },
    deleteGoods (id) {
      this.$confirm('此操作将永久删除该商品, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$http.delete('goods/' + id).then(res => {
          if (res.data.meta.status === 200) {
            this.$message.success(res.data.meta.msg)
            this.getGoodsList()
          } else {
            this.$message.error(res.data.meta.msg)
          }
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
    },
    // 添加用户
    goAddGoodsPage () {
      this.$router.push('/goods/add')
    }
  }
}
</script>

<style lang="less" scoped>
.el-col-2 {
  width: 5.6666%
}
</style>
