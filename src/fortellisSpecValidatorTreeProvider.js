const vscode = require('vscode');
const path = require('path');

class FortellisSpecValidatorProvider {
  constructor(issues) {
    this._onDidChangeTreeData = new vscode.EventEmitter();
    this.onDidChangeTreeData = this._onDidChangeTreeData.event;
    this.updateIssues(issues);
  }

  updateIssues(issues) {
    this.data = [
      { message: 'Validation Issues', isRoot: true, children: issues }
    ];
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element) {
    let treeItem = new vscode.TreeItem(
      element.message,
      element.isRoot
        ? vscode.TreeItemCollapsibleState.Expanded
        : vscode.TreeItemCollapsibleState.None
    );
    if (!element.isRoot) {
			treeItem.tooltip = 'Show Issue';			
			treeItem.iconPath = {
				light: path.join(__filename,'..', '..', 'resources', 'icons', 'light', 'error.svg'),
				dark: path.join(__filename, '..', '..', 'resources', 'icons', 'dark', 'error.svg')
			};
      treeItem.command = {
        command: 'extension.highlightIssue',
        title: 'Show Issue',
        arguments: [element]
      };
    }
    return treeItem;
  }

  getChildren(element) {
    if (element === undefined) {
      return this.data;
    }
    return element.children;
  }
}

module.exports = FortellisSpecValidatorProvider;
