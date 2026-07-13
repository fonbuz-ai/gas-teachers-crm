# ClassCare 班級關懷工作台 — Phase C1 匯入中心手動與驗收指南

本文件為 **Phase C1: 班級與學生名冊匯入 MVP** 的人工驗收測試流程與測試資料準備指南。

> [!NOTE]
> **文件狀態**：`DOCUMENTED` (已編寫驗收指南)
> **功能狀態**：`IMPLEMENTED` (代碼與測試已實作，經本地 Node 語法查核 0 錯誤，尚未在 Google Apps Script 真實環境跑過執行驗收)

---

## 1. 驗收環境準備

1. 準備一個空白 Google 試算表。
2. 複製 `dist/ClassCareInstaller.gs` 的內容貼入該試算表的「擴充功能 → Apps Script → Code.gs」中。
3. 儲存並重新整理試算表，頂端選單右側將出現 **「ClassCare 系統」**。

---

## 2. 逐步驗收流程 (Acceptance Step-by-Step)

### 2.1 系統初始化與第一個管理員
- [ ] **Step 1: 啟動精靈**
  * 點擊 `ClassCare 系統` > `① 啟動設定精靈`。
  * 逐步填入基本資訊，勾選「自動建立資料夾」與「建立資料表分頁」，暫不勾選示範資料。
  * 確認精靈能順利完成 6 個步驟，且試算表中出現 16 個核心分頁。
- [ ] **Step 2: 檢查第一個管理員**
  * 打開工作表 `users` 與 `user_scopes`，確認目前操作者的 Google Email 被登記為 `ADMIN`，且在 `user_scopes` 有一筆對應的 `ALL_CLASSES` 範疇（active 為 `TRUE`）。

### 2.2 匯入範本與資料預檢 (Dry-Run)
- [ ] **Step 3: 建立匯入範本**
  * 點擊 `ClassCare 系統` > `匯入資料` > `建立學生名冊匯入範本`。
  * 確認系統自動建立/清空工作表 `import_students`，並寫入 8 個標準標頭欄位。
- [ ] **Step 4: 填入測試資料並預檢**
  * 在 `import_students` 中填入下方提供的 **5 筆虛構測試資料**。
  * 點選 `ClassCare 系統` > `匯入資料` > `預檢學生名冊`。
  * 確認對話框正確讀取名冊，顯示 `預估成功：5 筆`，且正式寫入按鈕轉為可點選狀態。
  * **關鍵確認**：此時打開正式工作表 `students`、`classes`，確認依然為空（預檢不寫入資料）。

### 2.3 正式匯入與權限鏈驗證 (Commit & Access Verification)
- [ ] **Step 5: 正式寫入資料**
  * 在對話框中點選 `2. 確認正式寫入資料`。
  * 完成後對話框顯示 `正式寫入：共完成 5 筆學生資料之新增或更新作業。`。
- [ ] **Step 6: 驗證班級與學生建立**
  * 打開工作表 `classes`，確認建立了「春風班」與「秋水班」兩班，並生成 `class_id` UUID。
  * 打開工作表 `students`，確認建立了 5 位學生的紀錄，且 `student_id` 均為隨機 UUID，而非學號。
  * 打開工作表 `import_student_mapping`，確認學號 `VIRTUAL001` - `VIRTUAL005` 分別與隨機產生的 `student_id` UUID 完成映射對照。
- [ ] **Step 7: 驗證導師 Scopes 建立**
  * 打開工作表 `users`，確認為 `teacher_c1_a@example.com` 與 `teacher_c1_b@example.com` 建立了 `CLASS_TEACHER` 使用者。
  * 打開工作表 `user_scopes`，確認已建立兩筆 `scope_type` 為 `CLASS` 的授權，其 `scope_value` 分別是「春風班」與「秋水班」的 `class_id` UUID (不可為班級名稱)。
- [ ] **Step 8: 操作者權限提示 (Operator Security Warning)**
  * 若操作者本身的 Email 不是 `teacher_c1_a@example.com` 或 `teacher_c1_b@example.com`，且該操作者在 `user_scopes` 的 `ALL_CLASSES` 範圍已被手動關閉：
  * 確認匯入成功對話框中會顯示明確的黃色/紅色警告：`⚠️ 注意：目前您的登入帳號 ... 尚未被授權存取此批匯入的班級。請聯絡管理員設定範疇...`。

### 2.4 重複性與阻斷保護測試 (Validation & Error Protection)
- [ ] **Step 9: 同班座號重複阻斷**
  * 在 `import_students` 中刻意將兩位學生的座號改為相同（例如同為春風班 1 號），執行預檢。
  * 確認預檢對話框攔截到 `ERROR`，錯誤原因顯示 `同班座號重複`，且正式寫入按鈕被強制停用。
- [ ] **Step 10: 同學年度學號重複阻斷**
  * 在 `import_students` 中將兩位不同班級的學生學號設為相同（例如均為 `VIRTUAL001`），執行預檢。
  * 確認預檢對話框攔截到 `ERROR`，錯誤原因顯示 `student_number 重複`，無法進行正式寫入。
- [ ] **Step 1: 既有學生更新並保留 UUID**
  * 在 `import_students` 中將 `VIRTUAL001` 的姓名修改為「趙虛擬（更名）」，座號改為 `10`。
  * 重新執行預檢與正式寫入。
  * 打開工作表 `students`，確認趙虛擬的姓名與座號已更新，**但其 `student_id` UUID 維持原值，不產生重複學生列**。

---

## 3. 完全虛構測試資料名冊 (5 Rows Mock Data)

請將以下資料貼入 `import_students` 工作表中進行 Phase C1 驗收：

| school_year | class_name | grade | seat_no | student_name | student_number | status | teacher_email |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 114 | 春風班 | 5 | 1 | 趙虛擬 | VIRTUAL001 | ACTIVE | teacher_c1_a@example.com |
| 114 | 春風班 | 5 | 2 | 錢幻想 | VIRTUAL002 | ACTIVE | teacher_c1_a@example.com |
| 114 | 秋水班 | 5 | 1 | 孫空中 | VIRTUAL003 | ACTIVE | teacher_c1_b@example.com |
| 114 | 秋水班 | 5 | 2 | 李霧裡 | VIRTUAL004 | ACTIVE | teacher_c1_b@example.com |
| 114 | 秋水班 | 5 | 3 | 周鏡中 | VIRTUAL005 | ACTIVE | teacher_c1_b@example.com |

---

## 4. 尚未進行之實機測試項目 (待手動驗證)

以下自動化測試已在本地完成 Node.js 語法合規查核，但在 Google Apps Script 線上環境中，仍需實機執行：

1. **`runInstallerTests()` 自動化測試**：確認 18 項內部整合測試（含新增的 `testOpenSystemStatus()`）在 Google Apps Script 執行環境中全數回傳 `PASSED`。
2. **`LockService` 鎖定性能驗證**：高併發或快速雙擊寫入時，確認鎖定機制能正確佇列執行，不產生寫入衝突。
3. **雲端硬碟權限彈出**：確認首次啟動設定精靈或匯入時，Google 的 OAuth 授權視窗能正確彈出並被使用者核准。
