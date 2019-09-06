# [**@ladjs/store-ip-address**](https://github.com/ladjs/store-ip-address)

[![build status](https://img.shields.io/travis/ladjs/store-ip-address.svg)](https://travis-ci.org/ladjs/store-ip-address)
[![code coverage](https://img.shields.io/codecov/c/github/ladjs/store-ip-address.svg)](https://codecov.io/gh/ladjs/store-ip-address)
[![code style](https://img.shields.io/badge/code_style-XO-5ed9c7.svg)](https://github.com/sindresorhus/xo)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
[![made with lass](https://img.shields.io/badge/made_with-lass-95CC28.svg)](https://lass.js.org)
[![license](https://img.shields.io/github/license/ladjs/store-ip-address.svg)](<>)

> Stores user's IP address in the background for Lad


## Table of Contents

* [Install](#install)
* [Usage](#usage)
* [Contributors](#contributors)
* [License](#license)


## Install

[npm][]:

```sh
npm install @ladjs/store-ip-address
```

[yarn][]:

```sh
yarn add @ladjs/store-ip-address
```


## Usage

> With standard [logger][]:

App:

```js
const StoreIPAddress = require('@ladjs/store-ip-address');

// ...

const storeIPAddress = new StoreIPAddress();
app.use(storeIPAddress.middleware);
```

Mongoose user model:

```js
const storeIPAddress = new StoreIPAddress();
User.plugin(storeIPAddress.plugin);
```

> With custom [logger][] instance:

App:

```js
const StoreIPAddress = require('@ladjs/store-ip-address');
const Logger = require('@ladjs/logger');

// ...

const storeIPAddress = new StoreIPAddress({ logger: new Logger() });
app.use(storeIPAddress.middleware);
```

> With custom fields to store on user model instead of `ip` and `last_ips`:

App:

```js
const StoreIPAddress = require('@ladjs/store-ip-address');
const Logger = require('@ladjs/logger');

// ...

const storeIPAddress = new StoreIPAddress({
  ip: 'ip_address',
  lastIps: 'last_ip_addresses'
});

app.use(storeIPAddress.middleware);
```

Mongoose user model:

```js
const storeIPAddress = new StoreIPAddress({
  ip: 'ip_address',
  lastIps: 'last_ip_addresses'
});

User.plugin(storeIPAddress.plugin);
```


## Contributors

| Name           | Website                    |
| -------------- | -------------------------- |
| **Nick Baugh** | <http://niftylettuce.com/> |


## License

[MIT](LICENSE) © [Nick Baugh](http://niftylettuce.com/)


## 

[npm]: https://www.npmjs.com/

[yarn]: https://yarnpkg.com/

[logger]: https://github.com/ladjs/logger
