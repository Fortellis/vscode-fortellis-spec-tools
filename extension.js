const vscode = require('vscode');
const validate = require('@fortellis/spec-validator');

const diagnosticCollection = vscode.languages.createDiagnosticCollection();

function activate(context) {
  const validateAction = vscode.commands.registerTextEditorCommand(
    'extension.validateSpec',
    validateSpec
  );

  let timeout = undefined;

  let triggerValidateSpec = (editor) => {
    console.log('validate triggered');
    if (timeout) {
      clearTimeout(timeout);
      timeout = undefined;
    }
    timeout = setTimeout(() => {validateSpec(editor);}, 500);
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
  context.subscriptions.push(diagnosticCollection);
}

function validateSpec(editor) {
  validate(editor.document.getText())
    .then(res => {
      const diagnostics = res.map(err => {
        return new vscode.Diagnostic(err.range, err.message);
      });
      diagnosticCollection.set(editor.document.uri, diagnostics);
      vscode.window.showErrorMessage(
        'Validation failed!',
        ...res.map(err => err.message)
      );
    })
    .catch(err => {
      vscode.window.showInformationMessage(err);
    });
}

// this method is called when your extension is deactivated
function deactivate() {}

module.exports = {
  activate,
  deactivate
};
