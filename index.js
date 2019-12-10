const validator = require('validator');
const debug = require('debug')('@ladjs/store-ip-address');

class StoreIPAddress {
  constructor(config = {}) {
    this.config = { logger: console, ip: 'ip', lastIps: 'last_ips', ...config };
    this.plugin = this.plugin.bind(this);
    this.middleware = this.middleware.bind(this);
  }

  plugin(schema) {
    const obj = {};
    obj[this.config.ip] = {
      type: String,
      trim: true,
      validate: val => validator.isIP(val)
    };
    obj[this.config.lastIps] = [
      {
        type: String,
        trim: true,
        validate: val => validator.isIP(val)
      }
    ];
    schema.add(obj);
    return schema;
  }

  async middleware(ctx, next) {
    // return early if the user is not authenticated
    // or if the user's last ip changed then don't do anything
    if (
      typeof ctx.state.user !== 'object' ||
      typeof ctx.state.user.save !== 'function' ||
      typeof ctx.isAuthenticated !== 'function' ||
      !ctx.isAuthenticated() ||
      ctx.state.user.ip === ctx.ip
    )
      return next();

    // set the user's IP to the current one
    // make sure the IP's saved are unique
    debug(`storing IP of ${ctx.ip} for user ${ctx.state.user.id}`);
    ctx.state.user[this.config.ip] = ctx.ip;
    if (Array.isArray(ctx.state.user[this.config.lastIps])) {
      ctx.state.user[this.config.lastIps].push(ctx.ip);
      ctx.state.user[this.config.lastIps] = [
        ...new Set(ctx.state.user.last_ips)
      ];
    } else {
      ctx.state.user[this.config.lastIps] = [ctx.ip];
    }

    ctx.state.user = await ctx.state.user.save();

    return next();
  }
}

module.exports = StoreIPAddress;
