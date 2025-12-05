/**
 * FASE 3.3.3: CALL ANALYTICS COMPONENT
 * Auto-Model Router: GPT-5.1 Codex (Frontend/React/Componente)
 * 
 * Componente para exibir analytics detalhados da chamada:
 * - Métricas de latência (E2E, ASR, LLM, TTS, KB)
 * - Distribuição de tempos
 * - Performance do LLM (tokens, custo)
 * - Análise de qualidade
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Activity, 
  Zap, 
  Brain, 
  Volume2, 
  Database,
  Clock,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';

interface LatencyMetrics {
  e2e?: {
    p50: number;
    p90: number;
    p95: number;
    p99: number;
    max: number;
    min: number;
  };
  asr?: {
    p50: number;
    p90: number;
    p95: number;
    p99: number;
  };
  llm?: {
    p50: number;
    p90: number;
    p95: number;
    p99: number;
  };
  tts?: {
    p50: number;
    p90: number;
    p95: number;
    p99: number;
  };
  kb?: {
    p50: number;
    p90: number;
    p95: number;
    p99: number;
  };
}

interface LLMUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  estimatedCost: number;
  model: string;
}

interface CallAnalyticsProps {
  latency: LatencyMetrics;
  llmUsage: LLMUsage;
  callDuration: number;
  totalCost: number;
}

export function CallAnalytics({ 
  latency, 
  llmUsage, 
  callDuration,
  totalCost 
}: CallAnalyticsProps) {
  
  // Calcular score de qualidade baseado na latência
  const calculateQualityScore = () => {
    if (!latency.e2e) return 0;
    
    const p95 = latency.e2e.p95;
    
    // Score baseado no P95 da latência E2E
    if (p95 < 500) return 100;
    if (p95 < 800) return 90;
    if (p95 < 1000) return 80;
    if (p95 < 1500) return 70;
    if (p95 < 2000) return 60;
    return 50;
  };

  const qualityScore = calculateQualityScore();

  // Determinar cor do score
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Componente para métrica de latência
  const LatencyMetric = ({ 
    label, 
    icon: Icon, 
    data, 
    threshold = 1000 
  }: { 
    label: string; 
    icon: any; 
    data?: { p50: number; p90: number; p95: number; p99: number }; 
    threshold?: number;
  }) => {
    if (!data) return null;

    const isGood = data.p95 < threshold;

    return (
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-sm font-medium">{label}</CardTitle>
            </div>
            <Badge variant={isGood ? 'success' : 'warning'}>
              {isGood ? 'Excelente' : 'Atenção'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-muted-foreground">P50 (Mediana)</div>
              <div className="text-lg font-bold">{data.p50}ms</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">P90</div>
              <div className="text-lg font-bold">{data.p90}ms</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">P95</div>
              <div className="text-lg font-bold">{data.p95}ms</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">P99 (Pior)</div>
              <div className="text-lg font-bold">{data.p99}ms</div>
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">vs. Meta ({threshold}ms)</span>
              <span className={isGood ? 'text-green-600' : 'text-red-600'}>
                {data.p95 < threshold ? `${threshold - data.p95}ms abaixo` : `${data.p95 - threshold}ms acima`}
              </span>
            </div>
            <Progress 
              value={Math.min(100, (data.p95 / threshold) * 100)} 
              className="h-2"
            />
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Score de Qualidade Geral */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Score de Qualidade da Chamada
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <div className={`text-5xl font-bold ${getScoreColor(qualityScore)}`}>
                {qualityScore}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                {qualityScore >= 90 && 'Excelente experiência do usuário'}
                {qualityScore >= 70 && qualityScore < 90 && 'Boa experiência, com margem para melhorias'}
                {qualityScore < 70 && 'Requer atenção - latência acima do ideal'}
              </div>
            </div>
            <div className="text-right space-y-2">
              <div>
                <div className="text-xs text-muted-foreground">Duração Total</div>
                <div className="text-lg font-semibold">
                  {Math.floor(callDuration / 60)}m {callDuration % 60}s
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Custo Total</div>
                <div className="text-lg font-semibold">
                  ${(totalCost / 100).toFixed(4)}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="latency" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="latency">Latência</TabsTrigger>
          <TabsTrigger value="llm">LLM & Custos</TabsTrigger>
        </TabsList>

        {/* Tab: Métricas de Latência */}
        <TabsContent value="latency" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <LatencyMetric
              label="End-to-End (E2E)"
              icon={Activity}
              data={latency.e2e}
              threshold={800}
            />
            <LatencyMetric
              label="ASR (Speech-to-Text)"
              icon={Volume2}
              data={latency.asr}
              threshold={300}
            />
            <LatencyMetric
              label="LLM (AI Processing)"
              icon={Brain}
              data={latency.llm}
              threshold={500}
            />
            <LatencyMetric
              label="TTS (Text-to-Speech)"
              icon={Zap}
              data={latency.tts}
              threshold={400}
            />
          </div>

          {latency.kb && (
            <LatencyMetric
              label="Knowledge Base"
              icon={Database}
              data={latency.kb}
              threshold={200}
            />
          )}

          {/* Alertas de latência */}
          {latency.e2e && latency.e2e.p95 > 1000 && (
            <Card className="border-yellow-200 bg-yellow-50">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <div className="font-semibold text-yellow-900">
                      Latência Alta Detectada
                    </div>
                    <div className="text-sm text-yellow-700 mt-1">
                      A latência P95 de {latency.e2e.p95}ms está acima do ideal (800ms). 
                      Considere otimizar o prompt do LLM ou usar um modelo mais rápido.
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Tab: LLM & Custos */}
        <TabsContent value="llm" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Uso de Tokens */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Brain className="h-4 w-4" />
                  Uso de Tokens LLM
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Tokens de Entrada</span>
                    <span className="font-semibold">{llmUsage.promptTokens.toLocaleString()}</span>
                  </div>
                  <Progress 
                    value={(llmUsage.promptTokens / llmUsage.totalTokens) * 100} 
                    className="h-2"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Tokens de Saída</span>
                    <span className="font-semibold">{llmUsage.completionTokens.toLocaleString()}</span>
                  </div>
                  <Progress 
                    value={(llmUsage.completionTokens / llmUsage.totalTokens) * 100} 
                    className="h-2"
                  />
                </div>
                <div className="pt-2 border-t">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Total de Tokens</span>
                    <span className="text-xl font-bold">{llmUsage.totalTokens.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Breakdown de Custos */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Breakdown de Custos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">LLM ({llmUsage.model})</span>
                    <span className="font-medium">${(llmUsage.estimatedCost / 100).toFixed(4)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Voice Engine (TTS/ASR)</span>
                    <span className="font-medium">${((totalCost - llmUsage.estimatedCost) * 0.6 / 100).toFixed(4)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Telephony</span>
                    <span className="font-medium">${((totalCost - llmUsage.estimatedCost) * 0.4 / 100).toFixed(4)}</span>
                  </div>
                </div>
                <div className="pt-3 border-t">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Custo Total</span>
                    <span className="text-xl font-bold text-green-600">
                      ${(totalCost / 100).toFixed(4)}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    ~${((totalCost / callDuration) * 60 / 100).toFixed(2)}/minuto
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recomendações de otimização */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">
                💡 Recomendações de Otimização
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                {llmUsage.promptTokens > 2000 && (
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-600">•</span>
                    <span>
                      O prompt está usando {llmUsage.promptTokens} tokens. Considere otimizar 
                      o prompt do sistema para reduzir custos.
                    </span>
                  </li>
                )}
                {(totalCost / callDuration) * 60 > 15 && (
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-600">•</span>
                    <span>
                      O custo por minuto está acima de $0.15. Avalie usar um modelo LLM mais econômico 
                      ou otimizar a duração das chamadas.
                    </span>
                  </li>
                )}
                {llmUsage.completionTokens / llmUsage.promptTokens > 2 && (
                  <li className="flex items-start gap-2">
                    <span className="text-green-600">•</span>
                    <span>
                      Boa proporção de tokens de saída vs. entrada - o agente está sendo eficiente.
                    </span>
                  </li>
                )}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
