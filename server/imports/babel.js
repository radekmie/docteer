module.exports = function transform() {
  return {
    visitor: {
      // Transforms:
      //   import {a} from 'x';
      //   import {b} from 'x';
      //   import type {c} from 'x';
      // To:
      //   import {a, b} from 'x';
      ImportDeclaration(path, {file}) {
        if (path.node.importKind === 'type') {
          path.remove();
          return;
        }

        const source = path.node.source.value;

        if (file.importsReducer.has(source)) {
          const prev = file.importsReducer.get(source);

          prev.node.specifiers.push(...path.node.specifiers);
          path.remove();
        } else {
          file.importsReducer.set(source, path);
        }
      },

      // Transforms:
      //   <p data-test-x="1" />
      // To:
      //   <p />
      JSXAttribute(path) {
        if (
          path.node.name.type === 'JSXIdentifier' &&
          path.node.name.name.startsWith('data-test')
        )
          path.remove();
      },

      // Reset before each file.
      Program(path, {file}) {
        file.importsReducer = new Map();
      }
    }
  };
};
