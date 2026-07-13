# ClassCare 班級關懷工作台 — 測試指南

本文件說明如何驗證系統的權限控管、資料隔離與隱私機制。

> [!NOTE]
> **當前狀態**：
> *   測試規劃：`DOCUMENTED` (已編寫文件)
> *   測試程式碼：`IMPLEMENTED` (已編寫測試執行指令，尚未在 Apps Script 實際環境中跑過驗證)

---

## 1. 測試環境準備
*   測試均在 Google Apps Script 環境中藉由專屬測試方法執行。
*   測試過程中使用 `SetupService.seedDemoData()` 所產生的虛構測試資料。
*   **注意**：測試時嚴禁使用任何真實學校或學生資料。

---

## 2. 核心測試情境

### 2.1 身份與權限存取測試
1.  **未登入存取驗證**：傳入空白或無效的 Email，後端必須回傳錯誤，禁止讀取任何資料。驗證之根永遠為 `Session.getActiveUser().getEmail()`。
2.  **停用使用者驗證**：在 `users` 工作表中將某位使用者的 `active` 設為 `FALSE`，該使用者重新載入網頁時必須被阻擋在系統外。
3.  **假角色提權防範**：在前端傳入修改過的角色名稱（如試圖宣稱自己是 `ADMIN`），後端必須完全忽略，一律以 `users` 工作表內登記之角色為準。

### 2.2 範疇與班級邊界隔離測試 (基於 `user_scopes` 表)
1.  **導師跨班存取防範**：使用五年三班導師的 Email，呼叫後端讀取五年四班學生的 `student_id`。確認後端透過對比其在 `user_scopes` 的範圍紀錄攔截並擲回 `PERMISSION_DENIED` 錯誤。
2.  **變更 ID 漏洞防範**：驗證在前端變更傳回參數之 `student_id` 時，後端是否會主動進行「學生-班級-導師授權範圍」三方關聯校對。

### 2.3 敏感資訊防護與時效測試
1.  **健康文件權限分設**：使用導師或唯讀帳號存取 `health_alerts` 檔案時，確認回傳結構中 `restricted_document_url` 欄位值已被設定為 `null`，而 `HEALTH_CENTER` 與 `ADMIN` 則能正確讀取連結。
2.  **補助紀錄文件防護**：確認非 `SUBSIDY_OFFICER` 與 `ADMIN` 的帳號存取補助紀錄時，會被拒絕或無法取得限制存取之文件 URL。
3.  **資料時效性驗證**：若目前時間超出敏感記錄的 `effective_to`（效期截止日），確認查詢結果會將該警示或紀錄過濾、排除或標記為失效，避免過期敏感資訊持續曝光。

### 2.4 輸入驗證與安全防護測試
1.  **輸入長度測試**：送出過長字串時，確認後端會觸發截斷或拋出格式異常錯誤。
2.  **無效日期測試**：傳入 `9999-99-99` 等非正常日期時，確認 `ValidationService` 能正確攔截。
3.  **XSS 測試**：傳入包含 `<script>` 或 HTML 語法標籤的聯絡紀錄內容，確認前端渲染時會被當作純文字輸出或進行轉義。

---

## 3. 執行測試
1.  在 Apps Script 專案中開啟 `TestRunner.gs`。
2.  執行 `TestRunner.runAllTests()` 函式。
3.  檢視 Apps Script 的執行記錄，確認所有 Test Cases 皆為 `PASSED`。

---

## 4. 單檔安裝器自動化測試 (Single-File Installer Testing)
在單檔安裝版專案中，我們整合了輕量級測試套件以供快速驗證：
1.  開啟 Apps Script 編輯器，在檔案列表選取貼入了程式碼的 `Code.gs`。
2.  於編輯器頂端執行方法下拉選單中選取 **`runInstallerTests`**。
3.  點擊「執行」。
4.  下方「執行記錄」將會輸出 JSON 格式的測試報告，包含 12 個關鍵工作表、對齊、重複寫入阻擋等測試案例通過狀態。

---

## 5. 學生名冊匯入模組測試情境 (Phase C1 Import Integration Tests)
本系統於 `TestRunner.gs` 中實作了 8 個關鍵的匯入整合測試項目，以確保在沙盒環境與未來正式環境中的匯入安全性：
1.  **`testImportStudentRosterPreview` (預檢分析)**：測試寫入模擬資料到 `import_students` 暫存表後，`ImportService.validateStudentRoster()` 能正確分析統計 `totalRows` 與 `validRows` 筆數，且不會寫入正式資料表。
2.  **`testImportStudentRosterCommit` (正式寫入)**：測試執行正式匯入時，能透過 `importStudentRoster()` 成功在 `students` 寫入新學生紀錄，並在關聯對照表建立 Mappings。
3.  **`testImportDuplicateSeatNumber` (同班座號重複阻斷)**：驗證當匯入暫存表中在同一個班級內出現重複的座號時，預檢機制能正確攔截該 ERROR 並標記其錯誤原因。
4.  **`testImportDuplicateStudentNumber` (學號重複阻斷)**：驗證當同一個學年度內出現重複的學號時，預檢機制能正確攔截並防止其寫入。
5.  **`testImportExistingStudentKeepsId` (既有學生更新保留 ID)**：驗證當學生的學號或班級座號已存在於系統中，正式寫入時只更新其基本資料（如姓名、狀態），且必定保留其原先的系統唯一 `student_id` (UUID)。
6.  **`testImportCreatesTeacherScope` (自動導師與 Scope 建立)**：驗證當匯入資料指派了 `teacher_email` 時，系統是否能自動建立/啟用對應的使用者並產生 `CLASS` 授權範圍。
7.  **`testImportedTeacherCanReadClass` (權限鏈整合驗證)**：驗證新建立的導師 Email 是否能正常且立即透過 `ClassService` 與 `PermissionService` 權限鏈讀取其被指派的班級。
8.  **`testUnauthorizedUserCannotReadImportedClass` (非授權存取拒絕)**：驗證未被指派或無 `ALL_CLASSES` 權限的非授權信箱，在試圖存取該匯入班級時，會被安全機制阻斷。
