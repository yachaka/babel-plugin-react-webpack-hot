
const alreadyProcessed = new WeakSet();
let num = -1;

module.exports = function({ types: t }) {

  const isCreateElement = t.buildMatchMemberExpression('React.createElement');
  const isReactDOMRender = t.buildMatchMemberExpression('ReactDOM.render');

  return {
    visitor: {
      CallExpression: {
        exit(path) {
          if (!alreadyProcessed.has(path.node)
          && t.isCallExpression(path)
          && isReactDOMRender(path.node.callee)) {
            alreadyProcessed.add(path.node);
            num++;

            const renderedComponentIdentifierNames = [];

            path.traverse({
              CallExpression: (path) =>{
                if (isCreateElement(path.node.callee)
                && t.isIdentifier(path.node.arguments[0])) {
                  renderedComponentIdentifierNames.push(path.node.arguments[0].name);
                }
              },
            });

            const renderCallWithAppContainer = t.callExpression(
              t.memberExpression(t.identifier('ReactDOM'), t.identifier('render')),
              [
                t.jSXElement(
                  t.jSXOpeningElement(t.jSXIdentifier('AppContainer'), []),
                  t.jSXClosingElement(t.jSXIdentifier('AppContainer')),
                  [t.jSXExpressionContainer(path.node.arguments[0])]
                ),
                path.node.arguments[1],
              ]
            );
            alreadyProcessed.add(renderCallWithAppContainer);

            const program = path.findParent(path => path.isProgram());

            const sources = renderedComponentIdentifierNames.map(name => {
              if (program.scope.hasBinding(name)) {
                return program.scope.bindings[name].path.parent.source;
              }
            }).filter(v => !!v);

            const renderFunctionIdentifier = t.identifier(`babelReactHotAccept__renderComponent${num}`);

            const call = t.callExpression(
              t.arrowFunctionExpression(
                [],
                t.blockStatement([
                  t.variableDeclaration('const', [t.variableDeclarator(
                    t.identifier('AppContainer'),
                    t.memberExpression(
                      t.callExpression(t.identifier('require'), [t.stringLiteral('react-hot-loader')]),
                      t.identifier('AppContainer')
                    )
                  )]),

                  t.variableDeclaration('const', [t.variableDeclarator(
                    renderFunctionIdentifier,
                    t.arrowFunctionExpression([], t.blockStatement([
                      t.expressionStatement(renderCallWithAppContainer),
                    ]))
                  )]),

                  t.expressionStatement(t.callExpression(renderFunctionIdentifier, [])),

                  t.ifStatement(
                    t.memberExpression(t.identifier('module'), t.identifier('hot')),
                    t.expressionStatement(t.callExpression(
                      t.memberExpression(t.memberExpression(t.identifier('module'), t.identifier('hot')), t.identifier('accept')),
                      [
                        t.arrayExpression(sources),
                        t.functionExpression(null, [], t.blockStatement([
                          t.expressionStatement(t.callExpression(renderFunctionIdentifier, []))
                        ])),
                      ]
                    ))
                  ),

                ])
              ),
              []
            );

            path.replaceWith(call);
          }
        }
      }
    }
  }
}
