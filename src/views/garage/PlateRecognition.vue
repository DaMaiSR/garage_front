<template>
  <div class="common-layout">
    <el-container>
      <el-header>
        <div class="page-shell">
          <div class="page-hero">
            <div class="page-hero-title">
              <h2>车牌识别自动入出库</h2>
              <p>上传本地图片后，系统将通过 YOLO+LPRNet 识别车牌并自动执行入库/出库流程。</p>
            </div>
          </div>
        </div>
      </el-header>
      <el-divider style="margin: 0" />
      <el-main>
        <div class="page-shell">
          <div class="content-card">
            <div class="panel-head">
              <h3 class="panel-title">识别参数</h3>
              <span class="panel-hint">仅管理员可执行该操作</span>
            </div>
            <el-form :model="form" label-width="92px" class="recognition-form">
              <el-row :gutter="12">
                <el-col :xs="24" :sm="12" :md="8">
                  <el-form-item label="识别动作">
                    <el-select v-model="form.action" style="width: 100%">
                      <el-option label="入库识别" value="IN" />
                      <el-option label="出库识别" value="OUT" />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :xs="24" :sm="12" :md="8">
                  <el-form-item label="摄像头编号">
                    <el-input v-model="form.cameraCode" placeholder="如：GATE-IN-01" clearable />
                  </el-form-item>
                </el-col>
                <el-col v-if="form.action === 'IN'" :xs="24" :sm="12" :md="8">
                  <el-form-item label="优先车位">
                    <el-input v-model="form.spaceNo" placeholder="可选，如 A-001" clearable />
                  </el-form-item>
                </el-col>
              </el-row>
            </el-form>

            <el-upload
              class="upload-zone"
              drag
              accept="image/*"
              :auto-upload="false"
              :limit="1"
              :file-list="fileList"
              :on-change="handleFileChange"
              :on-remove="handleFileRemove"
              :on-exceed="handleFileExceed"
            >
              <el-icon class="upload-icon"><UploadFilled /></el-icon>
              <div class="el-upload__text">
                将车牌图片拖拽到此处，或 <em>点击上传</em>
              </div>
              <template #tip>
                <div class="el-upload__tip">支持 JPG / PNG / WEBP，建议图片中车牌区域清晰。</div>
              </template>
            </el-upload>

            <div class="action-row">
              <el-button type="primary" class="toolbar-strong" :loading="submitting" @click="submitRecognition">
                识别并自动执行
              </el-button>
              <el-button class="toolbar-subtle" @click="resetForm">重置</el-button>
            </div>
          </div>

          <div v-if="result" class="content-card">
            <div class="panel-head">
              <h3 class="panel-title">执行结果</h3>
              <span class="panel-hint">{{ result.message || "处理完成" }}</span>
            </div>
            <el-alert
              :title="result.flag ? '流程执行成功' : '流程执行失败'"
              :type="result.flag ? 'success' : 'error'"
              show-icon
              :closable="false"
            />
            <el-descriptions :column="2" border class="result-desc">
              <el-descriptions-item label="识别车牌">{{ modelPlateNo }}</el-descriptions-item>
              <el-descriptions-item label="识别来源">{{ modelProvider }}</el-descriptions-item>
              <el-descriptions-item label="置信度">{{ modelConfidence }}</el-descriptions-item>
              <el-descriptions-item label="识别动作">{{ actionLabel }}</el-descriptions-item>
              <el-descriptions-item label="分析结果">{{ analysisMessage }}</el-descriptions-item>
              <el-descriptions-item label="执行结果">{{ operationMessage }}</el-descriptions-item>
            </el-descriptions>
          </div>
        </div>
      </el-main>
    </el-container>
  </div>
</template>

<script>
import { recognizeAndTransit } from "@/api/plateRecognitionApi.js";

