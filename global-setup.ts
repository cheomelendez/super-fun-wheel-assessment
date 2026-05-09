import * as dotenv from 'dotenv';
import path from 'path';
import { FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  const envName = process.env.NODE_ENV || 'localhost';

  dotenv.config({
    path: path.resolve(__dirname, `./utils/env-files/env.${envName}`),
    override: true,
  });
}

export default globalSetup;
