# neuroedge_agent_registry.py
# Simple agent registry / factory. Use this to register agents that require constructor args.

_agent_factories = {}

def register_agent(name: str):
    """Decorator to register an agent factory function or class."""
    def deco(obj):
        _agent_factories[name] = obj
        return obj
    return deco

def create_agent(name: str, *args, **kwargs):
    """Create an agent by registered name. Returns None if not found."""
    factory = _agent_factories.get(name)
    if factory is None:
        return None
    try:
        if hasattr(factory, '__call__'):
            return factory(*args, **kwargs)
        return factory
    except Exception:
        return None

def list_registered():
    return list(_agent_factories.keys())
