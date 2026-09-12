import axios from 'axios';

const client = axios.create({
  // production backend with HTTPS
  baseURL: 'https://trapnet.sayantanmandal.is-a.dev:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default client;
