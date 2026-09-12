import axios from 'axios';

const client = axios.create({
  // all API calls proxied through Nginx at /api/
  baseURL: 'https://trapnet.sayantanmandal.is-a.dev/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default client;
