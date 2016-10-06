
# ember-changeset-hofs

> Higher-order validation functions for
> [ember-changeset-validations](https://github.com/DockYard/ember-changeset-validations).

For background info, please see the thread [here](https://github.com/DockYard/ember-changeset-validations/issues/97).

This addon provides `and` and `or` higher-order functions, that allow you to
*compose* together validations. It is useful if you want the short-circuit
behavior of `&&` and `||`. For example:

```js
// app/validations/user.js
import and from 'ember-changeset-hofs/utils/and'
import or from 'ember-changeset-hofs/utils/or'

export const {
  email: and(
    validateFormat({ type: 'email' }),
    askServerIfExists(), // will not get called if validateFormat fails
  ),

  anotherEmail: or(
    isUndefinedOrNull(),
    askServerIfExists(), // will not get called if isUndefinedOrNull succeeds
  ),
}
```

Note that the `and` and `or` utils work with both synchronous and asynchronous
validators.

## Install

```bash
$ ember install ember-changeset-hofs
```

## License

MIT

