/**
 * FASE 3.3.1: CALL TRANSCRIPT COMPONENT
 * Auto-Model Router: GPT-5.1 Codex (Frontend/React/Componente)
 * 
 * Componente para exibir a transcrição completa da chamada
 * com marcação de tempo, identificação de quem falou (agente/usuário),
 * análise de sentimento por fala e opções de exportação.
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Download, Search, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface TranscriptWord {
  word: string;
  start: number;
  end: number;
  confidence: number;
}

interface TranscriptSegment {
  role: 'agent' | 'user';
  content: string;
  timestamp: number;
  duration: number;
  words?: TranscriptWord[];
  sentiment?: 'positive' | 'neutral' | 'negative';
  confidence?: number;
}

interface CallTranscriptProps {
  transcript: TranscriptSegment[];
  callDuration: number;
  agentName: string;
}

export function CallTranscript({ 
  transcript, 
  callDuration, 
  agentName 
}: CallTranscriptProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [copied, setCopied] = useState(false);

  // Filtrar transcrição por termo de busca
  const filteredTranscript = transcript.filter(segment =>
    segment.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Formatar timestamp (ms -> MM:SS)
  const formatTimestamp = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Copiar transcrição completa para clipboard
  const handleCopyTranscript = async () => {
    const text = transcript
      .map(segment => `[${formatTimestamp(segment.timestamp)}] ${segment.role === 'agent' ? agentName : 'Cliente'}: ${segment.content}`)
      .join('\n\n');
    
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Exportar transcrição como arquivo .txt
  const handleExportTranscript = () => {
    const text = transcript
      .map(segment => `[${formatTimestamp(segment.timestamp)}] ${segment.role === 'agent' ? agentName : 'Cliente'}: ${segment.content}`)
      .join('\n\n');
    
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transcript-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Exportar como formato JSON estruturado
  const handleExportJSON = () => {
    const data = {
      agentName,
      callDuration,
      totalSegments: transcript.length,
      transcript: transcript.map(segment => ({
        timestamp: formatTimestamp(segment.timestamp),
        timestampMs: segment.timestamp,
        role: segment.role,
        speaker: segment.role === 'agent' ? agentName : 'Cliente',
        content: segment.content,
        duration: segment.duration,
        sentiment: segment.sentiment,
        confidence: segment.confidence,
        wordCount: segment.content.split(' ').length
      }))
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transcript-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Cores de sentimento
  const sentimentColors = {
    positive: 'text-green-600 bg-green-50 border-green-200',
    neutral: 'text-gray-600 bg-gray-50 border-gray-200',
    negative: 'text-red-600 bg-red-50 border-red-200'
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Transcrição Completa</CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyTranscript}
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Copiado
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-2" />
                  Copiar
                </>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportTranscript}
            >
              <Download className="h-4 w-4 mr-2" />
              Exportar TXT
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportJSON}
            >
              <Download className="h-4 w-4 mr-2" />
              Exportar JSON
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-4 mt-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar na transcrição..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            {filteredTranscript.length} de {transcript.length} segmentos
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[600px] pr-4">
          <div className="space-y-4">
            {filteredTranscript.map((segment, index) => (
              <div
                key={index}
                className={cn(
                  'p-4 rounded-lg border',
                  segment.role === 'agent' 
                    ? 'bg-blue-50 border-blue-200' 
                    : 'bg-slate-50 border-slate-200'
                )}
              >
                {/* Header da fala */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={segment.role === 'agent' ? 'default' : 'secondary'}
                    >
                      {segment.role === 'agent' ? agentName : 'Cliente'}
                    </Badge>
                    <span className="text-xs text-muted-foreground font-mono">
                      {formatTimestamp(segment.timestamp)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      ({(segment.duration / 1000).toFixed(1)}s)
                    </span>
                  </div>
                  {segment.sentiment && (
                    <Badge 
                      variant="outline"
                      className={sentimentColors[segment.sentiment]}
                    >
                      {segment.sentiment === 'positive' && '😊 Positivo'}
                      {segment.sentiment === 'neutral' && '😐 Neutro'}
                      {segment.sentiment === 'negative' && '😞 Negativo'}
                    </Badge>
                  )}
                </div>

                {/* Conteúdo da fala */}
                <p className="text-sm leading-relaxed">
                  {segment.content}
                </p>

                {/* Metadados adicionais */}
                {segment.confidence !== undefined && (
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      Confiança:
                    </span>
                    <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={cn(
                          'h-full transition-all',
                          segment.confidence > 0.8 ? 'bg-green-500' :
                          segment.confidence > 0.6 ? 'bg-yellow-500' :
                          'bg-red-500'
                        )}
                        style={{ width: `${segment.confidence * 100}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium">
                      {(segment.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                )}

                {/* Destacar termo buscado */}
                {searchTerm && segment.content.toLowerCase().includes(searchTerm.toLowerCase()) && (
                  <div className="mt-2 text-xs text-blue-600 font-medium">
                    ✓ Corresponde à busca
                  </div>
                )}
              </div>
            ))}

            {filteredTranscript.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                {searchTerm 
                  ? `Nenhum resultado encontrado para "${searchTerm}"`
                  : 'Nenhuma transcrição disponível'
                }
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
