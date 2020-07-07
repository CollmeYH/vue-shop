<template>
    <div>
      <!-- 面包屑导航 -->
      <el-breadcrumb separator-class='el-icon-arrow-right'>
        <el-breadcrumb-item :to="{ path: '/categories' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>商品管理</el-breadcrumb-item>
        <el-breadcrumb-item>商品分类</el-breadcrumb-item>
      </el-breadcrumb>
      <!-- 卡片视图 -->
      <el-card class='box-card'>
        <el-row>
          <el-col>
            <el-button type='primary' @click='showCateDialogVisible()'>添加分类</el-button>
          </el-col>
        </el-row>
        <!-- 表格区 -->
        <tree-table class="treeTable" :data="cateList"
                    :columns="columns"
                    :selection-type="false"
                    :expand-type="false"
                    :show-index="true"
                    index-text="#"
                    :border="true">
          <template v-slot:isOk="scope">
            <i class="el-icon-success" style="color: lightgreen" v-if="scope.row.cat_deleted === false"></i>
            <i class="el-icon-error" style="color: red" v-else></i>
          </template>
          <template v-slot:order="scope">
            <el-tag size="mini" v-if="scope.row.cat_level === 0">一级</el-tag>
            <el-tag size="mini" v-else-if="scope.row.cat_level === 1" type="success">二级</el-tag>
            <el-tag size="mini" v-else type="warning">三级</el-tag>
          </template>
          <template v-slot:opt="scope">
            <!-- 编辑按钮-->
            <el-button type='primary' size='mini' icon='el-icon-edit'
                       @click='showUpdateCate(scope.row.cat_id)'>编辑</el-button>
            <!-- 刪除按钮-->
            <el-button type='danger' size='mini' icon='el-icon-delete'
                       @click='deleteCate(scope.row.cat_id)'>删除</el-button>
          </template>
        </tree-table>
        <!-- 分页区 -->
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
      <!-- 新增对话框-->
      <el-dialog title='添加分类' @close='addCateFormClose()' :visible.sync='addCateDialogVisible' :close-on-click-modal='false' width='50%'>
        <!-- 内容主体区 -->
        <el-form :model='addCateForm' :rules='addFormRules' ref='addFormRef' label-width='80px'>
          <el-form-item label='分类名称' prop='cat_name'>
            <el-input v-model='addCateForm.cat_name' autocompconste='off'></el-input>
          </el-form-item>
          <el-form-item label='父级分类'>
            <el-cascader
              v-model="selectKeys"
              :options="parentCateList"
              :props="cascaderProps"
              expandTrigger="hover"
              :clearable="true"
              filterable
              @change="parentChange">
            </el-cascader>
          </el-form-item>
        </el-form>
        <!-- 底部区 -->
        <div slot='footer' class='dialog-footer'>
          <el-button @click='addCateDialogVisible = false'>取 消</el-button>
          <el-button type='primary' @click="addCate">确 定</el-button>
        </div>
      </el-dialog>
      <!-- 修改对话框 -->
      <el-dialog title='修改分类' @close='updateCateFormClose()' :visible.sync='updateCateDialogVisible' :close-on-click-modal='false' width='50%'>
        <!-- 内容主体区 -->
        <el-form :model='updateCateForm' :rules='addFormRules' ref='updateFormRef' label-width='80px'>
          <el-form-item label='分类名称' prop='cat_name'>
            <el-input v-model='updateCateForm.cat_name' autocompconste='off'></el-input>
          </el-form-item>
        </el-form>
        <!-- 底部区 -->
        <div slot='footer' class='dialog-footer'>
          <el-button @click='updateCateDialogVisible = false'>取 消</el-button>
          <el-button type='primary' @click="updateCate">确 定</el-button>
        </div>
      </el-dialog>
    </div>
</template>

