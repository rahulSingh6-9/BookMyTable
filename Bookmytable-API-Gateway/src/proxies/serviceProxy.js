import { createProxyMiddleware, fixRequestBody } from "http-proxy-middleware";

const createServiceProxy = (target, pathRewrite = {}) => {
  return createProxyMiddleware({
    target,
    changeOrigin: true,
    pathRewrite,

    on: {
      proxyReq: (proxyReq, req) => {
        try {
          // 🔥 Only if body exists
          if (req.body && Object.keys(req.body).length > 0) {
            fixRequestBody(proxyReq, req);
          }

          // 🔥 Safe header set
          if (req.headers["x-user-id"]) {
            proxyReq.setHeader("x-user-id", req.headers["x-user-id"]);
          }

          if (req.headers["x-user-roles"]) {
            proxyReq.setHeader("x-user-roles", req.headers["x-user-roles"]);
          }

          // 🔥 Set gateway secret for trust
          proxyReq.setHeader("x-internal-gateway", process.env.GATEWAY_SECRET);


        } catch (err) {
          console.error("Proxy Error:", err.message);
        }
      },
    },
  });
};

export default createServiceProxy;