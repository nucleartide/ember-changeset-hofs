
import { assert } from 'chai'
import { describe, it } from 'mocha'
import or from 'ember-changeset-hofs/utils/or'
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

describe('or', function() {
  describe('sync validators', function() {
    it('should work with an argument list', function() {
      const testCases = [
        {
          validators: [() => true, () => 'this is an error message'],
          expected: true
        },
        {
          validators: [() => true, () => false],
          expected: true
        },
        {
          validators: [() => true, () => true],
          expected: true
        },
      ]

      for (const { validators, expected } of testCases) {
        const validationFn = or(...validators)
        assert.equal(validationFn(), expected)
      }
    })

    it('should short-circuit', function() {
      const didExecute = [false, false, false]
      const validators = [
        () => { didExecute[0] = true; return false },
        () => true,
        () => { throw new Error('This validator should not be reached.') },
      ]
      const validationFn = or(...validators)
      validationFn()
      assert.deepEqual(didExecute, [true, false, false])
    })

    it('should work with an array of arguments')
  })

  describe('async validators', function() {
    it('should work with an argument list', async function() {
      const testCases = [
        {
          validators: [
            () => rejectAfter(1, 'first'),
            () => rejectAfter(2, 'second'),
            () => rejectAfter(3, 'third')
          ],
          expected: 'third',
        },
        {
          validators: [() => rejectAfter(1), () => true, () => rejectAfter(3)],
          expected: true,
        },
        {
          validators: [() => true, () => resolveAfter(3, 'rip')],
          expected: true,
        },
      ]

      for (const { validators, expected } of testCases) {
        const validationFn = or(...validators)
        const result = await validationFn()
        assert.equal(result, expected)
      }
    })

    it('should short-circuit', async function() {
      const didExecute = [false, false, false]
      const validators = [
        () => rejectAfter(1, 'first').then(() => { didExecute[0] = true; return false }),
        () => rejectAfter(1, 'second').then(() => true),
        () => rejectAfter(1, 'third').then(() => { throw new Error('This validator should not be reached.') }),
      ]
      const validationFn = or(...validators)
      await validationFn()
      assert.deepEqual(didExecute, [true, false, false])
    })

    it('should work with an array of arguments')
  })
})

