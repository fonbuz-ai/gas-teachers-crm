你現在是本專案的主要系統架構師、Google Apps Script 工程師與資訊安全審查者。

請在目前目錄中建立一套可部署的 Google Apps Script Web App，專案名稱為：

ClassCare 班級關懷工作台

這套系統提供新接班級的導師使用，讓導師快速掌握班級學生的家庭聯絡、主要照顧者、健康行動提醒、過去補助申請狀態、親師聯絡及後續追蹤事項。

這不是一般家長資料庫，也不是完整醫療或輔導紀錄系統。系統必須遵守最少資料蒐集、目的限制、角色分權、敏感資訊分級及存取留痕原則。

請先進行規劃，再分階段實作。不要一次產生難以檢查的大量程式碼。

==================================================
一、技術環境
==================================================

使用：

- Google Apps Script
- HTML Service
- 原生 HTML、CSS、JavaScript
- Google Sheets 作為資料儲存
- Google Drive 作為限制存取的附件儲存
- Google Workspace 帳號登入
- clasp 相容專案結構
- 繁體中文介面
- 響應式版面，支援桌機、平板與手機
- 不使用外部付費服務
- 不使用 Node.js 後端
- 不使用 React、Vue 或其他前端框架

可以使用：

- Google Apps Script PropertiesService
- LockService
- CacheService
- Utilities
- SpreadsheetApp
- DriveApp
- Session
- HtmlService

不得將 Spreadsheet ID、Folder ID 或其他設定直接寫死在前端。

==================================================
二、第一階段目標
==================================================

先完成可運作的 MVP，包含：

1. 使用者登入與權限驗證
2. 班級學生名冊
3. 學生支持卡
4. 家庭及主要照顧者資料
5. 健康行動摘要
6. 補助申請歷程
7. 親師聯絡紀錄
8. 待辦與追蹤事項
9. 班級總覽儀表板
10. 敏感資料存取紀錄
11. 系統設定及資料表初始化

第一階段不要實作：

- AI 自動摘要
- 大量寄信
- LINE 通知
- 完整醫療文件管理
- 輔導紀錄全文
- 家長直接登入
- 跨校資料交換
- 大量資料匯出
- 公開連結

==================================================
三、使用者角色
==================================================

建立以下角色：

ADMIN
DIRECTOR
CLASS_TEACHER
HEALTH_CENTER
COUNSELOR
SUBSIDY_OFFICER
READ_ONLY

權限原則：

ADMIN：
- 管理系統設定
- 管理使用者及角色
- 查看所有班級
- 執行資料初始化
- 查看稽核紀錄

DIRECTOR：
- 查看授權範圍內班級摘要
- 不直接查看完整醫療文件
- 不直接查看補助資格證明文件

CLASS_TEACHER：
- 只能查看自己負責班級
- 查看學生支持摘要
- 查看導師所需健康行動摘要
- 查看補助辦理狀態摘要
- 新增親師聯絡紀錄
- 建立及更新追蹤事項

HEALTH_CENTER：
- 查看及維護健康行動摘要
- 查看限制存取的健康文件連結
- 不查看補助資格文件

COUNSELOR：
- 查看授權學生的支持與輔導摘要
- 不查看完整醫療文件
- 不查看補助資格文件

SUBSIDY_OFFICER：
- 查看及維護補助申請資料
- 可查看補助文件連結
- 不查看健康文件

READ_ONLY：
- 只能查看明確授權的非敏感摘要
- 不得新增、修改、刪除及匯出

所有權限都必須由後端驗證。

不得只靠前端隱藏按鈕。

即使使用者修改網址參數、student_id、class_id 或 JavaScript，仍不得取得未授權資料。

==================================================
四、資料表設計
==================================================

建立初始化函式 setupSystem()，自動建立以下工作表及標題欄。

1. users

欄位：

user_id
email
name
role
class_ids
active
created_at
updated_at

class_ids 使用逗號分隔或 JSON 字串，請選擇較安全且容易維護的方式，並在文件中說明。

