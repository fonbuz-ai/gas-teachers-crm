# ClassCare 班級關懷工作台 — 系統轉銜與開發規則

為確保後續開發或交接時系統不產生安全漏洞，所有開發人員必須遵守以下轉銜規範。

> [!NOTE]
> **當前狀態**：
> *   轉銜規則：`DOCUMENTED` (已編寫文件)
> *   專案實作檔案：`SKELETON_CREATED` (已建立骨架，尚未開始撰寫業務邏輯)

---

## 1. 欄位與結構相容性 (Schema Compatibility)
*   **禁止隨意修改現有欄位名**：如需新增欄位，必須追加在工作表欄位的最後方，不得將現有欄位改名或刪除，避免舊有 API 解析失敗。
*   **資料表遷移 (Migration)**：如因重大架構變更需要調整工作表欄位結構，必須：
    1.  編寫 `MigrationService.gs`，包含資料備份、新舊欄位對齊、格式轉換等函式。
    2.  在系統發布日誌（Changelog）中說明變更原因與手動遷移步驟。
    3.  確保新版本程式碼仍具備舊版結構的向下相容讀取邏輯。
*   **授權範圍表維護**：`user_scopes` 的欄位（`scope_type`, `scope_value`）為整個授權驗證核心，進行重構時，必須確保 `ALL_CLASSES` / `GRADE` / `CLASS` / `STUDENT` 這四種規格的向下相容性。

---

## 2. 命名空間物件設計與重構規範
*   **命名空間物件強制規範**：為避免在 Google Apps Script 中宣告大量全域變數導致名稱衝突，所有服務檔案必須使用 Namespace Object Pattern 設計：
    *   例如：`const AuthService = { ... }` 或是 `const DataRepository = { ... }`。
    *   全域禁止新增非封裝的自由函式（Free Functions），除了全域系統進入點或特定手動測試按鈕。
*   **DataRepository.gs 唯一性**：不論任何原因，禁止在各處室模組（如 `HealthService.gs`）中繞過 `DataRepository.gs` 而直接呼叫 `SpreadsheetApp.openById()`。所有資料庫交互必須收斂於 repository 層中。
*   **LockService 強制鎖定**：修改寫入功能時，必須確認在 `DataRepository.gs` 的寫入作業外層包裹 `LockService`，且合理的超時等待時間為 10-30 秒。
*   **統一回傳格式**：重構 API 時，後端暴露給前端調用的方法必須一律使用 `ResponseService.gs` 封裝，格式必須是：
    ```json
    {
      "success": true/false,
      "data": null/Object/Array,
      "message": "說明文字",
      "errorCode": "錯誤代碼"
    }
    ```

---

## 3. 專案移交與發布 (Deployment Checklists)
當移交給下一個開發階段時，必須確保：
1.  所有測試函式（`TestRunner.gs`）在全新建立的空白試算表中執行 `SetupService.setupSystem()` 後，執行結果均為 `PASSED`。
2.  `AGENTS.md` 中的安全警告（如身份驗證以 `Session.getActiveUser().getEmail()` 為唯一根）並未被削弱。
3.  Web App 的發布權限設定沒有被修改為公開。
