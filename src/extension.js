const vscode = require('vscode');
const validate = require('@fortellis/spec-validator');

const diagnosticCollection = vscode.languages.createDiagnosticCollection();
const FortellisSpecValidatorTreeProvider = require('./fortellisSpecValidatorTreeProvider');
const treeProvider = new FortellisSpecValidatorTreeProvider();
let statusBarMessage;

function activate(context) {
  const validateAction = vscode.commands.registerTextEditorCommand(
    'extension.validateSpec',
    validateSpec
  );

  const highlightIssueAction = vscode.commands.registerTextEditorCommand(
    'extension.highlightIssue',
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
    }, 2000);
  };

  vscode.workspace.onDidChangeTextDocument(
    event => {
      if (
        vscode.window.activeTextEditor &&
        event.document === vscode.window.activeTextEditor.document
        && event.document.languageId === 'yaml'
      ) {
        triggerValidateSpec(vscode.window.activeTextEditor);
      }
    },
    null,
    context.subscriptions
  );

  context.subscriptions.push(validateAction);
  context.subscriptions.push(highlightIssueAction);
  context.subscriptions.push(diagnosticCollection);

  vscode.window.registerTreeDataProvider('fortellis-spec-validator-view', treeProvider);
}

function highlighIssue(editor, edit, issue) {
  editor.selection = new vscode.Selection(
    new vscode.Position(
      issue.range.start.line,
      issue.range.start.character
    ),
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
