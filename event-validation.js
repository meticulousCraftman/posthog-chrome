// import type from "component-type";
// import join from "join-component";
// import { assert } from "chai";

var type = require('component-type')
var join = require('join-component')
var assert = require('chai').assert
var Buffer = require('buffer/').Buffer

// PostHog messages can be a maximum of 32kb.
var MAX_SIZE = 32 << 10

module.exports = eventValidation

/**
 * Validate an event.
 */

function eventValidation(event, type) {
  validateGenericEvent(event)
  type = type || event.type
  assert(type, 'You must pass an event type.')
  switch (type) {
    case 'capture':
      return validateCaptureEvent(event)
    case 'identify':
      return validateIdentifyEvent(event)
    case 'alias':
      return validateAliasEvent(event)
    default:
      assert(0, 'Invalid event type: "' + type + '"')
  }
}

/**
 * Validate a "capture" event.
 */

function validateCaptureEvent(event) {
  assert(event.distinctId, 'You must pass a "distinctId".')
  assert(event.event, 'You must pass an "event".')
}

/**
 * Validate a "identify" event.
 */

function validateIdentifyEvent(event) {
  assert(event.distinctId, 'You must pass a "distinctId".')
}

/**
 * Validate an "alias" event.
 */

function validateAliasEvent(event) {
  assert(event.distinctId, 'You must pass a "distinctId".')
  assert(event.alias, 'You must pass a "alias".')
}

/**
 * Validation rules.
 */

var genericValidationRules = {
  event: 'string',
  properties: 'object',
  alias: 'string',
  timestamp: 'date',
  distinctId: 'string',
  type: 'string'
}

/**
 * Validate an event object.
 */

function validateGenericEvent(event) {
  assert(type(event) === 'object', 'You must pass a message object.')
  var json = JSON.stringify(event)
  // Strings are variable byte encoded, so json.length is not sufficient.
  assert(Buffer.byteLength(json, 'utf8') < MAX_SIZE, 'Your message must be < 32kb.')

  for (var key in genericValidationRules) {
    var val = event[key]
    if (!val) continue
    var rule = genericValidationRules[key]
    if (type(rule) !== 'array') {
      rule = [rule]
    }
    var a = rule[0] === 'object' ? 'an' : 'a'
    assert(
      rule.some(function (e) { return type(val) === e }),
      '"' + key + '" must be ' + a + ' ' + join(rule, 'or') + '.'
    )
  }
}
