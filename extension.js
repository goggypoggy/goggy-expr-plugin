const vscode = require('vscode');

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
	console.log('Congratulations, your extension "goggy-expr-plugin" is now active!');

	vscode.workspace.onDidChangeTextDocument((event) => {
		vscode.window.showInformationMessage("I see you typing");

		var changes = event.contentChanges;
		for (change in changes) {
			console.log(change);
		}
	})

	const disposable = vscode.commands.registerCommand('goggy-expr-plugin.helloWorld', function () {	
		vscode.window.showInformationMessage("Hi");
	});

	context.subscriptions.push(disposable);
}

function deactivate() {}

module.exports = {
	activate,
	deactivate
}
