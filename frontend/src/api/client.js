import axios from 'axios';

const client = axios.create({
  // production backend — trapnet.sayantanmandal.is-a.dev
  baseURL: 'http://trapnet.sayantanmandal.is-a.dev:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default client;
