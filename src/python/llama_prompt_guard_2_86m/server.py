"""HTTP server for Llama Prompt Guard 2 86M inference.

All endpoints exchange JSON. Set Content-Type: application/json on POSTs.

Endpoints:
    GET  /health
        Output: {"status": "ok"}

    POST /check    -- classify a single prompt
        Input:  {"text": "Is it safe to ...?"}
        Output: {"isMalicious": false, "confidence": 0.9996}

    POST /batch    -- classify multiple prompts at once
        Input:  {"texts": ["prompt one", "prompt two"]}
        Output: [{"isMalicious": false, "confidence": 0.9996},
                 {"isMalicious": true, "confidence": 0.9995}]
        Results are in the same order as the input `texts`.

Field semantics:
    text         -- the prompt to classify; non-empty string
    texts        -- array of non-empty strings to classify
    isMalicious  -- whether the prompt is classified as malicious (bool)
    confidence   -- model confidence in the label, float in [0, 1]

Errors (400 for invalid/missing input fields, 404 for unknown paths):
    {"error": "..."}
"""

import json
import os
import sys
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from threading import Lock

import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification

# Server defaults
HTTP_HOST = "127.0.0.1"
HTTP_PORT = 3096
# Model context limit and chunk overlap for splitting overlong inputs.
MAX_TOKENS = 512
STRIDE_TOKENS = 64
# Log HTTP access lines (e.g. "GET /health HTTP/1.1" 200 -). Defaults to off.
LOG_ACCESS = False

# Path to cached model
snapshot_dir = Path("~/.cache/huggingface/hub/models--meta-llama--Llama-Prompt-Guard-2-86M/snapshots").expanduser()
subfolders = os.listdir(snapshot_dir)
model_path = os.path.join(snapshot_dir, subfolders[0])

tokenizer = AutoTokenizer.from_pretrained(model_path)
model = AutoModelForSequenceClassification.from_pretrained(model_path)
model.eval()

_device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
if _device.type == "cuda":
    model.to(_device)

# Guard on-device inference so concurrent threads share one model safely.
_infer_lock = Lock()


def _classify(texts):
    """Infer labels for a batch of texts. Caller must hold _infer_lock.

    Inputs longer than MAX_TOKENS are split into MAX_TOKENS-wide chunks with
    STRIDE_TOKENS overlap, so content straddling a chunk boundary isn't lost.
    A text is malicious if any of its chunks is classified malicious;
    confidence is the most-confident classification across its chunks.
    Results align 1:1 with the input order of `texts`.
    """
    encodings = tokenizer(
        texts,
        return_tensors="pt",
        truncation=True,
        max_length=MAX_TOKENS,
        padding=True,
        stride=STRIDE_TOKENS,
        return_overflowing_tokens=True,
    ).to(_device)

    with torch.no_grad():
        logits = model(input_ids=encodings["input_ids"], attention_mask=encodings["attention_mask"]).logits

    probs = torch.softmax(logits, dim=-1)
    predicted = logits.argmax(dim=-1).tolist()

    # Group every chunk back to its source text and combine results.
    sample_ids = encodings["overflow_to_sample_mapping"]
    aggregated = [None] * len(texts)
    for i in range(len(sample_ids)):
        idx = sample_ids[i].item()
        is_malicious = predicted[i] == 1  # class 1 = MALICIOUS, class 0 = BENIGN
        confidence = probs[i, predicted[i]].item()
        candidate = (is_malicious, round(confidence, 4))
        prev = aggregated[idx]
        if prev is None:
            aggregated[idx] = candidate
        else:
            # Any malicious chunk makes the whole input malicious; on a tie,
            # keep the classification the model was most confident about.
            if candidate[0] and not prev[0]:
                aggregated[idx] = candidate
            elif candidate[0] == prev[0] and candidate[1] > prev[1]:
                aggregated[idx] = candidate

    return [
        {"isMalicious": is_malicious, "confidence": confidence}
        for is_malicious, confidence in aggregated
    ]


def check_prompt(data):
    """Validate + classify a single text. Returns (payload, status)."""
    text = data.get("text")
    if not isinstance(text, str) or not text.strip():
        return {"error": "field 'text' must be a non-empty string"}, 400
    with _infer_lock:
        result = _classify([text])[0]
    return result, 200


def batch_prompts(data):
    """Validate + classify a batch of texts. Returns (payload, status)."""
    texts = data.get("texts")
    if not isinstance(texts, list) or not texts:
        return {"error": "field 'texts' must be a non-empty array"}, 400
    if not all(isinstance(t, str) and t.strip() for t in texts):
        return {"error": "all entries in 'texts' must be non-empty strings"}, 400
    with _infer_lock:
        result = _classify(texts)
    return result, 200


class Handler(BaseHTTPRequestHandler):
    server_version = "PromptGuardServer/1.0"

    def log_message(self, format, *args):
        if not LOG_ACCESS:
            return
        super().log_message(format, *args)

    def _send_json(self, payload, status=200):
        body = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def _read_json(self):
        length = int(self.headers.get("Content-Length") or 0)
        if length <= 0:
            return None
        try:
            return json.loads(self.rfile.read(length))
        except (json.JSONDecodeError, UnicodeDecodeError):
            return None

    def do_GET(self):
        if self.path == "/health":
            self._send_json({"status": "ok"})
        else:
            self._send_json({"error": "not found"}, status=404)

    def do_POST(self):
        data = self._read_json()
        if data is None:
            self._send_json({"error": "invalid or missing JSON body"}, status=400)
            return
        if not isinstance(data, dict):
            self._send_json({"error": "body must be a JSON object"}, status=400)
            return

        handlers = {
            "/check": check_prompt,
            "/batch": batch_prompts,
        }
        handler = handlers.get(self.path)
        if handler is None:
            self._send_json({"error": "not found"}, status=404)
            return
        payload, status = handler(data)
        self._send_json(payload, status=status)

    def do_DELETE(self):
        self._send_json({"error": "method not allowed"}, status=405)


def run(host=HTTP_HOST, port=HTTP_PORT):
    server = ThreadingHTTPServer((host, port), Handler)
    print(f"Serving on http://{host}:{port}", flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()


if __name__ == "__main__":
    host = sys.argv[1] if len(sys.argv) > 1 else HTTP_HOST
    port = int(sys.argv[2]) if len(sys.argv) > 2 else HTTP_PORT
    run(host, port)
