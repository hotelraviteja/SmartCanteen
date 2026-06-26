import http from 'k6/http';
import { sleep, check } from 'k6';

export const options = {
  vus: 100,
  duration: '1m',
  thresholds: {
    http_req_failed: ['rate<0.01'], // less than 1% errors
  },
};

export default function () {
  // 1. Test React Web Frontend Landing Page (using IPv6 loopback [::1])
  const resReact = http.get('http://[::1]:5173/');
  check(resReact, {
    'web status is 200': (r) => r.status === 200,
  });

  // 2. Test Flutter Mobile App Web Page (using IPv4 loopback 127.0.0.1)
  const resFlutter = http.get('http://127.0.0.1:8080/');
  check(resFlutter, {
    'app asset status is 200': (r) => r.status === 200,
  });

  // Sleep 1 second to simulate realistic user browsing behavior
  sleep(1);
}
