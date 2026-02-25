module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',     // Nova funcionalidade
        'fix',      // Correcao de bug
        'docs',     // Documentacao
        'style',    // Formatacao (sem mudanca de logica)
        'refactor', // Refatoracao
        'perf',     // Performance
        'test',     // Testes
        'build',    // Build system
        'ci',       // CI/CD
        'chore',    // Tarefas gerais
        'revert',   // Revert de commit
      ],
    ],
    'scope-enum': [
      1,
      'always',
      [
        'core',
        'auth',
        'cadastros',
        'fiscal',
        'vendas',
        'estoque',
        'financeiro',
        'infra',
        'docs',
        'config',
        'shared',
        'frontend',
        'backend',
      ],
    ],
    'subject-max-length': [2, 'always', 100],
    'body-max-line-length': [1, 'always', 200],
  },
};
