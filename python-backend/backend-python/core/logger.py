# backend-python/core/logger.py

class Logger:
    def log(self, msg: str):
        print(f"[LOG] {msg}")

    def warn(self, msg: str):
        print(f"[WARN] {msg}")

    def error(self, msg: str):
        print(f"[ERROR] {msg}")

logger = Logger()
