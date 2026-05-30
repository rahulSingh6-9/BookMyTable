import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';

const app = express();
const router = express.Router();

router.use("/tables", createProxyMiddleware({
  target: "http://example.com",
  pathRewrite: { "^": "/tables" },
  on: {
    proxyReq: (proxyReq) => {
      console.log("FORWARDED PATH:", proxyReq.path);
    }
  }
}));

app.use("/api", router);

app.listen(3006, () => {
  console.log("Listening on 3006");
});
