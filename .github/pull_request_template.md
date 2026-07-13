## 變更摘要與狀態

<!-- 使用 DOCUMENTED / SKELETON_CREATED / IMPLEMENTED / TESTED / DEPLOYED。 -->

## 修改檔案

## 權限與隱私影響

- [ ] 認證仍以 `Session.getActiveUser().getEmail()` 為唯一根
- [ ] 所有學生查詢仍執行班級／學生 Scope 驗證
- [ ] 敏感存取仍建立脫敏稽核紀錄
- [ ] 未加入真實個資、憑證、Google ID 或部署網址
- [ ] 未將 Web App 設為公開或「知道連結的任何人」

## 測試

<!-- 列出環境、情境、預期與實際結果；本機語法檢查不得標成 GAS 實機 TESTED。 -->

## 相容性與部署

- [ ] 未破壞既有工作表／欄位相容性，或已附 Migration 說明
- [ ] 已由 `python3 build.py` 重新產生單檔版本
- [ ] 已說明手動部署步驟與已知限制
