/**
 * FASE 3.4: CONFIGURAÇÕES (Settings Page)
 * Auto-Model Router: GPT-5.1 Codex (Frontend/React/Page)
 * 
 * Página de configurações da plataforma com abas para:
 * - Perfil e Organização
 * - API Keys
 * - Integrações (Twilio, CRM, Calendar)
 * - Notificações
 * - Billing
 */

'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, 
  Key, 
  Zap, 
  Bell, 
  CreditCard,
  Copy,
  Eye,
  EyeOff,
  Trash2,
  Plus,
  Check,
  AlertCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export default function SettingsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showApiKey, setShowApiKey] = useState<Record<string, boolean>>({});

  // Fetch settings
  const { data: settings, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const response = await fetch('/api/settings');
      if (!response.ok) throw new Error('Failed to fetch settings');
      return response.json();
    },
  });

  // Update organization
  const updateOrgMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/organizations/current', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update organization');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      toast({
        title: 'Sucesso',
        description: 'Organização atualizada com sucesso.',
      });
    },
  });

  // Create API key
  const createApiKeyMutation = useMutation({
    mutationFn: async (name: string) => {
      const response = await fetch('/api/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      if (!response.ok) throw new Error('Failed to create API key');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      toast({
        title: 'API Key criada',
        description: 'Copie a chave agora - ela não será mostrada novamente.',
      });
    },
  });

  // Delete API key
  const deleteApiKeyMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/api-keys/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete API key');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      toast({
        title: 'API Key deletada',
        description: 'A chave foi removida com sucesso.',
      });
    },
  });

  // Copy to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copiado!',
      description: 'Texto copiado para a área de transferência.',
    });
  };

  if (isLoading) {
    return <div className="p-8">Carregando configurações...</div>;
  }

  return (
    <div className="flex-1 space-y-6 p-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
        <p className="text-muted-foreground">
          Gerencie sua conta, API keys, integrações e preferências.
        </p>
      </div>

      <Tabs defaultValue="organization" className="space-y-6">
        <TabsList>
          <TabsTrigger value="organization" className="gap-2">
            <Building2 className="h-4 w-4" />
            Organização
          </TabsTrigger>
          <TabsTrigger value="api-keys" className="gap-2">
            <Key className="h-4 w-4" />
            API Keys
          </TabsTrigger>
          <TabsTrigger value="integrations" className="gap-2">
            <Zap className="h-4 w-4" />
            Integrações
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4" />
            Notificações
          </TabsTrigger>
          <TabsTrigger value="billing" className="gap-2">
            <CreditCard className="h-4 w-4" />
            Billing
          </TabsTrigger>
        </TabsList>

        {/* Organization Settings */}
        <TabsContent value="organization" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Informações da Organização</CardTitle>
              <CardDescription>
                Atualize os dados da sua organização
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="org-name">Nome da Organização</Label>
                  <Input
                    id="org-name"
                    defaultValue={settings?.organization?.name}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="org-domain">Domínio</Label>
                  <Input
                    id="org-domain"
                    defaultValue={settings?.organization?.domain}
                    placeholder="exemplo.com"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Plano Atual</Label>
                    <div>
                      <Badge variant="default">
                        {settings?.organization?.plan || 'Free'}
                      </Badge>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Chamadas Simultâneas</Label>
                    <div className="text-2xl font-bold">
                      {settings?.organization?.maxConcurrentCalls || 20}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={() => updateOrgMutation.mutate({})}>
                  Salvar Alterações
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Limites e Uso</CardTitle>
              <CardDescription>
                Acompanhe o uso dos recursos da sua organização
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">Total de Agentes</div>
                  <div className="text-2xl font-bold">
                    {settings?.usage?.agents || 0}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Chamadas (Este Mês)</div>
                  <div className="text-2xl font-bold">
                    {settings?.usage?.callsThisMonth || 0}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Custo (Este Mês)</div>
                  <div className="text-2xl font-bold">
                    ${((settings?.usage?.costThisMonth || 0) / 100).toFixed(2)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* API Keys */}
        <TabsContent value="api-keys" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>API Keys</CardTitle>
                  <CardDescription>
                    Gerencie chaves de API para integração com sua aplicação
                  </CardDescription>
                </div>
                <Button
                  onClick={() => {
                    const name = prompt('Nome da API Key:');
                    if (name) createApiKeyMutation.mutate(name);
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Nova API Key
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {settings?.apiKeys?.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Key className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhuma API Key criada ainda</p>
                  <p className="text-sm mt-1">
                    Crie uma chave para começar a integrar com a API
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {settings?.apiKeys?.map((key: any) => (
                    <div
                      key={key.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="space-y-1 flex-1">
                        <div className="font-medium">{key.name}</div>
                        <div className="flex items-center gap-2">
                          <code className="text-xs bg-muted px-2 py-1 rounded font-mono">
                            {showApiKey[key.id] ? key.key : '••••••••••••••••'}
                          </code>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() =>
                              setShowApiKey((prev) => ({
                                ...prev,
                                [key.id]: !prev[key.id],
                              }))
                            }
                          >
                            {showApiKey[key.id] ? (
                              <EyeOff className="h-3 w-3" />
                            ) : (
                              <Eye className="h-3 w-3" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => copyToClipboard(key.key)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Criada em {new Date(key.createdAt).toLocaleDateString('pt-BR')}
                          {' • '}
                          Último uso: {key.lastUsedAt ? new Date(key.lastUsedAt).toLocaleDateString('pt-BR') : 'Nunca'}
                        </div>
                      </div>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Deletar API Key?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta ação não pode ser desfeita. Aplicações usando esta chave
                              perderão acesso imediatamente.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteApiKeyMutation.mutate(key.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Deletar
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div className="text-sm text-yellow-900">
                  <div className="font-semibold mb-1">Importante</div>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Mantenha suas API keys seguras e nunca as compartilhe publicamente</li>
                    <li>Use diferentes keys para diferentes ambientes (dev, staging, prod)</li>
                    <li>Rotacione suas keys periodicamente por segurança</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Integrations */}
        <TabsContent value="integrations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Integrações Disponíveis</CardTitle>
              <CardDescription>
                Conecte sua plataforma com ferramentas externas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Twilio */}
              <div className="flex items-start justify-between p-4 border rounded-lg">
                <div className="flex gap-4">
                  <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">📞</span>
                  </div>
                  <div>
                    <div className="font-semibold">Twilio</div>
                    <div className="text-sm text-muted-foreground">
                      Conecte números de telefone e envie SMS
                    </div>
                    {settings?.integrations?.twilio?.connected && (
                      <Badge variant="success" className="mt-2">
                        <Check className="h-3 w-3 mr-1" />
                        Conectado
                      </Badge>
                    )}
                  </div>
                </div>
                <Button variant="outline">
                  {settings?.integrations?.twilio?.connected ? 'Configurar' : 'Conectar'}
                </Button>
              </div>

              {/* Salesforce */}
              <div className="flex items-start justify-between p-4 border rounded-lg">
                <div className="flex gap-4">
                  <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">☁️</span>
                  </div>
                  <div>
                    <div className="font-semibold">Salesforce</div>
                    <div className="text-sm text-muted-foreground">
                      Sincronize leads e tickets automaticamente
                    </div>
                  </div>
                </div>
                <Button variant="outline">Conectar</Button>
              </div>

              {/* Google Calendar */}
              <div className="flex items-start justify-between p-4 border rounded-lg">
                <div className="flex gap-4">
                  <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">📅</span>
                  </div>
                  <div>
                    <div className="font-semibold">Google Calendar</div>
                    <div className="text-sm text-muted-foreground">
                      Agende compromissos automaticamente
                    </div>
                  </div>
                </div>
                <Button variant="outline">Conectar</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Preferências de Notificação</CardTitle>
              <CardDescription>
                Configure como você quer ser notificado sobre eventos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Chamadas Falhadas</div>
                  <div className="text-sm text-muted-foreground">
                    Receba alertas quando uma chamada falhar
                  </div>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Relatórios Semanais</div>
                  <div className="text-sm text-muted-foreground">
                    Resumo semanal de performance por email
                  </div>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Alertas de Custo</div>
                  <div className="text-sm text-muted-foreground">
                    Notificar quando atingir 80% do limite de gastos
                  </div>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Billing */}
        <TabsContent value="billing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Plano e Billing</CardTitle>
              <CardDescription>
                Gerencie seu plano e métodos de pagamento
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">Plano Atual</div>
                  <div className="text-xl font-bold">Free</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Gasto Este Mês</div>
                  <div className="text-xl font-bold">
                    ${((settings?.usage?.costThisMonth || 0) / 100).toFixed(2)}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Próxima Fatura</div>
                  <div className="text-xl font-bold">-</div>
                </div>
              </div>
              <div className="pt-4">
                <Button>Upgrade para Professional</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
