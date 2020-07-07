<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class='el-icon-arrow-right'>
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card class='box-card'>
      <!-- 搜索框 -->
      <el-row :gutter='20'>
        <el-col :span='2' style='margin-top: 8px'>用户名:</el-col>
        <el-col :span='8'>
          <el-input placeholder='请输入内容' @clear='getUserList()' clearable v-model='queryInfo.query'>
            <el-button @click='getUserList()' slot='append' icon='el-icon-search'></el-button>
          </el-input>
        </el-col>
        <el-col :span='4'>
          <el-button type='primary' @click='addDialogVisible=true'>添加用户</el-button>
        </el-col>
      </el-row>
      <!-- 表格数据 -->
      <el-table :data='userList' border style='width: 100%'>
        <el-table-column type='index'></el-table-column>
        <el-table-column prop='username' label='姓名' ></el-table-column>
        <el-table-column prop='role_name' label='角色'></el-table-column>
        <el-table-column prop='mobile' label='电话' ></el-table-column>
        <el-table-column prop='email' label='邮箱' width='180px'></el-table-column>
        <el-table-column prop='create_time' label='创建时间'>
          <template v-slot:default='scop'>
            {{createtimeed(scop.row.create_time)}}
          </template>
        </el-table-column>
        <el-table-column label='状态' width='70px'>
          <template v-slot:default='scop'>
            <el-switch
              v-model='scop.row.mg_state'
              active-color='#13ce66'
              inactive-color='#ff4949'
              @change='userStateChange(scop.row)'>
            </el-switch>
          </template>
        </el-table-column>
        <el-table-column label='操作' width='180px'>
          <template v-slot='scope'>
            <!-- 编辑按钮-->
            <el-button type='primary' size='mini' icon='el-icon-edit' @click='showUpdateUser(scope.row.id)'></el-button>
            <!-- 刪除按钮-->
            <el-button type='danger' @click='deleteUser(scope.row.id)' size='mini' icon='el-icon-delete'></el-button>
            <!-- 分配角色-->
            <el-tooltip :enterable='false' class='item' effect='dark' content='分配角色' placement='top'>
              <el-button type='warning' size='mini' @click="showRoleDialogVisible(scope.row)" icon='el-icon-setting'></el-button>
            </el-tooltip>
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
    <!-- 新增对话框-->
    <el-dialog title='新增用户' @close='addFormClose()' :visible.sync='addDialogVisible' :close-on-click-modal='false' width='50%'>
      <!-- 内容主体区 -->
      <el-form :model='addForm' :rules='addFormRules' ref='addFormRef' label-width='70px'>
        <el-form-item label='用户名' prop='username'>
          <el-input v-model='addForm.username' autocompconste='off'></el-input>
        </el-form-item>
        <el-form-item label='密码' prop='password'>
          <el-input v-model='addForm.password' autocompconste='off'></el-input>
        </el-form-item>
        <el-form-item label='邮箱' prop='email'>
          <el-input v-model='addForm.email' autocompconste='off'></el-input>
        </el-form-item>
        <el-form-item label='手机号' prop='mobile'>
          <el-input v-model='addForm.mobile' autocompconste='off'></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区 -->
      <div slot='footer' class='dialog-footer'>
        <el-button @click='addDialogVisible = false'>取 消</el-button>
        <el-button type='primary' @click='addUser'>确 定</el-button>
      </div>
    </el-dialog>
    <!-- 修改用户对话框-->
    <el-dialog title='编辑用户'  @close='updateFormClose()' :visible.sync='updateDialogVisible' :close-on-click-modal='false' width='50%'>
      <!-- 内容主体区 -->
      <el-form :model='updateForm' :rules='addFormRules' ref='updateFormRef' label-width='70px'>
        <el-form-item label='用户名'>
          <el-input v-model='updateForm.username' autocompconste='off' disabled></el-input>
        </el-form-item>
        <el-form-item label='邮箱' prop='email'>
          <el-input v-model='updateForm.email' autocompconste='off'></el-input>
        </el-form-item>
        <el-form-item label='手机号' prop='mobile'>
          <el-input v-model='updateForm.mobile' autocompconste='off'></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区 -->
      <div slot='footer' class='dialog-footer'>
        <el-button @click='updateDialogVisible = false'>取 消</el-button>
        <el-button type='primary' @click='updateUser()'>确 定</el-button>
      </div>
    </el-dialog>
    <!-- 分配角色对话框-->
    <el-dialog title='分配权限' @close='roleFormClose()' :visible.sync='roleDialogVisible' :close-on-click-modal='false' width='50%'>
      <!-- 内容主体区 -->
     <div>
       <p>当前用户:{{userInfo.username}}</p>
       <p>当前角色:{{userInfo.role_name}}</p>
       <p>分配角色:
         <el-select v-model="selectedRoleId" placeholder="请选择">
           <el-option
             v-for="item in roleList"
             :key="item.id"
             :label="item.roleName"
             :value="item.id">
           </el-option>
         </el-select>
       </p>
     </div>
      <!-- 底部区 -->
      <div slot='footer' class='dialog-footer'>
        <el-button @click='roleDialogVisible = false'>取 消</el-button>
        <el-button type='primary' @click='saveRole()'>确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'Users',
  created () {
    this.getUserList()
  },
  data () {
    return {
      // 用来查询的对象
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      userList: [],
      total: 0,
      // 控制添加用户对话框的隐藏
      addDialogVisible: false,
      // 控制修改用户对话框
      updateDialogVisible: false,
      // 分配角色的对话框
      roleDialogVisible: false,
      // 添加用户的表单数据
      addForm: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      // 修改的单个对象
      updateForm: {},
      // 用户角对象
      userInfo: {},
      // 角色列表
      roleList: [],
      // 分配角色的id
      selectedRoleId: '',
      // 校验添加用户表单规则
      addFormRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 15, message: '长度在 6 到 15 个字符', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { min: 11, max: 11, message: '请输入正确的手机号', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    // 查询users列表
    getUserList () {
      this.$http.get('users', { params: this.queryInfo }).then(res => {
        if (res.data.meta.status !== 200) {
          return this.$message.error('获取用户列表失败')
        }
        this.userList = res.data.data.users
        this.total = res.data.data.total
      })
    },
    // 监听pageSize的改变
    handleSizeChange (newSize) {
      this.queryInfo.pagesize = newSize
      this.getUserList()
    },
    // 监听pageNum改变事件
    handleCurrentChange (newNum) {
      this.queryInfo.pagenum = newNum
      this.getUserList()
    },
    // 监听状态开关事件
    userStateChange (userInfo) {
      this.$http.put('users/' + userInfo.id + '/state/' + userInfo.mg_state).then(res => {
        console.log(res)
        if (res.data.meta.status !== 200) {
          userInfo.mg_state = !userInfo.mg_state
          return this.$message.error('更新用户状态失败!')
        }
        this.$message.success('更新用户状态成功!')
      })
    },
    // 新增重置表单
    addFormClose () {
      this.$refs.addFormRef.resetFields()
    },
    // 新增用户
    addUser () {
      this.$refs.addFormRef.validate(valid => {
        if (valid) {
          // 保存用户
          this.$http.post('users', this.addForm).then(res => {
            if (res.data.meta.status === 201) {
              this.addDialogVisible = false
              this.$message.success(res.data.meta.msg)
              this.getUserList()
            } else {
              this.$message.error(res.data.meta.msg)
            }
          })
        }
      })
    },
    // 修改用户
    updateUser () {
      this.$refs.updateFormRef.validate(valid => {
        if (valid) {
          this.$http.put('users/' + this.updateForm.id,
            { email: this.updateForm.email, mobile: this.updateForm.mobile }).then(res => {
            if (res.data.meta.status === 200) {
              this.$message.success(res.data.meta.msg)
              this.updateDialogVisible = false
              this.getUserList()
            } else {
              this.$message.success(res.data.meta.msg)
            }
          })
        }
      })
    },
    // 展示编辑对话框
    showUpdateUser (id) {
      this.updateDialogVisible = true
      this.$http.get('users/' + id).then(res => {
        if (res.data.meta.status === 200) {
          this.updateForm = res.data.data
        } else {
          this.$message.error(res.data.meta.msg)
        }
      })
    },
    // 监听修改重置表单
    updateFormClose () {
      this.$refs.updateFormRef.resetFields()
    },
    // 清空表单
    roleFormClose () {
      this.userInfo = {}
      this.selectedRoleId = ''
    },
    // 删除用户
    deleteUser (id) {
      this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$http.delete('users/' + id).then(res => {
          if (res.data.meta.status === 200) {
            this.$message.success(res.data.meta.msg)
            this.getUserList()
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
    // 日期格式化
    createtimeed (time) {
      if (time) {
        var date = new Date(time * 1000)
        console.log(date)
        const Y = date.getFullYear() + '-'
        console.log(Y)
        const M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-'
        const D = (date.getDate() < 10 ? '0' + date.getDate() : date.getDate()) + ' '
        const h = (date.getHours() < 10 ? '0' + date.getHours() : date.getHours()) + ':'
        const m = (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()) + ':'
        const s = (date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds())
        return Y + M + D + h + m + s
      }
    },
    // 查询角色列表
    showRoleDialogVisible (scope) {
      this.userInfo = scope
      // 获取所有角色列表
      this.$http.get('roles').then(res => {
        if (res.data.meta.status === 200) {
          this.roleList = res.data.data
        } else {
          this.$message.error(res.data.meta.msg)
        }
      })
      this.roleDialogVisible = true
    },
    // 保存角色
    saveRole () {
      if (!this.selectedRoleId) {
        return this.$message.error('请选择要分配的角色！')
      } else {
        this.$http.put('users/' + this.userInfo.id + '/role', { rid: this.selectedRoleId }).then(res => {
          if (res.data.meta.status === 200) {
            this.roleDialogVisible = false
            this.getUserList()
            return this.$message.success('更新角色成功！')
          } else {
            return this.$message.error(res.data.meta.msg)
          }
        })
      }
    }
  }
}
</script>

<style lang='less' scoped>

</style>
