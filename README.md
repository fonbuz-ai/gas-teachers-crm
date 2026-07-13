# ClassCare 班級關懷工作台 (GAS Teachers CRM)

這是一個基於 Google Apps Script 的 Web App 系統，專為國小導師及相關處室人員設計，用於追蹤學生的家庭關懷、健康提醒、補助申請及親師聯絡事項。

> [!IMPORTANT]
> **開發狀態說明**：
> *   系統核心架構與規範文件：**已編寫文件 (DOCUMENTED)**。
> *   後端服務與前端頁面骨架：**骨架已建立 (SKELETON_CREATED)**。
> *   安裝器與選單初始化邏輯：**已實作 (IMPLEMENTED)** (尚未在 Apps Script 真實線上環境中驗證)。

> [!WARNING]
> 本專案只應版本控制程式碼、規格與完全虛構的測試資料。請勿提交真實學生／家庭資料、`.clasp.json`、憑證、Spreadsheet ID、Folder ID 或部署網址。首次上傳建議先建立 **Private repository**，完成權限與安全測試後再評估是否公開。

---

## 1. 系統目的
本系統提供導師快速掌握班級學生的家庭聯絡、健康行動提醒、過去補助申請狀態、親師聯絡及後續追蹤事項，並兼顧敏感資訊的安全隔離與存取留痕。

---

## 2. 部署版本說明
為了簡化教師與非技術人員的建置流程，本專案提供兩種版本：
1.  **單檔安裝版 (dist/ClassCareInstaller.gs)**：適合一般使用者部署。只需新建試算表並將該檔案貼入 Apps Script 編輯器，即可透過試算表「ClassCare 系統」自訂選單與 HTML 設定精靈完成全系統初始化、管理員設定及示範資料匯入。
2.  **完整多檔專案版 (根目錄)**：適合開發團隊維護、使用 clasp 工具同步與進行版本控制。這是主要的源碼維護來源。單檔安裝版源碼由多檔專案合併組裝而成，可直接在專案根目錄下執行 `python3 build.py` 重新編譯產生 `dist/ClassCareInstaller.gs`，嚴禁進行雙向獨立修改。

---

## 3. 技術架構
*   **儲存層**：Google Sheets (試算表)、Google Drive (加密附件)。
*   **後端服務**：Google Apps Script (GAS)。
    *   **命名空間物件設計**：除全域進入點 (`doGet`, `doPost`) 外，後端邏輯必須封裝於對應的命名空間物件中（如 `const AuthService = { ... }`），防止全域衝突。
    *   **唯一身份根源**：系統認證永遠以 Google 提供之 **`Session.getActiveUser().getEmail()`** 為準，禁止採用前端傳入的 Email 或角色參數做為授權基礎。
*   **前端頁面**：原生 HTML、CSS、JavaScript 單頁式 Web App（不使用第三方框架，狀態為 `SKELETON_CREATED`）。
*   **安全邊界**：所有 API 請求由後端 `PermissionService` 進行身分與 `user_scopes` 權限比對，防止前端參數篡改。

---

## 4. 專案結構與狀態 (Project Structure & Status)

所有檔案之完整相對路徑與狀態標示如下：

### 核心規範與設計文件
*   `AGENTS.md` (已編寫文件 - DOCUMENTED) - AI 代理人開發規範
*   `AGY_PHASE0.md` (已編寫文件 - DOCUMENTED) - 專案 Phase 0 規格書
*   `README.md` (已編寫文件 - DOCUMENTED) - 專案說明文件
*   `docs/architecture.md` (已編寫文件 - DOCUMENTED) - 系統架構設計
*   `docs/data-model.md` (已編寫文件 - DOCUMENTED) - 資料庫模型設計
*   `docs/permission-matrix.md` (已編寫文件 - DOCUMENTED) - 權限矩陣設計
*   `docs/privacy-design.md` (已編寫文件 - DOCUMENTED) - 隱私設計與資料防護
*   `docs/deployment-guide.md` (已編寫文件 - DOCUMENTED) - 部署與設定指南
*   `docs/testing-guide.md` (已編寫文件 - DOCUMENTED) - 測試與驗證指南
*   `docs/transition-rules.md` (已編寫文件 - DOCUMENTED) - 系統轉銜與開發規則

### 安裝器分發版 (Convenience Distribution)
*   `dist/ClassCareInstaller.gs` (已實作 - IMPLEMENTED) - 單檔安裝器源碼
*   `dist/README_INSTALLER.md` (已編寫文件 - DOCUMENTED) - 單檔安裝器操作手冊

