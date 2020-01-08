const vscode = require('vscode');
const validate = require('@fortellis/spec-validator');

const diagnosticCollection = vscode.languages.createDiagnosticCollection();
let statusBarMessage;

function activate(context) {
  const validateAction = vscode.commands.registerTextEditorCommand(
    'extension.validateSpec',
    validateSpec
  );

  let timeout = undefined;  

  let triggerValidateSpec = editor => {
    if (timeout) {
      clearTimeout(timeout);
      timeout = undefined;
    }
    timeout = setTimeout(() => {
      validateSpec(editor);
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
  context.subscriptions.push(diagnosticCollection);
}

function validateSpec(editor) {
  validate(editor.document.getText())
    .then(res => {
      const diagnostics = res.map(errItem => {
        //Display error message each issue with link to the issue
        /*vscode.window.showErrorMessage(errItem.message, 'Go to Issue').then(
          () => {
            editor.selection = new vscode.Selection(
              new vscode.Position(
                errItem.range.start.line,
                errItem.range.start.character
              ),
              new vscode.Position(errItem.range.end.line, errItem.range.end.character)
            );
          },
          err => {
            vscode.window.showInformationMessage(err);
          }
        );*/
        // Highlight each issue in the editor
        return new vscode.Diagnostic(errItem.range, errItem.message);
      });
      diagnosticCollection.set(editor.document.uri, diagnostics);
      if(statusBarMessage) statusBarMessage.dispose();
      if (res.length > 0) {
        statusBarMessage = vscode.window.setStatusBarMessage('Specification invalid');
      } else {
        statusBarMessage = vscode.window.setStatusBarMessage('Specification valid', 5000);
      }
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
