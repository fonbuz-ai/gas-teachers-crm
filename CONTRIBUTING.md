# 貢獻指南

感謝協助改善 ClassCare。此專案涉及學生與家庭敏感資訊，所有變更都必須先滿足安全與資料最小化要求。

## 開始之前

修改程式碼前請完整閱讀：

- `AGENTS.md`
- `README.md`
- `docs/data-model.md`
- `docs/permission-matrix.md`
- `docs/privacy-design.md`
- `docs/transition-rules.md`

測試、Issue、Pull Request 與截圖只能使用完全虛構資料。不得提交 `.clasp.json`、`.clasprc.json`、環境變數、Spreadsheet ID、Folder ID、部署網址、正式 Email 名單或任何學生與家庭資料。

## 開發原則

- 認證根必須是伺服器端 `Session.getActiveUser().getEmail()`。
- 權限統一由 `PermissionService.gs` 執行，資料存取統一經過 `DataRepository.gs`。
- 不得以隱藏前端元素取代後端授權。
- 不得破壞既有工作表與欄位相容性；schema 變更必須附 Migration 說明。
- `dist/ClassCareInstaller.gs` 是產物，不得直接修改；請修改多檔原始碼後執行 `python3 build.py`。
- 文件與 PR 必須使用 `DOCUMENTED`、`SKELETON_CREATED`、`IMPLEMENTED`、`TESTED`、`DEPLOYED` 標示實際狀態。

## 提交前檢查

```bash
python3 build.py
git diff --exit-code -- dist/ClassCareInstaller.gs
```

另外應依 `docs/testing-guide.md` 執行適用的測試。只有在 Google Apps Script 環境實際通過的情境才能標示為 `TESTED`；本機語法檢查不能取代權限與部署驗證。

Pull Request 至少要說明：

- 完成項目與狀態分類
- 修改檔案
- 權限與隱私影響
- 已執行的測試情境與結果
- 已知限制
- 手動部署或 Migration 步驟
