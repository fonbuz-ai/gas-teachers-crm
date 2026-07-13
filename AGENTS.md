# AGENTS.md

## Project Purpose

This project is a Google Apps Script Web App for class teachers to manage
student support, family contact, health action summaries, subsidy tracking,
parent-teacher communication, and follow-up tasks.

The system contains sensitive student and family information.
Security and data minimization take priority over convenience.

## Mandatory Rules

1. Never expose raw Google Sheet data directly to the browser.
2. Every server-side request must verify the active user's email.
3. Every student query must verify that the user has permission to access
   the student's class.
4. Never trust student_id, class_id, role, or email values sent from the frontend.
5. Frontend visibility is not authorization.
6. Do not store identity card numbers, complete medical histories, income,
   asset details, or bank account numbers unless explicitly approved.
7. Health information shown to teachers must be action-oriented summaries,
   not complete medical records.
8. All reads and writes involving sensitive modules must create audit logs.
9. Do not implement bulk export of sensitive data without an explicit
   administrative permission check.
10. Do not place secrets, Spreadsheet IDs, Folder IDs, or deployment URLs
    directly in frontend files.
11. **Namespace Object Pattern**: All Google Apps Script services must be defined within a namespace object (e.g., `const AuthService = {}`) to prevent naming collisions in the global script scope. Do not declare global functions directly, except for the entry points `doGet` and `doPost`.
12. **Identity Root**: Authentication and authorization must *always* root from the server-side `Session.getActiveUser().getEmail()`. The frontend must never pass user emails or roles for authorization. The database `user_id` and `email` columns are only used for indexing and checking against this trusted session value.
13. **Implementation Status Classification**: In all reports and documentation, clearly distinguish the current status of files and features using:
    *   `DOCUMENTED` (已編寫文件)
    *   `SKELETON_CREATED` (已建立骨架)
    *   `IMPLEMENTED` (已實作)
    *   `TESTED` (已測試)
    *   `DEPLOYED` (已部署)
    Never describe specs or stubs as completed features.

## Permission Model

Supported roles:

- ADMIN
- DIRECTOR
- CLASS_TEACHER
- HEALTH_CENTER
- COUNSELOR
- SUBSIDY_OFFICER
- READ_ONLY

Permissions must be enforced in `PermissionService.gs`.

## Data Access

All spreadsheet access must go through `DataRepository.gs`.

Do not call SpreadsheetApp directly from HTML-facing service functions
unless the access is routed through the repository layer.

## Privacy by Design

Use the minimum amount of data required for the educational purpose.

Separate:

- teacher-visible action summaries
- restricted health documents
- restricted counseling records
- restricted subsidy qualification documents

Do not merge all sensitive information into a single worksheet or response.

## Development Process

Before modifying code, read:

- README.md
- docs/data-model.md
- docs/permission-matrix.md
- docs/privacy-design.md
- docs/transition-rules.md

After modifying code, report:

1. Completed items (indicating status: DOCUMENTED/SKELETON_CREATED/IMPLEMENTED/TESTED/DEPLOYED)
2. Modified files (using relative paths)
3. Permission or privacy impact
4. Test scenarios performed
5. Known limitations
6. Manual deployment steps

## Testing Requirements

At minimum, test:

- teacher can access own class
- teacher cannot access another class by changing student_id
- inactive users cannot access data
- health center can access restricted health information
- class teacher cannot access complete health documents
- subsidy officer can access subsidy records only
- unauthorized exports are rejected
- audit logs are created for sensitive access
- archived students are excluded from active class views

## Prohibited Changes

Do not:

- weaken permission checks for convenience
- make the Web App public
- use "anyone with the link" access
- return an entire worksheet to the frontend
- log sensitive values in console output
- include sensitive data in error messages
- delete historical records without a defined retention rule
- 破壞資料表欄位或工作表相容性 (Prohibit breaking worksheet or column schema compatibility)
- 調整 schema 時未提供 Migration (資料轉移) 說明與步驟
- 逕行雙向修改單檔版 (dist/ClassCareInstaller.gs) 與多檔原始碼，導致邏輯發散；單檔版本應由編譯/打包腳本統一編譯产生。
14. **Roster Import Integrity**: Roster imports must generate `student_id` via `Utilities.getUuid()`. Compare students strictly using priority criteria: `school_year + student_number` first, then `school_year + class_name + seat_no`. Create/update corresponding user roles and scopes based on `teacher_email` mapping and log structural/access validations.