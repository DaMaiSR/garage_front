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
        </el-row>
      </el-header>
      <el-divider style="margin: 0" />
      <el-main>
        <el-alert
          title="该页面展示当前账号关联的车位（固定车位、预约中、在库占用）。"
          type="info"
          :closable="false"
          style="margin-bottom: 12px"
        />
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
  </div>
</template>

<script>
import { listMyGarageSpacePage } from "@/api/garageSpaceApi.js";

export default {
  computed: {
    indexMethod() {
      return this.page.currentPag * this.page.pageSize - this.page.pageSize + 1;
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
    getSpaceList() {
      listMyGarageSpacePage(this.queryParams)
        .then((res) => {
          if (!res || res.flag === false) {
            this.spaceList = [];
            this.$message.error((res && res.message) || "加载失败");
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
