<h1 align="center"><br><br><img alt="ember-changeset-hofs" src="assets/title.svg" width="350px"><br><br><br></h1>

`ember-changeset-hofs` provides higher-order validation functions for [`ember-changeset-validations`](https://github.com/DockYard/ember-changeset-validations).

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
validators. You can nest `and` and `or` expressions arbitrarily, and you can
mix sync and async validators however you [want](tests/unit/integration-test.js):

```js
const validationFn = and(
  and(
    and(...someValidators),
    or(...someMoreValidators),
    or(
      or(...someValidators),
      and(...someMoreValidators),
    )
  ),
  or(...evenMoreValidators)
)
```

## Install

```bash
$ ember install ember-changeset-hofs
```

## License

MIT

