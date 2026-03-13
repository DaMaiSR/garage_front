<template>
  <div class="common-layout">
    <el-container>
      <el-header>
        <div class="page-shell">
          <div class="page-hero">
            <div class="page-hero-title">
              <h2>停车记录</h2>
              <p>统一处理车辆入库与出库结算，费用按停车时长自动计算。</p>
            </div>
            <div class="page-hero-actions">
              <el-button type="primary" class="toolbar-strong" @click="openInDialog">
                <el-icon><Plus /></el-icon>
                <span>停车入库</span>
              </el-button>
            </div>
          </div>

          <div class="filter-card">
            <div class="panel-head">
              <h3 class="panel-title">筛选条件</h3>
              <span class="panel-hint">支持按车牌与在场状态快速检索</span>
            </div>
            <el-row :gutter="12" class="filter-grid">
              <el-col :xs="24" :sm="12" :md="8" :lg="7">
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
                <label class="input-label">在场状态</label>
                <el-select
                  v-model="queryParams.recordStatus"
                  placeholder="在场状态"
                  clearable
                  style="width: 100%"
                  @change="query"
                >
                  <el-option
                    v-for="item in recordStatusOptions"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
              </el-col>
            </el-row>
            <div class="ops-note">出库结算时系统会自动计算费用，并需选择支付方式完成支付后出库。</div>
          </div>
        </div>
      </el-header>

      <el-divider style="margin: 0" />

      <el-main>
        <div class="table-card">
          <div class="panel-head">
            <h3 class="panel-title">停车记录列表</h3>
            <span class="panel-hint">共 {{ page.total }} 条</span>
          </div>
          <el-table :data="recordList" style="width: 100%" stripe>
            <el-table-column align="center" type="index" :index="indexMethod" label="序号" width="60" />
            <el-table-column align="center" prop="plateNo" label="车牌号" width="130" />
            <el-table-column align="center" prop="spaceNo" label="车位编号" width="120" />
            <el-table-column align="center" prop="inTime" label="入场时间" width="170" />
            <el-table-column align="center" prop="outTime" label="出场时间" width="170" />
            <el-table-column align="center" prop="parkingMinutes" label="停车时长(分钟)" width="130" />
            <el-table-column align="center" prop="totalFee" label="费用(元)" width="100" />
            <el-table-column align="center" prop="payStatus" label="支付状态" width="100">
              <template #default="scope">{{ formatPayStatus(scope.row.payStatus) }}</template>
            </el-table-column>
            <el-table-column align="center" prop="recordStatus" label="在场状态" width="100">
              <template #default="scope">{{ formatRecordStatus(scope.row.recordStatus) }}</template>
            </el-table-column>
            <el-table-column align="center" fixed="right" label="操作" width="150">
              <template #default="scope">
                <el-button
                  type="warning"
                  icon="Switch"
                  link
                  v-if="isCanOut(scope.row)"
                  @click="openOutDialog(scope.row)"
                >
                  出库结算
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
      v-model="inDialog.dialogVisible"
      title="停车入库"
      width="40%"
      align-center
      draggable
      :before-close="closeInDialog"
    >
      <el-divider border-style="double" style="margin: 0" />
      <el-form
        label-position="right"
        label-width="auto"
        style="max-width: 420px; margin: 20px auto"
        ref="inForm"
        :model="inDialog.form"
        :rules="inRules"
      >
        <el-form-item label="车辆" prop="vehicleId">
          <el-select v-model="inDialog.form.vehicleId" filterable placeholder="请选择车辆" style="width: 360px">
            <el-option
              v-for="item in vehicleOptions"
              :key="item.id"
              :label="`${item.plateNo} / ${item.ownerName || '-'}`"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="车位编号" prop="spaceNo">
          <el-select v-model="inDialog.form.spaceNo" filterable placeholder="请选择车位" style="width: 360px">
            <el-option
              v-for="item in spaceOptions"
              :key="item.id"
              :label="`${item.spaceNo} (${item.areaName || '-'}-${item.floorNo || '-'})`"
              :value="item.spaceNo"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="入场时间" prop="inTime">
          <el-date-picker
            style="width: 360px"
            v-model="inDialog.form.inTime"
            type="datetime"
            format="YYYY/MM/DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
            placeholder="请选择入场时间"
          />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="inDialog.form.remark" type="textarea" :rows="3" maxlength="100" show-word-limit />
        </el-form-item>
      </el-form>
      <el-divider border-style="double" style="margin: 0" />
      <template #footer>
        <span class="dialog-footer" style="padding-top: 0px">
          <el-button type="primary" :loading="inDialog.submitting" @click="saveIn('inForm')">保存</el-button>
          <el-button @click="closeInDialog">取消</el-button>
        </span>
      </template>
    </el-dialog>

    <el-dialog
      v-model="outDialog.dialogVisible"
      title="出库结算"
      width="40%"
      align-center
      draggable
      :before-close="closeOutDialog"
    >
      <el-divider border-style="double" style="margin: 0" />
      <el-form
        label-position="right"
        label-width="auto"
        style="max-width: 420px; margin: 20px auto"
        ref="outForm"
        :model="outDialog.form"
        :rules="outRules"
      >
        <el-form-item label="车牌号">
          <el-input v-model="outDialog.form.plateNo" readonly />
        </el-form-item>
        <el-form-item label="车位编号">
          <el-input v-model="outDialog.form.spaceNo" readonly />
        </el-form-item>
        <el-form-item label="入场时间">
          <el-input v-model="outDialog.form.inTime" readonly />
        </el-form-item>
        <el-form-item label="出场时间" prop="outTime">
          <el-date-picker
            style="width: 360px"
            v-model="outDialog.form.outTime"
            type="datetime"
            format="YYYY/MM/DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
            placeholder="请选择出场时间"
            @change="onOutTimeChange"
          />
        </el-form-item>
        <el-form-item label="停车时长(分钟)">
          <el-input v-model="outDialog.form.parkingMinutes" readonly />
        </el-form-item>
        <el-form-item label="费用(元)" prop="totalFee">
          <el-input v-model="outDialog.form.totalFee" readonly />
        </el-form-item>
        <el-form-item label="支付方式" prop="payMethod">
          <el-select v-model="outDialog.form.payMethod" style="width: 360px" placeholder="请选择支付方式">
            <el-option
              v-for="item in payMethodOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <el-divider border-style="double" style="margin: 0" />
      <template #footer>
        <span class="dialog-footer" style="padding-top: 0px">
          <el-button type="primary" :loading="outDialog.submitting" @click="saveOut('outForm')">保存</el-button>
          <el-button @click="closeOutDialog">取消</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { getNowDateTime } from "@/utils/common.js";
