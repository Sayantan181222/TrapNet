import axios from 'axios';

const client = axios.create({
  // swap to EC2 public IP if subdomain not yet configured
  baseURL: 'http://trapnet.sayantanmandal.is-a.dev:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default client;
