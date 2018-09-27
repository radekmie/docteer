module.exports = () => ({
  visitor: {
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
      path.skip();
    }
  }
});
