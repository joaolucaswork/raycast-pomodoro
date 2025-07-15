# Teste de Debug - Sessões não sendo salvas

## Como testar

### 1. Preparação
1. O projeto foi compilado com logs de debug adicionados
2. Abra o Raycast e execute o comando "Another Round"
3. Abra o DevTools do Raycast (se disponível) ou verifique os logs no terminal

### 2. Teste Básico - Sessão Curta (< 40 segundos)
1. Inicie uma sessão de trabalho
2. Aguarde alguns segundos (menos de 40)
3. Clique em "Complete Round" ou pare a sessão
4. **Resultado esperado**: Deve aparecer notificação "Session Too Short" e NÃO salvar no histórico

### 3. Teste Principal - Sessão Longa (> 40 segundos)
1. Inicie uma nova sessão de trabalho
2. Aguarde pelo menos 45-50 segundos
3. Clique em "Complete Round"
4. **Resultado esperado**: Sessão deve ser salva no histórico

### 4. Logs a verificar no Console

Procure por estes logs na ordem:

```
[DEBUG] updateStoreAfterCompletion called with:
[DEBUG] Current store state:
[DEBUG] shouldSaveSessionToHistory called with session:
[DEBUG] Session duration calculation:
[DEBUG] getActualSessionDuration called with session:
[DEBUG] Calculated session duration:
[DEBUG] Session completion details:
[DEBUG] About to update store with:
[DEBUG] Store updated after completion:
[DEBUG] Store state after update:
```

### 5. Informações importantes nos logs

**Verifique especialmente:**
- `actualDuration` deve ser >= 40 para sessões longas
- `shouldSave` deve ser `true`
- `shouldSaveToHistory` deve ser `true` para sessões válidas
- `oldHistoryLength` vs `newHistoryLength` deve aumentar em 1
- `actualHistoryLength` deve confirmar que o store foi atualizado

### 6. Possíveis problemas identificados pelos logs

**Se `actualDuration` < 40:**
- Timer está sendo completado muito rápido
- Problema no cálculo de tempo

**Se `shouldSaveToHistory` = false mas `actualDuration` >= 40:**
- Problema na função `shouldSaveSessionToHistory`
- Problema com datas `startTime` ou `endTime`

**Se `newHistoryLength` não aumenta:**
- Problema na atualização do store
- Problema na persistência

**Se `actualHistoryLength` não reflete a mudança:**
- Store não está sendo atualizado corretamente

### 7. Teste de Verificação do Histórico
1. Após completar uma sessão válida, vá para "Timer History"
2. Verifique se a sessão aparece na lista
3. Se não aparecer, o problema está na persistência ou na interface

### 8. Próximos passos baseados nos resultados

**Se os logs mostram que tudo está correto mas o histórico não aparece:**
- Problema na interface do histórico
- Problema na persistência (zustand storage)

**Se os logs mostram `shouldSaveToHistory = false`:**
- Problema no cálculo de duração
- Problema com datas

**Se não aparecem logs de debug:**
- Problema na compilação
- Logs não estão sendo exibidos no console correto

## Executar o teste

1. Execute o comando no Raycast
2. Faça o teste com uma sessão > 40 segundos
3. Copie todos os logs que aparecem no console
4. Relate os resultados para análise

## Informações adicionais

- Os logs de debug são temporários e serão removidos após identificar o problema
- Foque especialmente nos valores de `actualDuration` e `shouldSaveToHistory`
- Se possível, teste tanto "Complete Round" quanto parar a sessão manualmente
