<template>
  <div class="common-layout">
    <el-container>
      <el-header>
        <el-row :gutter="20">
          <el-col :span="6">
            <el-input
              v-model="queryParams.keyword"
              placeholder="车牌号/车主"
              clearable
              @clear="query"
            >
              <template #append>
                <el-button type="info" @click="query" style="color: black">查询</el-button>
              </template>
            </el-input>
          </el-col>
          <el-col :span="5">
            <el-select
              v-model="queryParams.status"
              placeholder="状态"
              clearable
              style="width: 100%"
              @change="query"
            >
              <el-option
                v-for="item in statusOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-col>
          <el-col :span="13">
            <el-button type="primary" color="#337ab7" @click="addItem">
              <el-icon><Plus /></el-icon>
              <span>新增车辆</span>
            </el-button>
          </el-col>
        </el-row>
      </el-header>

      <el-divider style="margin: 0" />

      <el-main>
        <el-table :data="vehicleList" style="width: 100%; color: black" stripe>
          <el-table-column align="center" type="index" :index="indexMethod" label="序号" width="60" />
          <el-table-column align="center" prop="plateNo" label="车牌号" width="130" />
          <el-table-column align="center" prop="ownerName" label="车主" width="110" />
          <el-table-column align="center" prop="ownerPhone" label="联系电话" width="140" />
          <el-table-column align="center" prop="vehicleType" label="车辆类型" width="120">
            <template #default="scope">{{ formatVehicleType(scope.row.vehicleType) }}</template>
          </el-table-column>
          <el-table-column align="center" prop="memberType" label="会员类型" width="120">
            <template #default="scope">{{ formatMemberType(scope.row.memberType) }}</template>
          </el-table-column>
          <el-table-column align="center" prop="bindSpaceNo" label="绑定车位" width="120" />
          <el-table-column align="center" prop="expireDate" label="有效期至" width="140" />
          <el-table-column align="center" prop="status" label="状态" width="100">
            <template #default="scope">{{ formatStatus(scope.row.status) }}</template>
          </el-table-column>
          <el-table-column align="center" fixed="right" label="操作" width="180">
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
        <el-form-item label="车牌号" prop="plateNo">
          <el-input v-model="dialog.item.plateNo" />
        </el-form-item>
        <el-form-item label="车主姓名" prop="ownerName">
          <el-input v-model="dialog.item.ownerName" />
        </el-form-item>
        <el-form-item label="联系电话" prop="ownerPhone">
          <el-input v-model="dialog.item.ownerPhone" />
        </el-form-item>
        <el-form-item label="车辆类型" prop="vehicleType">
          <el-select v-model="dialog.item.vehicleType" style="width: 360px" placeholder="请选择车辆类型">
            <el-option
              v-for="item in vehicleTypeOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="会员类型" prop="memberType">
          <el-select v-model="dialog.item.memberType" style="width: 360px" placeholder="请选择会员类型">
            <el-option
              v-for="item in memberTypeOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="绑定车位">
          <el-input v-model="dialog.item.bindSpaceNo" />
        </el-form-item>
        <el-form-item label="有效期至">
          <el-date-picker
            style="width: 360px"
            v-model="dialog.item.expireDate"
            type="date"
            format="YYYY/MM/DD"
            value-format="YYYY-MM-DD"
            placeholder="请选择日期"
          />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="dialog.item.status" style="width: 360px" placeholder="请选择状态">
            <el-option
              v-for="item in statusOptions"
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
          <el-button type="primary" :loading="dialog.submitting" @click="save('itemForm')">保存</el-button>
          <el-button @click="cancel">取消</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import {
  listGarageVehiclePage,
  addGarageVehicle,
  updateGarageVehicle,
  delGarageVehicle
} from "@/api/garageVehicleApi.js";

