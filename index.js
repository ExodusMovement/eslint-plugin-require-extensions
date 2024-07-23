const { existsSync, lstatSync } = require('fs');
const { join, dirname, resolve, posix, extname, basename } = require('path');

module.exports = {
    configs: {
        recommended: {
            plugins: ['require-extensions'],
            rules: {
                'require-extensions/require-extensions': 'error',
                'require-extensions/require-index': 'error',
            },
        },
    },
    rules: {
        'require-extensions': rule((context, node, path) => {
            const ext = extname(context.getFilename());

            if (!existsSync(path) || existsSync(`${path}${ext}`)) {
                let fix;
                if (!node.source.value.includes('?')) {
                    fix = (fixer) => {
                        return fixer.replaceText(node.source, `'${node.source.value}.js'`);
                    };
                }

                context.report({
                    node,
                    message: 'Relative imports and exports must end with .js',
                    fix,
                });
            }
        }),
        'require-index': rule((context, node, path) => {
            const fileExt = extname(context.getFilename());
            const conflictingFile = join(dirname(path), `${basename(path)}${fileExt}`);

            if (existsSync(path) && lstatSync(path).isDirectory() && !existsSync(conflictingFile)) {
                context.report({
                    node,
                    message: 'Directory paths must end with index.js',
                    fix(fixer) {
                        const { value: source } = node.source;

                        const prefix = source.startsWith('./') || source === '.' ? './' : '';
                        return fixer.replaceText(node.source, `'${prefix}${posix.join(source, 'index.js')}'`);
                    },
                });
            }
        }),
    },
};

function rule(check) {
    return {
        meta: {
            fixable: true,
        },
        create(context) {
            function rule(node) {
                const source = node.source;
                if (!source) return;
                const value = source.value.replace(/\?.*$/, '');
                if (!value || !value.startsWith('.') || value.endsWith('.js')) return;

                check(context, node, resolve(dirname(context.getFilename()), value));
            }

            return {
                DeclareExportDeclaration: rule,
                DeclareExportAllDeclaration: rule,
                ExportAllDeclaration: rule,
                ExportNamedDeclaration: rule,
                ImportDeclaration: rule,
            };
        },
    };
}
