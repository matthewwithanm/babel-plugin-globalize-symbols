globalize-symbols
=================

Transform `Symbol()` calls to add to the global Symbol registry.

_Disclaimer: This is an experiment._

Install
-------

```sh
npm install --save-dev babel-plugin-globalize-symbols
```

Usage
-------

Run:

```sh
babel --plugins globalize-symbols script.js
```

Or add the plugin to your `.babelrc` configuration:

```json
{
  "plugins": ["globalize-symbols"]
}
```

Example
-------

This plugin will transform the following code:

```js
const RED = Symbol('red');
```

into:

```js
const RED = Symbol.for('' + 'red' + '540ddd7da3ec634279bbff574b040782');
```

where the hash is unique to the module the symbol is defined in.

Why?
----

Symbols are really cool but when you use the `Symbol()` function to create them,
they have some issues:

* They can't [cross realms][1]
* They can't be [serialized and deserialized][2]
* Their modules can't be [reloaded][3]

To address this, we can use `Symbol.for()` to create and retrieve Symbols from a
global registry. Every time you call it with the same argument, you'll get the
same symbol. These symbols can be serialized (using `Symbol.keyFor`) and
deserialized (again, using `Symbol.for`). But it places the onus back on the
developer to guarantee uniqueness, which is a big part of the reason why we were
using Symbols in the first place!

The point of this plugin is to help you create unique Symbols that don't suffer
from the normal problems. To accomplish this, it transforms `Symbol()` calls
into `Symbol.for()` calls, but adds a hash to the key that it derives from the
package and module in which it's defined. That means `Symbol('red')` in
`pkg/a.js` will always be the same as `Symbol('red')` in `pkg/a.js`—regardless
of the frame that loaded it or how many times the module was reloaded—but will
never be the same as `Symbol('red')` in `other/a.js`.

Considerations
--------------

This project is an experiment and I'm still thinking about it. One drawback is
that it subtly changes the semantics of `Symbol()`, which might result in
surprising behavior. It might be better to encourage authors to always use
`Symbol.for()` with a free variable and use build time transforms to replace
that; for example `Symbol.for('red' + __MODULE_HASH__)`.


[1]: http://www.2ality.com/2014/12/es6-symbols.html
[2]: https://twitter.com/dan_abramov/status/626000941125386240
[3]: http://webpack.github.io/docs/hot-module-replacement.html
