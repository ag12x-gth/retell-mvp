/**
 * FASE 3.3.2: CALL RECORDING COMPONENT
 * Auto-Model Router: GPT-5.1 Codex (Frontend/React/Componente)
 * 
 * Componente para reproduzir gravações de chamadas com:
 * - Player de áudio HTML5 avançado
 * - Controles de velocidade de reprodução
 * - Visualização de waveform (opcional)
 * - Download da gravação
 * - Suporte multi-canal (agente/cliente separados)
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Play, 
  Pause, 
  Volume2, 
  Download, 
  SkipBack, 
  SkipForward,
  Headphones 
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { Slider } from '@/components/ui/slider';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface CallRecordingProps {
  recordingUrl: string;
  recordingUrlAgentChannel?: string;
  recordingUrlUserChannel?: string;
  duration: number;
  callId: string;
}

export function CallRecording({ 
  recordingUrl,
  recordingUrlAgentChannel,
  recordingUrlUserChannel,
  duration,
  callId
}: CallRecordingProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(1);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [activeChannel, setActiveChannel] = useState<'mixed' | 'agent' | 'user'>('mixed');

  // Determinar URL atual baseado no canal ativo
  const currentUrl = 
    activeChannel === 'agent' && recordingUrlAgentChannel ? recordingUrlAgentChannel :
    activeChannel === 'user' && recordingUrlUserChannel ? recordingUrlUserChannel :
    recordingUrl;

  // Atualizar áudio quando mudar de canal
  useEffect(() => {
    if (audioRef.current) {
      const currentPlayTime = audioRef.current.currentTime;
      const wasPlaying = !audioRef.current.paused;
      
      audioRef.current.src = currentUrl;
      audioRef.current.load();
      audioRef.current.currentTime = currentPlayTime;
      
      if (wasPlaying) {
        audioRef.current.play();
      }
    }
  }, [currentUrl]);

  // Atualizar tempo atual
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  // Play/Pause
  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Seek (mudar posição)
  const handleSeek = (value: number[]) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value[0];
      setCurrentTime(value[0]);
    }
  };

  // Volume
  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  // Velocidade de reprodução
  const handlePlaybackRateChange = (rate: string) => {
    const newRate = parseFloat(rate);
    setPlaybackRate(newRate);
    if (audioRef.current) {
      audioRef.current.playbackRate = newRate;
    }
  };

  // Skip (avançar/retroceder 10s)
  const skip = (seconds: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(
        0,
        Math.min(duration, audioRef.current.currentTime + seconds)
      );
    }
  };

  // Download da gravação
  const handleDownload = async () => {
    const response = await fetch(currentUrl);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `call-recording-${callId}-${activeChannel}.wav`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  // Formatar tempo (segundos -> MM:SS)
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Verificar se há canais separados disponíveis
  const hasMultiChannel = !!recordingUrlAgentChannel && !!recordingUrlUserChannel;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CardTitle>Gravação da Chamada</CardTitle>
            {hasMultiChannel && (
              <Badge variant="secondary" className="gap-1">
                <Headphones className="h-3 w-3" />
                Multi-canal
              </Badge>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
          >
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Seletor de canal (se multi-canal) */}
        {hasMultiChannel && (
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">Canal de Áudio:</span>
            <div className="flex gap-2">
              <Button
                variant={activeChannel === 'mixed' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveChannel('mixed')}
              >
                Mixado
              </Button>
              <Button
                variant={activeChannel === 'agent' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveChannel('agent')}
              >
                Apenas Agente
              </Button>
              <Button
                variant={activeChannel === 'user' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveChannel('user')}
              >
                Apenas Cliente
              </Button>
            </div>
          </div>
        )}

        {/* Player de áudio HTML5 (oculto) */}
        <audio ref={audioRef} src={currentUrl} preload="metadata" />

        {/* Timeline/Waveform */}
        <div className="space-y-2">
          <Slider
            value={[currentTime]}
            min={0}
            max={duration}
            step={0.1}
            onValueChange={handleSeek}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Controles de reprodução */}
        <div className="flex items-center justify-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => skip(-10)}
          >
            <SkipBack className="h-4 w-4" />
          </Button>

          <Button
            size="icon"
            className="h-12 w-12"
            onClick={togglePlayPause}
          >
            {isPlaying ? (
              <Pause className="h-6 w-6" />
            ) : (
              <Play className="h-6 w-6" />
            )}
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={() => skip(10)}
          >
            <SkipForward className="h-4 w-4" />
          </Button>
        </div>

        {/* Controles secundários */}
        <div className="flex items-center justify-between pt-4 border-t">
          {/* Volume */}
          <div className="flex items-center gap-3 flex-1">
            <Volume2 className="h-4 w-4 text-muted-foreground" />
            <Slider
              value={[volume]}
              min={0}
              max={1}
              step={0.01}
              onValueChange={handleVolumeChange}
              className="w-32"
            />
            <span className="text-xs text-muted-foreground w-12">
              {Math.round(volume * 100)}%
            </span>
          </div>

          {/* Velocidade de reprodução */}
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">Velocidade:</span>
            <Select 
              value={playbackRate.toString()} 
              onValueChange={handlePlaybackRateChange}
            >
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0.5">0.5x</SelectItem>
                <SelectItem value="0.75">0.75x</SelectItem>
                <SelectItem value="1">1x</SelectItem>
                <SelectItem value="1.25">1.25x</SelectItem>
                <SelectItem value="1.5">1.5x</SelectItem>
                <SelectItem value="2">2x</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Informações técnicas */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t text-sm">
          <div>
            <div className="text-muted-foreground">Formato</div>
            <div className="font-medium">WAV</div>
          </div>
          <div>
            <div className="text-muted-foreground">Duração</div>
            <div className="font-medium">{formatTime(duration)}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Canais</div>
            <div className="font-medium">
              {hasMultiChannel ? 'Estéreo (2)' : 'Mono (1)'}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