2. classes

class_id
school_year
class_name
grade
teacher_email
status
created_at
updated_at

3. students

student_id
school_year
class_id
seat_no
student_name
birth_date
status
created_at
updated_at

不要使用身分證字號作為 student_id。

student_id 必須使用 UUID。

4. guardians

guardian_id
student_id
name
relationship
is_legal_guardian
is_primary_caregiver
phone
contact_time
contact_method
pickup_permission
notes
created_at
updated_at

5. student_support_profiles

profile_id
student_id
strengths
learning_needs
emotional_support
peer_interaction
effective_strategies
avoid_strategies
transition_notes
review_date
created_at
updated_at

6. health_alerts

health_id
student_id
alert_level
teacher_summary
possible_symptoms
first_action
contact_guardian
notify_health_center
activity_restriction
restricted_document_url
review_date
created_by
created_at
updated_at

健康資料必須以「導師可以採取什麼行動」為核心，不建立完整病歷欄位。

7. subsidy_records

record_id
student_id
school_year
subsidy_type
application_status
approved_period
case_owner
document_status
restricted_document_url
next_review_date
notes
created_by
created_at
updated_at

8. contact_logs

log_id
student_id
contact_date
contact_method
contact_person
topic
objective_summary
guardian_response
agreement
follow_up_action
follow_up_date
created_by
created_at
updated_at

親師聯絡紀錄必須使用客觀描述，不設置家長評分、家庭功能評分或負面標籤欄位。

9. follow_up_tasks

task_id
student_id
task_type
task_title
description
due_date
owner_email
status
priority
source_record_id
created_by
created_at
updated_at

status：

TODO
IN_PROGRESS
COMPLETED
CANCELLED

priority：

LOW
NORMAL
HIGH
URGENT

10. access_logs

log_id
timestamp
user_email
action
module
student_id
class_id
result
metadata

metadata 不得儲存完整健康資料、電話、家庭狀況或補助內容。

11. system_settings

setting_key
setting_value
description
updated_by
updated_at

==================================================
五、後端架構
==================================================

建立以下 Apps Script 檔案：

Code.gs
Config.gs
SetupService.gs
AuthService.gs
PermissionService.gs
DataRepository.gs
UserService.gs
ClassService.gs
StudentService.gs
GuardianService.gs
SupportProfileService.gs
HealthService.gs
SubsidyService.gs
ContactLogService.gs
FollowUpService.gs
AuditLogService.gs
ValidationService.gs
ResponseService.gs

要求：

1. HTML 不得直接操作 SpreadsheetApp。
2. 所有資料存取集中在 DataRepository.gs。
3. 所有服務方法先進行權限驗證。
4. 所有傳入資料都要驗證及清理。
5. 所有回傳資料使用一致格式：

{
  success: true,
  data: {},
  message: ""
}

或：

{
  success: false,
  data: null,
  message: "適合一般使用者理解的錯誤訊息",
  errorCode: "PERMISSION_DENIED"
}

6. 不把程式堆疊、工作表名稱、內部 ID 或敏感資料回傳前端。
7. 新增及修改資料時使用 LockService，避免同時寫入造成資料覆蓋。
8. 所有 ID 使用 Utilities.getUuid()。
9. 日期統一使用 Asia/Taipei 時區。
10. 建立共用的欄位索引機制，不要在每次操作中硬編碼欄位位置。
11. 查詢單一學生時，必須同時驗證該學生所屬班級是否在使用者授權範圍。
12. 不得建立「讀取整張表後回傳前端」的函式。
13. 敏感模組的讀取、新增、修改與刪除都要寫入 access_logs。

==================================================
六、前端頁面
==================================================

建立以下檔案：

Index.html
Styles.html
Scripts.html
Components.html
DashboardView.html
StudentListView.html
StudentDetailView.html
GuardianView.html
SupportProfileView.html
HealthView.html
SubsidyView.html
ContactLogView.html
FollowUpView.html
AdminView.html
ErrorView.html

