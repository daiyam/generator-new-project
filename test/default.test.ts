import path from 'node:path';
import assert from 'yeoman-assert';
import helpers from 'yeoman-test';

describe('default', () => {
	it('vsx-project', async () => { // {{{
		await helpers
			.run(path.join(import.meta.dirname, '..', '..'))
			.withPrompts({
				name: 'my-vsx-project',
				component: 'vsx',
				bundler: 'webpack',
				test: false,
				editor: false,
			});

		assert.file([
			'my-vsx-project/.git',
			'my-vsx-project/package.json',
			'my-vsx-project/src/extension.ts',
			'my-vsx-project/node_modules',
			'my-vsx-project/package-lock.json',
			'my-vsx-project/webpack.config.js',
		]);

		assert.jsonFileContent('my-vsx-project/package.json', {
			name: 'my-vsx-project',
		});
	}); // }}}
});
