import dotenv from "dotenv";
dotenv.config();

import { createProxyMiddleware, fixRequestBody } from "http-proxy-middleware";

/**
 * createServiceProxy
 * @param {string} target - The target service URL
 * @param {object} pathRewrite - Path rewrite rules
 */
const createServiceProxy = (target, pathRewrite = {}) => {
  return createProxyMiddleware({
    target,
    changeOrigin: true,
    pathRewrite,
    on: {
      proxyReq: (proxyReq, req, res) => {
        // 1️⃣ Forward Authenticated Context (from verifyToken middleware)
        if (req.user) {
          const userId = req.user.id || req.user._id;
          if (userId) {
            proxyReq.setHeader("x-user-id", userId.toString());
          }

          if (req.user.roles) {
            proxyReq.setHeader("x-user-roles", JSON.stringify(req.user.roles));
          }
        }

        // 2️⃣ Internal service verification
        if (process.env.GATEWAY_SECRET) {
          proxyReq.setHeader("x-internal-gateway", process.env.GATEWAY_SECRET);
        }

        // 3️⃣ Fix Body (MUST be last after all headers are set)
        // If express.json() was used, we must re-stream the body
        if (req.body && Object.keys(req.body).length > 0) {
          fixRequestBody(proxyReq, req);
        }

        // console.log(`[Gateway Proxy] Forwarding to ${target}${req.url}`);
      },

      error: (err, req, res) => {
        console.error(`[Gateway Proxy Error] ${target}:`, err.message);

        if (!res.headersSent) {
          res.status(500).json({
            success: false,
            message: "Gateway proxy failed to reach target service",
            error: process.env.NODE_ENV === "development" ? err.message : undefined,
          });
        }
      },
      
      proxyRes: (proxyRes, req, res) => {
        // console.log(`[Gateway Proxy Response] ${proxyRes.statusCode} from ${target}`);
      }
    },
  });
};

export default createServiceProxy;