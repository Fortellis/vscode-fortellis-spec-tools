const vscode = require("vscode");
const { lintRaw, Severity } = require("@fortellis/spec-linter");
const generatePreview = require("./preview/previewGenerator");
const generateError = require("./preview/errorGenerator");
const FortellisSpecValidatorTreeProvider = require("./fortellisSpecValidatorTreeProvider");

const treeProvider = new FortellisSpecValidatorTreeProvider();
const diagnosticCollection = vscode.languages.createDiagnosticCollection();

let statusBarMessage;
let webviewPanels = {};
// Configuration values
let updateValidationEnabled = true;
let saveValidationEnabled = true;

async function activate(context) {
  updateConfiguration();

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
      updatePreview(editor);
    }, 2000);
  };

  vscode.window.onDidChangeActiveTextEditor(
    event => {
      if (
        updateValidationEnabled &&
        vscode.window.activeTextEditor &&
        event.document.languageId === "yaml"
      ) {
        triggerValidateSpec(vscode.window.activeTextEditor);
      }
    },
    null,
    context.subscriptions
  );

  vscode.workspace.onDidChangeTextDocument(
    event => {
      if (
        updateValidationEnabled &&
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

  vscode.workspace.onDidSaveTextDocument(
    document => {
      if (
        saveValidationEnabled &&
        document &&
        document.languageId === "yaml" &&
        vscode.window.activeTextEditor &&
        vscode.window.activeTextEditor.document &&
        document === vscode.window.activeTextEditor.document
      ) {
        triggerValidateSpec(vscode.window.activeTextEditor);
      }
    },
    null,
    context.subscriptions
  );

  vscode.workspace.onDidCloseTextDocument(
    () => treeProvider.clear(),
    null,
    context.subscriptions
  );

  vscode.workspace.onDidChangeConfiguration(() => updateConfiguration());

  context.subscriptions.push(validateAction);
  context.subscriptions.push(previewAction);
  context.subscriptions.push(highlightIssueAction);
  context.subscriptions.push(diagnosticCollection);

  vscode.window.registerTreeDataProvider(
    "fortellis-spec-validator-view",
    treeProvider
  );
}

function updateConfiguration() {
  const config = vscode.workspace.getConfiguration("fortellisSpec");
  updateValidationEnabled = config.validation.onChange;
  saveValidationEnabled = config.validation.onSave;
}

function highlighIssue(editor, edit, issue) {
  editor.selection = new vscode.Selection(
    new vscode.Position(issue.range.start.line, issue.range.start.character),
    new vscode.Position(issue.range.end.line, issue.range.end.character)
  );
  editor.revealRange(issue.range, vscode.TextEditorRevealType.InCenter);
}

function validateSpec(editor) {
  lintRaw(editor.document.getText(), {
    rulesets: {
      "oas2-enhanced": true,
      "oas2-fortellis": true
    },
    severity: Severity.warn
  })
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
          "$(verified) Specification valid",
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
  const fullFileName = document.fileName.split("/");
  const fileName = fullFileName[fullFileName.length - 1];

  if (!webviewPanels[document.fileName]) {
    webviewPanels[document.fileName] = vscode.window.createWebviewPanel(
      "specPreview",
      "Fortellis API Documentation Preview: " + fileName,
      vscode.ViewColumn.Beside,
      {}
    );

    webviewPanels[document.fileName].onDidDispose(() => {
      delete webviewPanels[document.fileName];
    });
  }

  updatePreview(editor);
}

function updatePreview(editor) {
  const document = editor.document;

  if (webviewPanels[document.fileName]) {
    const panel = webviewPanels[document.fileName];
    const text = document.getText();
    generatePreview(text)
      .then(res => {
        panel.webview.html = res;
      })
      .catch(err => {
        console.log(err);
        const diagnostics = diagnosticCollection.get(document.uri);
        panel.webview.html = generateError(err, document, diagnostics);
      });
  }
}

// this method is called when your extension is deactivated
function deactivate() {}

module.exports = {
  activate,
  deactivate
};
