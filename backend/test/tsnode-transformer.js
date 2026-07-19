// Transformer mínimo para e2e: usa TypeScript transpileModule (sin type-check)
// preservando el orden de carga CommonJS de los módulos, igual que el runtime
// (ts-node). Resuelve el ciclo de imports por valor entre modelos de
// sequelize-typescript que ts-jest deja undefined y cuelga app.init().
const ts = require('typescript');

module.exports = {
  process(src, filename) {
    if (filename.endsWith('.ts') || filename.endsWith('.tsx')) {
      const out = ts.transpileModule(src, {
        compilerOptions: {
          module: ts.ModuleKind.CommonJS,
          target: ts.ScriptTarget.ES2023,
          esModuleInterop: true,
          experimentalDecorators: true,
          emitDecoratorMetadata: true,
        },
      });
      return { code: out.outputText };
    }
    return { code: src };
  },
};
