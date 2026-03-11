<template>
  <div class="common-layout">
    <el-container>
      <el-header>
        <el-row :gutter="20">
          <el-col :span="6">
            <el-input
              v-model="queryParams.keyword"
              placeholder="车位编号/区域名称"
              clearable
              @clear="query"
            >
              <template #append>
                <el-button type="info" style="color: black" @click="query">查询</el-button>
              </template>
            </el-input>
          </el-col>
          <el-col :span="5">
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
          <el-col :span="13">
            <el-button v-if="isAdmin" type="primary" color="#337ab7" @click="addItem">
              <el-icon><Plus /></el-icon>
              <span>新增车位</span>
            </el-button>
          </el-col>
        </el-row>
      </el-header>
      <el-divider style="margin: 0" />
      <el-main>
        <el-table :data="spaceList" style="width: 100%; color: black" stripe>
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
