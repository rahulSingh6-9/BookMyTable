import { createProxyMiddleware, fixRequestBody } from "http-proxy-middleware";

const createServiceProxy = (target, pathRewrite = {}) => {
  return createProxyMiddleware({
    target,
    changeOrigin: true,
    pathRewrite,
    on: {
      proxyReq: (proxyReq, req, res) => {
        // 🔥 Re-fix body if needed
        fixRequestBody(proxyReq, req);

        // 🔥 Explicitly pass user headers set by auth middleware
        if (req.headers["x-user-id"]) {
          proxyReq.setHeader("x-user-id", req.headers["x-user-id"]);
        }
        if (req.headers["x-user-roles"]) {
          proxyReq.setHeader("x-user-roles", req.headers["x-user-roles"]);
        }
      },
    }
  });
};

export default createServiceProxy;