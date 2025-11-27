
package engines

import "github.com/neuroedge/go-backend/core"

// Constructors is a registry of engine constructors used for hot-reload.
// Each entry should return a fresh instance that implements core.Engine.
var Constructors = map[string]func() core.Engine{}
func init() {
    Constructors["AggregationEngine"] = func() core.Engine { return NewAggregationEngine() }
    Constructors["AlertingEngine"] = func() core.Engine { return NewAlertingEngine() }
    Constructors["AnalyticsEngine"] = func() core.Engine { return NewAnalyticsEngine() }
    Constructors["AuditEngine"] = func() core.Engine { return NewAuditEngine() }
    Constructors["AuditTrailEngine"] = func() core.Engine { return NewAuditTrailEngine() }
    Constructors["CacheEngine"] = func() core.Engine { return NewCacheEngine() }
    Constructors["ConnectorEngine"] = func() core.Engine { return NewConnectorEngine() }
    Constructors["DecisionEngine"] = func() core.Engine { return NewDecisionEngine() }
    Constructors["DeepLearningEngine"] = func() core.Engine { return NewDeepLearningEngine() }
    Constructors["EmbeddingEngine"] = func() core.Engine { return NewEmbeddingEngine() }
    Constructors["ExecutionEngine"] = func() core.Engine { return NewExecutionEngine() }
    Constructors["FeatureStoreEngine"] = func() core.Engine { return NewFeatureStoreEngine() }
    Constructors["FileEngine"] = func() core.Engine { return NewFileEngine() }
    Constructors["IndexEngine"] = func() core.Engine { return NewIndexEngine() }
    Constructors["IngestionEngine"] = func() core.Engine { return NewIngestionEngine() }
    Constructors["KnowledgeEngine"] = func() core.Engine { return NewKnowledgeEngine() }
    Constructors["LoggingEngine"] = func() core.Engine { return NewLoggingEngine() }
    Constructors["ModelServingEngine"] = func() core.Engine { return NewModelServingEngine() }
    Constructors["MonitoringEngine"] = func() core.Engine { return NewMonitoringEngine() }
    Constructors["NetworkEngine"] = func() core.Engine { return NewNetworkEngine() }
    Constructors["NotificationEngine"] = func() core.Engine { return NewNotificationEngine() }
    Constructors["OrchestrationEngine"] = func() core.Engine { return NewOrchestrationEngine() }
    Constructors["PipelineEngine"] = func() core.Engine { return NewPipelineEngine() }
    Constructors["PolicyEngine"] = func() core.Engine { return NewPolicyEngine() }
    Constructors["PredictionEngine"] = func() core.Engine { return NewPredictionEngine() }
    Constructors["QueryEngine"] = func() core.Engine { return NewQueryEngine() }
    Constructors["ReasoningEngine"] = func() core.Engine { return NewReasoningEngine() }
    Constructors["RecommendationEngine"] = func() core.Engine { return NewRecommendationEngine() }
    Constructors["RoutingEngine"] = func() core.Engine { return NewRoutingEngine() }
    Constructors["SchedulerEngine"] = func() core.Engine { return NewSchedulerEngine() }
    Constructors["ScraperEngine"] = func() core.Engine { return NewScraperEngine() }
    Constructors["SearchEngine"] = func() core.Engine { return NewSearchEngine() }
    Constructors["SecurityEngine"] = func() core.Engine { return NewSecurityEngine() }
    Constructors["SimulationEngine"] = func() core.Engine { return NewSimulationEngine() }
    Constructors["StorageEngine"] = func() core.Engine { return NewStorageEngine() }
    Constructors["SummarizationEngine"] = func() core.Engine { return NewSummarizationEngine() }
    Constructors["SyncEngine"] = func() core.Engine { return NewSyncEngine() }
    Constructors["TaskEngine"] = func() core.Engine { return NewTaskEngine() }
    Constructors["TranslationEngine"] = func() core.Engine { return NewTranslationEngine() }
    Constructors["UserModelEngine"] = func() core.Engine { return NewUserModelEngine() }
    Constructors["VectorEngine"] = func() core.Engine { return NewVectorEngine() }
    Constructors["VisualizationEngine"] = func() core.Engine { return NewVisualizationEngine() }
}
