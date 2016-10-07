
import { assert } from 'chai'
import { describe, it } from 'mocha'
import and from 'ember-changeset-hofs/utils/and'
import or from 'ember-changeset-hofs/utils/or'
import Ember from 'ember'

describe('integration', function() {
  it('should work with anything', async function() {
    const validators1 = [
      () => 'first error',
      () => Ember.RSVP.resolve('second error'),
      () => 'third error',
    ]

    const validators2 = [
      () => false,
      () => 'fifth error',
      () => Ember.RSVP.reject('sixth error'),
    ]

    const validators3 = [
      () => 'seventh error',
      () => true,
      () => 'ninth error',
    ]

    const validationFn = and(
      and( // 'first error'
        and(...validators1), // 'first error'
        or(...validators2),
        or(
          or(...validators1),
          and(...validators2),
        )
      ),
      or(...validators3) // true
    )

    assert.equal(await validationFn(), 'first error')
  })
})

