module.exports = function transform() {
  const seen = new Map();

  return {
    visitor: {
      // Transforms:
      //   import {a} from 'x';
      //   import {b} from 'x';
      //   import type {c} from 'x';
      // To:
      //   import {a, b} from 'x';
      ImportDeclaration(path) {
        if (path.node.importKind === 'type') {
          path.remove();
          return;
        }

        const file = path.node.source.value;

        if (seen.has(file)) {
          const prev = seen.get(file);

          path.node.specifiers.push(...prev.node.specifiers);
          prev.remove();
        }

        seen.set(file, path);
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
      Program() {
        seen.clear();
      }
    }
  };
};
