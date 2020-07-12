<template>
    <div>
      <!-- 面包屑导航 -->
      <el-breadcrumb separator-class='el-icon-arrow-right'>
        <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>商品管理</el-breadcrumb-item>
        <el-breadcrumb-item>参数列表</el-breadcrumb-item>
      </el-breadcrumb>
      <!-- 卡片视图 -->
      <el-card class='box-card'>
        <!-- 警告框 -->
        <el-alert title="注意:只允许为第三级分类设置相关参数！" type="warning" show-icon :closable="false"></el-alert>
        <!-- 选择商品分类-->
        <el-row class="cat_opt">
          <el-col>
            <span>选择商品分类: </span>
            <el-cascader
              v-model="selectedCateKeys"
              :options="cateList"
              :props="cascaderProps"
              expandTrigger="hover"
              :clearable="true"
              @change="parentChange">
            </el-cascader>
          </el-col>
        </el-row>
        <!-- 页签区-->
        <el-tabs v-model="activeName" @tab-click="handleTabClick">
          <el-tab-pane label="动态参数" name="many" :disabled="isBtnDisable">
            <el-button type="primary" size="mini" :disabled="isBtnDisable" @click="addDialogVisible=true">添加参数</el-button>
            <el-table :data="manyTableData" border stripe>
              <el-table-column type="expand">
                <template v-slot="scope">
                  <el-tag v-for="(item,index) in scope.row.attr_vals" :key="index" closable @close="tagClose(index,scope.row)">
                    {{item}}
                  </el-tag>
                  <!-- 输入文本框 -->
                  <el-input
                    class="input-new-tag"
                    v-if="scope.row.inputVisible"
                    v-model="scope.row.inputValue"
                    ref="saveTagInput"
                    size="small"
                    @keyup.enter.native="handleInputConfirm(scope.row)"
                    @blur="handleInputConfirm(scope.row)">
                  </el-input>
                  <!-- 添加按钮 -->
                  <el-button v-else class="button-new-tag" size="small" @click="showInputButton(scope.row)">+ New Tag</el-button>
                </template>
              </el-table-column>
              <el-table-column type="index"></el-table-column>
              <el-table-column label="参数名称" prop="attr_name"></el-table-column>
              <el-table-column label="操作">
                <template v-slot="scope">
                  <!-- 编辑按钮-->
                  <el-button type='primary' size='mini' icon='el-icon-edit'
                             @click='showUpdateCate(scope.row.attr_id)'>编辑</el-button>
                  <!-- 刪除按钮-->
                  <el-button type='danger' size='mini' icon='el-icon-delete'
                             @click='deleteCate(scope.row.attr_id)'>删除</el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-tab-pane>
          <el-tab-pane label="静态属性" name="only" :disabled="isBtnDisable">
            <el-button type="primary" size="mini" :disabled="isBtnDisable" @click="addDialogVisible=true">添加属性</el-button>
            <el-table :data="onlyTableData" border stripe>
              <el-table-column type="expand">
                <template v-slot="scope">
                  <el-tag v-for="(item,index) in scope.row.attr_vals" :key="index" closable @close="tagClose(index,scope.row)">
                    {{item}}
                  </el-tag>
                  <!-- 输入文本框 -->
                  <el-input
                    class="input-new-tag"
                    v-if="scope.row.inputVisible"
                    v-model="scope.row.inputValue"
                    ref="saveTagInput"
                    size="small"
                    @keyup.enter.native="handleInputConfirm(scope.row)"
                    @blur="handleInputConfirm(scope.row)">
                  </el-input>
                  <!-- 添加按钮 -->
                  <el-button v-else class="button-new-tag" size="small" @click="showInputButton(scope.row)">+ New Tag</el-button>
                </template>
              </el-table-column>
              <el-table-column type="index"></el-table-column>
              <el-table-column label="属性名称" prop="attr_name"></el-table-column>
              <el-table-column label="操作">
                <template v-slot="scope">
                  <!-- 编辑按钮-->
                  <el-button type='primary' size='mini' icon='el-icon-edit'
                             @click='showUpdateCate(scope.row.attr_id)'>编辑</el-button>
                  <!-- 刪除按钮-->
                  <el-button type='danger' size='mini' icon='el-icon-delete'
                             @click='deleteCate(scope.row.attr_id)'>删除</el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-tab-pane>
        </el-tabs>
      </el-card>
      <!-- 新增对话框 -->
      <el-dialog :title='activeName === "many" ? "添加参数" : "添加属性"' @close="addDialogClose" :visible.sync='addDialogVisible' :close-on-click-modal='false' width='50%'>
        <!-- 内容主体区 -->
        <el-form :model='addForm' :rules='addFormRules' ref='addFormRef' label-width='80px'>
          <el-form-item :label='activeName === "many" ? "参数名称" : "属性名称"' prop='attr_name'>
            <el-input v-model='addForm.attr_name' autocompconste='off'></el-input>
          </el-form-item>
        </el-form>
        <!-- 底部区 -->
        <div slot='footer' class='dialog-footer'>
          <el-button @click='addDialogVisible = false'>取 消</el-button>
          <el-button type='primary' @click="saveForm">确 定</el-button>
        </div>
      </el-dialog>
      <!-- 修改对话框 -->
      <el-dialog :title='activeName === "many" ? "修改参数" : "修改属性"' @close="updateDialogClose" :visible.sync='updateDialogVisible' :close-on-click-modal='false' width='50%'>
        <!-- 内容主体区 -->
        <el-form :model='updateForm' :rules='addFormRules' ref='updateFormRef' label-width='80px'>
          <el-form-item :label='activeName === "many" ? "参数名称" : "属性名称"' prop='attr_name'>
            <el-input v-model='updateForm.attr_name' autocompconste='off'></el-input>
          </el-form-item>
        </el-form>
        <!-- 底部区 -->
        <div slot='footer' class='dialog-footer'>
          <el-button @click='updateDialogVisible = false'>取 消</el-button>
          <el-button type='primary' @click="saveUpdateForm">确 定</el-button>
        </div>
      </el-dialog>
    </div>
