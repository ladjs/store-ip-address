const test = require('ava');
const Logger = require('@ladjs/logger');
const mongoose = require('mongoose');

const StoreIPAddress = require('..');

const next = () => {};
const save = () => new Promise(resolve => resolve());

test('returns itself', t => {
  t.true(new StoreIPAddress() instanceof StoreIPAddress);
});

test('creates a plugin with schema', async t => {
  const schema = new mongoose.Schema();
  const storeIPAddress = new StoreIPAddress();
  schema.plugin(storeIPAddress.plugin);
  t.true(typeof schema.paths.ip === 'object');
  t.true(typeof schema.paths.last_ips === 'object');

  const User = mongoose.model('User', schema);
  const user = new User();
  user.ip = '2';
  user.last_ips = '3';
  await t.throwsAsync(async () => {
    await user.validate();
  });
});

test('sets a custom logger instance', t => {
  t.true(
    new StoreIPAddress({ logger: new Logger() }) instanceof StoreIPAddress
  );
});

test('returns early if user is not authenticated', t => {
  const ctx = {
    ip: 'a',
    isAuthenticated: () => false,
    state: { user: { save } }
  };
  const storeIPAddress = new StoreIPAddress();
  storeIPAddress.middleware(ctx, next);
  t.not(ctx.state.user.ip, 'a');
});

test("returns early if the user's last ip has not changed", t => {
  const ctx = {
    ip: 'a',
    isAuthenticated: () => true,
    state: { user: { ip: 'a', last_ips: [], save } }
  };
  const storeIPAddress = new StoreIPAddress();
  storeIPAddress.middleware(ctx, next);
  t.deepEqual(ctx.state.user.last_ips, []);
});

test('sets last_ips to an array if not defined', t => {
  const ctx = {
    ip: 'a',
    isAuthenticated: () => true,
    state: { user: { ip: undefined, last_ips: undefined, save } }
  };
  const storeIPAddress = new StoreIPAddress();
  storeIPAddress.middleware(ctx, next);
  t.is(ctx.state.user.ip, 'a');
  t.deepEqual(ctx.state.user.last_ips, ['a']);
});

test('sets user ip to current one', t => {
  const ctx = {
    ip: 'a',
    isAuthenticated: () => true,
    state: {
      user: {
        id: '1',
        last_ips: [],
        save
      }
    }
  };

  const storeIPAddress = new StoreIPAddress();
  storeIPAddress.middleware(ctx, next);
  t.is(ctx.state.user.ip, 'a');
  t.deepEqual(ctx.state.user.last_ips, ['a']);
});

test('stores two consecutive IP addresses', t => {
  const ctx = {
    ip: 'a',
    isAuthenticated: () => true,
    state: {
      user: {
        id: '1',
        last_ips: [],
        save
      }
    }
  };

  const storeIPAddress = new StoreIPAddress();
  storeIPAddress.middleware(ctx, next);
  ctx.ip = 'b';
  storeIPAddress.middleware(ctx, next);
  t.is(ctx.state.user.ip, 'b');
  t.deepEqual(ctx.state.user.last_ips, ['a', 'b']);
});

test('does not store duplicate IP addresses', t => {
  const ctx = {
    ip: 'a',
    isAuthenticated: () => true,
    state: {
      user: {
        id: '1',
        last_ips: [],
        save
      }
    }
  };

  const storeIPAddress = new StoreIPAddress();
  storeIPAddress.middleware(ctx, next);
  storeIPAddress.middleware(ctx, next);
  t.is(ctx.state.user.ip, 'a');
  t.deepEqual(ctx.state.user.last_ips, ['a']);
});
