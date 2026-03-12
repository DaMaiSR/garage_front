<template>
  <div class="profile-wrap">
    <el-row :gutter="12" class="stat-row">
      <el-col :span="6">
        <div class="stat-card">
          <div class="label">车辆数</div>
          <div class="value">{{ summary.vehicleCount }}</div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card">
          <div class="label">驾驶档案数</div>
          <div class="value">{{ summary.driverProfileCount }}</div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card">
          <div class="label">当前预约</div>
          <div class="value">{{ summary.activeReservationCount }}</div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card">
          <div class="label">当前在库</div>
          <div class="value">{{ summary.activeParkingCount }}</div>
        </div>
      </el-col>
    </el-row>

    <el-card shadow="never">
      <template #header>
        <div class="card-header">个人资料</div>
      </template>
      <el-form :model="profileForm" label-width="90px" style="max-width: 680px" @submit.prevent>
        <el-row :gutter="12">
          <el-col :span="12">
            <el-form-item label="用户名">
              <el-input v-model="profileForm.username" disabled />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="角色">
              <el-input v-model="roleLabel" disabled />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="12">
          <el-col :span="12">
            <el-form-item label="显示名称">
              <el-input v-model="profileForm.displayName" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="手机号">
              <el-input v-model="profileForm.phone" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="12">
          <el-col :span="12">
            <el-form-item label="证件号">
              <el-input v-model="profileForm.licenseNo" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="证件类型">
              <el-input v-model="profileForm.licenseType" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="12">
          <el-col :span="12">
            <el-form-item label="新密码">
              <el-input v-model="profileForm.password" type="password" show-password placeholder="不修改请留空" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-button type="primary" :loading="saving" @click="saveProfile">保存资料</el-button>
      </el-form>
    </el-card>

    <el-card shadow="never" style="margin-top: 12px">
      <template #header>
        <div class="card-header">我的车辆</div>
      </template>
      <el-table :data="summary.vehicles" stripe>
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column prop="plateNo" label="车牌号" align="center" />
        <el-table-column prop="ownerName" label="车主" align="center" />
        <el-table-column prop="ownerPhone" label="联系电话" align="center" />
        <el-table-column prop="status" label="状态" align="center">
          <template #default="scope">{{ formatVehicleStatus(scope.row.status) }}</template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-card shadow="never" style="margin-top: 12px">
      <template #header>
        <div class="card-header">最近预约</div>
      </template>
      <el-table :data="summary.reservations" stripe>
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column prop="plateNo" label="车牌号" align="center" />
        <el-table-column prop="spaceNo" label="车位号" align="center" />
        <el-table-column prop="reservationTime" label="预约时间" align="center" />
        <el-table-column prop="reservationStatus" label="状态" align="center">
          <template #default="scope">
            {{ formatReservationStatus(scope.row.reservationStatus) }}
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-card shadow="never" style="margin-top: 12px">
      <template #header>
        <div class="card-header">最近停车记录</div>
      </template>
      <el-table :data="summary.parkingRecords" stripe>
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column prop="plateNo" label="车牌号" align="center" />
        <el-table-column prop="spaceNo" label="车位号" align="center" />
        <el-table-column prop="inTime" label="入库时间" align="center" />
        <el-table-column prop="outTime" label="出库时间" align="center" />
        <el-table-column prop="recordStatus" label="状态" align="center">
          <template #default="scope">
            {{ String(scope.row.recordStatus) === "0" ? "在库" : "已出库" }}
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script>
import { profileSummary, updateProfile } from "@/api/userApi.js";

export default {
  data() {
    return {
      saving: false,
      summary: {
        user: {},
        vehicles: [],
        driverProfiles: [],
        reservations: [],
        parkingRecords: [],
        vehicleCount: 0,
        driverProfileCount: 0,
        activeReservationCount: 0,
        activeParkingCount: 0
      },
      profileForm: {
        username: "",
        role: "",
        displayName: "",
        phone: "",
        licenseNo: "",
        licenseType: "",
        password: ""
      }
    };
  },
  computed: {
    roleLabel() {
      return this.profileForm.role === "admin" ? "管理员" : "用户";
    }
  },
  mounted() {
    this.loadSummary();
  },
  methods: {
    formatVehicleStatus(value) {
      return String(value) === "1" ? "启用" : "停用";
    },
    formatReservationStatus(value) {
      const map = {
        "0": "预约中",
        "1": "已取消",
        "2": "已入库"
      };
      return map[String(value)] || value;
    },
    fillProfile(user) {
      this.profileForm.username = user.username || "";
      this.profileForm.role = user.role || "";
      this.profileForm.displayName = user.displayName || "";
      this.profileForm.phone = user.phone || "";
      this.profileForm.licenseNo = user.licenseNo || "";
      this.profileForm.licenseType = user.licenseType || "";
      this.profileForm.password = "";
    },
    async loadSummary() {
      try {
        const res = await profileSummary();
        if (!res || !res.flag) {
          this.$message.error((res && res.message) || "加载失败");
          return;
        }
        this.summary = res.data || this.summary;
        this.fillProfile(this.summary.user || {});
      } catch (error) {
        this.$message.error(error.userMessage || "加载失败，请稍后重试");
      }
    },
    validateProfile() {
      const phone = String(this.profileForm.phone || "").trim();
      if (phone && !/^1\d{10}$/.test(phone)) {
        this.$message.warning("手机号格式不正确");
        return false;
      }
      const password = String(this.profileForm.password || "").trim();
      if (password && password.length < 6) {
        this.$message.warning("新密码至少6位");
        return false;
      }
      return true;
    },
    async saveProfile() {
      if (this.saving) {
        return;
      }
      if (!this.validateProfile()) {
        return;
      }

      const payload = {
        displayName: String(this.profileForm.displayName || "").trim(),
        phone: String(this.profileForm.phone || "").trim(),
        licenseNo: String(this.profileForm.licenseNo || "").trim(),
        licenseType: String(this.profileForm.licenseType || "").trim()
      };
      if (this.profileForm.password) {
        payload.password = String(this.profileForm.password).trim();
      }

      try {
        this.saving = true;
        const res = await updateProfile(payload);
        if (res && res.flag) {
          this.$message.success(res.message || "保存成功");
          this.loadSummary();
        } else {
          this.$message.error((res && res.message) || "保存失败");
        }
      } catch (error) {
        this.$message.error(error.userMessage || "保存失败，请稍后重试");
      } finally {
        this.saving = false;
      }
    }
  }
};
</script>

<style scoped>
.profile-wrap {
  padding: 8px 6px 16px;
}

.stat-row {
  margin-bottom: 12px;
}

.stat-card {
  background: linear-gradient(140deg, #235f9d, #3a89d2);
  color: #fff;
  border-radius: 8px;
  min-height: 84px;
  padding: 14px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.label {
  font-size: 13px;
  opacity: 0.9;
}

.value {
  font-size: 28px;
  font-weight: 700;
  margin-top: 4px;
}

.card-header {
  font-weight: 600;
}
</style>
