#!/usr/bin/env python3
"""Dev server for e-segar: serves the site with no-cache headers so edits always show."""
import http.server
import socketserver

PORT = 4321

class NoCacheHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()

with socketserver.TCPServer(("", PORT), NoCacheHandler) as httpd:
    httpd.allow_reuse_address = True
    print(f"e-segar dev server on http://localhost:{PORT} (no-cache)")
    httpd.serve_forever()
