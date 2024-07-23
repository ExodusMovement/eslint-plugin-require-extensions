const { describe, it } = require('node:test');
const path = require('node:path');
const { RuleTester } = require('eslint');
const { rules } = require('../index');

const ruleTester = new RuleTester({ parserOptions: { ecmaVersion: 2020, sourceType: 'module' } });
const filename = path.join(path.dirname(__dirname), 'example/index.js');

global.describe = describe;
global.it = it;

describe('eslint-plugin-require-extensions', () => {
    ruleTester.run('require-extensions', rules['require-extensions'], {
        valid: [
            {
                name: 'import with extension',
                code: "import test from './dir/index.js'",
                filename,
            },
            {
                name: 'package import',
                code: "import batcave from '@wayne/foundation'",
                filename,
            },
        ],
        invalid: [
            {
                name: 'import without extension',
                code: "import test from './dir/index'",
                output: "import test from './dir/index.js'",
                errors: ['Relative imports and exports must end with .js'],
                filename,
            },
            {
                name: 'file with sibling folder of same name',
                code: "import arkham from './arkham'",
                output: "import arkham from './arkham.js'",
                errors: ['Relative imports and exports must end with .js'],
                filename,
            },
            {
                name: 'typescript file with sibling folder of same name',
                code: "import batcave from './batcave'",
                output: "import batcave from './batcave.js'",
                errors: ['Relative imports and exports must end with .js'],
                filename: path.join(path.dirname(__dirname), 'example/index.ts'),
            },
        ],
    });

    ruleTester.run('require-index', rules['require-index'], {
        valid: [
            {
                name: 'import from index.js',
                code: "import test from './dir/index.js'",
                filename,
            },
            {
                name: 'package import',
                code: "import batcave from '@wayne/foundation'",
                filename,
            },
            {
                name: 'bail on import from file with sibling folder of same name',
                code: "import arkham from './arkham'",
                filename,
            },
        ],
        invalid: [
            {
                name: 'import without index',
                code: "import './dir'",
                output: "import './dir/index.js'",
                errors: ['Directory paths must end with index.js'],
                filename,
            },
            {
                name: 'export * without index',
                code: "export * from './dir'",
                output: "export * from './dir/index.js'",
                errors: ['Directory paths must end with index.js'],
                filename,
            },
            {
                name: 'export named without index',
                code: "export { joker } from './dir'",
                output: "export { joker } from './dir/index.js'",
                errors: ['Directory paths must end with index.js'],
                filename,
            },
            {
                name: "import from '../'",
                code: "import plugin from '../'",
                output: "import plugin from '../index.js'",
                errors: ['Directory paths must end with index.js'],
                filename,
            },
            {
                name: "import from '..'",
                code: "import plugin from '..'",
                output: "import plugin from '../index.js'",
                errors: ['Directory paths must end with index.js'],
                filename,
            },
            {
                name: "import from './'",
                code: "import index from './'",
                output: "import index from './index.js'",
                errors: ['Directory paths must end with index.js'],
                filename: path.join(path.dirname(__dirname), 'example/other.js'),
            },
            {
                name: "import from '.'",
                code: "import index from '.'",
                output: "import index from './index.js'",
                errors: ['Directory paths must end with index.js'],
                filename: path.join(path.dirname(__dirname), 'example/other.js'),
            },
            {
                name: 'named import without index',
                code: "import { batmobile } from './dir'",
                output: "import { batmobile } from './dir/index.js'",
                errors: ['Directory paths must end with index.js'],
                filename,
            },
            {
                name: 'default import without index',
                code: "import batmobile from './dir'",
                output: "import batmobile from './dir/index.js'",
                errors: ['Directory paths must end with index.js'],
                filename,
            },
        ],
    });
});
