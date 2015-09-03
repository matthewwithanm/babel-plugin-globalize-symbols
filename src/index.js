import p from 'path';
import fs from 'fs';
import crypto from 'crypto';


export default function({Plugin, types: t}) {
  return new Plugin('ast-transform', {
    visitor: {
      CallExpression(node) {
        if (t.isIdentifier(node.callee, {name: 'Symbol'})) {
          if (!node.arguments.length) return;
          const namespace = getNamespace(this.scope.hub.file.opts.filename);
          const symbolFor = t.MemberExpression(t.Identifier('Symbol'), t.Identifier('for'));
          const strings = [t.Literal('')].concat(node.arguments).concat(t.Literal(namespace));
          const keyExpr = strings.reduce((expr, string) => t.BinaryExpression('+', expr, string));
          return t.CallExpression(symbolFor, [keyExpr]);
        }
      },
    },
  });
}

function getNamespace(filename) {
  const cwd = process.cwd();
  const path = p.resolve(cwd, filename);
  const packageJsonPath = findNearestPackageJson(path);
  const json = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const modulePath = p.relative(p.dirname(packageJsonPath), path);
  return crypto.createHash('md5').update(`${json.name} ${modulePath}`).digest('hex');
}

function findNearestPackageJson(path) {
  const dir = p.dirname(path);
  const file = p.join(dir, 'package.json');
  try {
    fs.statSync(file);
    return file;
  } catch (err) {
    if (path === '/') throw new Error("Couldn't find package.json!");
    return findNearestPackageJson(dir);
  }
}
