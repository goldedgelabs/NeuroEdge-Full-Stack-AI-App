# backend-python/core/agentManager.py
from .dbManager import db
from .eventBus import eventBus
from .logger import logger

# Import all 71 agents
from ..agents import *  # Assuming __init__.py exports all agents

agentManager = {}

def register_agent(name: str, instance):
    agentManager[name] = instance
    # Subscribe DB events if handlers exist
    eventBus.subscribe("db:update", getattr(instance, "handle_db_update", lambda x: None))
    eventBus.subscribe("db:delete", getattr(instance, "handle_db_delete", lambda x: None))
    logger.log(f"[AgentManager] Registered agent: {name}")

# Auto-register all agents
from ..agents import (
    ARVAgent, AnalyticsAgent, AntiTheftAgent, AutoUpdateAgent, BackupAgent, BillingAgent,
    CollaborationAgent, ComplianceAgent, ContentModerationAgent, ConversationAgent, CorrectionAgent,
    CreativityAgent, CriticAgent, DataIngestAgent, DataProcessingAgent, DecisionAgent, DeploymentAgent,
    DeviceProtectionAgent, DiscoveryAgent, DistributedTaskAgent, DoctrineAgent, EncryptionAgent,
    EvolutionAgent, FeedbackAgent, FounderAgent, GPIAgent, GlobalMedAgent, GoldEdgeIntegrationAgent,
    HealthMonitoringAgent, HotReloadAgent, IdentityAgent, InspectionAgent, LearningAgent,
    LoadBalancingAgent, LocalStorageAgent, MarketAssessmentAgent, MetricsAgent, MonitoringAgent,
    NotificationAgent, OfflineAgent, OrchestrationAgent, PersonalAgent, PhoneSecurityAgent,
    PlannerAgent, PlannerHelperAgent, PluginManagerAgent, PredictionAgent, PredictiveAgent,
    RecommendationAgent, RecoveryAgent, ResearchAgent, ResearchAnalyticsAgent, RoutingAgent,
    SchedulingAgent, SearchAgent, SecurityAgent, SecurityAuditAgent, SelfHealingAgent,
    SelfImprovementAgent, SelfProtectionAgent, SimulationAgent, SummarizationAgent,
    SupervisorAgent, SyncAgent, TelemetryAgent, TestingAgent, TranslationAgent, UIAgent,
    ValidationAgent, VerifierAgent, WorkerAgent
)

for AgentClass in [
    ARVAgent, AnalyticsAgent, AntiTheftAgent, AutoUpdateAgent, BackupAgent, BillingAgent,
    CollaborationAgent, ComplianceAgent, ContentModerationAgent, ConversationAgent, CorrectionAgent,
    CreativityAgent, CriticAgent, DataIngestAgent, DataProcessingAgent, DecisionAgent, DeploymentAgent,
    DeviceProtectionAgent, DiscoveryAgent, DistributedTaskAgent, DoctrineAgent, EncryptionAgent,
    EvolutionAgent, FeedbackAgent, FounderAgent, GPIAgent, GlobalMedAgent, GoldEdgeIntegrationAgent,
    HealthMonitoringAgent, HotReloadAgent, IdentityAgent, InspectionAgent, LearningAgent,
    LoadBalancingAgent, LocalStorageAgent, MarketAssessmentAgent, MetricsAgent, MonitoringAgent,
    NotificationAgent, OfflineAgent, OrchestrationAgent, PersonalAgent, PhoneSecurityAgent,
    PlannerAgent, PlannerHelperAgent, PluginManagerAgent, PredictionAgent, PredictiveAgent,
    RecommendationAgent, RecoveryAgent, ResearchAgent, ResearchAnalyticsAgent, RoutingAgent,
    SchedulingAgent, SearchAgent, SecurityAgent, SecurityAuditAgent, SelfHealingAgent,
    SelfImprovementAgent, SelfProtectionAgent, SimulationAgent, SummarizationAgent,
    SupervisorAgent, SyncAgent, TelemetryAgent, TestingAgent, TranslationAgent, UIAgent,
    ValidationAgent, VerifierAgent, WorkerAgent
]:
    register_agent(AgentClass.__name__, AgentClass())
