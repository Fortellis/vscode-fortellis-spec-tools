const vscode = require('vscode');

class FortellisSpecValidatorProvider {
  constructor(issues) {
    this._onDidChangeTreeData = new vscode.EventEmitter();
		this.onDidChangeTreeData = this._onDidChangeTreeData.event;
    this.updateIssues(issues);
	}

  updateIssues(issues) {
    this.data = [
      new TreeItem(
        { message: 'Validation Issues' },
        issues ? issues.map(issue => new TreeItem(issue)) : []
      )
    ];
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element) {
    return element;
  }

  getChildren(element) {
    if (element === undefined) {
      return this.data;
    }
    return element.children;
  }
}

class TreeItem extends vscode.TreeItem {
  constructor(issue, children) {
    super(
      issue.message,
      children === undefined
        ? vscode.TreeItemCollapsibleState.None
        : vscode.TreeItemCollapsibleState.Expanded
    );
		this.children = children;
		this.command = {
			command: 'extension.highlightIssue',
			title: 'Show Issue',
			arguments: [issue]
		}
  }
}

module.exports = FortellisSpecValidatorProvider;
