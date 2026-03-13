<template>
  <div class="common-layout">
    <el-container>
      <el-header>
        <div class="page-shell">
          <div class="page-hero">
            <div class="page-hero-title">
              <h2>车位管理</h2>
              <p>快速查询和维护车位，状态变化会直接影响预约和入库流程。</p>
            </div>
            <div class="page-hero-actions">
              <el-button
                v-if="isAdmin"
                type="primary"
                class="toolbar-strong"
                @click="addItem"
              >
                <el-icon><Plus /></el-icon>
                <span>新增车位</span>
              </el-button>
            </div>
          </div>

          <div class="filter-card">
            <div class="panel-head">
              <h3 class="panel-title">筛选条件</h3>
              <span class="panel-hint">输入关键词后点击查询，结果会立即刷新</span>
            </div>
            <el-row :gutter="12" class="filter-grid">
              <el-col :xs="24" :sm="12" :md="8" :lg="7">
                <label class="input-label">关键词</label>
                <el-input
                  v-model="queryParams.keyword"
                  placeholder="车位编号/区域名称"
                  clearable
                  @clear="query"
                >
                  <template #append>
                    <el-button type="info" class="toolbar-subtle" @click="query">查询</el-button>
                  </template>
                </el-input>
              </el-col>
              <el-col :xs="24" :sm="12" :md="6" :lg="5">
                <label class="input-label">车位状态</label>
                <el-select
                  v-model="queryParams.status"
                  placeholder="车位状态"
                  clearable
                  @change="query"
                  style="width: 100%"
                >
                  <el-option
                    v-for="item in spaceStatusOptions"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
              </el-col>
            </el-row>
            <div class="ops-note">管理员可新增、修改、删除车位；普通用户仅可查看。</div>
          </div>
        </div>
      </el-header>
      <el-divider style="margin: 0" />
      <el-main>
        <div class="table-card">
          <div class="panel-head">
            <h3 class="panel-title">车位列表</h3>
            <span class="panel-hint">共 {{ page.total }} 条</span>
          </div>
          <el-table :data="spaceList" style="width: 100%" stripe>
            <el-table-column align="center" type="index" :index="indexMethod" label="序号" width="60" />
            <el-table-column align="center" prop="areaName" label="区域" width="140" />
            <el-table-column align="center" prop="floorNo" label="楼层" width="100" />
            <el-table-column align="center" prop="spaceNo" label="车位编号" width="130" />
            <el-table-column align="center" prop="spaceType" label="类型" width="120">
              <template #default="scope">{{ formatSpaceType(scope.row.spaceType) }}</template>
            </el-table-column>
            <el-table-column align="center" prop="status" label="状态" width="100">
              <template #default="scope">{{ formatSpaceStatus(scope.row.status) }}</template>
            </el-table-column>
            <el-table-column align="center" prop="remark" label="备注" min-width="180" />
            <el-table-column v-if="isAdmin" align="center" fixed="right" label="操作" width="180">
              <template #default="scope">
                <el-button type="primary" icon="Edit" size="small" plain @click="edit(scope.row)">修改</el-button>
                <el-button
                  type="danger"
                  icon="Delete"
                  size="small"
                  class="action-delete-btn"
                  @click="del(scope.row.id)"
                >
                  删除
                </el-button>
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
        <el-form-item label="区域" prop="areaName">
          <el-input v-model="dialog.item.areaName" />
        </el-form-item>
        <el-form-item label="楼层" prop="floorNo">
          <el-input v-model="dialog.item.floorNo" />
        </el-form-item>
        <el-form-item label="车位编号" prop="spaceNo">
          <el-input v-model="dialog.item.spaceNo" />
        </el-form-item>
        <el-form-item label="类型" prop="spaceType">
          <el-select v-model="dialog.item.spaceType" style="width: 360px" placeholder="请选择类型">
            <el-option
              v-for="item in spaceTypeOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="dialog.item.status" style="width: 360px" placeholder="请选择状态">
            <el-option
              v-for="item in spaceStatusOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="归属用户ID">
          <el-input v-model="dialog.item.ownerUserId" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="dialog.item.remark" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>
      <el-divider border-style="double" style="margin: 0" />
      <template #footer>
        <span class="dialog-footer" style="padding-top: 0px">
          <el-button type="primary" @click="save('itemForm')">保存</el-button>
          <el-button @click="cancel">取消</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import {
  listGarageSpacePage,
  addGarageSpace,
  updateGarageSpace,
  delGarageSpace
} from "@/api/garageSpaceApi.js";
import { getSessionStorage } from "@/utils/common.js";

