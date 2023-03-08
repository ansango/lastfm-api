# lastfm-client-ts

[![NPM Version](https://img.shields.io/npm/v/lastfm-client-ts.svg?branch=main)](https://www.npmjs.com/package/lastfm-client-ts)
[![Downloads Per Week](https://img.shields.io/npm/dw/lastfm-client-ts.svg?color=blue)](https://www.npmjs.com/package/lastfm-client-ts)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

## Table of Contents

- [lastfm-client-ts](#lastfm-client-ts)
  - [Table of Contents](#table-of-contents)
  - [About ](#about-)
  - [Getting Started ](#getting-started-)
    - [Installing](#installing)
    - [Usage](#usage)
    - [Environment Variables](#environment-variables)

## About <a name = "about"></a>

Last.fm API client for Node.js

## Getting Started <a name = "getting_started"></a>

### Installing

```bash
npm install lastfm-client-ts
```

### Usage

```typescript
import { lastFmClient } from "lastfm-client-ts";

const {
  userApiMethods,
  albumApiMethods,
  artistApiMethods,
  chartApiMethods,
  geoApiMethods,
  libraryApiMethods,
  tagApiMethods,
  trackApiMethods,
} = lastFmClient();

export default async function handler() {
  const response = userApiMethods.getInfo({
    user: "ansango",
  });
  return {
    response,
  };
}
```

### Environment Variables

To run this project, you will need to add the following environment variables to your .env file

- `LASTFM_API_BASE_URL=http://ws.audioscrobbler.com/2.0/`
- `LASTFM_USER=`
- `LASTFM_API_KEY=`
- `LASTFM_APPNAME=`
