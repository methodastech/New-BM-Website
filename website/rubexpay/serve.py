#!/usr/bin/env python3
"""Dev server for the RubexPay site: plain http.server plus Cache-Control: no-cache on every
response, so a normal reload ALWAYS revalidates (no more stale index.html hiding new work).
Usage: python3 serve.py <port>"""
import sys, http.server, socketserver

class NoCacheHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-cache, must-revalidate')
        super().end_headers()
    def log_message(self, *a):
        pass

port = int(sys.argv[1]) if len(sys.argv) > 1 else 4329
socketserver.ThreadingTCPServer.allow_reuse_address = True
with socketserver.ThreadingTCPServer(("", port), NoCacheHandler) as httpd:
    print(f"serving with no-cache on :{port}", flush=True)
    httpd.serve_forever()
