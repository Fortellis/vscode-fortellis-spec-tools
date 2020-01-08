const vscode = require("vscode");
const validate = require("@fortellis/spec-validator");
const generatePreview = require("./previewGenerator");

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
        event.document === vscode.window.activeTextEditor.document
      ) {
        triggerValidateSpec(vscode.window.activeTextEditor);
      }
    },
    null,
    context.subscriptions
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
      res.forEach(item => {
        vscode.window.showErrorMessage(item.message, "Go to Issue").then(
          () => {
            editor.selection = new vscode.Selection(
              new vscode.Position(
                item.range.start.line,
                item.range.start.character
              ),
              new vscode.Position(item.range.end.line, item.range.end.character)
            );
          },
          err => {
            vscode.window.showInformationMessage(err);
          }
        );
      });
      if (res.length > 0) {
        vscode.window.setStatusBarMessage("Specification invalid", 5000);
      } else {
        vscode.window.setStatusBarMessage("Specification valid", 5000);
      }
    })
    .catch(err => {
      vscode.window.showInformationMessage(err);
    });
}

function previewSpec(editor) {
  const document = editor.document;
  if (!webviewPanel) {
    webviewPanel = vscode.window.createWebviewPanel(
      "specPreview",
      document.fileName,
      vscode.ViewColumn.Beside,
      {}
    );
  }
  const text = document.getText();
  generatePreview(text)
    .then(res => {
      webviewPanel.webview.html = res;
    })
    .catch(err => console.log(err));
}

// this method is called when your extension is deactivated
function deactivate() {}

module.exports = {
  activate,
  deactivate
};
