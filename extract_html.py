import re

def extract():
    with open('dist/ClassCareInstaller.gs', 'r', encoding='utf-8') as f:
        content = f.read()

    # Extract SetupWizardHtml
    wizard_match = re.search(r'const SetupWizardHtml = `(.*?)\n`;', content, re.DOTALL)
    if wizard_match:
        wizard_html = wizard_match.group(1).strip()
        # Unescape escaped backticks and dollar signs if any
        wizard_html = wizard_html.replace('\\`', '`').replace('\\$', '$')
        with open('SetupWizard.html', 'w', encoding='utf-8') as f_out:
            f_out.write(wizard_html)
        print("Extracted SetupWizard.html")
    else:
        print("Warning: SetupWizardHtml not found")

    # Extract TeacherWorkspaceHtml
    workspace_match = re.search(r'const TeacherWorkspaceHtml = `(.*?)\n`;', content, re.DOTALL)
    if workspace_match:
        workspace_html = workspace_match.group(1).strip()
        workspace_html = workspace_html.replace('\\`', '`').replace('\\$', '$')
        with open('TeacherWorkspace.html', 'w', encoding='utf-8') as f_out:
            f_out.write(workspace_html)
        print("Extracted TeacherWorkspace.html")
    else:
        print("Warning: TeacherWorkspaceHtml not found")

if __name__ == '__main__':
    extract()
