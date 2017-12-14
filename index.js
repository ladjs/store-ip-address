const autoBind = require('auto-bind');
const debug = require('debug')('@ladjs/store-ip-address');

class StoreIPAddress {
  constructor(config = {}) {
    autoBind(this);

    this.config = Object.assign({ logger: console }, config);
  }
  middleware(ctx, next) {
    // return early if the user is not authenticated
    // or if the user's last ip changed then don't do anything
    if (!ctx.isAuthenticated() || ctx.state.user.ip === ctx.ip) return next();

    // set the user's IP to the current one
    // make sure the IP's saved are unique
    debug(`storing IP of ${ctx.ip} for user ${ctx.state.user.id}`);
    ctx.state.user.ip = ctx.ip;
    ctx.state.user.last_ips.push(ctx.ip);
    ctx.state.user.last_ips = [...new Set(ctx.state.user.last_ips)];
    ctx.state.user
      .save()
      .then()
      .catch(this.config.logger.error);

    return next();
  }
}

module.exports = StoreIPAddress;
