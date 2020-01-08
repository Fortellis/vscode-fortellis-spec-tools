const vscode = require("vscode");
const validate = require("@fortellis/spec-validator");
const generatePreview = require('./previewGenerator');

const diagnosticCollection = vscode.languages.createDiagnosticCollection();
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

  context.subscriptions.push(validateAction);
  context.subscriptions.push(previewAction);
  context.subscriptions.push(diagnosticCollection);
}

function validateSpec(editor) {
  validate(editor.document.getText())
    .then(res => {
      const diagnostics = res.map(err => {
        return new vscode.Diagnostic(err.range, err.message);
      });
      diagnosticCollection.set(editor.document.uri, diagnostics);
    })
    .catch(err => {
      vscode.window.showInformationMessage(err);
    });
}

function previewSpec(editor) {
  const document = editor.document;
  webviewPanel = vscode.window.createWebviewPanel(
    "specPreview",
    document.fileName,
    vscode.ViewColumn.Beside,
    {}
  );
  const text = document.getText();
  webviewPanel.webview.html = generatePreview(text);
}

// this method is called when your extension is deactivated
function deactivate() {}

module.exports = {
  activate,
  deactivate
};