### 後端服務骨架 (狀態：部分實作中 - IMPLEMENTED / SKELETON_CREATED)
*   `appsscript.json` (已實作 - IMPLEMENTED) - Apps Script 設定檔
*   `Config.gs` (已實作 - IMPLEMENTED) - 系統全域變數設定與屬性存取
*   `SetupService.gs` (已實作 - IMPLEMENTED) - 工作表初始化與結構驗證
*   `Code.gs` (已實作 - IMPLEMENTED) - Web App 進入點 (doGet/doPost) 與選單進入點
*   `AuthService.gs` (已實作 - IMPLEMENTED) - 使用者身份與 Session 管理
*   `PermissionService.gs` (已實作 - IMPLEMENTED) - 角色與資料庫存取權限檢查
*   `DataRepository.gs` (已實作 - IMPLEMENTED) - 統一的試算表存取介面，具備安全寫入防護
*   `UserService.gs` (已實作 - IMPLEMENTED) - 使用者帳號服務
*   `ClassService.gs` (已實作 - IMPLEMENTED) - 班級資訊服務
*   `StudentService.gs` (已實作 - IMPLEMENTED) - 學生基本資料服務
*   `GuardianService.gs` (已實作 - IMPLEMENTED) - 監護人與照顧者服務
*   `SupportProfileService.gs` (已實作 - IMPLEMENTED) - 學生支持摘要服務
*   `HealthService.gs` (已實作 - IMPLEMENTED) - 健康提醒服務
*   `SubsidyService.gs` (已實作 - IMPLEMENTED) - 補助追蹤服務
*   `ContactLogService.gs` (已實作 - IMPLEMENTED) - 親師聯絡紀錄服務
*   `FollowUpService.gs` (已實作 - IMPLEMENTED) - 待辦與追蹤服務
*   `AuditLogService.gs` (已實作 - IMPLEMENTED) - 安全稽核日誌服務
*   `ValidationService.gs` (已實作 - IMPLEMENTED) - 輸入資料與日期格式驗證服務
*   `ResponseService.gs` (已實作 - IMPLEMENTED) - 統一 API 回傳格式封裝服務
*   `ImportService.gs` (已實作 - IMPLEMENTED) - 安全班級與學生名冊匯入服務 MVP
*   `TestRunner.gs` (已實作 - IMPLEMENTED) - 自動化測試腳本與匯入測試
*   `PrecheckDialog.html` (已實作 - IMPLEMENTED) - 名冊匯入預檢與正式確認互動對話框

### 前端頁面與組件骨架 (狀態：骨架已建立 - SKELETON_CREATED)
*   `Index.html` - 主要頁面載體
*   `Styles.html` - 淺色溫暖風樣式表
*   `Scripts.html` - 前端主要 API 調用與 DOM 控制
*   `Components.html` - 共用 UI 組件範本
*   `DashboardView.html` - 儀表板視圖
*   `StudentListView.html` - 學生名冊清單視圖
*   `StudentDetailView.html` - 學生詳細頁主視圖
*   `GuardianView.html` - 監護人與聯絡人分頁視圖
*   `SupportProfileView.html` - 學生支持摘要分頁視圖
*   `HealthView.html` - 健康提醒分頁視圖
*   `SubsidyView.html` - 補助申請分頁視圖
*   `ContactLogView.html` - 親師聯絡分頁視圖
*   `FollowUpView.html` - 待辦與追蹤分頁視圖
*   `AdminView.html` - 管理者後台視圖
*   `ErrorView.html` - 錯誤與未授權提示視圖

---

## 5. 本機建置與提交前檢查

專案不需要安裝第三方 Python 套件。修改多檔原始碼後，重新產生單檔安裝版：

```bash
python3 build.py
```

確認產物已同步且沒有未預期差異：

```bash
python3 build.py
git diff --exit-code -- dist/ClassCareInstaller.gs
```

完整權限與隱私測試必須在 Google Apps Script 測試環境使用虛構資料執行，請參考 [`docs/testing-guide.md`](docs/testing-guide.md)。本機建置或語法檢查通過，不代表功能已在 GAS 實機 `TESTED` 或已 `DEPLOYED`。

---

## 6. GitHub 上傳前安全檢查

- `.gitignore` 已排除本機 clasp 設定、憑證、環境檔、log 與暫存產物；`appsscript.json` 與 `dist/ClassCareInstaller.gs` 則應保留在版本控制中。
- `.github/workflows/verify.yml` 會在 Push 與 Pull Request 自動檢查 Python 工具、Apps Script 語法、manifest JSON 與單檔產物同步狀態。
- 上傳前再次確認 `git status` 與 `git diff --cached`，避免把工作目錄中的正式資料或截圖納入提交。
- Issue、Pull Request 與測試紀錄只能使用完全虛構資料。
- 安全問題請依 [`SECURITY.md`](SECURITY.md) 私密回報；貢獻流程請見 [`CONTRIBUTING.md`](CONTRIBUTING.md)。
- Web App 部署範圍必須限制為機構內成員、指定使用者或僅自己，禁止公開存取。

---

## 7. 授權

本專案採用 [MIT License](LICENSE)，Copyright (c) 2026 mihozip。
