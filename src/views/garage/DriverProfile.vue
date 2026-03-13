<template>
  <div class="common-layout">
    <el-container>
      <el-header>
        <div class="page-shell">
          <div class="page-hero">
            <div class="page-hero-title">
              <h2>驾驶档案管理</h2>
              <p>维护驾驶员核心资质信息，系统会在预约和入库前自动校验有效档案。</p>
            </div>
            <div class="page-hero-actions">
              <el-button type="primary" class="toolbar-strong" @click="addItem">
                <el-icon><Plus /></el-icon>
                <span>新增档案</span>
              </el-button>
            </div>
          </div>

          <div class="filter-card">
            <div class="panel-head">
              <h3 class="panel-title">筛选条件</h3>
              <span class="panel-hint">按姓名、证件号或状态快速定位档案</span>
            </div>
            <el-row :gutter="12" class="filter-grid">
              <el-col :xs="24" :sm="12" :md="8" :lg="7">
                <label class="input-label">关键词</label>
                <el-input
                  v-model="queryParams.keyword"
                  placeholder="驾驶员姓名/驾驶证号"
                  clearable
                  @clear="query"
                >
                  <template #append>
                    <el-button type="info" class="toolbar-subtle" @click="query">查询</el-button>
                  </template>
                </el-input>
              </el-col>
              <el-col :xs="24" :sm="12" :md="6" :lg="5">
                <label class="input-label">状态</label>
                <el-select
                  v-model="queryParams.status"
                  placeholder="状态"
                  clearable
                  @change="query"
                  style="width: 100%"
                >
                  <el-option
                    v-for="item in statusOptions"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
              </el-col>
            </el-row>
            <div class="ops-note">建议仅保留一个有效档案，避免车辆预约时产生冲突。</div>
          </div>
        </div>
      </el-header>

      <el-divider style="margin: 0" />

      <el-main>
        <div class="table-card">
          <div class="panel-head">
            <h3 class="panel-title">驾驶档案列表</h3>
            <span class="panel-hint">共 {{ page.total }} 条</span>
          </div>
          <el-table :data="profileList" style="width: 100%" stripe>
            <el-table-column align="center" type="index" :index="indexMethod" label="序号" width="60" />
            <el-table-column align="center" prop="driverName" label="驾驶员姓名" width="130" />
            <el-table-column align="center" prop="licenseNo" label="驾驶证号" width="160" />
            <el-table-column align="center" prop="licenseType" label="准驾车型" width="120" />
            <el-table-column align="center" prop="validUntil" label="有效期至" width="140" />
            <el-table-column align="center" prop="phone" label="手机号" width="130" />
            <el-table-column align="center" prop="status" label="状态" width="100">
              <template #default="scope">{{ formatStatus(scope.row.status) }}</template>
            </el-table-column>
            <el-table-column align="center" prop="remark" label="备注" min-width="180" />
            <el-table-column align="center" fixed="right" label="操作" width="180">
              <template #default="scope">
                <el-button type="primary" icon="Edit" link @click="edit(scope.row)">修改</el-button>
                <el-button type="danger" icon="Delete" link @click="del(scope.row.id)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>

          <div style="margin-top: 15px">
            <el-pagination
              :page-size="page.pageSize"
              background
              :current-page="page.currentPag"
              layout=" prev, pager, next"
              :total="page.total"
              @current-change="handleCurrentChange"
            />
          </div>
        </div>
      </el-main>
    </el-container>

    <el-dialog
      v-model="dialog.dialogVisible"
      :title="dialog.tops"
      width="40%"
      align-center
      draggable
      :before-close="handleClose"
    >
      <el-divider border-style="double" style="margin: 0" />
      <el-form
        label-position="right"
        label-width="auto"
        style="max-width: 420px; margin: 20px auto"
        ref="itemForm"
        :model="dialog.item"
        :rules="rules"
      >
        <el-form-item label="驾驶员姓名" prop="driverName">
          <el-input v-model="dialog.item.driverName" />
        </el-form-item>
        <el-form-item label="驾驶证号" prop="licenseNo">
          <el-input v-model="dialog.item.licenseNo" />
        </el-form-item>
        <el-form-item label="准驾车型" prop="licenseType">
          <el-input v-model="dialog.item.licenseType" />
        </el-form-item>
        <el-form-item label="有效期至">
          <el-date-picker
            style="width: 360px"
            v-model="dialog.item.validUntil"
            type="date"
            format="YYYY/MM/DD"
            value-format="YYYY-MM-DD"
            placeholder="请选择日期"
          />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="dialog.item.phone" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="dialog.item.status" style="width: 360px" placeholder="请选择状态">
            <el-option
              v-for="item in statusOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="dialog.item.remark" type="textarea" :rows="3" maxlength="100" show-word-limit />
        </el-form-item>
      </el-form>
      <el-divider border-style="double" style="margin: 0" />
      <template #footer>
        <span class="dialog-footer" style="padding-top: 0px">
          <el-button type="primary" :loading="dialog.submitting" @click="save('itemForm')">保存</el-button>
          <el-button @click="cancel">取消</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import {
  listDriverProfilePage,
  addDriverProfile,
  updateDriverProfile,
  delDriverProfile
} from "@/api/driverProfileApi.js";

