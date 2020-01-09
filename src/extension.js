const vscode = require("vscode");
const validate = require("@fortellis/spec-validator");
const generatePreview = require("./previewGenerator");
const generateError = require("./errorGenerator");
const FortellisSpecValidatorTreeProvider = require("./fortellisSpecValidatorTreeProvider");

const treeProvider = new FortellisSpecValidatorTreeProvider();
const diagnosticCollection = vscode.languages.createDiagnosticCollection();

let statusBarMessage;
let webviewPanel = undefined;

function activate(context) {
  const validateAction = vscode.commands.registerTextEditorCommand(
    "extension.validateSpec",
    validateSpec
  );

  const previewAction = vscode.commands.registerTextEditorCommand(
    "extension.previewSpec",
    previewSpec
  );

  const highlightIssueAction = vscode.commands.registerTextEditorCommand(
    "extension.highlightIssue",
    highlighIssue
  );

  let timeout = undefined;
  let triggerValidateSpec = editor => {
    if (timeout) {
      clearTimeout(timeout);
      timeout = undefined;
    }
    timeout = setTimeout(() => {
      validateSpec(editor);
      if (webviewPanel) {
        previewSpec(editor);
      }
    }, 2000);
  };

  vscode.workspace.onDidChangeTextDocument(
    event => {
      if (
        vscode.window.activeTextEditor &&
        event.document === vscode.window.activeTextEditor.document &&
        event.document.languageId === "yaml"
      ) {
        triggerValidateSpec(vscode.window.activeTextEditor);
      }
    },
    null,
    context.subscriptions
  );

  context.subscriptions.push(validateAction);
  context.subscriptions.push(previewAction);
  context.subscriptions.push(highlightIssueAction);
  context.subscriptions.push(diagnosticCollection);

  vscode.window.registerTreeDataProvider(
    "fortellis-spec-validator-view",
    treeProvider
  );
}

function highlighIssue(editor, edit, issue) {
  editor.selection = new vscode.Selection(
    new vscode.Position(issue.range.start.line, issue.range.start.character),
    new vscode.Position(issue.range.end.line, issue.range.end.character)
  );
  editor.revealRange(issue.range, vscode.TextEditorRevealType.InCenter);
}

function validateSpec(editor) {
  validate(editor.document.getText())
    .then(res => {
      const diagnostics = res.map(errItem => {
        return new vscode.Diagnostic(errItem.range, errItem.message);
      });
      treeProvider.updateIssues(res);
      diagnosticCollection.set(editor.document.uri, diagnostics);
      if (statusBarMessage) statusBarMessage.dispose();
      if (res.length > 0) {
        statusBarMessage = vscode.window.setStatusBarMessage(
          "$(error) Specification invalid"
        );
      } else {
        statusBarMessage = vscode.window.setStatusBarMessage(
          "$(check) Specification valid",
          5000
        );
      }
    })
    .catch(err => {
      vscode.window.showInformationMessage(err);
    });
}

function previewSpec(editor) {
  const document = editor.document;
  const fullFileName = document.fileName.split('/');
  const fileName = fullFileName[fullFileName.length - 1];
  if (!webviewPanel) {
    webviewPanel = vscode.window.createWebviewPanel(
      "specPreview",
      "Fortellis API Documentation Preview: " + fileName,
      vscode.ViewColumn.Beside,
      {}
    );
  }
  const text = document.getText();
  generatePreview(text)
    .then(res => {
      webviewPanel.webview.html = res;
    })
    .catch(err => {
      console.log(err);
      const diagnostics = diagnosticCollection.get(document.uri);
      webviewPanel.webview.html = generateError(err, document, diagnostics);
    });
}

// this method is called when your extension is deactivated
function deactivate() {}

module.exports = {
  activate,
  deactivate
};
