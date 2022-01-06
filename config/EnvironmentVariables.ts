import dotenv from 'dotenv';

const results = dotenv.config();

/*
If there is an error key in results, loading the .env file failed.
That means the app is in a production environment, so the necessary environment variables
should already be present in process.env (via Heroku config vars)
*/
let envs: any;
if (!('error' in results)) {
  envs = results.parsed;
} else {
  envs = {};
  Object.keys(process.env).forEach((key) => {
    envs[key] = process.env[key];
  });
}

const EnvironmentVariables = envs;

export default EnvironmentVariables;
