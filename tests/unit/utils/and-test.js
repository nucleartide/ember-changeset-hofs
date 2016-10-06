
import { assert } from 'chai'
import { describe, it } from 'mocha'
import and from 'ember-changeset-hofs/utils/and'
import Ember from 'ember'

/**
 * @param {Number} ms
 */
function resolveAfter(ms) {
  return new Ember.RSVP.Promise((resolve, reject) => {
    try {
      Ember.run.later(resolve, true, ms)
    } catch (err) {
      reject(err)
    }
  })
}

/**
 * Note: ember-changeset treats anything that isn't the
 * value `true` as a failed alidation.
 *
 * @param {Number} ms
 * @param {String} errorMessage
 */
function rejectAfter(ms, errorMessage) {
  return new Ember.RSVP.Promise((resolve, reject) => {
    try {
      Ember.run.later(resolve, errorMessage, ms)
    } catch (err) {
      reject(err)
    }
  })
}

describe('and', function() {
  describe('sync validators', function() {
    it('should work with an argument list', function() {
      const testCases = [
        {
          validators: [() => true, () => 'this is an error message'],
          expected: 'this is an error message',
        },
        {
          validators: [() => true, () => false],
          expected: false
        },
        {
          validators: [() => true, () => true],
          expected: true
        },
      ]

      for (const { validators, expected } of testCases) {
        const validationFn = and(...validators)
        assert.equal(validationFn(), expected)
      }
    })

    it('should short-circuit', function() {
      const didExecute = [false, false, false]
      const validators = [
        () => didExecute[0] = true,
        () => false,
        () => { throw new Error('This validator should not be reached.') },
      ]
      const validationFn = and(...validators)
      validationFn()
      assert.deepEqual(didExecute, [true, false, false])
    })

    it('should work with an array of arguments')
  })

  describe('async validators', function() {
    it('should work with an argument list', async function() {
      const testCases = [
        {
          validators: [() => resolveAfter(1), () => resolveAfter(2), () => resolveAfter(3)],
          expected: true,
        },
        {
          validators: [() => resolveAfter(1), () => true, () => resolveAfter(3)],
          expected: true,
        },
        {
          validators: [() => resolveAfter(1), () => true, () => rejectAfter(3, 'rip')],
          expected: 'rip',
        },
      ]

      for (const { validators, expected } of testCases) {
        const validationFn = and(...validators)
        const result = await validationFn()
        assert.equal(result, expected)
      }
    })

    it('should short-circuit', async function() {
      const didExecute = [false, false, false]
      const validators = [
        () => resolveAfter(1).then(() => didExecute[0] = true),
        () => resolveAfter(1).then(() => false),
        () => resolveAfter(1).then(() => { throw new Error('This validator should not be reached.') }),
      ]
      const validationFn = and(...validators)
      await validationFn()
      assert.deepEqual(didExecute, [true, false, false])
    })

    it('should work with an array of arguments')
  })
})