export default {
  computed: {
    indexMethod() {
      return this.page.currentPag * this.page.pageSize - this.page.pageSize + 1;
    }
  },
  data() {
    const plateValidator = (_, value, callback) => {
      const txt = String(value || "").trim();
      if (!txt) {
        callback(new Error("请输入车牌号"));
        return;
      }
      if (txt.length < 5 || txt.length > 12) {
        callback(new Error("车牌号长度应为5-12位"));
        return;
      }
      callback();
    };

    const phoneValidator = (_, value, callback) => {
      const txt = String(value || "").trim();
      if (!/^1\d{10}$/.test(txt)) {
        callback(new Error("请输入11位手机号"));
        return;
      }
      callback();
    };

    return {
      vehicleTypeOptions: [
        { value: "1", label: "轿车" },
        { value: "2", label: "SUV" },
        { value: "3", label: "新能源车" }
      ],
      memberTypeOptions: [
        { value: "1", label: "临停" },
        { value: "2", label: "月租" },
        { value: "3", label: "年租" }
      ],
      statusOptions: [
        { value: "1", label: "启用" },
        { value: "2", label: "停用" }
      ],
      dialog: {
        dialogVisible: false,
        submitting: false,
        tops: "",
        item: {
          id: "",
          plateNo: "",
          ownerName: "",
          ownerPhone: "",
          vehicleType: "1",
          memberType: "1",
          bindSpaceNo: "",
          expireDate: "",
          status: "1"
        }
      },
      rules: {
        plateNo: [{ validator: plateValidator, trigger: "blur" }],
        ownerName: [{ required: true, message: "请输入车主姓名", trigger: "blur" }],
        ownerPhone: [{ validator: phoneValidator, trigger: "blur" }],
        vehicleType: [{ required: true, message: "请选择车辆类型", trigger: "change" }],
        memberType: [{ required: true, message: "请选择会员类型", trigger: "change" }],
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
      vehicleList: []
    };
  },
  mounted() {
    this.getVehicleList();
  },
  methods: {
    formatVehicleType(value) {
      const item = this.vehicleTypeOptions.find((temp) => temp.value === String(value));
      return item ? item.label : value;
    },
    formatMemberType(value) {
      const item = this.memberTypeOptions.find((temp) => temp.value === String(value));
      return item ? item.label : value;
    },
    formatStatus(value) {
      const item = this.statusOptions.find((temp) => temp.value === String(value));
      return item ? item.label : value;
    },
    query() {
      this.queryParams.pageSize = "1";
      this.getVehicleList();
    },
    handleCurrentChange(curPage) {
      this.page.currentPag = curPage;
      this.queryParams.pageSize = String(curPage);
      this.getVehicleList();
    },
    initDialogForm() {
      this.dialog.item.id = "";
      this.dialog.item.plateNo = "";
      this.dialog.item.ownerName = "";
      this.dialog.item.ownerPhone = "";
      this.dialog.item.vehicleType = "1";
      this.dialog.item.memberType = "1";
      this.dialog.item.bindSpaceNo = "";
      this.dialog.item.expireDate = "";
      this.dialog.item.status = "1";
    },
    addItem() {
      this.dialog.tops = "新增车辆";
      this.dialog.dialogVisible = true;
      this.$nextTick(() => {
        this.initDialogForm();
      });
    },
    edit(row) {
      this.dialog.tops = "修改车辆";
      this.dialog.dialogVisible = true;
      this.$nextTick(() => {
        this.dialog.item.id = row.id;
        this.dialog.item.plateNo = row.plateNo;
        this.dialog.item.ownerName = row.ownerName;
        this.dialog.item.ownerPhone = row.ownerPhone;
        this.dialog.item.vehicleType = row.vehicleType == null ? "1" : String(row.vehicleType);
        this.dialog.item.memberType = row.memberType == null ? "1" : String(row.memberType);
        this.dialog.item.bindSpaceNo = row.bindSpaceNo || "";
        this.dialog.item.expireDate = row.expireDate || "";
        this.dialog.item.status = row.status == null ? "1" : String(row.status);
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
    buildPayload() {
      return {
        ...this.dialog.item,
        plateNo: String(this.dialog.item.plateNo || "").trim().toUpperCase(),
        ownerName: String(this.dialog.item.ownerName || "").trim(),
        ownerPhone: String(this.dialog.item.ownerPhone || "").trim(),
        bindSpaceNo: String(this.dialog.item.bindSpaceNo || "").trim()
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
        this.dialog.submitting = true;
        const payload = this.buildPayload();
        let res;
        if (!payload.id) {
          res = await addGarageVehicle(payload);
          if (res && res.flag) {
            this.$message.success(res.message || "新增成功");
            this.query();
            this.handleClose();
            return;
          }
          this.$message.error((res && res.message) || "新增失败");
          return;
        }

        res = await updateGarageVehicle(payload);
        if (res && res.flag) {
          this.$message.success(res.message || "修改成功");
          this.getVehicleList();
          this.handleClose();
          return;
        }
        this.$message.error((res && res.message) || "修改失败");
      } catch (error) {
        this.$message.error(error.userMessage || "保存失败，请稍后重试");
      } finally {
        this.dialog.submitting = false;
      }
    },
    del(id) {
      this.$confirm("此操作将删除车辆信息，是否继续？", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(async () => {
          const res = await delGarageVehicle({ id });
          if (res && res.flag) {
            this.$message.success(res.message || "删除成功");
            this.getVehicleList();
          } else {
            this.$message.error((res && res.message) || "删除失败");
          }
        })
        .catch(() => {});
    },
    async getVehicleList() {
      try {
        const res = await listGarageVehiclePage(this.queryParams);
        if (!res || res.flag === false) {
          this.vehicleList = [];
          if (res && res.message) {
            this.$message.error(res.message);
          }
          return;
        }
        const data = res.data || {};
        this.vehicleList = data.records || [];
        this.page.total = data.total || 0;
        this.page.pageSize = data.size || 6;
        this.page.currentPag = data.current || 1;
        this.page.pagCount = data.pages || 0;
      } catch (error) {
        this.vehicleList = [];
        this.$message.error(error.userMessage || "车辆列表加载失败");
      }
    }
  }
};
</script>
