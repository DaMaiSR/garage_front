<template>
  <div class="monitor-wrap">
    <div class="monitor-header">
      <h3>实时监控</h3>
      <div class="monitor-actions">
        <span class="server-time">服务器时间：{{ serverTime }}</span>
        <span class="conn" :class="wsConnected ? 'ok' : 'warn'">
          {{ wsConnected ? "WebSocket已连接" : "WebSocket未连接" }}
        </span>
        <el-button type="primary" @click="loadData">刷新</el-button>
      </div>
    </div>

    <el-row :gutter="12" class="overview-row">
      <el-col :span="6">
        <div class="overview-card">
          <div class="label">总车位数</div>
          <div class="value">{{ overview.totalSpaceCount }}</div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="overview-card">
          <div class="label">已占用</div>
          <div class="value">{{ overview.occupiedSpaceCount }}</div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="overview-card">
          <div class="label">空闲</div>
          <div class="value">{{ overview.freeSpaceCount }}</div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="overview-card">
          <div class="label">预约中</div>
          <div class="value">{{ overview.reservedSpaceCount }}</div>
        </div>
      </el-col>
    </el-row>

    <el-row :gutter="12" class="overview-row">
      <el-col :span="6">
        <div class="overview-card muted">
          <div class="label">当前在库车辆</div>
          <div class="value">{{ overview.activeParkingCount }}</div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="overview-card muted">
          <div class="label">当前预约数</div>
          <div class="value">{{ overview.activeReservationCount }}</div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="overview-card muted">
          <div class="label">今日入库</div>
          <div class="value">{{ overview.inTodayCount }}</div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="overview-card muted">
          <div class="label">今日出库</div>
          <div class="value">{{ overview.outTodayCount }}</div>
        </div>
      </el-col>
    </el-row>

    <el-card shadow="never" style="margin-top: 12px">
      <template #header>
        <div class="card-header">当前在库车辆</div>
      </template>
      <el-table :data="activeRecords" v-loading="loading" stripe>
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column prop="plateNo" label="车牌号" align="center" width="130" />
        <el-table-column prop="spaceNo" label="车位编号" align="center" width="120" />
        <el-table-column prop="inTime" label="入场时间" align="center" width="170" />
        <el-table-column prop="durationMinutes" label="停车时长(分钟)" align="center" width="130" />
        <el-table-column prop="remark" label="备注" min-width="180" align="center" />
      </el-table>
    </el-card>

    <el-card shadow="never" style="margin-top: 12px">
      <template #header>
        <div class="card-header">最新进出库记录</div>
      </template>
      <el-table :data="latestRecords" v-loading="loading" stripe>
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column prop="plateNo" label="车牌号" align="center" width="130" />
        <el-table-column prop="spaceNo" label="车位编号" align="center" width="120" />
        <el-table-column prop="inTime" label="入场时间" align="center" width="170" />
        <el-table-column prop="outTime" label="出场时间" align="center" width="170" />
        <el-table-column prop="recordStatus" label="状态" align="center" width="120">
          <template #default="scope">{{ scope.row.recordStatus === "0" ? "在库" : "已出库" }}</template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-card shadow="never" style="margin-top: 12px">
      <template #header>
        <div class="card-header">车位占用情况</div>
      </template>
      <el-table :data="spaceRows" v-loading="loading" stripe>
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column prop="areaName" label="区域" align="center" width="120" />
        <el-table-column prop="floorNo" label="楼层" align="center" width="100" />
        <el-table-column prop="spaceNo" label="车位编号" align="center" width="120" />
        <el-table-column prop="status" label="状态" align="center" width="120">
          <template #default="scope">{{ formatSpaceStatus(scope.row.status) }}</template>
        </el-table-column>
        <el-table-column prop="currentPlateNo" label="当前车牌" align="center" width="140" />
        <el-table-column prop="remark" label="备注" min-width="180" align="center" />
      </el-table>
    </el-card>
  </div>
</template>

<script>
import { getRealtimeMonitorData } from "@/api/monitorApi.js";

