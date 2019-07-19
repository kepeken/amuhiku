import * as React from 'react';
import { HashRouter, Route } from 'react-router-dom';

import Header from './Header';
import Home from './Home';
import WordList from './WordList';

const App = () => (
  <HashRouter>
    <div>
      <Header />
      <Route exact path="/" component={Home} />
      <Route path="/d/:id" component={WordList} />
      <Route path="/u/:id" />
    </div>
  </HashRouter>
);

export default App;
