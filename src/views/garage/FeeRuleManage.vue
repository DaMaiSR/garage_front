<template>
  <div class="fee-rule-page">
    <el-card class="panel-card" shadow="hover">
      <template #header>
        <div class="panel-head">
          <span class="panel-title">停车费率配置</span>
          <span class="panel-subtitle">用于出库结算、识别预估、支付下单金额计算</span>
        </div>
      </template>

      <el-alert
        type="info"
        show-icon
        :closable="false"
        class="tip-alert"
        title="计费规则：超过免费时长后按小时向上取整计费，可设置封顶金额。"
      />

      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="150px"
        class="rule-form"
        v-loading="loading"
      >
        <el-form-item label="免费时长(分钟)" prop="freeMinutes">
          <el-input-number v-model="form.freeMinutes" :min="0" :step="5" />
        </el-form-item>

        <el-form-item label="每小时收费(元)" prop="hourlyRate">
          <el-input v-model="form.hourlyRate" placeholder="例如 5 或 6.5" clearable />
        </el-form-item>

        <el-form-item label="封顶金额(元)">
          <el-input v-model="form.capAmount" placeholder="不填表示不封顶" clearable />
        </el-form-item>

        <el-form-item label="备注">
          <el-input
            v-model="form.remark"
            type="textarea"
            :rows="3"
            maxlength="255"
            show-word-limit
            placeholder="可选，用于说明费率用途"
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" :loading="saving" @click="saveRule">保存配置</el-button>
          <el-button @click="loadRule">刷新</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script>
import { getCurrentFeeRule, updateCurrentFeeRule } from "@/api/feeRuleApi.js";
import { getSessionStorage } from "@/utils/common.js";

export default {
  data() {
    return {
      loading: false,
      saving: false,
      form: {
        freeMinutes: 0,
        hourlyRate: "5",
        capAmount: "",
        remark: ""
      },
      rules: {
        freeMinutes: [
          { required: true, message: "请输入免费时长", trigger: "blur" }
        ],
        hourlyRate: [
          { required: true, message: "请输入每小时收费", trigger: "blur" },
          {
            validator: (_rule, value, callback) => {
              if (value === "" || value == null) {
                callback(new Error("请输入每小时收费"));
                return;
              }
              const num = Number(value);
              if (!Number.isFinite(num) || num < 0) {
                callback(new Error("每小时收费必须是大于等于0的数字"));
                return;
              }
              callback();
            },
            trigger: "blur"
          }
        ]
      }
    };
  },
  mounted() {
    const user = getSessionStorage("user");
    if (!user || user.role !== "admin") {
      this.$message.warning("仅管理员可配置费率");
      this.$router.replace("/garage/spaceManage");
      return;
    }
    this.loadRule();
  },
  methods: {
    loadRule() {
      this.loading = true;
      getCurrentFeeRule()
        .then((res) => {
          if (!res || res.flag === false) {
            this.$message.error((res && res.message) || "获取费率失败");
            return;
          }
          const data = res.data || {};
          this.form.freeMinutes = Number(data.freeMinutes || 0);
          this.form.hourlyRate = String(data.hourlyRate == null ? "5" : data.hourlyRate);
          this.form.capAmount = data.capAmount == null ? "" : String(data.capAmount);
          this.form.remark = data.remark || "";
        })
        .finally(() => {
          this.loading = false;
        });
    },
    saveRule() {
      this.$refs.formRef.validate((valid) => {
        if (!valid) {
          return;
        }
        if (this.form.capAmount !== "") {
          const capNum = Number(this.form.capAmount);
          if (!Number.isFinite(capNum) || capNum < 0) {
            this.$message.warning("封顶金额必须是大于等于0的数字");
            return;
          }
        }

        this.saving = true;
        updateCurrentFeeRule({
          freeMinutes: this.form.freeMinutes,
          hourlyRate: this.form.hourlyRate,
          capAmount: this.form.capAmount,
          remark: this.form.remark
        })
          .then((res) => {
            if (!res || res.flag === false) {
              this.$message.error((res && res.message) || "保存失败");
              return;
            }
            this.$message.success(res.message || "保存成功");
            this.loadRule();
          })
          .finally(() => {
            this.saving = false;
          });
      });
    }
  }
};
</script>

<style scoped>
.fee-rule-page {
  padding: 6px;
}

.panel-card {
  border-radius: 10px;
}

.panel-head {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.panel-title {
  font-size: 18px;
  font-weight: 700;
  color: #d8e8ff;
}

.panel-subtitle {
  font-size: 12px;
  color: #9cb9ec;
}

.tip-alert {
  margin-bottom: 14px;
  --el-alert-bg-color: #eef2f7 !important;
  --el-alert-border-color: #d5dfec !important;
  --el-alert-title-color: #1f3f6f !important;
  --el-alert-description-color: #1f3f6f !important;
  --el-alert-icon-color: #73a7e9 !important;
  background-color: var(--el-alert-bg-color) !important;
  border-color: var(--el-alert-border-color) !important;
}

.tip-alert :deep(.el-alert__title),
.tip-alert :deep(.el-alert__description),
.tip-alert :deep(.el-alert__content) {
  color: #1f3f6f !important;
  opacity: 1 !important;
  font-weight: 600;
}

.tip-alert :deep(.el-alert__icon) {
  color: #73a7e9 !important;
}

.rule-form {
  max-width: 680px;
}

.rule-form :deep(.el-textarea .el-input__count) {
  color: #b9cdee !important;
  background: transparent !important;
}

.rule-form :deep(.el-input__count-inner) {
  color: #b9cdee !important;
  background: transparent !important;
}
</style>
