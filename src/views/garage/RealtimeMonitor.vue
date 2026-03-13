<template>
  <div class="monitor-wrap">
    <div class="board-title">车库实时监控</div>
    <div class="board-subtitle">
      服务器时间：{{ serverTime || "--" }}
      <span class="conn" :class="wsConnected ? 'ok' : 'warn'">
        {{ wsConnected ? "实时通道已连接" : "实时通道未连接" }}
      </span>
    </div>

    <div class="top-grid">
      <section class="panel filter-panel">
        <h3 class="panel-title">筛选条件</h3>
        <div class="filter-grid">
          <div class="filter-item">
            <label>车牌号</label>
            <el-select
              v-model="filters.plateNo"
              filterable
              clearable
              placeholder="全部车牌"
              popper-class="monitor-select-popper"
            >
              <el-option
                v-for="item in plateOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </div>
          <div class="filter-item">
            <label>车位号</label>
            <el-select
              v-model="filters.spaceNo"
              filterable
              clearable
              placeholder="全部车位"
              popper-class="monitor-select-popper"
            >
              <el-option
                v-for="item in spaceOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </div>
          <div class="filter-item">
            <label>车位状态</label>
            <el-select
              v-model="filters.spaceStatus"
              clearable
              placeholder="全部状态"
              popper-class="monitor-select-popper"
            >
              <el-option
                v-for="item in spaceStatusOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </div>
          <div class="filter-item">
            <label>记录状态</label>
            <el-select
              v-model="filters.recordStatus"
              clearable
              placeholder="全部状态"
              popper-class="monitor-select-popper"
            >
              <el-option
                v-for="item in recordStatusOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </div>
        </div>
        <div class="filter-actions">
          <el-button type="primary" class="action-btn" @click="applyFilters">筛选</el-button>
          <el-button class="action-btn ghost" @click="resetFilters">重置</el-button>
          <el-button class="action-btn ghost" @click="loadData">刷新</el-button>
        </div>
      </section>

      <section class="panel pie-panel">
        <h3 class="panel-title">车位状态占比</h3>
        <div class="pie-box">
          <div class="pie-core" :style="{ background: pieGradient }"></div>
          <div class="pie-legend">
            <div
              class="legend-item"
              v-for="item in statusDistribution"
              :key="item.key"
            >
              <span class="dot" :style="{ backgroundColor: item.color }"></span>
              <span class="name">{{ item.label }}</span>
              <span class="num">{{ item.value }}</span>
            </div>
          </div>
        </div>
      </section>

      <section class="panel bar-panel">
        <h3 class="panel-title">车位状态统计</h3>
        <div class="bar-chart">
          <div
            class="bar-col"
            v-for="item in statusBars"
            :key="item.label"
          >
            <div class="bar-val">{{ item.value }}</div>
            <div class="bar-track">
              <div
                class="bar-fill"
                :style="{ height: toPercent(item.value, statusBarMax) + '%' }"
              ></div>
            </div>
            <div class="bar-label">{{ item.label }}</div>
          </div>
        </div>
      </section>

      <section class="panel bar-panel">
        <h3 class="panel-title">流量统计</h3>
        <div class="bar-chart">
          <div
            class="bar-col"
            v-for="item in flowBars"
            :key="item.label"
          >
            <div class="bar-val">{{ item.value }}</div>
            <div class="bar-track">
              <div
                class="bar-fill"
                :style="{ height: toPercent(item.value, flowBarMax) + '%' }"
              ></div>
            </div>
            <div class="bar-label">{{ item.label }}</div>
          </div>
        </div>
      </section>
    </div>

    <div class="bottom-grid">
      <section class="panel list-panel">
        <div class="list-head">
          <h3 class="panel-title">在库中车辆</h3>
          <span class="count-badge">{{ filteredActiveRecords.length }}</span>
        </div>
        <div class="list-body">
          <div class="list-row" v-for="item in activeListRows" :key="item.id">
            <span class="txt">{{ item.plateNo }}</span>
            <span class="mini-badge">{{ item.durationMinutes }}</span>
          </div>
          <div v-if="activeListRows.length === 0" class="empty-tip">暂无数据</div>
        </div>
        <el-pagination
          class="mini-pager"
          background
          small
          layout="prev, pager, next"
          :total="filteredActiveRecords.length"
          :page-size="activePageSize"
          :current-page="activePage"
          :pager-count="5"
          hide-on-single-page
          @current-change="handleActivePageChange"
        />
      </section>

      <section class="panel list-panel">
        <div class="list-head">
          <h3 class="panel-title">空闲车位</h3>
          <span class="count-badge">{{ filteredFreeSpaceRows.length }}</span>
        </div>
        <div class="list-body">
          <div class="list-row" v-for="item in freeSpaceRows" :key="item.id">
            <span class="txt">{{ item.spaceNo }}</span>
            <span class="mini-badge">{{ item.floorNo || "-" }}</span>
          </div>
          <div v-if="freeSpaceRows.length === 0" class="empty-tip">暂无数据</div>
        </div>
        <el-pagination
          class="mini-pager"
          background
          small
          layout="prev, pager, next"
          :total="filteredFreeSpaceRows.length"
          :page-size="freePageSize"
          :current-page="freePage"
          :pager-count="5"
          hide-on-single-page
          @current-change="handleFreePageChange"
        />
      </section>

      <section class="panel table-panel">
        <div class="list-head">
          <h3 class="panel-title">监控明细</h3>
          <span class="table-tip">共 {{ detailRows.length }} 条</span>
        </div>
        <div class="table-scroll">
          <el-table :data="detailPageRows" v-loading="loading" stripe>
            <el-table-column type="index" :index="detailRowIndex" label="序号" width="60" align="center" />
            <el-table-column prop="spaceNo" label="车位号" min-width="120" />
            <el-table-column prop="areaName" label="区域" min-width="120" />
            <el-table-column prop="floorNo" label="楼层" min-width="90" align="center" />
            <el-table-column prop="statusLabel" label="状态" min-width="110" align="center" />
            <el-table-column prop="currentPlateNo" label="当前车牌" min-width="130" align="center" />
            <el-table-column prop="durationMinutes" label="在库时长(分)" min-width="120" align="center" />
            <el-table-column prop="remark" label="备注" min-width="140" />
          </el-table>
        </div>
        <el-pagination
          class="table-pager"
          background
          small
          layout="total, prev, pager, next"
          :total="detailRows.length"
          :page-size="detailPageSize"
          :current-page="detailPage"
          :pager-count="7"
          hide-on-single-page
          @current-change="handleDetailPageChange"
        />
      </section>
    </div>
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
      filters: {
        plateNo: "",
        spaceNo: "",
        spaceStatus: "",
        recordStatus: ""
      },
      appliedFilters: {
        plateNo: "",
        spaceNo: "",
        spaceStatus: "",
        recordStatus: ""
      },
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
      spaceRows: [],
      spaceStatusOptions: [
        { value: "0", label: "空闲" },
        { value: "1", label: "占用" },
        { value: "4", label: "预约中" },
        { value: "2", label: "维护中" },
        { value: "3", label: "停用" }
      ],
      recordStatusOptions: [
        { value: "0", label: "在库" },
        { value: "1", label: "已出库" }
      ],
      activePage: 1,
      freePage: 1,
      detailPage: 1,
      activePageSize: 8,
      freePageSize: 8,
      detailPageSize: 10
    };
  },
  computed: {
    plateOptions() {
      const set = new Set();
      this.activeRecords.forEach((row) => {
        if (row && row.plateNo) {
          set.add(row.plateNo);
        }
      });
      this.latestRecords.forEach((row) => {
        if (row && row.plateNo) {
          set.add(row.plateNo);
        }
      });
      return Array.from(set).map((item) => ({ value: item, label: item }));
    },
    spaceOptions() {
      const set = new Set();
      this.spaceRows.forEach((row) => {
        if (row && row.spaceNo) {
          set.add(row.spaceNo);
        }
      });
      return Array.from(set).map((item) => ({ value: item, label: item }));
    },
    filteredActiveRecords() {
      return this.activeRecords.filter((row) => {
        if (!row) {
          return false;
        }
        if (this.appliedFilters.plateNo && row.plateNo !== this.appliedFilters.plateNo) {
          return false;
        }
        if (this.appliedFilters.spaceNo && row.spaceNo !== this.appliedFilters.spaceNo) {
          return false;
        }
        if (this.appliedFilters.recordStatus && String(row.recordStatus) !== this.appliedFilters.recordStatus) {
          return false;
        }
        return true;
      });
    },
    filteredSpaceRows() {
      return this.spaceRows.filter((row) => {
        if (!row) {
          return false;
        }
        if (this.appliedFilters.spaceNo && row.spaceNo !== this.appliedFilters.spaceNo) {
          return false;
        }
        if (this.appliedFilters.spaceStatus && String(row.status) !== this.appliedFilters.spaceStatus) {
          return false;
        }
        if (this.appliedFilters.plateNo && row.currentPlateNo !== this.appliedFilters.plateNo) {
          return false;
        }
        if (this.appliedFilters.recordStatus === "0" && !row.currentPlateNo) {
          return false;
        }
        if (this.appliedFilters.recordStatus === "1" && row.currentPlateNo) {
          return false;
        }
        return true;
      });
    },
    activeRecordMapBySpaceNo() {
      const map = {};
      this.filteredActiveRecords.forEach((row) => {
        if (row && row.spaceNo) {
          map[row.spaceNo] = row;
        }
      });
      return map;
    },
    detailRows() {
      return this.filteredSpaceRows.map((row) => {
        const active = this.activeRecordMapBySpaceNo[row.spaceNo];
        return {
          ...row,
          statusLabel: this.formatSpaceStatus(row.status),
          durationMinutes: active ? active.durationMinutes : "-",
          currentPlateNo: row.currentPlateNo || "-"
        };
      });
    },
    detailPageRows() {
      return this.getPageSlice(this.detailRows, this.detailPage, this.detailPageSize);
    },
    filteredFreeSpaceRows() {
      return this.filteredSpaceRows.filter((item) => String(item.status) === "0");
    },
    activeListRows() {
      return this.getPageSlice(this.filteredActiveRecords, this.activePage, this.activePageSize);
    },
    freeSpaceRows() {
      return this.getPageSlice(this.filteredFreeSpaceRows, this.freePage, this.freePageSize);
    },
    statusDistribution() {
      return [
        { key: "free", label: "空闲", value: this.num(this.overview.freeSpaceCount), color: "#74d7ff" },
        { key: "occupied", label: "占用", value: this.num(this.overview.occupiedSpaceCount), color: "#1f8fff" },
        { key: "reserved", label: "预约中", value: this.num(this.overview.reservedSpaceCount), color: "#57b6ff" },
        { key: "maintain", label: "维护中", value: this.num(this.overview.maintenanceSpaceCount), color: "#6f87ff" },
        { key: "disabled", label: "停用", value: this.num(this.overview.disabledSpaceCount), color: "#5f6f99" }
      ];
    },
    pieGradient() {
      const total = this.statusDistribution.reduce((sum, item) => sum + item.value, 0);
      if (total <= 0) {
        return "conic-gradient(#214386 0deg, #214386 360deg)";
      }
      let start = 0;
      const pieces = [];
      this.statusDistribution.forEach((item) => {
        if (item.value <= 0) {
          return;
        }
        const degree = (item.value / total) * 360;
        const end = start + degree;
        pieces.push(`${item.color} ${start}deg ${end}deg`);
        start = end;
      });
      if (start < 360) {
        pieces.push(`#214386 ${start}deg 360deg`);
      }
      return `conic-gradient(${pieces.join(",")})`;
    },
    statusBars() {
      return [
        { label: "空闲", value: this.num(this.overview.freeSpaceCount) },
        { label: "占用", value: this.num(this.overview.occupiedSpaceCount) },
        { label: "预约中", value: this.num(this.overview.reservedSpaceCount) },
        { label: "维护中", value: this.num(this.overview.maintenanceSpaceCount) },
        { label: "停用", value: this.num(this.overview.disabledSpaceCount) }
      ];
    },
    flowBars() {
      return [
        { label: "今日入库", value: this.num(this.overview.inTodayCount) },
        { label: "今日出库", value: this.num(this.overview.outTodayCount) },
        { label: "当前在库", value: this.num(this.overview.activeParkingCount) },
        { label: "当前预约", value: this.num(this.overview.activeReservationCount) }
      ];
    },
    statusBarMax() {
      return Math.max(1, ...this.statusBars.map((item) => item.value));
    },
    flowBarMax() {
      return Math.max(1, ...this.flowBars.map((item) => item.value));
    }
  },
  watch: {
    filteredActiveRecords: {
      handler(rows) {
        this.activePage = this.normalizePage(this.activePage, rows.length, this.activePageSize);
      },
      immediate: true
    },
    filteredFreeSpaceRows: {
      handler(rows) {
        this.freePage = this.normalizePage(this.freePage, rows.length, this.freePageSize);
      },
      immediate: true
    },
    detailRows: {
      handler(rows) {
        this.detailPage = this.normalizePage(this.detailPage, rows.length, this.detailPageSize);
      },
      immediate: true
    }
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
    num(value) {
      const n = Number(value);
      return Number.isFinite(n) ? n : 0;
    },
    toPercent(value, max) {
      if (!max) {
        return 0;
      }
      return Math.max(8, Math.round((this.num(value) / max) * 100));
    },
    normalizePage(page, total, pageSize) {
      const size = Math.max(1, Number(pageSize) || 1);
      const maxPage = Math.max(1, Math.ceil((Number(total) || 0) / size));
      const current = Math.max(1, Number(page) || 1);
      return Math.min(current, maxPage);
    },
    getPageSlice(rows, page, pageSize) {
      const list = Array.isArray(rows) ? rows : [];
      const size = Math.max(1, Number(pageSize) || 1);
      const current = this.normalizePage(page, list.length, size);
      const start = (current - 1) * size;
      return list.slice(start, start + size);
    },
    resetPagerPages() {
      this.activePage = 1;
      this.freePage = 1;
      this.detailPage = 1;
    },
    handleActivePageChange(page) {
      this.activePage = this.normalizePage(page, this.filteredActiveRecords.length, this.activePageSize);
    },
    handleFreePageChange(page) {
      this.freePage = this.normalizePage(page, this.filteredFreeSpaceRows.length, this.freePageSize);
    },
    handleDetailPageChange(page) {
      this.detailPage = this.normalizePage(page, this.detailRows.length, this.detailPageSize);
    },
    detailRowIndex(index) {
      return (this.detailPage - 1) * this.detailPageSize + index + 1;
    },
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
    applyFilters() {
      this.appliedFilters = {
        ...this.filters
      };
      this.resetPagerPages();
    },
    resetFilters() {
      this.filters = {
        plateNo: "",
        spaceNo: "",
        spaceStatus: "",
        recordStatus: ""
      };
      this.applyFilters();
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
  padding: 6px;
}

.board-title {
  text-align: center;
  color: #1fa0ff;
  font-size: 34px;
  font-weight: 700;
  letter-spacing: 2px;
  margin-bottom: 4px;
}

.board-subtitle {
  text-align: center;
  color: #8facdf;
  font-size: 13px;
  margin-bottom: 12px;
}

.conn {
  display: inline-block;
  margin-left: 10px;
  padding: 2px 10px;
  border-radius: 10px;
  font-size: 12px;
}

.conn.ok {
  color: #8ff2cd;
  background: rgba(26, 110, 80, 0.45);
  border: 1px solid rgba(66, 184, 139, 0.45);
}

.conn.warn {
  color: #f5c988;
  background: rgba(120, 77, 18, 0.45);
  border: 1px solid rgba(219, 154, 73, 0.42);
}

.top-grid {
  display: grid;
  grid-template-columns: 1.45fr 1fr 1fr 1fr;
  gap: 10px;
  margin-bottom: 10px;
}

.bottom-grid {
  display: grid;
  grid-template-columns: 0.86fr 0.86fr 2.28fr;
  gap: 10px;
  min-height: 446px;
  align-items: stretch;
}

.panel {
  background: linear-gradient(180deg, rgba(18, 33, 82, 0.95), rgba(11, 21, 54, 0.95));
  border: 1px solid rgba(82, 131, 236, 0.34);
  border-radius: 8px;
  box-shadow: 0 8px 18px rgba(3, 10, 30, 0.3);
}

.panel-title {
  margin: 0 0 10px;
  font-size: 15px;
  color: #b9d6ff;
  font-weight: 700;
}

.filter-panel {
  padding: 12px;
}

.filter-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.filter-item label {
  display: block;
  margin-bottom: 6px;
  font-size: 12px;
  color: #89a9df;
}

.filter-item :deep(.el-select),
.filter-item :deep(.el-input) {
  width: 100%;
}

.filter-item :deep(.el-select__wrapper) {
  background: rgba(7, 14, 38, 0.92);
  box-shadow: 0 0 0 1px rgba(92, 144, 255, 0.45) inset;
}

.filter-item :deep(.el-select__selected-item),
.filter-item :deep(.el-input__inner) {
  color: #dcecff;
}

.filter-item :deep(.el-select__placeholder) {
  color: rgba(203, 222, 252, 0.72);
}

:deep(.monitor-select-popper.el-select-dropdown) {
  background: #0a163d;
  border: 1px solid rgba(92, 144, 255, 0.46);
  box-shadow: 0 12px 24px rgba(2, 10, 30, 0.45);
}

:deep(.monitor-select-popper .el-select-dropdown__item) {
  color: #cfe1ff;
}

:deep(.monitor-select-popper .el-select-dropdown__item.is-hovering),
:deep(.monitor-select-popper .el-select-dropdown__item:hover) {
  color: #f3f8ff;
  background: rgba(63, 123, 243, 0.36);
}

:deep(.monitor-select-popper .el-select-dropdown__item.is-selected) {
  color: #84c3ff;
  font-weight: 700;
}

.filter-actions {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}

.action-btn {
  min-width: 84px;
  border-radius: 8px;
  font-weight: 700;
}

.action-btn.ghost {
  background: rgba(19, 41, 93, 0.65);
  border: 1px solid rgba(82, 131, 236, 0.35);
  color: #b9d6ff;
}

.pie-panel {
  padding: 12px;
}

.pie-box {
  display: flex;
  align-items: center;
  gap: 12px;
}

.pie-core {
  width: 126px;
  height: 126px;
  border-radius: 50%;
  position: relative;
  box-shadow: inset 0 0 0 8px rgba(7, 16, 44, 0.65);
}

.pie-core::after {
  content: "";
  position: absolute;
  inset: 24px;
  border-radius: 50%;
  background: rgba(8, 16, 43, 0.88);
}

.pie-legend {
  flex: 1;
  min-width: 0;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
  font-size: 12px;
  color: #95b3e5;
}

.legend-item .dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.legend-item .name {
  flex: 1;
}

.legend-item .num {
  color: #d8e9ff;
  font-weight: 700;
}

.bar-panel {
  padding: 12px 10px;
}

.bar-chart {
  display: flex;
  align-items: flex-end;
  gap: 10px;
  min-height: 160px;
  height: 160px;
}

.bar-col {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.bar-val {
  font-size: 12px;
  color: #aaceff;
  margin-bottom: 4px;
}

.bar-track {
  width: 20px;
  height: 112px;
  display: flex;
  align-items: flex-end;
  background: rgba(20, 42, 93, 0.68);
  border-radius: 6px;
  border: 1px solid rgba(82, 131, 236, 0.2);
}

.bar-fill {
  width: 100%;
  border-radius: 5px;
  background: linear-gradient(180deg, #6bc8ff, #2b82f5);
  transition: height 0.25s ease;
}

.bar-label {
  margin-top: 6px;
  font-size: 12px;
  color: #90afe2;
  writing-mode: horizontal-tb;
  transform: none;
  letter-spacing: 0;
  line-height: 1.2;
  text-align: center;
  min-height: 28px;
}

.list-panel {
  padding: 10px 10px 6px;
  display: flex;
  flex-direction: column;
  min-height: 446px;
}

.list-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.count-badge {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: linear-gradient(180deg, #49a3ff, #2d79e8);
  color: #f4f9ff;
  font-size: 13px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.list-body {
  flex: 1;
  min-height: 0;
  max-height: 372px;
  overflow: auto;
  padding-right: 2px;
}

.mini-pager {
  margin-top: 8px;
  align-self: center;
}

.list-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgba(82, 131, 236, 0.22);
  padding: 8px 0;
}

.txt {
  color: #d2e4ff;
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-right: 8px;
}

.mini-badge {
  min-width: 30px;
  height: 30px;
  padding: 0 8px;
  border-radius: 15px;
  background: rgba(53, 132, 245, 0.85);
  color: #eef6ff;
  font-size: 12px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.empty-tip {
  text-align: center;
  color: #7f9fd2;
  padding: 26px 0;
  font-size: 13px;
}

.table-panel {
  padding: 10px;
  display: flex;
  flex-direction: column;
  min-height: 446px;
}

.table-scroll {
  min-height: 0;
  overflow: hidden;
}

.table-tip {
  color: #8caade;
  font-size: 12px;
}

.table-panel :deep(.el-table) {
  margin-top: 2px;
}

.table-scroll :deep(.el-table__body-wrapper) {
  max-height: 360px;
  overflow-y: auto;
}

.table-pager {
  margin-top: 10px;
  align-self: flex-end;
}

@media (max-width: 1400px) {
  .top-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .bottom-grid {
    grid-template-columns: 1fr;
    min-height: auto;
  }

  .list-panel,
  .table-panel {
    min-height: 300px;
  }

  .list-body {
    max-height: 220px;
  }
}

@media (max-width: 860px) {
  .board-title {
    font-size: 24px;
  }

  .top-grid {
    grid-template-columns: 1fr;
  }

  .filter-grid {
    grid-template-columns: 1fr;
  }

  .filter-actions {
    flex-wrap: wrap;
  }

  .bar-label {
    writing-mode: horizontal-tb;
    transform: none;
    height: auto;
  }
}
</style>
