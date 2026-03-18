import * as fs from 'node:fs';
import type { LinkDetectionResult } from '../types';

/** Detect navigation links in a source file using Babel AST parsing */
export function detectLinks(filePath: string, sourceRouteId: string): LinkDetectionResult {
  const result: LinkDetectionResult = {
    sourceFile: filePath,
    sourceRouteId,
    targets: [],
  };

  try {
    const code = fs.readFileSync(filePath, 'utf-8');
    const { parse } = require('@babel/parser');
    const traverse = require('@babel/traverse').default;

    const ast = parse(code, {
      sourceType: 'module',
      plugins: ['typescript', 'jsx'],
    });

    traverse(ast, {
      // <Link to="/path" /> or <NavLink to="/path" />
      JSXOpeningElement(astPath: any) {
        const name = astPath.node.name;
        if (
          name.type === 'JSXIdentifier' &&
          (name.name === 'Link' || name.name === 'NavLink')
        ) {
          const toAttr = astPath.node.attributes.find(
            (attr: any) =>
              attr.type === 'JSXAttribute' &&
              attr.name.name === 'to',
          );

          if (toAttr) {
            const targetPath = extractStringValue(toAttr.value);
            if (targetPath) {
              result.targets.push({
                targetPath,
                type: 'link',
                line: astPath.node.loc?.start?.line ?? 0,
              });
            }
          }

          // Also check href for Next.js Link
          const hrefAttr = astPath.node.attributes.find(
            (attr: any) =>
              attr.type === 'JSXAttribute' &&
              attr.name.name === 'href',
          );

          if (hrefAttr) {
            const targetPath = extractStringValue(hrefAttr.value);
            if (targetPath) {
              result.targets.push({
                targetPath,
                type: 'link',
                line: astPath.node.loc?.start?.line ?? 0,
              });
            }
          }
        }
      },

      // navigate("/path") from useNavigate()
      CallExpression(astPath: any) {
        const callee = astPath.node.callee;

        // Direct navigate("/path") call
        if (callee.type === 'Identifier' && callee.name === 'navigate') {
          const firstArg = astPath.node.arguments[0];
          const targetPath = extractStringFromNode(firstArg);
          if (targetPath) {
            result.targets.push({
              targetPath,
              type: 'navigate',
              line: astPath.node.loc?.start?.line ?? 0,
            });
          }
        }

        // router.push("/path") or router.replace("/path")
        if (
          callee.type === 'MemberExpression' &&
          callee.object.type === 'Identifier' &&
          (callee.object.name === 'router' || callee.object.name === 'Router') &&
          callee.property.type === 'Identifier' &&
          (callee.property.name === 'push' || callee.property.name === 'replace')
        ) {
          const firstArg = astPath.node.arguments[0];
          const targetPath = extractStringFromNode(firstArg);
          if (targetPath) {
            result.targets.push({
              targetPath,
              type: callee.property.name === 'replace' ? 'redirect' : 'navigate',
              line: astPath.node.loc?.start?.line ?? 0,
            });
          }
        }
      },
    });
  } catch {
    // If parsing fails, return empty result
  }

  return result;
}

/** Extract string value from a JSX attribute value node */
function extractStringValue(node: any): string | null {
  if (!node) return null;

  // to="/path"
  if (node.type === 'StringLiteral') {
    return node.value;
  }

  // to={"/path"}
  if (node.type === 'JSXExpressionContainer') {
    return extractStringFromNode(node.expression);
  }

  return null;
}

/** Extract a string from an AST node (handles string literals and template literals) */
function extractStringFromNode(node: any): string | null {
  if (!node) return null;

  if (node.type === 'StringLiteral') {
    return node.value;
  }

  // Template literal with no expressions: `/users`
  if (node.type === 'TemplateLiteral' && node.expressions.length === 0) {
    return node.quasis.map((q: any) => q.value.raw).join('');
  }

  return null;
}
