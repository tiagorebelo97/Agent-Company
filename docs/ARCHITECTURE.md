# Architecture Documentation

## Overview

The Agent Company project follows a modular architecture where each agent is a self-contained module that can be developed, tested, and deployed independently.

## Architecture Principles

1. **Modularity**: Each agent is isolated and can be developed independently
2. **Shared Utilities**: Common functionality is in the `shared/` directory
3. **Configuration-Driven**: Agents are configured via YAML files
4. **Standard Interface**: All agents inherit from `BaseAgent` and implement standard methods

## Directory Structure

```
Agent-Company/
├── agents/                  # Agent implementations
│   ├── __init__.py
│   └── figma_designer/      # Figma Designer Agent
│       ├── __init__.py
│       ├── figma_designer_agent.py
│       └── README.md
├── shared/                  # Shared utilities
│   ├── __init__.py
│   ├── base_agent.py        # Base agent class
│   └── config_loader.py     # Configuration management
├── config/                  # Configuration files
│   └── agents.yaml          # Agent configurations
├── tests/                   # Test files
├── docs/                    # Documentation
└── output/                  # Agent outputs (gitignored)
```

## Agent Structure

Each agent should:

1. Inherit from `BaseAgent`
2. Implement required abstract methods:
   - `execute(task)`: Execute agent tasks
   - `get_capabilities()`: Return agent capabilities
3. Have its own configuration in `config/agents.yaml`
4. Include a README.md with usage instructions

## Communication Patterns

(To be defined as the project evolves)

## Extension Points

- Add new agents by creating directories under `agents/`
- Extend shared utilities in `shared/`
- Add new configuration options in `config/agents.yaml`
