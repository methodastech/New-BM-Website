#!/usr/bin/env python3
"""Local dev server WITH HTTP Range support (needed for video scrubbing).

Python's built-in `python -m http.server` does NOT honor Range requests,
so seeking inside <video>/<audio> snaps back. Run this instead:

    python serve.py            # serves current folder on port 8000
    python serve.py 8080       # custom port

Production (Apache/nginx/Cloudways) already supports Range, so this only
matters for local testing.
"""
import os
import re
import sys
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer


class RangeRequestHandler(SimpleHTTPRequestHandler):
    """SimpleHTTPRequestHandler that serves partial content (HTTP 206)."""

    def send_head(self):
        path = self.translate_path(self.path)
        if os.path.isdir(path):
            return super().send_head()

        range_header = self.headers.get("Range")
        if range_header is None:
            return super().send_head()

        try:
            f = open(path, "rb")
        except OSError:
            self.send_error(404, "File not found")
            return None

        fs = os.fstat(f.fileno())
        file_len = fs[6]

        m = re.match(r"bytes=(\d*)-(\d*)", range_header.strip())
        if not m:
            f.close()
            self.send_error(400, "Invalid Range header")
            return None

        start_s, end_s = m.group(1), m.group(2)
        if start_s == "":  # suffix range: bytes=-N (last N bytes)
            length = int(end_s)
            start = max(0, file_len - length)
            end = file_len - 1
        else:
            start = int(start_s)
            end = int(end_s) if end_s else file_len - 1
        end = min(end, file_len - 1)

        if start > end or start >= file_len:
            f.close()
            self.send_response(416)  # Range Not Satisfiable
            self.send_header("Content-Range", "bytes */%d" % file_len)
            self.end_headers()
            return None

        self.send_response(206)
        self.send_header("Content-Type", self.guess_type(path))
        self.send_header("Accept-Ranges", "bytes")
        self.send_header("Content-Range", "bytes %d-%d/%d" % (start, end, file_len))
        self.send_header("Content-Length", str(end - start + 1))
        self.send_header("Last-Modified", self.date_time_string(fs.st_mtime))
        self.end_headers()
        f.seek(start)
        self._range_remaining = end - start + 1
        return f

    def copyfile(self, source, outputfile):
        remaining = getattr(self, "_range_remaining", None)
        if remaining is None:
            return super().copyfile(source, outputfile)
        # Stream only the requested byte range.
        while remaining > 0:
            chunk = source.read(min(64 * 1024, remaining))
            if not chunk:
                break
            outputfile.write(chunk)
            remaining -= len(chunk)
        self._range_remaining = None


def main():
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
    RangeRequestHandler.extensions_map.update({
        ".webm": "video/webm",
        ".mp4": "video/mp4",
        ".webp": "image/webp",
    })
    with ThreadingHTTPServer(("", port), RangeRequestHandler) as httpd:
        print("Serving %s with Range support at http://localhost:%d/" % (os.getcwd(), port))
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nStopped.")


if __name__ == "__main__":
    main()
