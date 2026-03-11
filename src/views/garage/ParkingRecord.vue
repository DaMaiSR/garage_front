<template>
  <div class="common-layout">
    <el-container>
      <el-header>
        <el-row :gutter="20">
          <el-col :span="6">
            <el-input
              v-model="queryParams.plateNo"
              placeholder="车牌号"
              clearable
              @clear="query"
            >
              <template #append>
                <el-button type="info" @click="query" style="color:black">查询</el-button>
              </template>
            </el-input>
          </el-col>
          <el-col :span="5">
            <el-select
              v-model="queryParams.recordStatus"
              placeholder="在场状态"
              clearable
              style="width:100%"
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
          <el-col :span="13">
            <el-button type="primary" color="#337ab7" @click="openInDialog">
              <el-icon><Plus /></el-icon>
              <span>停车入库</span>
            </el-button>
          </el-col>
        </el-row>
      </el-header>
      <el-divider style="margin:0"></el-divider>
      <el-main>
        <el-table :data="recordList" style="width:100%;color:black;" stripe>
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
        <div style="margin-top:15px">
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
      v-model="inDialog.dialogVisible"
      title="停车入库"
      width="40%"
      align-center
      draggable
      :before-close="closeInDialog"
    >
      <el-divider border-style="double" style="margin:0;" />
      <el-form
        label-position="right"
        label-width="auto"
        style="max-width:420px;margin:20px auto"
        class="demo-form-inline"
        ref="inForm"
        :model="inDialog.form"
        :rules="inRules"
      >
        <el-form-item label="车牌号" prop="plateNo">
          <el-input v-model="inDialog.form.plateNo" />
        </el-form-item>
        <el-form-item label="车位编号" prop="spaceNo">
          <el-input v-model="inDialog.form.spaceNo" />
        </el-form-item>
        <el-form-item label="入场时间" prop="inTime">
          <el-date-picker
            style="width:360px"
            v-model="inDialog.form.inTime"
            type="datetime"
            format="YYYY/MM/DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
            placeholder="请选择入场时间"
          ></el-date-picker>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="inDialog.form.remark" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>
      <el-divider border-style="double" style="margin:0;" />
      <template #footer>
        <span class="dialog-footer" style="padding-top:0px">
          <el-button type="primary" @click="saveIn('inForm')">保存</el-button>
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
      <el-divider border-style="double" style="margin:0;" />
      <el-form
        label-position="right"
        label-width="auto"
        style="max-width:420px;margin:20px auto"
        class="demo-form-inline"
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
        <el-form-item label="出场时间" prop="outTime">
          <el-date-picker
            style="width:360px"
            v-model="outDialog.form.outTime"
            type="datetime"
            format="YYYY/MM/DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
            placeholder="请选择出场时间"
          ></el-date-picker>
        </el-form-item>
        <el-form-item label="费用(元)" prop="totalFee">
          <el-input v-model="outDialog.form.totalFee" />
        </el-form-item>
        <el-form-item label="支付状态" prop="payStatus">
          <el-select v-model="outDialog.form.payStatus" style="width:360px" placeholder="请选择支付状态">
            <el-option
              v-for="item in payStatusOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <el-divider border-style="double" style="margin:0;" />
      <template #footer>
        <span class="dialog-footer" style="padding-top:0px">
          <el-button type="primary" @click="saveOut('outForm')">保存</el-button>
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
      inDialog: {
        dialogVisible: false,
        form: {
          plateNo: "",
          spaceNo: "",
          inTime: "",
          remark: ""
        }
      },
      outDialog: {
        dialogVisible: false,
        form: {
          id: "",
          plateNo: "",
          spaceNo: "",
          outTime: "",
          totalFee: "",
          payStatus: "1"
        }
      },
      inRules: {
        plateNo: [{ required: true, message: "请输入车牌号", trigger: "blur" }],
        spaceNo: [{ required: true, message: "请输入车位编号", trigger: "blur" }],
        inTime: [{ required: true, message: "请选择入场时间", trigger: "change" }]
      },
      outRules: {
        outTime: [{ required: true, message: "请选择出场时间", trigger: "change" }],
        totalFee: [{ required: true, message: "请输入费用", trigger: "blur" }],
        payStatus: [{ required: true, message: "请选择支付状态", trigger: "change" }]
      }
    };
  },
  mounted() {
    this.getRecordList();
  },
  methods: {
    formatPayStatus(value) {
      const item = this.payStatusOptions.find((temp) => temp.value == value);
      return item ? item.label : value;
    },
    formatRecordStatus(value) {
      const item = this.recordStatusOptions.find((temp) => temp.value == value);
      return item ? item.label : value;
    },
    isCanOut(row) {
      return row && (row.recordStatus + "") === "0";
    },
    query() {
      this.queryParams.pageSize = "1";
      this.getRecordList();
    },
    handleCurrentChange(curPage) {
      this.page.currentPag = curPage;
      this.queryParams.pageSize = curPage;
      this.getRecordList();
    },
    initInForm() {
      this.inDialog.form.plateNo = "";
      this.inDialog.form.spaceNo = "";
      this.inDialog.form.inTime = getNowDateTime();
      this.inDialog.form.remark = "";
    },
    initOutForm() {
      this.outDialog.form.id = "";
      this.outDialog.form.plateNo = "";
      this.outDialog.form.spaceNo = "";
      this.outDialog.form.outTime = getNowDateTime();
      this.outDialog.form.totalFee = "";
      this.outDialog.form.payStatus = "1";
    },
    resetForm(formName) {
      if (this.$refs[formName]) {
        this.$refs[formName].resetFields();
      }
    },
    openInDialog() {
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
        this.outDialog.form.outTime = row.outTime ? row.outTime : getNowDateTime();
        this.outDialog.form.totalFee = row.totalFee == null ? "" : row.totalFee + "";
        this.outDialog.form.payStatus = row.payStatus == null ? "1" : row.payStatus + "";
      });
    },
    closeOutDialog() {
      this.outDialog.dialogVisible = false;
      this.resetForm("outForm");
      this.initOutForm();
    },
    saveIn(formName) {
      this.$refs[formName].validate((valid) => {
        if (!valid) {
          return false;
        }
        addGarageInRecord(this.inDialog.form).then((res) => {
          if (res.flag) {
            this.$message.success(res.message || "入库成功");
            this.closeInDialog();
            this.query();
          } else {
            this.$message.error(res.message || "入库失败");
          }
        });
      });
    },
    saveOut(formName) {
      this.$refs[formName].validate((valid) => {
        if (!valid) {
          return false;
        }
        updateGarageOutRecord(this.outDialog.form).then((res) => {
          if (res.flag) {
            this.$message.success(res.message || "出库成功");
            this.closeOutDialog();
            this.getRecordList();
          } else {
            this.$message.error(res.message || "出库失败");
          }
        });
      });
    },
    getRecordList() {
      listGarageRecordPage(this.queryParams)
        .then((res) => {
          if (!res || res.flag === false) {
            this.recordList = [];
            return;
          }
          const data = res.data || {};
          this.recordList = data.records || [];
          this.page.total = data.total || 0;
          this.page.pageSize = data.size || 6;
          this.page.currentPag = data.current || 1;
          this.page.pagCount = data.pages || 0;
        })
        .catch(() => {
          this.recordList = [];
        });
    }
  }
};
</script>
