import assert from 'yeoman-assert';
import helpers from 'yeoman-test';
import NewProjectGenerator from '../src';

describe('default', () => {
	it('vsx-project', async () => { // {{{
		const context = helpers.create(NewProjectGenerator);

		const cwd: string = await new Promise((resolve) => {
			void context.inTmpDir(resolve);
		});

		void context.withOptions({
			cwd,
		});

		void context.withPrompts({
			name: 'my-vsx-project',
			component: 'vsx',
			test: false,
			editor: false,
		});

		await context.run();

		assert.file([
			'my-vsx-project/.git',
			'my-vsx-project/package.json',
			'my-vsx-project/src/extension.ts',
			'my-vsx-project/node_modules',
			'my-vsx-project/package-lock.json',
		]);

		assert.jsonFileContent('my-vsx-project/package.json', {
			name: 'my-vsx-project',
		});
	}); // }}}
});
