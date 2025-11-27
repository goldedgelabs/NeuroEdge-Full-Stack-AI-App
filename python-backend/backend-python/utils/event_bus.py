from collections import defaultdict
from typing import Callable, Any

class EventBus:
    def __init__(self):
        self._subscribers = defaultdict(list)

    def subscribe(self, event: str, callback: Callable[[Any], None]):
        self._subscribers[event].append(callback)

    def publish(self, event: str, data: Any):
        if event in self._subscribers:
            for callback in self._subscribers[event]:
                try:
                    callback(data)
                except Exception as e:
                    print(f"[EventBus] Error in subscriber for {event}: {e}")

# Global bus instance
event_bus = EventBus()
