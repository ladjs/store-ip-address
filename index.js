const Logger = require('@ladjs/logger');

class StoreIPAddress {
  constructor(config = {}) {
    this.config = Object.assign({ logger: new Logger() }, config);
    this.logger = this.config.logger;
    if (!(this.logger instanceof Logger))
      throw new Error('`config.logger` must be a Logger instance');
  }
  middleware(ctx, next) {
    // return early if the user is not authenticated
    // or if the user's last ip changed then don't do anything
    if (!ctx.isAuthenticated() || ctx.state.user.ip === ctx.req.ip)
      return next();

    // set the user's IP to the current one
    // make sure the IP's saved are unique
    ctx.state.user.ip = ctx.req.ip;
    ctx.state.user.last_ips.push(ctx.req.ip);
    ctx.state.user.last_ips = [...new Set(ctx.state.user.last_ips)];
    ctx.state.user
      .save()
      .then()
      .catch(this.logger.error);

    return next();
  }
}

module.exports = StoreIPAddress;
