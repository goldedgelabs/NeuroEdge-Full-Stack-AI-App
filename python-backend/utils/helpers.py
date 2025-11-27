import json
import uuid
from typing import Any, Dict

def generate_id() -> str:
    """Generate a unique ID for DB records."""
    return str(uuid.uuid4())

def safe_json(data: Any) -> str:
    """Convert data to JSON string safely."""
    try:
        return json.dumps(data, default=str)
    except Exception:
        return "{}"

def merge_dicts(a: Dict, b: Dict) -> Dict:
    """Merge two dictionaries."""
    result = a.copy()
    result.update(b)
    return result
