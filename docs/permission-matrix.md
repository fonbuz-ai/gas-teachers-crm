# ClassCare 班級關懷工作台 — 權限矩陣與驗證機制

本文件說明系統各角色的操作權限，以及後端 `PermissionService.gs` 如何強制執行這些限制。

> [!NOTE]
> **當前狀態**：
> *   設計規範：`DOCUMENTED` (已編寫文件)
> *   後端驗證邏輯：`IMPLEMENTED` (後端驗證與範圍查核已實作，尚未在 GAS 真實環境驗證)

---

## 1. 角色定義 (Roles)
*   `ADMIN` (系統管理員)：系統底層維護、權限分配、稽核日誌調閱。
*   `DIRECTOR` (主管/校長/主任)：跨班級的統計與大局瀏覽，不得檢視敏感文件細節。
*   `CLASS_TEACHER` (班級導師)：負責特定班級學生的主要關懷、家長聯絡及日常生活常態防範。
*   `HEALTH_CENTER` (健康中心)：維護學生健康警示與上傳敏感醫療細節文件。
*   `COUNSELOR` (輔導老師)：檢視學生支持摘要，撰寫輔導追蹤摘要。
*   `SUBSIDY_OFFICER` (補助承辦人員)：維護補助名單與核銷進度。
*   `READ_ONLY` (唯讀人員)：特殊指派的觀摩或外部督導，不具寫入與敏感文件存取權限。

---

## 2. 權限與範疇矩陣表 (Permission & Scope Matrix)

本系統廢除原 `users.class_ids` 的直接限制，改由獨立的工作表 `user_scopes` 進行過濾，支援以下四種授權範圍類型 (`scope_type`)：
1.  `ALL_CLASSES`：存取權限遍及全校班級。
2.  `GRADE`：限定特定年級之班級（如年級主任）。
3.  `CLASS`：限定特定班級（如導師）。
4.  `STUDENT`：限定單一特定學生（如個別個案認輔）。

| 功能模組 | ADMIN | DIRECTOR | CLASS_TEACHER | HEALTH_CENTER | COUNSELOR | SUBSIDY_OFFICER | READ_ONLY |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **系統設定** | R/W | R | 無存取 | 無存取 | 無存取 | 無存取 | 無存取 |
| **使用者管理**| R/W | 無存取 | 無存取 | 無存取 | 無存取 | 無存取 | 無存取 |
| **稽核日誌** | R | R | 無存取 | 無存取 | 無存取 | 無存取 | 無存取 |
| **學生名冊** | R/W | R | R (限 Scope)* | R | R | R | R |
| **家長資料** | R/W | R | R (限 Scope)* | 無存取 | R | 無存取 | R |
| **支持摘要** | R/W | R | R (限 Scope)* | 無存取 | R/W | 無存取 | R |
| **健康提醒摘要**| R/W | R | R (限 Scope)* | R/W | R | 無存取 | R |
| **健康限制文件**| R/W | 無存取 | 無存取 | R/W | 無存取 | 無存取 | 無存取 |
| **補助狀態摘要**| R/W | R | R (限 Scope)* | 無存取 | 無存取 | R/W | R |
| **補助資格文件**| R/W | 無存取 | 無存取 | 無存取 | 無存取 | R/W | 無存取 |
| **親師聯絡紀錄**| R/W | R | R/W (限 Scope)*| 無存取 | R/W | 無存取 | R |
| **待辦與追蹤** | R/W | R | R/W (限 Scope)*| R/W | R/W | R/W | R |

*\*註：`CLASS_TEACHER` 等有範圍限制的角色在讀取或寫入學生資料時，後端必須強制經由 `user_scopes` 進行過濾，查核學生的班級或 ID 是否落於授權之範疇內。*

---

## 3. 後端授權驗證設計 (Backend Scope Check Design)

### 3.1 驗證之根：`Session.getActiveUser().getEmail()`
在進行任何權限與範圍驗證前，`AuthService.gs` 會讀取當前 session 的使用者身份作為**唯一合法根源**：

```javascript
// 邏輯封裝於 PermissionService 命名空間物件中
const PermissionService = {

  // 檢驗使用者對特定學生的存取權限
  checkStudentAccess: function(studentId) {
    // 1. 獲取當前登入者 trusted email
    const currentUserEmail = AuthService.getActiveUserEmail();

    // 2. 獲取使用者帳號與 active 狀態
    const user = UserService.getUserByEmail(currentUserEmail);
    if (!user || !user.active) {
      throw new Error("存取遭拒：使用者帳號不存在或已遭停用。");
    }

    // 3. ADMIN 與 DIRECTOR 具備全域存取權限
    if (user.role === "ADMIN" || user.role === "DIRECTOR") {
      return true;
    }

    // 4. 其餘角色拉取 scopes 表比對範圍
    const userScopes = UserService.getUserScopes(currentUserEmail);
    const student = StudentService.getStudentById(studentId);

    return this.evaluateScopes(userScopes, student);
  },

  evaluateScopes: function(scopes, student) {
    // 遍歷使用者 scopes
    for (let i = 0; i < scopes.length; i++) {
      const scope = scopes[i];
      if (scope.scope_type === "ALL_CLASSES") {
        return true;
      }
      if (scope.scope_type === "CLASS" && scope.scope_value === student.class_id) {
        return true;
      }
      if (scope.scope_type === "GRADE" && scope.scope_value == student.grade) {
        return true;
      }
      if (scope.scope_type === "STUDENT" && scope.scope_value === student.student_id) {
        return true;
      }
    }
    throw new Error("權限錯誤：該學生不屬於您的授權存取範疇。");
  }
};
```

### 3.2 敏感附件 URL 防護
健康與補助模組中的 `restricted_document_url` 僅儲存 Google Drive 的私有連結。
*   後端傳遞給前端時，若使用者不具備角色要求的 `restricted` 存取資格（如導師存取健康文件），該欄位值在後端服務層會被強制清空（設為 `null`），不傳遞至前端。
*   即便前端硬編碼存取 URL，亦會受限於 Google Drive 本身的權限控管。

---

## 4. 匯入作業之授權與 Scopes 建立規範 (Import Authorization & Scopes Provisioning)
在執行批次學生名冊匯入時，權限模組會自動執行以下程序，以確保匯入後之資料鏈及授權鏈完整閉合：
1.  **Email 正規化**：寫入 `users` 與 `user_scopes` 前，系統會將所有 Email 執行 `trim().toLowerCase()`，防止任何大小寫造成的驗證漏洞。
2.  **CLASS Scope 綁定**：匯入程式自動建立的 `user_scopes` 其 `scope_type` 均強制為大寫 `CLASS`，且 `scope_value` 必須為系統生成的 `class_id` UUID，**嚴禁綁定班級名稱字串**，以免造成權限判定漏洞。
3.  **啟用狀態與效期**：自動生成的導師 Scopes 的 `active` 旗標設為 `"TRUE"`，其起迄效期 `effective_from` 與 `effective_to` 設為空字串，代表「立即且永久生效」。
4.  **操作者權限隔離**：當前執行匯入的人員 (Operator) 除非本身即為匯入資料中被指派的 `teacher_email`，否則匯入完成後系統絕不自動向其授予該班之 CLASS 範疇，操作人員將收到明確的安全隔離提示，並被導向權限申請流程。