export default {
  data() {
    return {
      loading: false,
      wsConnected: false,
      serverTime: "",
      timerId: null,
      reconnectTimer: null,
      ws: null,
      overview: {
        totalSpaceCount: 0,
        freeSpaceCount: 0,
        occupiedSpaceCount: 0,
        reservedSpaceCount: 0,
        maintenanceSpaceCount: 0,
        disabledSpaceCount: 0,
        activeParkingCount: 0,
        activeReservationCount: 0,
        inTodayCount: 0,
        outTodayCount: 0
      },
      activeRecords: [],
      latestRecords: [],
      spaceRows: []
    };
  },
  mounted() {
    this.loadData();
    this.connectWebSocket();
    this.timerId = setInterval(() => {
      this.loadData();
    }, 30000);
  },
  beforeUnmount() {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  },
  methods: {
    formatSpaceStatus(value) {
      const mapping = {
        "0": "空闲",
        "1": "占用",
        "2": "维护中",
        "3": "停用",
        "4": "预约中"
      };
      return mapping[String(value)] || value;
    },
    applyPayload(res) {
      if (!res || res.flag === false) {
        return;
      }
      const data = res.data || {};
      const overview = data.overview || {};
      this.overview = {
        totalSpaceCount: overview.totalSpaceCount || 0,
        freeSpaceCount: overview.freeSpaceCount || 0,
        occupiedSpaceCount: overview.occupiedSpaceCount || 0,
        reservedSpaceCount: overview.reservedSpaceCount || 0,
        maintenanceSpaceCount: overview.maintenanceSpaceCount || 0,
        disabledSpaceCount: overview.disabledSpaceCount || 0,
        activeParkingCount: overview.activeParkingCount || 0,
        activeReservationCount: overview.activeReservationCount || 0,
        inTodayCount: overview.inTodayCount || 0,
        outTodayCount: overview.outTodayCount || 0
      };
      this.activeRecords = Array.isArray(data.activeRecords) ? data.activeRecords : [];
      this.latestRecords = Array.isArray(data.latestRecords) ? data.latestRecords : [];
      this.spaceRows = Array.isArray(data.spaceRows) ? data.spaceRows : [];
      this.serverTime = data.serverTime || new Date().toLocaleString();
    },
    buildWsUrl() {
      const base = process.env.VUE_APP_BASE_URL || "http://localhost:9999/garage";
      const token = sessionStorage.getItem("token") || "";
      const url = base.replace(/^http/i, "ws").replace(/\/$/, "");
      return `${url}/ws/realtime?token=${encodeURIComponent(token)}`;
    },
    connectWebSocket() {
      const token = sessionStorage.getItem("token");
      if (!token) {
        return;
      }
      const wsUrl = this.buildWsUrl();
      this.ws = new WebSocket(wsUrl);
      this.ws.onopen = () => {
        this.wsConnected = true;
      };
      this.ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data || "{}");
          this.applyPayload(payload);
        } catch (e) {
          // ignore parse error
        }
      };
      this.ws.onclose = () => {
        this.wsConnected = false;
        this.scheduleReconnect();
      };
      this.ws.onerror = () => {
        this.wsConnected = false;
      };
    },
    scheduleReconnect() {
      if (this.reconnectTimer) {
        return;
      }
      this.reconnectTimer = setTimeout(() => {
        this.reconnectTimer = null;
        this.connectWebSocket();
      }, 5000);
    },
    loadData() {
      this.loading = true;
      getRealtimeMonitorData()
        .then((res) => {
          this.applyPayload(res);
        })
        .finally(() => {
          this.loading = false;
        });
    }
  }
};
</script>

<style scoped>
.monitor-wrap {
  padding: 8px 6px 16px;
}

.monitor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.monitor-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.conn {
  font-size: 12px;
  border-radius: 10px;
  padding: 1px 8px;
}

.conn.ok {
  color: #0c7a43;
  background: #ddf5e9;
}

.conn.warn {
  color: #a55b11;
  background: #ffeccd;
}

.server-time {
  color: #4a627d;
  font-size: 13px;
}

.overview-row {
  margin-bottom: 12px;
}

.overview-card {
  background: linear-gradient(140deg, #235f9d, #3a89d2);
  color: #fff;
  border-radius: 8px;
  min-height: 84px;
  padding: 14px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.overview-card.muted {
  background: linear-gradient(140deg, #5e7991, #8aa4ba);
}

.overview-card .label {
  font-size: 13px;
  opacity: 0.9;
}

.overview-card .value {
  font-size: 28px;
  font-weight: 700;
  margin-top: 4px;
}

.card-header {
  font-weight: 600;
}
</style>
