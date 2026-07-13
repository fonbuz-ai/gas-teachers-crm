# ClassCare 班級關懷工作台 — 部署與設定指南

本文件說明如何建立試算表、設定指令碼屬性、以及安全部署本 Web App。

> [!NOTE]
> **當前狀態**：
> *   部署規劃：`DOCUMENTED` (已編寫文件)
> *   專案結構檔案：`SKELETON_CREATED` (已建立骨架，單檔安裝程式已實作，未進行實際雲端發布或部署)

---

## 1. 準備 Google 試算表
1.  建立一個新的 Google 試算表。
2.  複製該試算表的網址，並截取其中的 ID。
    *   例如網址為 `https://docs.google.com/spreadsheets/d/1A2B3C.../edit`，則試算表 ID 為 `1A2B3C...`。
3.  此時工作表可以保持空白，稍後將由系統初始化功能自動建立結構。

---

## 2. 建立 Google 雲端硬碟資料夾
1.  建立一個限定存取的 Google Drive 資料夾，用於儲存健康診斷書或補助資格證明。
2.  複製該資料夾的 ID。

---

## 3. 設定 Google Apps Script 專案與環境變數安全
> [!WARNING]
> **資訊安全原則**：`appsscript.json` 僅能包含時區、例外記錄模式與執行架構等元數據設定。**絕對禁止將 Spreadsheet ID、Folder ID、管理者 Email 或其他環境變數直接硬編碼於 `appsscript.json` 或程式碼中**。

必須在 Apps Script 專案設定中以「指令碼屬性 (Script Properties)」儲存上述配置：
1.  進入 Apps Script 專案設定（左側齒輪圖示）。
2.  於最下方「指令碼屬性」區塊新增以下屬性：
    *   `SPREADSHEET_ID` = `(你的試算表 ID)`
    *   `DRIVE_FOLDER_ID` = `(你的雲端硬碟資料夾 ID)`
    *   `INITIALIZATION_STATUS` = `FALSE`

---

## 4. 系統初始化與設定第一位管理員 (狀態：骨架已建立)
1.  在編輯器中開啟 `SetupService.gs`，執行全域進入方法 `SetupService.setupSystem()`。
    *   這將自動在你的試算表建立必要的工作表欄位（`users`, `user_scopes`, `classes`, `students` 等）。
2.  開啟試算表中的 `users` 工作表，手動填入第一位管理員：
    *   `user_id`：手動生成一個 UUID (如 `6ba7b810-9dad-11d1-80b4-00c04fd430c8`)。
    *   `email`：你的管理員 Google 帳號（例 `admin@your-school.edu.tw`）。
    *   `name`：系統管理員。
    *   `role`：`ADMIN`。
    *   `active`：`TRUE`。
    *   `created_at` & `updated_at`：目前日期時間。
3.  於 `user_scopes` 工作表中建立該管理員的權限範疇：
    *   `scope_id`：UUID。
    *   `user_email`：`admin@your-school.edu.tw`。
    *   `scope_type`：`ALL_CLASSES`。
    *   `scope_value`：`*`。

---

## 5. 部署為網頁應用程式 (Web App)
1.  在 Apps Script 編輯器右上角點擊「部署」 > 「新增部署」。
2.  選取類型為「網頁應用程式」。
3.  設定：
    *   **說明**：ClassCare V1 部署。
    *   **執行身分**：以「我 (Me)」執行（方便以開發者權限存取試算表，但後端會檢查實際存取者 Email）。
    *   **誰有權限存取**：**必須設為「您的機構內成員」**。若為個人帳號，可設為「只有我」或特定共用帳號。**絕對不得設為「任何人 (Anyone)」**。
4.  點擊部署並授權相關權限。
5.  複製產生的「網頁應用程式網址」即可提供給校內同仁使用。

---

## 6. 單檔安裝版快速部署流程 (Single-File Quick Deployment)
對於不需要進行程式修改的教師，可參照 [`dist/README_INSTALLER.md`](../dist/README_INSTALLER.md) 快速部署：
1.  建立空白試算表。
2.  開啟 Apps Script 編輯器，清空 `Code.gs`。
3.  將 [`dist/ClassCareInstaller.gs`](../dist/ClassCareInstaller.gs) 的程式碼全部複製貼入。
4.  儲存並重新整理試算表頁面。
5.  使用頂端產生的「ClassCare 系統」選單點選 `① 啟動設定精靈` 即可完成建置。
