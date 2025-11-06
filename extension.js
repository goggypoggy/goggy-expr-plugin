const vscode = require('vscode');

let extension_is_on = true;

/**
 * Runs when the extension is activated.
 * 
 * Arguments:
 *     - context: vscode.ExtensionContext
 * Returns: none
 */
function activate(context) {
	console.log('Expression Extension is active.');

	/**
	 * Checks if a keyword has been typed in the editor
	 * and if a space was typed after that.
	 * If so, expands the keyword into a full expression. 
	 * 
	 * Arguments:
	 *     - keyword: string - keyword that has to be expanded
	 * Returns:
	 *     - true, if a keyword was expanded, false otherwise
	 */
	function ExpandWord(keyword) {
		const editor = vscode.window.activeTextEditor;
		if (!editor) {
			return false;
		}

		const document = editor.document;
		const selection = editor.selection;
		const cur_pos = selection.active;
		const cur_char = document.getText(new vscode.Range(cur_pos, cur_pos.translate(0, 1)));
		
		if (cur_char !== ' ') {
			return false;
		}

		let cur_word = document.getText(document.getWordRangeAtPosition(cur_pos));
		let line = document.lineAt(cur_pos.line);
		let right_part = document.getText(new vscode.Range(cur_pos, line.range.end));	

		let no_brace = 
			right_part.indexOf("(") == -1 && 
			right_part.indexOf(")") == -1 && 
			right_part.indexOf("{") == -1;

		if (cur_word == keyword && no_brace) {
			let tab_spaces_range = new vscode.Range(line.range.start, new vscode.Position(cur_pos.line, line.firstNonWhitespaceCharacterIndex));
			let tab_spaces = document.getText(tab_spaces_range);

			let tabbed_empty_body = " ".repeat(tab_spaces.length + 4) + "\n";
			let tabbed_closed_curly = " ".repeat(tab_spaces.length) + "}";

			let final_string = "() {\n" + tabbed_empty_body + tabbed_closed_curly;

			editor.edit(edit_builder => {
				edit_builder.insert(cur_pos.translate(0, 1), final_string);
			});
			editor.selection = new vscode.Selection(cur_pos.translate(0, 2), cur_pos.translate(0, 2));

			return true;
		}

		return false;
	}
	
	/**
	 * Tries to expand every keyword from a given list.
	 * Stops after a keyworded was expanded. 
	 * 
	 * Arguments:
	 *     - word_list: string Array, list of keywords the function will try to expand
	 * Returns:
	 * 	   - true, if a keyword from the list was expanded, false otherwise
	 */
	function ExpandWords(word_list) {
		for (let i = 0; i < word_list.length; ++i) {
			if (ExpandWord(word_list[i])) {
				return true;
			}
		}

		return false;
	}

	/**
	 * DidChangeTextDocument event listener.
	 * The point where the extension checks
	 * for an expandable keyword and expands it if able.
	 * 
	 * Argument:
	 *     - event: vscode.TextDocumentChangeEvent
	 * Returns: None
	 */
	vscode.workspace.onDidChangeTextDocument((event) => {
		if (!extension_is_on) {
			return;
		}
		if (event.contentChanges.length === 0 || event.document !== vscode.window.activeTextEditor.document) {
			return;
		}
		const keywords = ["if", "for", "while"];
		ExpandWords(keywords);
		count += 1;
	})

	/**
	 * Plugin enabler command "goggy-expr-plugin.enable"
	 * with the name "Enable Expression Auto-completion".
	 * Can be called from the command pallete.
	 */
	const enable_command = vscode.commands.registerCommand("goggy-expr-plugin.enable", function () {
		if (extension_is_on) {
			return;
		}
		extension_is_on = true;
		vscode.window.showInformationMessage("Expression auto-completion enabled");
	});

	/**
	 * Plugin disabler command "goggy-expr-plugin.disable"
	 * with the name "Disable Expression Auto-completion".
	 * Can be called from the command pallete.
	 */
	const disable_command = vscode.commands.registerCommand("goggy-expr-plugin.disable", function () {
		if (!extension_is_on) {
			return;
		}
		extension_is_on = false;
		vscode.window.showInformationMessage("Expression auto-completion disabled");
	});

	/**
	 * Command "goggy-expr-plugin.toggle"
	 * with the name "Toggle Expression Auto-completion On/Off".
	 * Calls an appropriate command depending on whether
	 * the extension is enabled or disabled.
	 * Can be called by pressing Ctrl+Alt+E
	 * or from the command pallete.
	 */
	const toggle_command = vscode.commands.registerCommand("goggy-expr-plugin.toggle", function () {
		if (extension_is_on) {
			vscode.commands.executeCommand("goggy-expr-plugin.disable");
		} else {
			vscode.commands.executeCommand("goggy-expr-plugin.enable");
		}
	});

	context.subscriptions.push(enable_command);
	context.subscriptions.push(disable_command);
	context.subscriptions.push(toggle_command);
}

/**
 * Runs when the extension is deactivated.
 * 
 * Arguments: none
 * Returns: none
 */
function deactivate() {}

module.exports = {
	activate,
	deactivate
}
