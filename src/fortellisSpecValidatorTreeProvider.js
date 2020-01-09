const vscode = require('vscode');
const path = require('path');

class FortellisSpecValidatorProvider {
  constructor(issues) {
    this._onDidChangeTreeData = new vscode.EventEmitter();
    this.onDidChangeTreeData = this._onDidChangeTreeData.event;
    this.updateIssues(issues);
  }

  updateIssues(issues) {
    if (!issues) {
      this.data = [];
    } else {
      this.data = [
        {
          message:
            issues && issues.length > 0
              ? 'Validation Issues'
              : 'Specification valid',
          isRoot: true,
          valid: !(issues && issues.length > 0),
          children: issues
        }
      ];
    }
    this._onDidChangeTreeData.fire();
  }

  clear() {
    this.data = [];
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element) {
    let treeItem = new vscode.TreeItem(
      element.message,
      (element.children !== undefined && element.children.length > 0) 
        ? vscode.TreeItemCollapsibleState.Expanded
        : vscode.TreeItemCollapsibleState.None
		);
		let icon = 'error.svg';
		if(element.isRoot && element.valid) icon = 'check.svg';

		if(!element.isRoot || (element.isRoot && element.valid)){
			treeItem.iconPath = this.getIconPath(icon);
		}
    if (!element.isRoot) {
      treeItem.tooltip = 'Show Issue';      
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
	
	getIconPath(icon){
		return {
			light: path.join(
				__filename,
				'..',
				'..',
				'resources',
				'icons',
				'light',
				icon
			),
			dark: path.join(
				__filename,
				'..',
				'..',
				'resources',
				'icons',
				'dark',
				icon
			)
		}
	}
}

module.exports = FortellisSpecValidatorProvider;
