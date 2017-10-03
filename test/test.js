const test = require('ava');
const Logger = require('@ladjs/logger');

const StoreIPAddress = require('../');

const next = () => {};
const save = () => new Promise(resolve => resolve());

test('returns itself', t => {
  t.true(new StoreIPAddress() instanceof StoreIPAddress);
});

test('sets a custom logger instance', t => {
  t.true(
    new StoreIPAddress({ logger: new Logger() }) instanceof StoreIPAddress
  );
});

test('returns early if user is not authenticated', t => {
  const ctx = {
    req: { ip: 'a' },
    isAuthenticated: () => false,
    state: { user: {} }
  };
  const storeIPAddress = new StoreIPAddress();
  storeIPAddress.middleware(ctx, next);
  t.not(ctx.state.user.ip, 'a');
});

test("returns early if the user's last ip has not changed", t => {
  const ctx = {
    req: { ip: 'a' },
    isAuthenticated: () => true,
    state: { user: { ip: 'a', last_ips: [] } }
  };
  const storeIPAddress = new StoreIPAddress();
  storeIPAddress.middleware(ctx, next);
  t.deepEqual(ctx.state.user.last_ips, []);
});

test('sets user ip to current one', t => {
  const ctx = {
    req: { ip: 'a' },
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
    req: { ip: 'a' },
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
  ctx.req.ip = 'b';
  storeIPAddress.middleware(ctx, next);
  t.is(ctx.state.user.ip, 'b');
  t.deepEqual(ctx.state.user.last_ips, ['a', 'b']);
});

test('does not store duplicate IP addresses', t => {
  const ctx = {
    req: { ip: 'a' },
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

test('does not save private address in production', t => {
  // momentarily change environment
  process.env.NODE_ENV = 'production';
  const ctx = {
    req: { ip: '10.0.0.0' },
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
  t.deepEqual(ctx.state.user.last_ips, []);
  // set environment back to 'test'
  process.env.NODE_ENV = 'test';
});

test('saves private address when not in production', t => {
  const ctx = {
    req: { ip: '10.0.0.0' },
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
  t.deepEqual(ctx.state.user.last_ips, ['10.0.0.0']);
});
