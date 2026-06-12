import http from "k6/http";
import { check, sleep } from "k6";
import { Rate, Trend } from "k6/metrics";

export const options = {
    stages: [
        { duration: "1m", target: 10 },
        { duration: "2m", target: 50 },
        { duration: "1m", target: 0 },
    ],
    thresholds: {
        http_req_duration: ["p(95)<30000"],
        http_req_failed: ["rate<0.01"],
        ai_analysis_duration: ["p(95)<60000"],
    },
};

const analysisDuration = new Trend("ai_analysis_duration");
const failureRate = new Rate("ai_failure_rate");

const BASE_URL = __ENV.BASE_URL || "http://localhost:3000";

export default function () {
    const headers = { "Content-Type": "application/json" };

    // Health check
    const health = http.get(`${BASE_URL}/api/health`);
    check(health, { "health status 200": (r) => r.status === 200 });
    sleep(1);

    // Dashboard (unauthenticated — should be blocked)
    const dash = http.get(`${BASE_URL}/dashboard`);
    check(dash, { "dashboard responds": (r) => r.status < 500 });
    sleep(0.5);

    // Rate limit check — hit ask-ai without auth
    const payload = JSON.stringify({ question: "What does high cholesterol mean?" });
    for (let i = 0; i < 5; i++) {
        const start = Date.now();
        const res = http.post(`${BASE_URL}/api/ask-ai`, payload, { headers });
        const dur = Date.now() - start;
        analysisDuration.add(dur);

        if (res.status === 429) {
            failureRate.add(false);
        } else {
            failureRate.add(res.status >= 500);
            check(res, {
                "ask-ai non-server-error": (r) => r.status < 500,
            });
        }
        sleep(0.2);
    }

    sleep(1);
}