<script>
export default {
  name: 'Cate',
  created () {
    this.getCateList()
  },
  data () {
    return {
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 10
      },
      total: 0,
      // 商品分类的数据列表
      cateList: [],
      // 为table指定列
      columns: [{
        label: '分类名称',
        prop: 'cat_name'
      }, {
        label: '是否有效',
        prop: 'cat_deleted',
        type: 'template',
        template: 'isOk'
      }, {
        label: '排序',
        prop: 'cat_level',
        type: 'template',
        template: 'order'
      }, {
        label: '操作',
        type: 'template',
        template: 'opt'
      }],
      addCateDialogVisible: false,
      updateCateDialogVisible: false,
      addFormRules: {
        cat_name: [
          {
            required: true,
            message: '请输入分类名',
            trigger: 'blur'
          }
        ]
      },
      addCateForm: {
        cat_pid: 0,
        cat_level: 0,
        cat_name: ''
      },
      parentCateList: [],
      cascaderProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        checkStrictly: 'true'
      },
      selectKeys: [],
      updateCateForm: {}
    }
  },
  methods: {
    // 获取商品分类的数据列表
    getCateList () {
      this.$http.get('categories', { params: this.queryInfo }).then(res => {
        if (res.data.meta.status === 200) {
          this.cateList = res.data.data.result
          this.total = res.data.data.total
        } else {
          return this.$message.error(res.data.meta.msg)
        }
      })
    },
    // 监听pageSize的改变
    handleSizeChange (newSize) {
      this.queryInfo.pagesize = newSize
      this.getCateList()
    },
    // 监听pageNum改变事件
    handleCurrentChange (newNum) {
      this.queryInfo.pagenum = newNum
      this.getCateList()
    },
    addCateFormClose () {
      this.$refs.addFormRef.resetFields()
      this.selectKeys = []
      this.addCateForm.cat_pid = 0
      this.addCateForm.cat_level = 0
    },
    showCateDialogVisible () {
      this.getParentCateList()
      this.addCateDialogVisible = true
    },
    // 获取父级的list列表
    getParentCateList () {
      this.$http.get('categories', { params: { type: 2 } }).then(res => {
        if (res.data.meta.status === 200) {
          this.parentCateList = res.data.data
        } else {
          return this.$message.error(res.data.meta.msg)
        }
      })
    },
    // 选择项发生变化
    parentChange () {
      if (this.selectKeys.length > 0) {
        // 父级id
        this.addCateForm.cat_pid = this.selectKeys[this.selectKeys.length - 1]
        this.addCateForm.cat_level = this.selectKeys.length
      } else {
        // 父级id
        this.addCateForm.cat_pid = 0
        this.addCateForm.cat_level = 0
      }
    },
    // 保存分类
    addCate () {
      this.$refs.addFormRef.validate(valid => {
        if (valid) {
          this.$http.post('categories', this.addCateForm).then(res => {
            if (res.data.meta.status === 201) {
              this.getCateList()
              this.addCateDialogVisible = false
              return this.$message.success(res.data.meta.msg)
            } else {
              return this.$message.error(res.data.meta.msg)
            }
          })
        }
      })
    },
    // 修改
    showUpdateCate (id) {
      this.updateCateDialogVisible = true
      this.$http.get('categories/' + id).then(res => {
        if (res.data.meta.status === 200) {
          this.updateCateForm = res.data.data
        } else {
          this.$message.error(res.data.meta.msg)
        }
      })
    },
    // 重置修改表单
    updateCateFormClose () {
      this.updateCateForm = {}
      this.$refs.updateFormRef.resetFields()
    },
    // 修改保存
    updateCate () {
      this.$refs.updateFormRef.validate(valid => {
        if (valid) {
          this.$http.put('categories/' + this.updateCateForm.cat_id,
            { cat_name: this.updateCateForm.cat_name }).then(res => {
            if (res.data.meta.status === 200) {
              this.$message.success(res.data.meta.msg)
              this.updateCateDialogVisible = false
              this.getCateList()
            } else {
              this.$message.success(res.data.meta.msg)
            }
          })
        }
      })
    },
    // 删除
    deleteCate (id) {
      this.$confirm('此操作将永久删除该分类, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$http.delete('categories/' + id).then(res => {
          if (res.data.meta.status === 200) {
            this.$message.success(res.data.meta.msg)
            this.getCateList()
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
    }
  }
}
</script>

<style lang="less" scoped>
.treeTable{
  margin-top: 15px;
}
  .el-cascader {
    width: 100%;
  }
</style>
