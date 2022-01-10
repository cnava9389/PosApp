import { render } from 'solid-js/web';
import { Router } from 'solid-app-router';
import { UserProvider } from './context/UserContext'


import './index.css';
import App from './App';

render(() => <Router><UserProvider><App /></UserProvider></Router>, document.getElementById('root') as HTMLElement);
