export interface EvaluationPluginOutput {
  name: string;
  description: string;
}

export interface EvaluationPluginInfo {
  description: string;
  outputs: EvaluationPluginOutput[];
}

export const evaluationPluginInfo: Record<string, EvaluationPluginInfo> = {
  mock: {
    description:
      "Test plugin that returns generated scores to check the evaluation workflow. These scores are not biological predictions.",
    outputs: [{ name: "mock_score", description: "a generated test score" }],
  },
};
