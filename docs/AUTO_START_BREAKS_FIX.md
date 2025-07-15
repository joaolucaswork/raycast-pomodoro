# Correção do Auto-Start de Breaks em Background

## Problema Identificado
O timer não estava iniciando automaticamente o tempo curto de 5 minutos (short break) em background após completar uma sessão de trabalho.

## Causa Raiz
O problema estava na configuração padrão do `autoStartBreaks` que estava definida como `false` em dois locais:

1. **package.json** - Configuração de preferências do Raycast
2. **preferences-service.ts** - Valor padrão quando a preferência não está definida

## Alterações Realizadas

### 1. package.json
```json
{
  "name": "autoStartBreaks",
  "title": "Auto-start Breaks",
  "description": "Automatically start break sessions after work sessions",
  "type": "checkbox",
  "default": true,  // ✅ Alterado de false para true
  "required": false
}
```

### 2. src/services/system/preferences-service.ts
```typescript
// getCurrentConfig() method
autoStartBreaks: preferences.autoStartBreaks ?? true,  // ✅ Alterado de false para true
```

## Como Funciona o Auto-Start

1. **Quando uma sessão de trabalho é completada:**
   - O `useTimer` hook detecta que `timeRemaining` chegou a 0
   - Chama `backgroundTimerService.updateTimerState()`
   - Que por sua vez chama `timerCompletionService.handleCompletion()`

2. **Lógica de Auto-Start:**
   - `timerCompletionService.handleAutoStartLogic()` verifica se deve iniciar automaticamente
   - Usa `timerCoreService.shouldAutoStartNext()` que verifica:
     - Se sessão completada foi WORK → verifica `config.autoStartBreaks`
     - Se sessão completada foi BREAK → verifica `config.autoStartWork`

3. **Determinação do próximo tipo de sessão:**
   - `timerCoreService.getNextSessionType()` determina se será SHORT_BREAK ou LONG_BREAK
   - Baseado no `longBreakInterval` (a cada 4 sessões por padrão)

## Configuração Padrão Recomendada

```typescript
const DEFAULT_CONFIG = {
  autoStartBreaks: true,    // ✅ Permite fluxo pomodoro contínuo
  autoStartWork: false,     // ✅ Usuário controla quando reiniciar trabalho
  workDuration: 25,         // 25 minutos de trabalho
  shortBreakDuration: 5,    // 5 minutos de pausa curta
  longBreakDuration: 15,    // 15 minutos de pausa longa
  longBreakInterval: 4,     // Pausa longa a cada 4 sessões
};
```

## Teste da Correção

Para testar se a correção funcionou:

1. Inicie uma sessão de trabalho
2. Aguarde ou complete manualmente a sessão
3. Verifique se o short break de 5 minutos inicia automaticamente
4. Confirme que as notificações aparecem corretamente

## Branch
As alterações foram feitas na branch `fix/auto-pause-background` e podem ser mescladas com a branch principal após teste.

## Impacto
- ✅ Short breaks (5min) agora iniciam automaticamente após trabalho
- ✅ Long breaks (15min) iniciam automaticamente após 4 sessões
- ✅ Usuário ainda controla quando iniciar novo trabalho após breaks
- ✅ Mantém toda funcionalidade existente de notificações e tracking