採用單頁式操作，但不要使用前端框架。

畫面風格：

- 國小教育情境
- 清楚、溫暖、專業
- 淺色背景
- 藍色作為主要操作色
- 綠色表示完成或一般狀態
- 黃色表示待確認
- 紅色只用於真正緊急事項
- 不用過度鮮豔色彩
- 字體大小適合教師長時間閱讀
- 手機版仍可正常使用

首頁顯示：

- 班級名稱
- 學生總人數
- 今日待辦
- 本週追蹤
- 健康提醒人數
- 補助待確認人數
- 家庭聯絡資料待更新人數
- 最近親師聯絡紀錄
- 學生搜尋
- 依狀態篩選

學生卡片只顯示必要摘要，例如：

- 姓名
- 座號
- 主要照顧者類型
- 是否有健康行動提醒
- 是否有補助待辦
- 是否有到期追蹤

不要在班級首頁顯示完整健康內容、家庭經濟情況或補助資格。

學生詳細頁分頁：

支持摘要
家庭聯絡
健康提醒
補助紀錄
親師聯絡
追蹤事項

==================================================
七、資料安全
==================================================

必須遵守：

1. Web App 不得設定為任何人皆可存取。
2. 使用 Session.getActiveUser().getEmail() 取得登入帳號。
3. 空白 Email 視為未登入。
4. 不相信前端傳入的 user email 或 role。
5. 所有角色及班級資訊由後端 users 表取得。
6. 不將完整 users、health_alerts 或 subsidy_records 工作表傳給前端。
7. 文件連結必須先檢查角色權限。
8. 前端不得保存敏感資料於 localStorage。
9. 不在 console.log 輸出學生、家長、健康或補助資料。
10. 不在 URL query string 放置姓名、電話、健康狀況或家庭資料。
11. 不建立公開下載網址。
12. 不提供整班敏感資料匯出功能。
13. 所有 HTML 輸出必須避免 XSS。
14. 所有字串輸入必須進行長度限制。
15. restricted_document_url 只儲存受限制的 Google Drive 檔案網址。
16. 不自動改變 Drive 檔案分享權限。
17. 停用使用者不得登入。
18. 每次查看健康、補助或家庭詳細資料都要記錄稽核紀錄。

==================================================
八、示範資料
==================================================

建立 seedDemoData()，產生：

- 1 個管理員
- 1 個五年三班導師
- 1 個健康中心角色
- 1 個補助承辦角色
- 1 個班級
- 12 位虛構學生
- 不同家庭照顧情況
- 3 筆健康行動提醒
- 4 筆補助紀錄
- 8 筆親師聯絡紀錄
- 6 筆追蹤事項

所有姓名、電話、Email 及情境均為虛構資料。

不要使用真實學校、學生、家長或教師資料。

seedDemoData() 必須防止重複執行產生重複資料。

==================================================
九、管理功能
==================================================

管理員頁面第一階段包含：

- 查看使用者
- 新增使用者
- 修改角色
- 啟用或停用使用者
- 指派班級
- 查看班級
- 查看最近 access_logs
- 執行系統資料表檢查
- 顯示缺少的工作表或欄位
- 不直接顯示完整敏感資料

建立 validateSystemStructure()：

檢查：

- 必要工作表是否存在
- 欄位是否完整
- Spreadsheet ID 是否設定
- 管理員是否存在
- 是否有重複 Email
- 是否有學生指向不存在的班級
- 是否有孤立資料
- 日期格式是否異常

不得自動刪除資料。

==================================================
十、文件
==================================================

建立：

README.md
AGENTS.md
docs/architecture.md
docs/data-model.md
docs/permission-matrix.md
docs/privacy-design.md
docs/deployment-guide.md
docs/testing-guide.md
docs/transition-rules.md

README.md 包含：

- 系統目的
- 功能範圍
- 技術架構
- 專案結構
- 初始化方式
- 如何設定 Script Properties
- 如何執行 setupSystem()
- 如何建立第一位管理員
- 如何執行 seedDemoData()
- Web App 部署步驟
- 權限注意事項
- 已知限制

