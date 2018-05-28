# babel-plugin-react-webpack-hot

Will transform this:
```js
import MyComponent from './my-path.js';

/* ... */

ReactDOM.render(
  <MyComponent />,
  document.getElementById('root'),
);

```
into this:
```js
import MyComponent from './my-path.js';

/* ... */

(() => {
  const AppContainer = require('react-hot-loader').AppContainer;
  const renderIt = () => {
    ReactDOM.render(
      <AppContainer>
        <MyComponent />
      </AppContainer>,
      document.getElementById('root'),
    );
  }
  
  renderIt();
  
  if (module.hot) {
  	module.hot.accept(['./my-path.js'], () => renderIt());
  }
})();
```

This is useful if you're looking to use `react-hot-loader` and have multiple rendering points throughout your app.

It's also assuming you're using **webpack 2** import (with babel es2015 modules transpilation deactivated).
