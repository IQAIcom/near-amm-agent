import * as http from "node:http";

export function startServer() {
	// Get the port from the environment, default to 8080
	const port = process.env.PORT || 8080;

	// Create a simple server that responds to health checks
	const server = http.createServer((req, res) => {
		if (req.url === "/health") {
			res.writeHead(200, { "Content-Type": "text/plain" });
			res.end("OK");
		} else {
			res.writeHead(404, { "Content-Type": "text/plain" });
			res.end("Not Found");
		}
	});

	server.listen(port, () => {
		console.log(`🏥 Health check server listening on port ${port}`);
	});
}
