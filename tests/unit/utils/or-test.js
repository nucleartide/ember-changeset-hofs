
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

    it('should return the last error if all validators return errors', function() {
      const validators = [
        () => 'first error',
        () => 'second error',
        () => 'third error',
      ]

      const validationFn = or(...validators)
      assert.equal(validationFn(), 'third error')
    })

    it('should work with arbitrary nesting', function() {
      {
        const validators1 = [
          () => 'first error',
          () => 'second error',
          () => 'third error',
        ]

        const validators2 = [
          () => 'fourth error',
          () => 'fifth error',
          () => 'sixth error',
        ]

        const validators3 = [
          () => 'seventh error',
          () => 'eighth error',
          () => 'ninth error',
        ]

        const validationFn = or(
          or(
            or(...validators1),
            or(...validators2)
          ),
          or(...validators3)
        )

        assert.equal(validationFn(), 'ninth error')
      }

      {
        const validators1 = [
          () => 'first error',
          () => 'second error',
          () => 'third error',
        ]

        const validators2 = [
          () => 'fourth error',
          () => true, // derp
          () => 'sixth error',
        ]

        const validators3 = [
          () => 'seventh error',
          () => 'eighth error',
          () => 'ninth error',
        ]

        const validationFn = or(
          or(
            or(...validators1),
            or(...validators2)
          ),
          or(...validators3)
        )

        assert.equal(validationFn(), true)
      }
    })
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

    it('should return the last error if all validators return errors', async function() {
      const validators = [
        () => Ember.RSVP.resolve('first error'),
        () => Ember.RSVP.resolve('second error'),
        () => Ember.RSVP.resolve('third error'),
      ]

      const validationFn = or(...validators)
      assert.deepEqual(await validationFn(), 'third error')
    })

    it('should work with arbitrary nesting', async function() {
      {
        const validators1 = [
          () => Ember.RSVP.resolve('first error'),
          () => Ember.RSVP.resolve('second error'),
          () => Ember.RSVP.resolve('third error'),
        ]

        const validators2 = [
          () => Ember.RSVP.resolve('fourth error'),
          () => Ember.RSVP.resolve('fifth error'),
          () => Ember.RSVP.resolve('sixth error'),
        ]

        const validators3 = [
          () => Ember.RSVP.resolve('seventh error'),
          () => Ember.RSVP.resolve('eighth error'),
          () => Ember.RSVP.resolve('ninth error'),
        ]

        const validationFn = or(
          or(
            or(...validators1),
            or(...validators2)
          ),
          or(...validators3)
        )

        assert.equal(await validationFn(), 'ninth error')
      }

      {
        const validators1 = [
          () => Ember.RSVP.resolve('first error'),
          () => Ember.RSVP.resolve('second error'),
          () => Ember.RSVP.resolve('third error'),
        ]

        const validators2 = [
          () => Ember.RSVP.resolve('fourth error'),
          () => Ember.RSVP.resolve(true), // derp
          () => Ember.RSVP.resolve('sixth error'),
        ]

        const validators3 = [
          () => Ember.RSVP.resolve('seventh error'),
          () => Ember.RSVP.resolve('eighth error'),
          () => Ember.RSVP.resolve('ninth error'),
        ]

        const validationFn = or(
          or(
            or(...validators1),
            or(...validators2)
          ),
          or(...validators3)
        )

        assert.equal(await validationFn(), true)
      }
    })
  })
})

