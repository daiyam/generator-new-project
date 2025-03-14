import path from 'node:path';
import process from 'node:process';
import Generator, { type BaseOptions, type PromptQuestions } from 'yeoman-generator';

type Answers = {
	cwd: string;
	author?: boolean;
	bundler?: string;
	component: string;
	editor?: boolean;
	language: string;
	manager: string;
	name: string;
	test: boolean;
	remove?: boolean;
};

const EDITOR = process.env.EDITOR;

export default class NewProjectGenerator extends Generator<BaseOptions & Answers> {
	private readonly artifacts = ['@daiyam/lang-js'];
	private answers?: Answers;

	constructor(args, options: BaseOptions & Answers) { // {{{
		super(args, options);

		this.option('cwd', {
			type: String,
			description: 'generate project to <cwd>',
		});
	} // }}}

	public async prompting() { // {{{
		const response1 = await this.prompt<{ cwd: string; name: string; component: string }>([
			{
				type: 'input',
				name: 'cwd',
				message: 'Where to?',
				default: this.options.cwd ?? '',
			},
			{
				type: 'input',
				name: 'name',
				required: true,
				message: 'What is the name of the project?',
			},
			{
				type: 'list',
				name: 'component',
				message: 'Pick the type of the project',
				choices: ['npm', 'vsx', 'skip'],
			},
		]);

		if(response1.component === 'npm') {
			const question2: PromptQuestions<{ test: boolean; editor: boolean | undefined }> = [
				{
					type: 'confirm',
					name: 'test',
					message: 'Add unit testing?',
				},
			];

			if(EDITOR) {
				question2.push({
					type: 'confirm',
					name: 'editor',
					message: 'Open editor?',
				});
			}

			const response2 = await this.prompt(question2);

			this.answers = {
				...response1,
				...response2,
				language: 'typescript',
				author: true,
				manager: 'npm',
			};
		}
		else if(response1.component === 'vsx') {
			const question2: PromptQuestions<{ test: boolean; bundler: string; editor: boolean | undefined }> = [
				{
					type: 'confirm',
					name: 'test',
					message: 'Add unit testing?',
				},
				{
					type: 'list',
					name: 'bundler',
					message: 'Pick the bundler to use',
					choices: ['skip', 'ncc', 'webpack'],
				},
			];

			if(EDITOR) {
				question2.push({
					type: 'confirm',
					name: 'editor',
					message: 'Open editor?',
				});
			}

			const response2 = await this.prompt(question2);

			this.answers = {
				...response1,
				...response2,
				language: 'typescript',
				author: true,
				manager: 'npm',
			};
		}
		else {
			const question2: PromptQuestions<{ language: string; test: boolean; manager: string; editor: boolean | undefined }> = [
				{
					type: 'list',
					name: 'language',
					message: 'Pick the language',
					choices: ['typescript', 'skip'],
				},
				{
					type: 'confirm',
					name: 'test',
					message: 'Add unit testing?',
				},
				{
					type: 'list',
					name: 'manager',
					message: 'Pick the package manager',
					choices: ['npm', 'yarn'],
				},
			];

			if(EDITOR) {
				question2.push({
					type: 'confirm',
					name: 'editor',
					message: 'Open editor?',
				});
			}

			const response2 = await this.prompt(question2);

			this.answers = { ...response1, ...response2 };
		}

		const root = path.join(this.answers.cwd, this.answers.name);

		if(this.fs.exists(root)) {
			const response3 = await this.prompt({
				type: 'confirm',
				name: 'remove',
				message: 'The project is already existing. Should it be trashed?',
			});

			this.answers = { ...this.answers, ...response3 };
		}
	} // }}}

	public configuring() { // {{{
		const root = path.join(this.answers!.cwd, this.answers!.name);

		this.destinationRoot(root);

		if(this.answers!.language === 'typescript') {
			this.artifacts.push('@daiyam/lang-ts');

			if(this.answers!.component === 'npm') {
				this.artifacts.push('@daiyam/npm-ts');

				if(this.answers!.author) {
					this.artifacts.push('@daiyam/npm-daiyam');
				}

				if(this.answers!.test) {
					this.artifacts.push('@daiyam/test-mocha-ts');
				}
			}
			else if(this.answers!.component === 'vsx') {
				this.artifacts.push('@daiyam/vsx-ts');

				if(this.answers!.author) {
					this.artifacts.push('@daiyam/vsx-zokugun');
				}

				if(this.answers!.bundler === 'ncc') {
					this.artifacts.push('@daiyam/vsx-bundle-ncc');
				}
				else if(this.answers!.bundler === 'webpack') {
					this.artifacts.push('@daiyam/vsx-bundle-webpack');
				}

				if(this.answers!.test) {
					this.artifacts.push('@daiyam/test-mocha-ts');
				}
			}
		}
	} // }}}

	public async writing() { // {{{
		this._writingPackage();
	} // }}}

	public async install() { // {{{
		await this._installGit();

		await this._installArtifacts();

		await this._installManager();
	} // }}}

	public end() { // {{{
		if(this.answers!.editor) {
			void this.spawnCommand(EDITOR!, ['.']);
		}
	} // }}}

	private async _installArtifacts() { // {{{
		await this.spawnCommand('artifact', ['add', ...this.artifacts]);
	} // }}}

	private async _installGit() { // {{{
		await this.spawnCommand('git', ['init', '--quiet']);
	} // }}}

	private async _installManager() { // {{{
		if(this.answers!.manager === 'yarn') {
			await this.spawnCommand('yarn', ['install', '--silent']);
		}
		else {
			await this.spawnCommand('npm', ['install', '--silent']);
		}
	} // }}}

	private _writingPackage() { // {{{
		if(!this.existsDestination('package.json')) {
			this.writeDestinationJSON('package.json', {
				name: this.answers!.name,
				version: '0.0.0',
				description: '',
				author: '',
				license: 'MIT',
				homepage: '',
				repository: '',
				bugs: '',
				main: 'index.js',
				scripts: {},
				keywords: [],
			}, undefined, '\t');
		}
	} // }}}
}