</template>

<script>
export default {
  name: 'params',
  created () {
    this.getCateList()
  },
  data () {
    return {
      cateList: [],
      selectedCateKeys: [],
      cascaderProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      activeName: 'many',
      manyTableData: [],
      onlyTableData: [],
      addDialogVisible: false,
      updateDialogVisible: false,
      inputVisible: false,
      inputValue: '',
      addForm: {},
      updateForm: {},
      addFormRules: {
        attr_name: [
          {
            required: true,
            message: this.activeName === 'many' ? '参数名称不能为空' : '属性名称不能为空',
            trigger: 'blur'
          }
        ]
      }
    }
  },
  methods: {
    getCateList () {
      this.$http.get('categories').then(res => {
        if (res.data.meta.status === 200) {
          this.cateList = res.data.data
        } else {
          return this.$message.error(res.data.meta.msg)
        }
      })
    },
    // 选择项发生变化
    parentChange () {
      if (this.selectedCateKeys.length !== 3) {
        // 父级id
        this.selectedCateKeys = []
        this.manyTableData = []
        this.onlyTableData = []
      } else {
        this.getParamsData()
      }
    },
    // tab页签点击事件
    handleTabClick () {
      this.getParamsData()
    },
    // 获取参数
    getParamsData () {
      this.$http.get('categories/' + this.cateId + '/attributes', { params: { sel: this.activeName } }).then(res => {
        if (res.data.meta.status === 200) {
          if (res.data.data != null) {
            res.data.data.forEach(item => {
              item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
              item.inputVisible = false
              item.inputValue = ''
            })
          }
          if (this.activeName === 'many') {
            this.manyTableData = res.data.data
          } else {
            this.onlyTableData = res.data.data
          }
        } else {
          return this.$message.error(res.data.meta.msg)
        }
      })
    },
    addDialogClose () {
      this.$refs.addFormRef.resetFields()
    },
    updateDialogClose () {
      this.$refs.updateFormRef.resetFields()
    },
    saveForm () {
      this.$refs.addFormRef.validate(valid => {
        if (valid) {
          this.$http.post('categories/' + this.cateId + '/attributes',
            { attr_name: this.addForm.attr_name, attr_sel: this.activeName }).then(res => {
            if (res.data.meta.status === 201) {
              this.addDialogVisible = false
              this.getParamsData()
              this.$message.success(res.data.meta.msg)
            } else {
              this.$message.error(res.data.meta.msg)
            }
          })
        }
      })
    },
    showUpdateCate (id) {
      this.updateDialogVisible = true
      this.$http.get('categories/' + this.cateId + '/attributes/' + id, { params: { attr_sel: this.activeName } }).then(res => {
        if (res.data.meta.status === 200) {
          this.updateForm = res.data.data
        } else {
          this.$message.error(res.data.meta.msg)
        }
      })
    },
    saveUpdateForm () {
      this.$refs.updateFormRef.validate(valid => {
        if (valid) {
          this.$http.put('categories/' + this.cateId + '/attributes/' + this.updateForm.attr_id,
            { attr_name: this.updateForm.attr_name, attr_sel: this.activeName }).then(res => {
            if (res.data.meta.status === 200) {
              this.updateDialogVisible = false
              this.getParamsData()
              this.$message.success(res.data.meta.msg)
            } else {
              this.$message.error(res.data.meta.msg)
            }
          })
        }
      })
    },
    deleteCate (id) {
      this.$confirm('此操作将永久删除该分类, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$http.delete('categories/' + this.cateId + '/attributes/' + id).then(res => {
          if (res.data.meta.status === 200) {
            this.$message.success(res.data.meta.msg)
            this.getParamsData()
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
    updateAttr: function (row) {
      this.$http.put('categories/' + this.cateId + '/attributes/' + row.attr_id, {
        attr_name: row.attr_name,
        attr_sel: this.activeName,
        attr_vals: row.attr_vals.join(' ')
      }).then(res => {
        if (res.data.meta.status === 200) {
          this.$message.success(res.data.meta.msg)
        } else {
          this.$message.error(res.data.meta.msg)
        }
      })
    },
    handleInputConfirm (row) {
      row.inputVisible = false
      if (row.inputValue.trim().length === 0) {
        row.inputValue = ''
        return
      }
      row.attr_vals.push(row.inputValue.trim())
      this.updateAttr(row)
      row.inputValue = ''
    },
    showInputButton (row) {
      row.inputVisible = true
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    // 删除tag
    tagClose (index, row) {
      row.attr_vals.splice(index, 1)
      this.updateAttr(row)
    }
  },
  computed: {
    // eslint-disable-next-line vue/return-in-computed-property
    isBtnDisable () {
      if (this.selectedCateKeys.length !== 3) {
        return true
      }
    },
    // eslint-disable-next-line vue/return-in-computed-property
    cateId () {
      if (this.selectedCateKeys.length === 3) {
        return this.selectedCateKeys[2]
      }
    }
  }
}
</script>

<style lang="less" scoped>
  .cat_opt {
    margin: 15px 0
  }
  .el-tag {
    margin: 8px;
  }
  .input-new-tag {
    width: 150px;
  }
</style>