export default {
  computed: {
    indexMethod() {
      return this.page.currentPag * this.page.pageSize - this.page.pageSize + 1;
    },
    isAdmin() {
      const user = getSessionStorage("user");
      return user && user.role === "admin";
    }
  },
  data() {
    return {
      spaceTypeOptions: [
        { value: "1", label: "固定车位" },
        { value: "2", label: "临停车位" },
        { value: "3", label: "充电车位" }
      ],
      spaceStatusOptions: [
        { value: "0", label: "空闲" },
        { value: "1", label: "占用" },
        { value: "2", label: "维护中" },
        { value: "3", label: "停用" },
        { value: "4", label: "预约中" }
      ],
      dialog: {
        dialogVisible: false,
        tops: "",
        item: {
          id: "",
          areaName: "",
          floorNo: "",
          spaceNo: "",
          spaceType: "1",
          status: "0",
          ownerUserId: "",
          remark: ""
        }
      },
      rules: {
        areaName: [{ required: true, message: "请输入区域", trigger: "blur" }],
        spaceNo: [{ required: true, message: "请输入车位编号", trigger: "blur" }],
        spaceType: [{ required: true, message: "请选择类型", trigger: "change" }],
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
      spaceList: []
    };
  },
  mounted() {
    this.getSpaceList();
  },
  methods: {
    formatSpaceType(value) {
      const item = this.spaceTypeOptions.find((temp) => temp.value === String(value));
      return item ? item.label : value;
    },
    formatSpaceStatus(value) {
      const item = this.spaceStatusOptions.find((temp) => temp.value === String(value));
      return item ? item.label : value;
    },
    query() {
      this.queryParams.pageSize = "1";
      this.getSpaceList();
    },
    handleCurrentChange(curPage) {
      this.page.currentPag = curPage;
      this.queryParams.pageSize = String(curPage);
      this.getSpaceList();
    },
    initDialogForm() {
      this.dialog.item.id = "";
      this.dialog.item.areaName = "";
      this.dialog.item.floorNo = "";
      this.dialog.item.spaceNo = "";
      this.dialog.item.spaceType = "1";
      this.dialog.item.status = "0";
      this.dialog.item.ownerUserId = "";
      this.dialog.item.remark = "";
    },
    addItem() {
      if (!this.isAdmin) {
        this.$message.warning("仅管理员可新增车位");
        return;
      }
      this.dialog.tops = "新增车位";
      this.dialog.dialogVisible = true;
      this.$nextTick(() => {
        this.initDialogForm();
      });
    },
    edit(row) {
      if (!this.isAdmin) {
        this.$message.warning("仅管理员可修改车位");
        return;
      }
      this.dialog.tops = "修改车位";
      this.dialog.dialogVisible = true;
      this.$nextTick(() => {
        this.dialog.item.id = row.id;
        this.dialog.item.areaName = row.areaName;
        this.dialog.item.floorNo = row.floorNo;
        this.dialog.item.spaceNo = row.spaceNo;
        this.dialog.item.spaceType = row.spaceType == null ? "1" : String(row.spaceType);
        this.dialog.item.status = row.status == null ? "0" : String(row.status);
        this.dialog.item.ownerUserId = row.ownerUserId == null ? "" : String(row.ownerUserId);
        this.dialog.item.remark = row.remark;
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
    save(formName) {
      if (!this.isAdmin) {
        this.$message.warning("仅管理员可保存车位信息");
        return;
      }
      this.$refs[formName].validate((valid) => {
        if (!valid) {
          return false;
        }
        if (this.dialog.item.id == null || this.dialog.item.id === "") {
          addGarageSpace(this.dialog.item).then((res) => {
            if (res.flag) {
              this.$message.success(res.message || "新增成功");
              this.query();
              this.handleClose();
            } else {
              this.$message.error(res.message || "新增失败");
            }
          });
        } else {
          updateGarageSpace(this.dialog.item).then((res) => {
            if (res.flag) {
              this.$message.success(res.message || "修改成功");
              this.getSpaceList();
              this.handleClose();
            } else {
              this.$message.error(res.message || "修改失败");
            }
          });
        }
      });
    },
    del(id) {
      if (!this.isAdmin) {
        this.$message.warning("仅管理员可删除车位");
        return;
      }
      this.$confirm("此操作将删除该车位，是否继续？", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          delGarageSpace({ id }).then((res) => {
            if (res.flag) {
              this.$message.success(res.message || "删除成功");
              this.getSpaceList();
            } else {
              this.$message.error(res.message || "删除失败");
            }
          });
        })
        .catch(() => {});
    },
    getSpaceList() {
      listGarageSpacePage(this.queryParams)
        .then((res) => {
          if (!res || res.flag === false) {
            this.spaceList = [];
            return;
          }
          const data = res.data || {};
          this.spaceList = data.records || [];
          this.page.total = data.total || 0;
          this.page.pageSize = data.size || 6;
          this.page.currentPag = data.current || 1;
          this.page.pagCount = data.pages || 0;
        })
        .catch(() => {
          this.spaceList = [];
        });
    }
  }
};
</script>

<style scoped>
.action-delete-btn {
  color: #ffe3e9 !important;
  border-color: rgba(242, 118, 146, 0.68) !important;
  background: linear-gradient(180deg, rgba(216, 85, 118, 0.95), rgba(174, 55, 84, 0.95)) !important;
}

.action-delete-btn:hover {
  color: #fff4f7 !important;
  border-color: rgba(252, 150, 173, 0.82) !important;
  background: linear-gradient(180deg, rgba(231, 103, 134, 0.96), rgba(188, 62, 93, 0.96)) !important;
}
</style>
