import http from "http";
import { streamAudio } from "./stream.js";

export function startServer(ytDlpPath, port = 3333) {
  const server = http.createServer((req, res) => {
    if (!req.url.startsWith("/stream")) {
      res.writeHead(404);
      return res.end("Not Found");
    }

    const url = new URL(req.url, "http://localhost");
    req.query = Object.fromEntries(url.searchParams);

    if (!req.query.videoId) {
      res.writeHead(400);
      return res.end("Bad Request: Missing videoId");
    }

    streamAudio(req, res, ytDlpPath);
  });
  server.listen(port, () =>
    console.log(`Server running on http://localhost:${port}`)
  );
  return server;
}
