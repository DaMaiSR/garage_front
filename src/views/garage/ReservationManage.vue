<template>
  <div class="common-layout">
    <el-container>
      <el-header>
        <div class="page-shell">
          <div class="page-hero">
            <div class="page-hero-title">
              <h2>预约管理</h2>
              <p>用户可发起预约，管理员可进行“预约转入库”，流程状态清晰可追踪。</p>
            </div>
            <div class="page-hero-actions">
              <el-button type="primary" class="toolbar-strong" @click="openCreateDialog">
                <el-icon><Plus /></el-icon>
                <span>新增预约</span>
              </el-button>
            </div>
          </div>

          <div class="filter-card">
            <div class="panel-head">
              <h3 class="panel-title">筛选条件</h3>
              <span class="panel-hint">可按车牌、车位和状态定位预约记录</span>
            </div>
            <el-row :gutter="12" class="filter-grid">
              <el-col :xs="24" :sm="12" :md="6" :lg="5">
                <label class="input-label">车牌号</label>
                <el-input
                  v-model="queryParams.plateNo"
                  placeholder="车牌号"
                  clearable
                  @clear="query"
                >
                  <template #append>
                    <el-button type="info" class="toolbar-subtle" @click="query">查询</el-button>
                  </template>
                </el-input>
              </el-col>
              <el-col :xs="24" :sm="12" :md="6" :lg="5">
                <label class="input-label">车位编号</label>
                <el-input
                  v-model="queryParams.spaceNo"
                  placeholder="车位编号"
                  clearable
                  @clear="query"
                />
              </el-col>
              <el-col :xs="24" :sm="12" :md="6" :lg="5">
                <label class="input-label">预约状态</label>
                <el-select
                  v-model="queryParams.reservationStatus"
                  placeholder="预约状态"
                  clearable
                  style="width: 100%"
                  @change="query"
                >
                  <el-option
                    v-for="item in reservationStatusOptions"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
              </el-col>
            </el-row>
            <div class="ops-note">预约前请先完善驾驶档案和车辆信息；同一车辆同一时间仅允许一个有效预约。</div>
          </div>
        </div>
      </el-header>

      <el-divider style="margin: 0" />

      <el-main>
        <div class="table-card">
          <div class="panel-head">
            <h3 class="panel-title">预约列表</h3>
            <span class="panel-hint">共 {{ page.total }} 条</span>
          </div>
          <el-table :data="reservationList" style="width: 100%" stripe>
            <el-table-column align="center" type="index" :index="indexMethod" label="序号" width="60" />
            <el-table-column align="center" prop="plateNo" label="车牌号" width="130" />
            <el-table-column align="center" prop="spaceNo" label="车位编号" width="130" />
            <el-table-column align="center" prop="reservationTime" label="预约时间" width="170" />
            <el-table-column align="center" prop="checkInTime" label="入库时间" width="170" />
            <el-table-column align="center" prop="cancelTime" label="取消时间" width="170" />
            <el-table-column align="center" prop="reservationStatus" label="预约状态" width="110">
              <template #default="scope">{{ formatReservationStatus(scope.row.reservationStatus) }}</template>
            </el-table-column>
            <el-table-column align="center" prop="remark" label="备注" min-width="150" />
            <el-table-column align="center" fixed="right" label="操作" width="180">
              <template #default="scope">
                <el-button
                  v-if="isAdmin && scope.row.reservationStatus === '0'"
                  type="warning"
                  icon="Van"
                  size="small"
                  class="action-checkin-btn"
                  @click="checkIn(scope.row.id)"
                >
                  转入库
                </el-button>
                <el-button
                  v-if="scope.row.reservationStatus === '0'"
                  type="danger"
                  icon="Close"
                  size="small"
                  class="action-cancel-btn"
                  @click="cancel(scope.row.id)"
                >
                  取消
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
      title="新增预约"
      width="40%"
      align-center
      draggable
      :before-close="closeDialog"
    >
      <el-divider border-style="double" style="margin: 0" />
      <el-form
        ref="itemForm"
        :model="dialog.item"
        :rules="rules"
        label-position="right"
        label-width="auto"
        style="max-width: 420px; margin: 20px auto"
      >
        <el-form-item label="车辆" prop="vehicleId">
          <el-select v-model="dialog.item.vehicleId" filterable placeholder="请选择车辆" style="width: 360px">
            <el-option
              v-for="item in vehicleOptions"
              :key="item.id"
              :label="`${item.plateNo} / ${item.ownerName || '-'}`"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="车位编号" prop="spaceNo">
          <el-select v-model="dialog.item.spaceNo" filterable placeholder="请选择车位" style="width: 360px">
            <el-option
              v-for="item in spaceOptions"
              :key="item.id"
              :label="`${item.spaceNo} (${item.areaName || '-'}-${item.floorNo || '-'})`"
              :value="item.spaceNo"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="dialog.item.remark" type="textarea" :rows="3" maxlength="100" show-word-limit />
        </el-form-item>
      </el-form>
      <el-divider border-style="double" style="margin: 0" />
      <template #footer>
        <span class="dialog-footer" style="padding-top: 0px">
          <el-button type="primary" :loading="dialog.submitting" @click="save('itemForm')">保存</el-button>
          <el-button @click="closeDialog">取消</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import {
  listGarageReservationPage,
  createReservation,
  cancelReservation,
  checkInReservation
} from "@/api/garageReservationApi.js";
import { listGarageVehicle } from "@/api/garageVehicleApi.js";
import { listGarageSpacePage } from "@/api/garageSpaceApi.js";
import { listDriverProfilePage } from "@/api/driverProfileApi.js";
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
    const remarkValidator = (_, value, callback) => {
      if ((value || "").length > 100) {
        callback(new Error("备注最多100个字符"));
        return;
      }
      callback();
    };

    return {
      reservationStatusOptions: [
        { value: "0", label: "预约中" },
        { value: "1", label: "已取消" },
        { value: "2", label: "已入库" }
      ],
      queryParams: {
        plateNo: "",
        spaceNo: "",
        reservationStatus: "",
        pageSize: "1"
      },
      page: {
        total: 0,
        pageSize: 6,
        currentPag: 1,
        pagCount: 0
      },
      reservationList: [],
      dialog: {
        dialogVisible: false,
        submitting: false,
        item: {
          vehicleId: "",
          plateNo: "",
          spaceNo: "",
          remark: ""
        }
      },
      rules: {
        vehicleId: [{ required: true, message: "请选择车辆", trigger: "change" }],
        spaceNo: [{ required: true, message: "请选择车位", trigger: "change" }],
        remark: [{ validator: remarkValidator, trigger: "blur" }]
      },
      vehicleOptions: [],
      spaceOptions: []
    };
  },
  mounted() {
    this.getReservationList();
  },
  methods: {
    formatReservationStatus(value) {
      const item = this.reservationStatusOptions.find((temp) => temp.value === String(value));
      return item ? item.label : value;
    },
    query() {
      this.queryParams.pageSize = "1";
      this.getReservationList();
    },
    handleCurrentChange(curPage) {
      this.page.currentPag = curPage;
      this.queryParams.pageSize = String(curPage);
      this.getReservationList();
    },
    initDialogForm() {
      this.dialog.item.vehicleId = "";
      this.dialog.item.plateNo = "";
      this.dialog.item.spaceNo = "";
      this.dialog.item.remark = "";
    },
    resetForm(formName) {
      if (this.$refs[formName]) {
        this.$refs[formName].resetFields();
      }
    },
    async hasDriverProfile() {
      try {
        const res = await listDriverProfilePage({ pageSize: "1" });
        if (!res || !res.flag) {
          return false;
        }
        const data = res.data || {};
        const records = data.records || [];
        if (records.length > 0) {
          return true;
        }
        return Number(data.total || 0) > 0;
      } catch (error) {
        this.$message.error(error.userMessage || "驾驶档案校验失败，请稍后重试");
        return false;
      }
    },
    async loadVehicleOptions() {
      try {
        const res = await listGarageVehicle();
        if (res && res.flag) {
          this.vehicleOptions = Array.isArray(res.data) ? res.data : [];
        } else {
          this.vehicleOptions = [];
        }
      } catch (error) {
        this.vehicleOptions = [];
        this.$message.error(error.userMessage || "车辆列表加载失败");
      }
    },
    async loadSpaceOptions() {
      try {
        const res = await listGarageSpacePage({ status: "0", pageSize: "1" });
        if (res && res.flag) {
          const records = (res.data && res.data.records) || [];
          this.spaceOptions = records;
        } else {
          this.spaceOptions = [];
        }
      } catch (error) {
        this.spaceOptions = [];
        this.$message.error(error.userMessage || "空闲车位加载失败");
      }
    },
    async openCreateDialog() {
      const hasProfile = await this.hasDriverProfile();
      if (!hasProfile) {
        this.$alert("请先在“驾驶档案管理”中完善档案信息，再发起预约。", "提示", {
          confirmButtonText: "去完善"
        }).then(() => {
          this.$router.push("/garage/driverProfile");
        });
        return;
      }

      await Promise.all([this.loadVehicleOptions(), this.loadSpaceOptions()]);
      if (this.vehicleOptions.length === 0) {
        this.$alert("你还没有可用车辆，请先新增车辆信息。", "提示", {
          confirmButtonText: "去新增"
        }).then(() => {
          this.$router.push("/garage/vehicleManage");
        });
        return;
      }
      if (this.spaceOptions.length === 0) {
        this.$message.warning("当前没有空闲车位，请稍后再试");
        return;
      }

      this.dialog.dialogVisible = true;
      this.$nextTick(() => {
        this.initDialogForm();
      });
    },
    closeDialog() {
      this.dialog.dialogVisible = false;
      this.resetForm("itemForm");
      this.initDialogForm();
    },
    async hasActiveReservation(plateNo) {
      const res = await listGarageReservationPage({
        plateNo,
        reservationStatus: "0",
        pageSize: "1"
      });
      if (!res || !res.flag) {
        return false;
      }
      const records = (res.data && res.data.records) || [];
      return records.length > 0;
    },
    async validateReservationPayload() {
      const selectedVehicle = this.vehicleOptions.find((item) => item.id === this.dialog.item.vehicleId);
      if (!selectedVehicle || !selectedVehicle.plateNo) {
        this.$message.warning("请选择有效车辆");
        return null;
      }

      const hasActive = await this.hasActiveReservation(selectedVehicle.plateNo);
      if (hasActive) {
        this.$message.warning("该车辆已有进行中的预约，请先取消或入库后再预约");
        return null;
      }

      await this.loadSpaceOptions();
      const selectedSpace = this.spaceOptions.find((item) => item.spaceNo === this.dialog.item.spaceNo);
      if (!selectedSpace) {
        this.$message.warning("该车位已不可预约，请重新选择车位");
        return null;
      }

      return {
        vehicleId: this.dialog.item.vehicleId,
        plateNo: selectedVehicle.plateNo,
        spaceNo: this.dialog.item.spaceNo,
        remark: (this.dialog.item.remark || "").trim()
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
        const payload = await this.validateReservationPayload();
        if (!payload) {
          return;
        }
        this.dialog.submitting = true;
        const res = await createReservation(payload);
        if (res && res.flag) {
          this.$message.success(res.message || "预约成功");
          this.closeDialog();
          this.query();
          return;
        }
        this.$message.error((res && res.message) || "预约失败");
      } catch (error) {
        this.$message.error(error.userMessage || "预约失败，请稍后重试");
      } finally {
        this.dialog.submitting = false;
      }
    },
    cancel(id) {
      this.$confirm("确认取消该预约吗？", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(async () => {
          const res = await cancelReservation({ id });
          if (res && res.flag) {
            this.$message.success(res.message || "取消成功");
            this.getReservationList();
          } else {
            this.$message.error((res && res.message) || "取消失败");
          }
        })
        .catch(() => {});
    },
    checkIn(id) {
      if (!this.isAdmin) {
        this.$message.warning("仅管理员可执行转入库操作");
        return;
      }
      this.$confirm("确认将该预约转为入库记录吗？", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(async () => {
          const res = await checkInReservation({ id });
          if (res && res.flag) {
            this.$message.success(res.message || "入库成功");
            this.getReservationList();
          } else {
            this.$message.error((res && res.message) || "入库失败");
          }
        })
        .catch(() => {});
    },
    async getReservationList() {
      try {
        const res = await listGarageReservationPage(this.queryParams);
        if (!res || res.flag === false) {
          this.reservationList = [];
          if (res && res.message) {
            this.$message.error(res.message);
          }
          return;
        }
        const data = res.data || {};
        this.reservationList = data.records || [];
        this.page.total = data.total || 0;
        this.page.pageSize = data.size || 6;
        this.page.currentPag = data.current || 1;
        this.page.pagCount = data.pages || 0;
      } catch (error) {
        this.reservationList = [];
        this.$message.error(error.userMessage || "预约列表加载失败");
      }
    }
  }
};
</script>

<style scoped>
.action-checkin-btn {
  color: #fff6df !important;
  border-color: rgba(245, 187, 92, 0.72) !important;
  background: linear-gradient(180deg, rgba(236, 166, 61, 0.96), rgba(197, 132, 36, 0.96)) !important;
}

.action-checkin-btn:hover {
  color: #fffaf0 !important;
  border-color: rgba(250, 205, 132, 0.88) !important;
  background: linear-gradient(180deg, rgba(246, 183, 90, 0.98), rgba(209, 147, 49, 0.98)) !important;
}

.action-cancel-btn {
  color: #ffe5eb !important;
  border-color: rgba(242, 118, 146, 0.7) !important;
  background: linear-gradient(180deg, rgba(217, 90, 122, 0.95), rgba(174, 56, 85, 0.95)) !important;
}

.action-cancel-btn:hover {
  color: #fff3f6 !important;
  border-color: rgba(252, 157, 178, 0.85) !important;
  background: linear-gradient(180deg, rgba(230, 106, 136, 0.97), rgba(186, 66, 95, 0.97)) !important;
}
</style>
