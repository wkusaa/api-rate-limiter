import { type NextApiRequest, type NextApiResponse } from "next";
import { Ratelimit } from "@upstash/ratelimit"; // for deno: see above
import { redis } from "~/lib/upstash/upstash-client";
import { Redis } from "@upstash/redis";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const ratelimit = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(100, "30 d"),
    analytics: true,
    /**
     * Optional prefix for the keys used in redis. This is useful if you want to share a redis
     * instance with other applications and want to avoid key collisions. The default prefix is
     * "@upstash/ratelimit"
     */
    prefix: "@upstash/ratelimit",
  });

  // Use a constant string to limit all requests with a single ratelimit
  // Or use a userID, apiKey or ip address for individual limits.
  const identifier = "limiter-test";
  const { success, limit, remaining } = await ratelimit.limit(identifier);

  if (!success) {
    res.status(429).json({
      message: `Unable to process at this time`,
      remaining,
      limit,
    });
  }

  res.status(200).json({ message: "All good!", remaining, limit });
};

export default handler;
