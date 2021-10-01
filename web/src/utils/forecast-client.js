import { client } from './api-client';

function create(forecastData) {
  return client('beach', { body: forecastData });
}

function read() {
  return client('forecast');
}

export { create, read };