export default {
  computed: {
    indexMethod() {
      return this.page.currentPag * this.page.pageSize - this.page.pageSize + 1;
    }
  },
  data() {
    const phoneValidator = (_, value, callback) => {
      const txt = String(value || "").trim();
      if (!/^1\d{10}$/.test(txt)) {
        callback(new Error("请输入11位手机号"));
        return;
      }
      callback();
    };

    return {
      statusOptions: [
        { value: "1", label: "启用" },
        { value: "2", label: "停用" }
      ],
      dialog: {
        dialogVisible: false,
        submitting: false,
        tops: "",
        item: {
          id: "",
          driverName: "",
          licenseNo: "",
          licenseType: "C1",
          validUntil: "",
          phone: "",
          status: "1",
          remark: ""
        }
      },
      rules: {
        driverName: [{ required: true, message: "请输入驾驶员姓名", trigger: "blur" }],
        licenseNo: [{ required: true, message: "请输入驾驶证号", trigger: "blur" }],
        licenseType: [{ required: true, message: "请输入准驾车型", trigger: "blur" }],
        phone: [{ validator: phoneValidator, trigger: "blur" }],
        status: [{ required: true, message: "请选择状态", trigger: "change" }]
      },
      queryParams: {
        keyword: "",
        status: "",
        pageSize: "1"
      },
      page: {
        total: 0,
        pageSize: 6,
        currentPag: 1,
        pagCount: 0
      },
      profileList: []
    };
  },
  mounted() {
    this.getProfileList();
  },
  methods: {
    formatStatus(value) {
      const item = this.statusOptions.find((temp) => temp.value === String(value));
      return item ? item.label : value;
    },
    query() {
      this.queryParams.pageSize = "1";
      this.getProfileList();
    },
    handleCurrentChange(curPage) {
      this.page.currentPag = curPage;
      this.queryParams.pageSize = String(curPage);
      this.getProfileList();
    },
    initDialogForm() {
      this.dialog.item.id = "";
      this.dialog.item.driverName = "";
      this.dialog.item.licenseNo = "";
      this.dialog.item.licenseType = "C1";
      this.dialog.item.validUntil = "";
      this.dialog.item.phone = "";
      this.dialog.item.status = "1";
      this.dialog.item.remark = "";
    },
    addItem() {
      this.dialog.tops = "新增驾驶档案";
      this.dialog.dialogVisible = true;
      this.$nextTick(() => {
        this.initDialogForm();
      });
    },
    edit(row) {
      this.dialog.tops = "修改驾驶档案";
      this.dialog.dialogVisible = true;
      this.$nextTick(() => {
        this.dialog.item.id = row.id;
        this.dialog.item.driverName = row.driverName;
        this.dialog.item.licenseNo = row.licenseNo;
        this.dialog.item.licenseType = row.licenseType || "C1";
        this.dialog.item.validUntil = row.validUntil || "";
        this.dialog.item.phone = row.phone;
        this.dialog.item.status = row.status == null ? "1" : String(row.status);
        this.dialog.item.remark = row.remark || "";
      });
    },
    resetForm(formName) {
      if (this.$refs[formName]) {
        this.$refs[formName].resetFields();
      }
    },
    handleClose() {
      this.dialog.dialogVisible = false;
      this.resetForm("itemForm");
      this.initDialogForm();
    },
    cancel() {
      this.handleClose();
    },
    buildPayload() {
      return {
        ...this.dialog.item,
        driverName: String(this.dialog.item.driverName || "").trim(),
        licenseNo: String(this.dialog.item.licenseNo || "").trim().toUpperCase(),
        licenseType: String(this.dialog.item.licenseType || "").trim().toUpperCase(),
        phone: String(this.dialog.item.phone || "").trim(),
        remark: String(this.dialog.item.remark || "").trim()
      };
    },
    async save(formName) {
      if (this.dialog.submitting) {
        return;
      }
      const formRef = this.$refs[formName];
      if (!formRef) {
        return;
      }

      try {
        await formRef.validate();
      } catch (error) {
        return;
      }

      try {
        this.dialog.submitting = true;
        const payload = this.buildPayload();
        let res;
        if (!payload.id) {
          res = await addDriverProfile(payload);
          if (res && res.flag) {
            this.$message.success(res.message || "新增成功");
            this.query();
            this.handleClose();
            return;
          }
          this.$message.error((res && res.message) || "新增失败");
          return;
        }

        res = await updateDriverProfile(payload);
        if (res && res.flag) {
          this.$message.success(res.message || "修改成功");
          this.getProfileList();
          this.handleClose();
          return;
        }
        this.$message.error((res && res.message) || "修改失败");
      } catch (error) {
        this.$message.error(error.userMessage || "保存失败，请稍后重试");
      } finally {
        this.dialog.submitting = false;
      }
    },
    del(id) {
      this.$confirm("此操作将删除驾驶档案，是否继续？", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(async () => {
          const res = await delDriverProfile({ id });
          if (res && res.flag) {
            this.$message.success(res.message || "删除成功");
            this.getProfileList();
          } else {
            this.$message.error((res && res.message) || "删除失败");
          }
        })
        .catch(() => {});
    },
    async getProfileList() {
      try {
        const res = await listDriverProfilePage(this.queryParams);
        if (!res || res.flag === false) {
          this.profileList = [];
          if (res && res.message) {
            this.$message.error(res.message);
          }
          return;
        }
        const data = res.data || {};
        this.profileList = data.records || [];
        this.page.total = data.total || 0;
        this.page.pageSize = data.size || 6;
        this.page.currentPag = data.current || 1;
        this.page.pagCount = data.pages || 0;
      } catch (error) {
        this.profileList = [];
        this.$message.error(error.userMessage || "驾驶档案加载失败");
      }
    }
  }
};
</script>
