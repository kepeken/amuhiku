import { createElement } from 'react';
import { render } from 'react-dom';
import 'whatwg-fetch';
import './icons';
import App from './components/App';

render(
  createElement(App),
  document.getElementById('app')
);
