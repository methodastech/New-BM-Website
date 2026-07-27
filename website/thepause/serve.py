#!/usr/bin/env python3
"""Static dev server for The Pause.

Serves the site with no-store cache headers so edits to css/js (especially
ES modules, which browsers cache aggressively) always reload. Port defaults
to 8140 and can be overridden: `python3 serve.py 9000`.
"""
import sys
import http.server
import socketserver

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8140


class NoCacheHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()

    def log_message(self, *args):
        pass


socketserver.TCPServer.allow_reuse_address = True
with socketserver.TCPServer(("", PORT), NoCacheHandler) as httpd:
    print(f"The Pause dev server running at http://localhost:{PORT}")
    httpd.serve_forever()
