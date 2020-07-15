<template>
    <div>
      <!-- 面包屑导航 -->
      <el-breadcrumb separator-class='el-icon-arrow-right'>
        <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item :to="{ path: '/goods' }">商品列表</el-breadcrumb-item>
        <el-breadcrumb-item>添加商品</el-breadcrumb-item>
      </el-breadcrumb>
      <!-- 卡片视图-->
      <el-card>
        <!-- 提示信息-->
        <el-alert title="添加商品信息" type="info" show-icon center :closable="false"></el-alert>
        <!-- 步骤条-->
        <el-steps :space="300" :active="stepsActive - 0" finish-status="success" align-center>
          <el-step title="基本信息"></el-step>
          <el-step title="商品参数"></el-step>
          <el-step title="商品属性"></el-step>
          <el-step title="商品图片"></el-step>
          <el-step title="商品内容"></el-step>
          <el-step title="完成"></el-step>
        </el-steps>
        <el-form :model="addForm" status-icon label-position="top" :rules="addFormRules" ref="addForm" label-width="100px">
        <!-- 标签tab栏区域-->
        <el-tabs tab-position="left" @tab-click="tabClik" :before-leave="beforeLeave">
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input type="number" v-model="addForm.goods_price"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input type="number" v-model="addForm.goods_weight"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input type="number" v-model="addForm.goods_number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
              <el-cascader
                v-model="addForm.goods_cat"
                :options="cateList"
                :props="cateProps"
                expandTrigger="hover"
                :clearable="true"
                filterable
                @change="handleChange">
              </el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <el-form-item v-for="item in manyTableData" :key="item.attr_id" :label="item.attr_name">
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox v-for="(itemVals, index) in item.attr_vals" :label="itemVals" :key="index" border></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <el-form-item v-for="item in onlyTableData" :key="item.attr_id" :label="item.attr_name">
              <el-input v-model="item.attr_vals[0]"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <el-upload
              action="http://timemeetyou.com:8889/api/private/v1/upload/"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              :headers="headersObject"
              :on-success="handleSuccess"
              list-type="picture">
              <el-button size="small" type="primary">点击上传</el-button>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <!-- 富文本编辑器-->
            <quill-editor
              ref="quillDitor"
              v-model="addForm.goods_introduce"
            />
            <el-button type="primary" class="btnAdd" @click="add">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
        </el-form>
      </el-card>
      <!-- 图片预览对话框-->
      <el-dialog
        title="图片预览"
        :visible.sync="previewDialogVisible"
        width="40%">
        <img :src="previewPath">
      </el-dialog>
    </div>
</template>

