import os

gs_files = [
    'Config.gs',
    'ResponseService.gs',
    'ValidationService.gs',
    'DataRepository.gs',
    'UserService.gs',
    'PermissionService.gs',
    'PrivacyService.gs',
    'AuthService.gs',
    'SetupService.gs',
    'AdminBootstrapService.gs',
    'DemoDataService.gs',
    'SystemStatusService.gs',
    'AuditLogService.gs',
    'UIService.gs',
    'ClassService.gs',
    'StudentService.gs',
    'GuardianService.gs',
    'SupportProfileService.gs',
    'ContactLogService.gs',
    'FollowUpService.gs',
    'HealthService.gs',
    'SubsidyService.gs',
    'ImportService.gs',
    'TestRunner.gs',
    'Code.gs'
]

html_files = {
    'SetupWizardHtml': 'SetupWizard.html',
    'TeacherWorkspaceHtml': 'TeacherWorkspace.html',
    'ImportCenterHtml': 'ImportCenter.html',
    'PrecheckDialogHtml': 'PrecheckDialog.html',
    'SystemStatusHtml': 'SystemStatus.html'
}

def escape_html_for_gas(content):
    # Escape backslashes first, then backticks, then dollar signs
    escaped = content.replace('\\', '\\\\')
    escaped = escaped.replace('`', '\\`')
    escaped = escaped.replace('$', '\\$')
    return escaped

def build():
    output = []

    # 1. Add banner headers
    output.append("// ==============================================================================")
    output.append("// ClassCare 單檔安裝版 — ClassCareInstaller.gs")
    output.append("// 說明：本檔案由 build.py 自動編譯打包產生。請勿直接修改此檔案。")
    output.append("// 狀態：已實作 (IMPLEMENTED) - 尚未在 Google Apps Script 真實線上環境中執行驗證。")
    output.append("// ==============================================================================\n")

    # 2. Add system version and names
    output.append("const SYSTEM_NAME = \"ClassCare 班級關懷工作台\";")
    output.append("const SYSTEM_VERSION = \"1\";")
    output.append("const INSTALLER_SCHEMA_VERSION = 1;\n")

    # 3. Concatenate all GS files with template loader translations
    for gs in gs_files:
        if not os.path.exists(gs):
            print(f"Error: {gs} not found!")
            return

        with open(gs, 'r', encoding='utf-8') as f:
            content = f.read()

        # Translate file-based HTML loading in UIService
        if gs == 'UIService.gs':
            content = content.replace('HtmlService.createTemplateFromFile("Index")\n      .evaluate()', 'HtmlService.createTemplate(TeacherWorkspaceHtml).evaluate()')
            content = content.replace('HtmlService.createHtmlOutputFromFile("Index")', 'HtmlService.createTemplate(SetupWizardHtml).evaluate()')
            content = content.replace('HtmlService.createHtmlOutputFromFile("ImportCenter")', 'HtmlService.createTemplate(ImportCenterHtml).evaluate()')
            content = content.replace('HtmlService.createHtmlOutputFromFile("PrecheckDialog")', 'HtmlService.createTemplate(PrecheckDialogHtml).evaluate()')
            content = content.replace('HtmlService.createTemplateFromFile("SystemStatus")\n      .evaluate()', 'HtmlService.createTemplate(SystemStatusHtml).evaluate()')

            # Inline sidebar rendering in openSystemSidebar
            sidebar_target = """  // 開啟系統管理側邊欄 (原 openSidebar 重命名)
  openSystemSidebar: function() {
    const html = HtmlService.createHtmlOutputFromFile("AdminView")
      .setTitle("ClassCare 系統管理");
    SpreadsheetApp.getUi().showSidebar(html);
  },"""
            sidebar_replacement = """  // 開啟系統管理側邊欄 (原 openSidebar 重命名)
  openSystemSidebar: function() {
    const userEmail = Session.getActiveUser().getEmail() || "未登入";
    const sidebarHtml = `
      <div style="font-family: sans-serif; padding: 15px; background-color: #f4f6f9; height: 100vh;">
        <h3 style="color:#1a73e8; margin-bottom: 5px;">ClassCare 系統管理</h3>
        <p style="font-size: 12px; color:#5f6368; margin-top:0;">版本：V${SYSTEM_VERSION}</p>
        <div style="background: white; padding: 10px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); margin-bottom: 15px;">
          <strong>當前登入帳號</strong>
          <div style="font-size:12px; word-break:break-all; color:#1a73e8; margin-top:5px;">\\${userEmail}</div>
        </div>
        <button onclick="google.script.run.setupOrValidateSystem()" style="width:100%; padding:10px; margin-bottom:8px; background-color:#1a73e8; color:white; border:none; border-radius:4px; cursor:pointer;">驗證系統結構</button>
        <button onclick="google.script.run.showAdminSetupDialog()" style="width:100%; padding:10px; margin-bottom:8px; background-color:#34a853; color:white; border:none; border-radius:4px; cursor:pointer;">設定管理員</button>
        <button onclick="google.script.run.seedDemoDataFromMenu()" style="width:100%; padding:10px; margin-bottom:8px; background-color:#fbbc05; color:black; border:none; border-radius:4px; cursor:pointer;">建立示範資料</button>
      </div>
    `;
    const htmlOutput = HtmlService.createHtmlOutput(sidebarHtml).setTitle("ClassCare 系統管理");
    SpreadsheetApp.getUi().showSidebar(htmlOutput);
  },"""
            content = content.replace(sidebar_target, sidebar_replacement)

        elif gs == 'Code.gs':
            # Translate doGet to use template evaluating in Code.gs
            content = content.replace('HtmlService.createTemplateFromFile("Index")\n    .evaluate()', 'HtmlService.createTemplate(TeacherWorkspaceHtml).evaluate()')

        output.append(f"// --- Start of {gs} ---")
        output.append(content)
        output.append(f"// --- End of {gs} ---\n")

    # 4. Add unique global trigger mapping only
    output.append("""
// ==============================================================================
// 測試執行全域包裝進入點 (Installer Unique Triggers)
// ==============================================================================
function runInstallerTests() {
  return TestRunner.runAllTests();
}
""")

    # 5. Append escaped HTML template strings
    output.append("// ==============================================================================")
    output.append("// 19. HTML Template Constants (Escaped for Safe Multi-line Inlining)")
    output.append("// ==============================================================================\n")

    for key, filename in html_files.items():
        if not os.path.exists(filename):
            print(f"Error: {filename} not found!")
            return

        with open(filename, 'r', encoding='utf-8') as f:
            html_content = f.read()

        escaped_html = escape_html_for_gas(html_content)
        output.append(f"const {key} = `\n{escaped_html}\n`;\n")

    # Write to target installer
    os.makedirs('dist', exist_ok=True)
    with open('dist/ClassCareInstaller.gs', 'w', encoding='utf-8') as f_out:
        f_out.write('\n'.join(output))

    print("ClassCareInstaller.gs compiled successfully!")

if __name__ == '__main__':
    build()
