# PostCSS Pseudo Companion Classes [![NPM version][npm-img]][npm] [![Tests][tests-img]][tests] [![Code Coverage][codecov-img]][codecov]

[npm-img]: https://img.shields.io/npm/v/postcss-pseudo-companion-classes.svg
[npm]: https://www.npmjs.com/package/postcss-pseudo-companion-classes
[tests-img]: https://github.com/michaeldfoley/postcss-pseudo-companion-classes/workflows/tests/badge.svg
[tests]:https://github.com/michaeldfoley/postcss-pseudo-companion-classes/actions/workflows/test.yml
[codecov-img]: https://codecov.io/gh/michaeldfoley/postcss-pseudo-companion-classes/branch/main/graph/badge.svg
[codecov]: https://codecov.io/gh/michaeldfoley/postcss-pseudo-companion-classes

[PostCSS] plugin to add companion classes to pseudo-classes for testing purposes. This allows you to add the class name to force the styling of a pseudo-class,
which can be helpful for visual QA and building sticker sheets of all style states.
### Input

```css
.some-selector:hover {
  text-decoration: underline;
}
```
### Output

```css
.some-selector:hover,
.some-selector.\:hover {
  text-decoration: underline;
}
```

[PostCSS]: https://github.com/postcss/postcss

## Credits
This plugin is a fork of [postcss-pseudo-classes](https://github.com/giuseppeg/postcss-pseudo-classes) and adds support for css modules.

## Usage

**Step 1:** Install plugin:

```sh
npm install --save-dev postcss postcss-pseudo-companion-classes
```
or

```sh
yarn add --dev postcss postcss-pseudo-companion-classes
```

**Step 2:** Check you project for existed PostCSS config: `postcss.config.js`
in the project root, `"postcss"` section in `package.json`
or `postcss` in bundle config.

If you do not use PostCSS, add it according to [official docs]
and set this plugin in settings.

**Step 3:** Add the plugin to plugins list:

```diff
module.exports = {
  plugins: [
+   require('postcss-pseudo-companion-classes'),
    require('autoprefixer')
  ]
}
```

[official docs]: https://github.com/postcss/postcss#usage

## Options
| Property | Description | Default Value |
| --- | --- | --- |
| `exclude` | An array of pseudo-classes to skip when generating companion classes | `[':before', ':after']` |
| `restrictTo` | Limit the companion classes to an array of pseudo-classes | |
| `allCombinations` | When multiple pseudo-classes are present (ie `.selector:hover:focus`), output classes for each combination <br><br> <pre lang="css"><code>.selector:hover:focus,&#13;.selector:hover.\\:focus,&#13;.selector.\\:hover:focus,&#13;.selector.\\:hover.\\:focus</code></pre> | `false` |
| `isModule` | Wrap companion classes in `:global()` to prevent them from being renamed when CSS modules are being used | `false`
| `prefix` | The prefix for the companion class | `\\:` |