AGENTS.md 必須規定：

- 修改前需要閱讀的文件
- 權限檢查不可移除
- 不可公開 Web App
- 不可將敏感資料回傳前端
- 不可將完整工作表讀取結果傳到瀏覽器
- 不可記錄敏感資料到日誌
- 修改後必須執行的測試
- 修改後回報格式
- 禁止破壞資料表相容性
- schema 調整必須提供 migration 說明

==================================================
十一、測試
==================================================

建立測試文件及可執行的 GAS 測試函式。

至少測試：

1. 未登入使用者不能存取。
2. 停用使用者不能存取。
3. 導師只能查看自己的班級。
4. 修改 student_id 後不能查看別班學生。
5. 導師不能查看完整健康限制文件。
6. 健康中心可以查看健康限制文件。
7. 補助承辦可以更新補助資料。
8. 補助承辦不能查看健康限制文件。
9. READ_ONLY 不能新增或修改資料。
10. 前端傳入假的角色不能提升權限。
11. 敏感資料讀取會產生 access_logs。
12. 新增資料會產生 UUID。
13. 無效日期會被拒絕。
14. 過長文字會被拒絕或截斷。
15. HTML 或 script 標籤輸入不會形成 XSS。
16. seedDemoData() 不會重複建立資料。
17. setupSystem() 可安全重複執行。
18. 不存在的 student_id 回傳一致的錯誤格式。

==================================================
十二、實作流程
==================================================

請依照以下順序工作：

Phase 0：
- 檢查目前目錄
- 建立專案規劃
- 建立 README.md 初稿
- 建立 AGENTS.md
- 建立 docs
- 建立檔案樹
- 此階段不要寫完整功能

Phase 1：
- 建立 appsscript.json
- 建立 Config.gs
- 建立 SetupService.gs
- 建立資料表初始化
- 建立示範資料
- 建立系統結構檢查

Phase 2：
- 建立 AuthService.gs
- 建立 PermissionService.gs
- 建立 DataRepository.gs
- 建立 ValidationService.gs
- 建立 ResponseService.gs
- 建立 AuditLogService.gs
- 完成基本權限測試

Phase 3：
- 建立班級及學生服務
- 建立家庭聯絡服務
- 建立學生支持摘要
- 完成學生清單及學生詳細頁

Phase 4：
- 建立健康行動摘要
- 建立補助歷程
- 建立敏感資料權限
- 建立稽核紀錄

Phase 5：
- 建立親師聯絡
- 建立待辦追蹤
- 建立儀表板統計
- 完成響應式介面

Phase 6：
- 建立管理員功能
- 完成測試
- 完成部署文件
- 執行安全檢查
- 檢查所有 TODO 與 FIXME

每完成一個 Phase，先停止並回報，不要自行進入下一個 Phase。

==================================================
十三、本次只執行 Phase 0
==================================================

現在只執行 Phase 0。

請先：

1. 檢查目前目錄是否已有檔案。
2. 若為空目錄，建立完整專案骨架。
3. 建立 README.md 初稿。
4. 建立 AGENTS.md。
5. 建立 docs/architecture.md。
6. 建立 docs/data-model.md。
7. 建立 docs/permission-matrix.md。
8. 建立 docs/privacy-design.md。
9. 建立 docs/deployment-guide.md。
10. 建立 docs/testing-guide.md。
11. 建立 docs/transition-rules.md。
12. 建立所有預計使用的空白或骨架檔案。
13. 不要實作完整 CRUD。
14. 不要部署。
15. 不要執行具有破壞性的指令。
16. 不要建立真實學生或家長資料。

完成後，請以繁體中文回報：

- 完成項目
- 建立或修改檔案
- 專案檔案樹
- 核心架構決策
- 權限與隱私設計
- 尚未實作項目
- 下一階段建議
- 需要人工確認的設定

開始執行 Phase 0。