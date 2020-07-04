<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class='el-icon-arrow-right'>
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card class='box-card'>
      <!-- 搜索框 -->
      <el-row :gutter='20'>
        <el-col :span='4'>
          <el-button type='primary' @click='addDialogVisible=true'>添加角色</el-button>
        </el-col>
      </el-row>
      <!-- 角色列表区 -->
      <el-table :data="rolesList" border stripe height="700px">
        <el-table-column type="expand" v-slot="scope">
          <el-row :class="['dbbottom',i1 === 0 ? 'dbtop' : '','vcenter']" v-for="(item1,i1) in scope.row.children" :key="item1.id">
            <!-- 一级权限 -->
            <el-col :span="5">
              <el-tag closable @close="removeRightById(scope.row,item1.id)">{{item1.authName}}</el-tag><i class="el-icon-caret-right"></i>
            </el-col>
            <!-- 二级和三级权限-->
            <el-col :span="19">
              <el-row v-for="(item2, i2) in item1.children" :class="[i2 === 0 ? '':'dbtop','vcenter']" :key="item2.id">
                <!-- 二级 -->
                <el-col :span="6">
                  <el-tag @close="removeRightById(scope.row,item2.id)" closable type="success">{{item2.authName}}</el-tag><i class="el-icon-caret-right"></i>
                </el-col>
                <!-- 三级 -->
                <el-col :span="18">
                  <el-tag closable @close="removeRightById(scope.row,item3.id)" type="warning" v-for="item3 in item2.children" :key="item3.id">
                    {{item3.authName}}
                  </el-tag>
                </el-col>
              </el-row>
            </el-col>
          </el-row>
        </el-table-column>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作" width="300px">
          <template v-slot="scope">
            <!-- 编辑按钮-->
            <el-button type='primary' size='mini' icon='el-icon-edit' @click='showUpdateRole(scope.row.id)'>编辑</el-button>
            <!-- 刪除按钮-->
            <template>
              <el-button type='danger' size='mini' icon='el-icon-delete' @click='deconsteRole(scope.row.id)'>删除</el-button>
            </template>
            <!-- 分配角色-->
            <el-button type='warning' size='mini' icon='el-icon-setting' @click="showSetRightDialog(scope.row)">分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!-- 新增对话框-->
    <el-dialog title='新增用户' @close='addFormClose()' :visible.sync='addDialogVisible' :close-on-click-modal='false' width='50%'>
      <!-- 内容主体区 -->
      <el-form :model='addForm' :rules='addFormRules' ref='addFormRef' label-width='70px'>
        <el-form-item label='角色名' prop='roleName'>
          <el-input v-model='addForm.roleName' autocompconste='off'></el-input>
        </el-form-item>
        <el-form-item label='备注' prop='roleDesc'>
          <el-input v-model='addForm.roleDesc' autocompconste='off'></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区 -->
      <div slot='footer' class='dialog-footer'>
        <el-button @click='addDialogVisible = false'>取 消</el-button>
        <el-button type='primary' @click='addRole'>确 定</el-button>
      </div>
    </el-dialog>
    <!-- 修改用户对话框-->
    <el-dialog title='编辑角色'  @close='updateFormClose()' :visible.sync='updateDialogVisible' :close-on-click-modal='false' width='50%'>
      <!-- 内容主体区 -->
      <el-form :model='updateForm' :rules='addFormRules' ref='updateFormRef' label-width='70px'>
        <el-form-item label='角色名' prop='roleName'>
          <el-input v-model='updateForm.roleName' autocompconste='off'></el-input>
        </el-form-item>
        <el-form-item label='密码' prop='roleDesc'>
          <el-input v-model='updateForm.roleDesc' autocompconste='off'></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区 -->
      <div slot='footer' class='dialog-footer'>
        <el-button @click='updateDialogVisible = false'>取 消</el-button>
        <el-button type='primary' @click='updateRole()'>确 定</el-button>
      </div>
    </el-dialog>
    <!-- 分配权限对话框-->
    <el-dialog title='分配权限' @close='roleFormClose()' :visible.sync='roleDialogVisible' :close-on-click-modal='false' width='50%'>
      <!-- 内容主体区 -->
      <el-tree
        :data="rightsList"
        show-checkbox
        node-key="id"
        :default-expanded-keys="defKeys"
        :default-checked-keys="defKeys"
        :props="treeProps"
        ref="treeRef">
      </el-tree>
      <!-- 底部区 -->
      <div slot='footer' class='dialog-footer'>
        <el-button @click='roleDialogVisible = false'>取 消</el-button>
        <el-button type='primary' @click='allotRights()'>确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'Roles',
  created () {
    this.getRolesList()
  },
  data () {
    return {
      addDialogVisible: false,
      updateDialogVisible: false,
      roleDialogVisible: false,
      // 添加角色的表单数据
      addForm: {
        roleName: '',
        roleDesc: ''
      },
      // 修改的单个对象
      updateForm: {},
      // 所以权限的数据
      rightsList: [],
      // 树形控件的属性绑定对象
      treeProps: {
        label: 'authName',
        children: 'children'
      },
      // 默认选择的id值
      defKeys: [],
      roleId: '',
      // 校验添加用户表单规则
      addFormRules: {
        roleName: [
          { required: true, message: '请输入角色名', trigger: 'blur' },
          { min: 2, max: 10, message: '长度在 2 到 10 个字符', trigger: 'blur' }
        ]
      },
      rolesList: []
    }
  },
  methods: {
    getRolesList () {
      this.$http.get('roles').then(res => {
        if (res.data.meta.status === 200) {
          this.rolesList = res.data.data
        } else {
          this.$message.error(res.data.meta.msg)
        }
      })
    },
    addRole () {
      this.$refs.addFormRef.validate(valid => {
        if (valid) {
          // 保存用户
          this.$http.post('roles', this.addForm).then(res => {
            if (res.data.meta.status === 201) {
              this.addDialogVisible = false
              this.$message.success(res.data.meta.msg)
              this.getRolesList()
            } else {
              this.$message.error(res.data.meta.msg)
            }
          })
        }
      })
    },
    updateRole () {
      this.$refs.updateFormRef.validate(valid => {
        if (valid) {
          this.$http.put('roles/' + this.updateForm.roleId,
            { roleName: this.updateForm.roleName, roleDesc: this.updateForm.roleDesc }).then(res => {
            if (res.data.meta.status === 200) {
              this.$message.success('修改成功')
              this.updateDialogVisible = false
              this.getRolesList()
            } else {
              this.$message.success(res.data.meta.msg)
            }
          })
        }
      })
    },
    addFormClose () {
      this.$refs.addFormRef.resetFields()
    },
    updateFormClose () {
      this.$refs.updateFormRef.resetFields()
    },
    showUpdateRole (id) {
      this.updateDialogVisible = true
      this.$http.get('roles/' + id).then(res => {
        if (res.data.meta.status === 200) {
          this.updateForm = res.data.data
        } else {
          this.$message.error(res.data.meta.msg)
        }
      })
    },
    deconsteRole (id) {
      this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$http.delete('roles/' + id).then(res => {
          if (res.data.meta.status === 200) {
            this.$message.success(res.data.meta.msg)
            this.getRolesList()
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
    removeRightById (role, rightId) {
      this.$confirm('此操作将永久删除该权限, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$http.delete('roles/' + role.id + '/rights/' + rightId).then(res => {
          if (res.data.meta.status === 200) {
            this.$message.success(res.data.meta.msg)
            role.children = res.data.data
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
    showSetRightDialog (role) {
      this.roleId = role.id
      this.roleDialogVisible = true
      this.$http.get('rights/tree').then(res => {
        if (res.data.meta.status === 200) {
          this.rightsList = res.data.data
          this.getDefKeys(role, this.defKeys)
        } else {
          this.$message.error(res.data.meta.msg)
        }
      })
    },
    getDefKeys (node, arr) {
      if (!node.children) {
        return arr.push(node.id)
      }
      node.children.forEach(item => {
        this.getDefKeys(item, arr)
      })
    },
    roleFormClose () {
      this.defKeys = []
    },
    allotRights () {
      const keys = [
        this.$refs.treeRef.getCheckedKeys(),
        this.$refs.treeRef.getHalfCheckedKeys()
      ]
      const idStr = keys.join(',')
      this.$http.post('roles/' + this.roleId + '/rights', { rids: idStr }).then(res => {
        if (res.data.meta.status === 200) {
          this.$message.success(res.data.meta.msg)
          this.roleDialogVisible = false
          this.getRolesList()
        } else {
          this.$message.error(res.data.meta.msg)
        }
      })
    }
  }
}
</script>

<style lang="less" scoped>
  .el-tag {
    margin: 7px;
  }
  .dbtop {
    border-top: 1px solid #eee;
  }
  .dbbottom {
    border-bottom: 1px solid #eee;
  }
  .vcenter {
    display: flex;
    align-items: center;
  }
</style>
