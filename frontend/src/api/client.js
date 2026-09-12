import axios from 'axios';

const client = axios.create({
  // production EC2 backend
  baseURL: 'http://13.206.64.164:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default client;
