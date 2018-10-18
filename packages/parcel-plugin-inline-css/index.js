const {join} = require('path');
const {readFile, writeFile} = require('fs').promises;

const matchAll = /<link rel="stylesheet" href="(.*?)">/g;
const matchOne = /<link rel="stylesheet" href="(.*?)">/;

module.exports = bundler => {
  bundler.on('bundled', async ({entryAsset, name}) => {
    if (entryAsset.type !== 'html' || process.env.NODE_ENV !== 'production')
      return;

    const input = await readFile(name, 'utf8');
    const links = input.match(matchAll);

    if (links === null) return;

    const files = await Promise.all(
      links
        .reverse()
        .map(link => link.replace(matchOne, '$1'))
        .map(path => readFile(join(name, '..', path), 'utf8'))
        .map(data => data.then(data => `<style>${data}</style>`))
    );

    await writeFile(name, input.replace(matchAll, () => files.pop()));
  });
};
