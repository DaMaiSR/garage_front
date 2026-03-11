<template>
  <div class="common-layout">
    <el-container>
      <el-header>
        <el-row :gutter="20">
          <el-col :span="5">
            <el-input
              v-model="queryParams.plateNo"
              placeholder="车牌号"
              clearable
              @clear="query"
            >
              <template #append>
                <el-button type="info" style="color: black" @click="query">查询</el-button>
              </template>
            </el-input>
          </el-col>
          <el-col :span="5">
            <el-input
              v-model="queryParams.spaceNo"
              placeholder="车位编号"
              clearable
              @clear="query"
            />
          </el-col>
          <el-col :span="5">
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
          <el-col :span="9">
            <el-button type="primary" color="#337ab7" @click="openCreateDialog">
              <el-icon><Plus /></el-icon>
              <span>新增预约</span>
            </el-button>
          </el-col>
        </el-row>
      </el-header>
      <el-divider style="margin: 0" />
      <el-main>
        <el-table :data="reservationList" style="width: 100%; color: black" stripe>
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
                v-if="scope.row.reservationStatus === '0'"
                type="warning"
                icon="Van"
                link
                @click="checkIn(scope.row.id)"
              >
                入库
              </el-button>
              <el-button
                v-if="scope.row.reservationStatus === '0'"
                type="danger"
                icon="Close"
                link
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
              :label="item.plateNo"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="车位编号" prop="spaceNo">
          <el-select v-model="dialog.item.spaceNo" filterable placeholder="请选择车位" style="width: 360px">
            <el-option
              v-for="item in spaceOptions"
              :key="item.id"
              :label="`${item.spaceNo}(${item.areaName || '-'}-${item.floorNo || '-'})`"
              :value="item.spaceNo"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="dialog.item.remark" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>
      <el-divider border-style="double" style="margin: 0" />
      <template #footer>
        <span class="dialog-footer" style="padding-top: 0px">
          <el-button type="primary" @click="save('itemForm')">保存</el-button>
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

export default {
  computed: {
    indexMethod() {
      return this.page.currentPag * this.page.pageSize - this.page.pageSize + 1;
    }
  },
  data() {
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
        item: {
          vehicleId: "",
          plateNo: "",
          spaceNo: "",
          remark: ""
        }
      },
      rules: {
        vehicleId: [{ required: true, message: "请选择车辆", trigger: "change" }],
        spaceNo: [{ required: true, message: "请选择车位", trigger: "change" }]
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
    openCreateDialog() {
      this.dialog.dialogVisible = true;
      this.$nextTick(() => {
        this.initDialogForm();
      });
      this.loadVehicleOptions();
      this.loadSpaceOptions();
    },
    closeDialog() {
      this.dialog.dialogVisible = false;
      this.resetForm("itemForm");
      this.initDialogForm();
    },
    save(formName) {
      this.$refs[formName].validate((valid) => {
        if (!valid) {
          return false;
        }
        const selectedVehicle = this.vehicleOptions.find((item) => item.id === this.dialog.item.vehicleId);
        this.dialog.item.plateNo = selectedVehicle ? selectedVehicle.plateNo : "";
        createReservation(this.dialog.item).then((res) => {
          if (res && res.flag) {
            this.$message.success(res.message || "预约成功");
            this.closeDialog();
            this.query();
          } else {
            this.$message.error((res && res.message) || "预约失败");
          }
        });
      });
    },
    cancel(id) {
      this.$confirm("确认取消该预约？", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          cancelReservation({ id }).then((res) => {
            if (res && res.flag) {
              this.$message.success(res.message || "取消成功");
              this.getReservationList();
            } else {
              this.$message.error((res && res.message) || "取消失败");
            }
          });
        })
        .catch(() => {});
    },
    checkIn(id) {
      this.$confirm("确认将该预约转为入库记录？", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          checkInReservation({ id }).then((res) => {
            if (res && res.flag) {
              this.$message.success(res.message || "入库成功");
              this.getReservationList();
            } else {
              this.$message.error((res && res.message) || "入库失败");
            }
          });
        })
        .catch(() => {});
    },
    loadVehicleOptions() {
      listGarageVehicle().then((res) => {
        if (res && res.flag) {
          this.vehicleOptions = Array.isArray(res.data) ? res.data : [];
        } else {
          this.vehicleOptions = [];
        }
      });
    },
    loadSpaceOptions() {
      listGarageSpacePage({ status: "0", pageSize: "1" }).then((res) => {
        if (res && res.flag) {
          const records = (res.data && res.data.records) || [];
          this.spaceOptions = records;
        } else {
          this.spaceOptions = [];
        }
      });
    },
    getReservationList() {
      listGarageReservationPage(this.queryParams)
        .then((res) => {
          if (!res || res.flag === false) {
            this.reservationList = [];
            return;
          }
          const data = res.data || {};
          this.reservationList = data.records || [];
          this.page.total = data.total || 0;
          this.page.pageSize = data.size || 6;
          this.page.currentPag = data.current || 1;
          this.page.pagCount = data.pages || 0;
        })
        .catch(() => {
          this.reservationList = [];
        });
    }
  }
};
</script>