<script>
import _ from 'lodash'
export default {
  name: 'AddGoods',
  created () {
    this.getCateList()
  },
  data () {
    // 自定义校验规则要写return外面
    const catRules = (rule, value, callback) => {
      if (value.length < 2) {
        callback(new Error('请选择三级分类'))
      } else {
        callback()
      }
    }
    // 自定义校验规则要写return外面
    const numberRules = (rule, value, callback) => {
      if (value < 0) {
        callback(new Error('数值必须大于0'))
      } else {
        callback()
      }
    }
    return {
      stepsActive: 0,
      addForm: {
        goods_name: '',
        goods_price: 0,
        goods_weight: 0,
        goods_number: 0,
        goods_introduce: '',
        goods_cat: [],
        pics: [],
        attrs: []
      },
      cateProps: {
        label: 'cat_name',
        value: 'cat_id',
        children: 'children'
      },
      cateList: [],
      manyTableData: [],
      onlyTableData: [],
      fileList: [],
      previewPath: '',
      previewDialogVisible: false,
      headersObject: { Authorization: window.sessionStorage.getItem('token') },
      addFormRules: {
        goods_name: [
          { required: true, message: '请输入商品名', trigger: 'blur' }
        ],
        goods_price: [
          { required: true, message: '请输入商品价格', trigger: 'blur' },
          { validator: numberRules, trigger: 'blur' }
        ],
        goods_weight: [
          { required: true, message: '请输入商品重量', trigger: 'blur' },
          { validator: numberRules, trigger: 'blur' }
        ],
        goods_number: [
          { required: true, message: '请输入商品数量', trigger: 'blur' },
          { validator: numberRules, trigger: 'blur' }
        ],
        goods_cat: [
          { type: 'array', message: '请填选商品分类', trigger: 'blur' },
          { validator: catRules, trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    tabClik (scope) {
      if (this.stepsActive === '1') {
        this.$http.get('categories/' + this.cateId + '/attributes', { params: { sel: 'many' } }).then(res => {
          if (res.data.meta.status === 200) {
            res.data.data.forEach(item => {
              item.attr_vals = item.attr_vals.length === 0 ? [] : item.attr_vals.split(' ')
            })
            this.manyTableData = res.data.data
          } else {
            return this.$message.error(res.data.meta.msg)
          }
        })
      } else if (this.stepsActive === '2') {
        this.$http.get('categories/' + this.cateId + '/attributes', { params: { sel: 'only' } }).then(res => {
          if (res.data.meta.status === 200) {
            res.data.data.forEach(item => {
              item.attr_vals = item.attr_vals.length === 0 ? [''] : item.attr_vals.split(' ')
            })
            this.onlyTableData = res.data.data
          } else {
            return this.$message.error(res.data.meta.msg)
          }
        })
      }
    },
    beforeLeave (activeName, oldActiveName) {
      if (oldActiveName === '0' && this.addForm.goods_cat.length !== 3) {
        this.$message.error('请选择商品分类在进入下一步！！！')
        return false
      }
      this.stepsActive = activeName
    },
    // 获取商品分类的数据列表
    getCateList () {
      this.$http.get('categories').then(res => {
        if (res.data.meta.status === 200) {
          this.cateList = res.data.data
        } else {
          return this.$message.error(res.data.meta.msg)
        }
      })
    },
    handleChange () {
      if (this.addForm.goods_cat.length !== 3) {
        this.$message.error('请选择商品的三级分类')
        this.addForm.goods_cat = []
      }
    },
    handleRemove (file, fileList) {
      console.log(file, fileList)
      const filePath = file.response.data.tmp_path
      const i = this.addForm.pics.findIndex(x => x.pic === filePath)
      this.addForm.pics.splice(i, 1)
    },
    handlePreview (file) {
      this.previewPath = file.response.data.url
      this.previewDialogVisible = true
    },
    handleSuccess (response) {
      if (response.meta.status === 200) {
        this.$message.success(response.meta.msg)
        const picInfo = { pic: response.data.tmp_path }
        this.addForm.pics.push(picInfo)
      } else {
        return this.$message.error(response.meta.msg)
      }
    },
    add () {
      this.$refs.addForm.validate(valid => {
        if (!valid) {
          return this.$message.error('请填写必要的商品信息')
        }
        this.manyTableData.forEach(item => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals.join(' ')
          }
          this.addForm.attrs.push(newInfo)
        })
        this.onlyTableData.forEach(item => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals.join(' ')
          }
          this.addForm.attrs.push(newInfo)
        })
        const form = _.cloneDeep(this.addForm)
        form.goods_cat = form.goods_cat.join(',')
        this.$http.post('goods', form).then(res => {
          if (res.data.meta.status === 201) {
            this.$message.success(res.data.meta.msg)
            this.$router.push('/goods')
          } else {
            this.$message.error(res.data.meta.msg)
          }
        })
      })
    }
  },
  computed: {
    // eslint-disable-next-line vue/return-in-computed-property
    cateId () {
      if (this.addForm.goods_cat.length === 3) {
        return this.addForm.goods_cat[2]
      }
      return null
    }
  }
}
</script>

<style lang="less" scoped>
  .el-checkbox {
    margin: 10px 5px 0 0 !important;
  }
  .el-dialog__body > img {
    width: 100%;
  }
  .btnAdd {
    margin-top: 15px;
  }
</style>