export default {
  name: "PlateRecognitionView",
  data() {
    return {
      submitting: false,
      selectedFile: null,
      fileList: [],
      form: {
        action: "IN",
        cameraCode: "UPLOAD-CAM-01",
        spaceNo: ""
      },
      result: null
    };
  },
  computed: {
    modelPlateNo() {
      return this.result?.data?.model?.plateNo || "--";
    },
    modelProvider() {
      return this.result?.data?.model?.provider || "--";
    },
    modelConfidence() {
      const confidence = this.result?.data?.model?.confidence;
      if (confidence === "" || confidence == null) {
        return "--";
      }
      const value = Number(confidence);
      return Number.isFinite(value) ? value.toFixed(3) : String(confidence);
    },
    actionLabel() {
      return this.form.action === "OUT" ? "出库识别" : "入库识别";
    },
    analysisMessage() {
      return this.result?.data?.analysis?.message || "--";
    },
    operationMessage() {
      return this.result?.data?.operation?.message || "--";
    }
  },
  methods: {
    handleFileChange(file, fileList) {
      this.fileList = fileList.slice(-1);
      this.selectedFile = (file && file.raw) || null;
    },
    handleFileRemove() {
      this.fileList = [];
      this.selectedFile = null;
    },
    handleFileExceed() {
      this.$message.warning("一次仅支持上传1张图片");
    },
    resetForm() {
      this.form.action = "IN";
      this.form.cameraCode = "UPLOAD-CAM-01";
      this.form.spaceNo = "";
      this.fileList = [];
      this.selectedFile = null;
      this.result = null;
    },
    async submitRecognition() {
      if (this.submitting) {
        return;
      }
      if (!this.selectedFile) {
        this.$message.warning("请先上传车牌图片");
        return;
      }

      const formData = new FormData();
      formData.append("imageFile", this.selectedFile);
      formData.append("action", this.form.action);
      formData.append("cameraCode", (this.form.cameraCode || "").trim());
      if (this.form.action === "IN" && (this.form.spaceNo || "").trim() !== "") {
        formData.append("spaceNo", this.form.spaceNo.trim());
      }

      this.submitting = true;
      try {
        const res = await recognizeAndTransit(formData);
        this.result = {
          flag: !!(res && res.flag),
          message: (res && res.message) || "",
          data: (res && res.data) || {}
        };
        if (res && res.flag) {
          this.$message.success(res.message || "识别成功");
        } else {
          this.$message.error((res && res.message) || "识别失败");
        }
      } catch (error) {
        this.result = {
          flag: false,
          message: error.userMessage || "识别请求失败",
          data: {}
        };
        this.$message.error(error.userMessage || "识别请求失败");
      } finally {
        this.submitting = false;
      }
    }
  }
};
</script>

<style scoped>
.recognition-form {
  margin-bottom: 6px;
}

.upload-zone {
  margin-top: 10px;
}

.upload-icon {
  font-size: 26px;
  color: #8ac3ff;
}

.upload-zone :deep(.el-upload-dragger) {
  background: #f7f9ff;
  border: 1px dashed rgba(84, 133, 226, 0.62);
  border-radius: 10px;
}

.upload-zone :deep(.el-upload__text) {
  color: #2c3f67;
  font-weight: 600;
}

.upload-zone :deep(.el-upload__text em) {
  color: #2c82f5;
  font-weight: 700;
}

.upload-zone :deep(.el-upload__tip) {
  color: #6078a8;
  font-weight: 500;
}

.action-row {
  margin-top: 14px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.result-desc {
  margin-top: 12px;
}

.result-desc :deep(.el-descriptions__label) {
  color: #dbe7ff !important;
  font-weight: 700;
}

.result-desc :deep(.el-descriptions__content) {
  background: #f7f9ff !important;
  color: #22365c !important;
  font-weight: 600;
  letter-spacing: 0.1px;
}

.result-desc :deep(.el-descriptions__cell) {
  border-color: rgba(101, 142, 217, 0.38) !important;
}
</style>
