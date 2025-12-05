# 🤝 Contribuindo para Retell MVP

Obrigado por considerar contribuir! 🎉

## 📋 Processo de Contribuição

### 1. Fork o Projeto
```bash
# Clique em "Fork" no GitHub
# Clone seu fork
git clone https://github.com/SEU-USUARIO/retell-mvp.git
cd retell-mvp
```

### 2. Criar Branch
```bash
git checkout -b feature/minha-feature
```

### 3. Fazer Mudanças
- Escreva código limpo e documentado
- Siga convenções existentes
- **NUNCA commite credenciais**

### 4. Testar Localmente
```bash
npm install
npm run build
npm test
```

### 5. Commit
```bash
git add .
git commit -m "feat: adiciona nova funcionalidade X"
```

**Padrão de commits**:
- `feat:` nova funcionalidade
- `fix:` correção de bug
- `docs:` documentação
- `chore:` tarefas de manutenção
- `refactor:` refatoração de código
- `test:` adição de testes

### 6. Push e PR
```bash
git push origin feature/minha-feature
# Abra Pull Request no GitHub
```

## 🔐 Segurança

⚠️ **CRÍTICO**: Nunca commite:
- API Keys (Twilio, Retell.ai, OpenAI)
- Tokens de autenticação
- Credenciais de banco de dados
- Secrets do `.env`

✅ Use sempre variáveis de ambiente!

## 📝 Estilo de Código

- **TypeScript**: seguir convenções NestJS
- **Indentação**: 2 espaços
- **Nomenclatura**: camelCase para variáveis, PascalCase para classes
- **Imports**: organizar por grupos (libs externas → libs internas → módulos locais)

## 🧪 Testes

```bash
# Executar testes
npm test

# Coverage
npm run test:cov
```

## 📚 Documentação

Sempre atualize:
- README.md se adicionar features
- Comentários JSDoc para funções públicas
- Swagger docs para novos endpoints

## ❓ Dúvidas

Abra uma [Issue](https://github.com/SEU-USUARIO/retell-mvp/issues) ou entre em contato!

---

**Obrigado por contribuir! 🚀**