import {
  listGarageRecordPage,
  addGarageInRecord,
  updateGarageOutRecord
} from "@/api/garageRecordApi.js";
import { listGarageVehicle } from "@/api/garageVehicleApi.js";
import { listGarageSpacePage } from "@/api/garageSpaceApi.js";
import { diffMinutes, calcFeeByMinutes } from "@/api/dbConfig.js";

export default {
  computed: {
    indexMethod() {
      return this.page.currentPag * this.page.pageSize - this.page.pageSize + 1;
    }
  },
  data() {
    return {
      payStatusOptions: [
        { value: "0", label: "未支付" },
        { value: "1", label: "已支付" }
      ],
      payMethodOptions: [
        { value: "WECHAT", label: "微信支付" },
        { value: "ALIPAY", label: "支付宝" },
        { value: "CASH", label: "现金" },
        { value: "FREE", label: "免单（0元）" }
      ],
      recordStatusOptions: [
        { value: "0", label: "在场" },
        { value: "1", label: "已出场" }
      ],
      queryParams: {
        plateNo: "",
        recordStatus: "",
        pageSize: "1"
      },
      page: {
        total: 0,
        pageSize: 6,
        currentPag: 1,
        pagCount: 0
      },
      recordList: [],
      vehicleOptions: [],
      spaceOptions: [],
      inDialog: {
        dialogVisible: false,
        submitting: false,
        form: {
          vehicleId: "",
          plateNo: "",
          spaceNo: "",
          inTime: "",
          remark: ""
        }
      },
      outDialog: {
        dialogVisible: false,
        submitting: false,
        form: {
          id: "",
          plateNo: "",
          spaceNo: "",
          inTime: "",
          outTime: "",
          parkingMinutes: "0",
          totalFee: "0",
          payMethod: "WECHAT"
        }
      },
      inRules: {
        vehicleId: [{ required: true, message: "请选择车辆", trigger: "change" }],
        spaceNo: [{ required: true, message: "请选择车位", trigger: "change" }],
        inTime: [{ required: true, message: "请选择入场时间", trigger: "change" }]
      },
      outRules: {
        outTime: [{ required: true, message: "请选择出场时间", trigger: "change" }],
        payMethod: [{ required: true, message: "请选择支付方式", trigger: "change" }]
      }
    };
  },
  mounted() {
    this.getRecordList();
  },
  methods: {
    formatPayStatus(value) {
      const item = this.payStatusOptions.find((temp) => temp.value === String(value));
      return item ? item.label : value;
    },
    formatRecordStatus(value) {
      const item = this.recordStatusOptions.find((temp) => temp.value === String(value));
      return item ? item.label : value;
    },
    isCanOut(row) {
      return row && String(row.recordStatus) === "0";
    },
    query() {
      this.queryParams.pageSize = "1";
      this.getRecordList();
    },
    handleCurrentChange(curPage) {
      this.page.currentPag = curPage;
      this.queryParams.pageSize = String(curPage);
      this.getRecordList();
    },
    initInForm() {
      this.inDialog.form.vehicleId = "";
      this.inDialog.form.plateNo = "";
      this.inDialog.form.spaceNo = "";
      this.inDialog.form.inTime = getNowDateTime();
      this.inDialog.form.remark = "";
    },
    initOutForm() {
      this.outDialog.form.id = "";
      this.outDialog.form.plateNo = "";
      this.outDialog.form.spaceNo = "";
      this.outDialog.form.inTime = "";
      this.outDialog.form.outTime = getNowDateTime();
      this.outDialog.form.parkingMinutes = "0";
      this.outDialog.form.totalFee = "0";
      this.outDialog.form.payMethod = "WECHAT";
    },
    resetForm(formName) {
      if (this.$refs[formName]) {
        this.$refs[formName].resetFields();
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
          this.spaceOptions = (res.data && res.data.records) || [];
        } else {
          this.spaceOptions = [];
        }
      } catch (error) {
        this.spaceOptions = [];
        this.$message.error(error.userMessage || "空闲车位加载失败");
      }
    },
    async openInDialog() {
      await Promise.all([this.loadVehicleOptions(), this.loadSpaceOptions()]);
      if (this.vehicleOptions.length === 0) {
        this.$alert("你还没有可用车辆，请先在“车辆信息管理”中新增车辆。", "提示", {
          confirmButtonText: "去新增"
        }).then(() => {
          this.$router.push("/garage/vehicleManage");
        });
        return;
      }
      if (this.spaceOptions.length === 0) {
        this.$message.warning("当前没有可用空闲车位，请稍后再试");
        return;
      }

      this.inDialog.dialogVisible = true;
      this.$nextTick(() => {
        this.initInForm();
      });
    },
    closeInDialog() {
      this.inDialog.dialogVisible = false;
      this.resetForm("inForm");
      this.initInForm();
    },
    openOutDialog(row) {
      this.outDialog.dialogVisible = true;
      this.$nextTick(() => {
        this.outDialog.form.id = row.id;
        this.outDialog.form.plateNo = row.plateNo;
        this.outDialog.form.spaceNo = row.spaceNo;
        this.outDialog.form.inTime = row.inTime || "";
        this.outDialog.form.outTime = row.outTime ? row.outTime : getNowDateTime();
        this.outDialog.form.totalFee = row.totalFee == null ? "0" : String(row.totalFee);
        this.outDialog.form.payMethod = "WECHAT";
        this.recalculateOutFee();
      });
    },
    closeOutDialog() {
      this.outDialog.dialogVisible = false;
      this.resetForm("outForm");
      this.initOutForm();
    },
    onOutTimeChange() {
      this.recalculateOutFee();
    },
    recalculateOutFee() {
      const minutes = diffMinutes(this.outDialog.form.inTime, this.outDialog.form.outTime);
      this.outDialog.form.parkingMinutes = minutes === "" ? "0" : minutes;
      this.outDialog.form.totalFee = calcFeeByMinutes(this.outDialog.form.parkingMinutes);
      if (String(this.outDialog.form.totalFee) === "0") {
        this.outDialog.form.payMethod = "FREE";
      } else if (this.outDialog.form.payMethod === "FREE") {
        this.outDialog.form.payMethod = "WECHAT";
      }
    },
    isOutTimeValid() {
      const inMs = new Date(this.outDialog.form.inTime).getTime();
      const outMs = new Date(this.outDialog.form.outTime).getTime();
      if (Number.isNaN(inMs) || Number.isNaN(outMs)) {
        return false;
      }
      return outMs >= inMs;
    },
    async saveIn(formName) {
      if (this.inDialog.submitting) {
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

      const selectedVehicle = this.vehicleOptions.find((item) => item.id === this.inDialog.form.vehicleId);
      if (!selectedVehicle || !selectedVehicle.plateNo) {
        this.$message.warning("请选择有效车辆");
        return;
      }

      try {
        this.inDialog.submitting = true;
        const payload = {
          plateNo: selectedVehicle.plateNo,
          spaceNo: this.inDialog.form.spaceNo,
          inTime: this.inDialog.form.inTime,
          remark: (this.inDialog.form.remark || "").trim()
        };
        const res = await addGarageInRecord(payload);
        if (res && res.flag) {
          this.$message.success(res.message || "入库成功");
          this.closeInDialog();
          this.query();
          return;
        }
        this.$message.error((res && res.message) || "入库失败");
      } catch (error) {
        this.$message.error(error.userMessage || "入库失败，请稍后重试");
      } finally {
        this.inDialog.submitting = false;
      }
    },
    async saveOut(formName) {
      if (this.outDialog.submitting) {
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

      if (!this.isOutTimeValid()) {
        this.$message.warning("出场时间不能早于入场时间");
        return;
      }

      try {
        this.outDialog.submitting = true;
        const payload = {
          id: this.outDialog.form.id,
          plateNo: this.outDialog.form.plateNo,
          spaceNo: this.outDialog.form.spaceNo,
          outTime: this.outDialog.form.outTime,
          totalFee: String(this.outDialog.form.totalFee).trim(),
          payMethod: this.outDialog.form.payMethod
        };
        const res = await updateGarageOutRecord(payload);
        if (res && res.flag) {
          this.$message.success(res.message || "出库成功");
          this.closeOutDialog();
          this.getRecordList();
          return;
        }
        this.$message.error((res && res.message) || "出库失败");
      } catch (error) {
        this.$message.error(error.userMessage || "出库失败，请稍后重试");
      } finally {
        this.outDialog.submitting = false;
      }
    },
    async getRecordList() {
      try {
        const res = await listGarageRecordPage(this.queryParams);
        if (!res || res.flag === false) {
          this.recordList = [];
          if (res && res.message) {
            this.$message.error(res.message);
          }
          return;
        }
        const data = res.data || {};
        this.recordList = data.records || [];
        this.page.total = data.total || 0;
        this.page.pageSize = data.size || 6;
        this.page.currentPag = data.current || 1;
        this.page.pagCount = data.pages || 0;
      } catch (error) {
        this.recordList = [];
        this.$message.error(error.userMessage || "停车记录加载失败");
      }
    }
  }
};
</script>
