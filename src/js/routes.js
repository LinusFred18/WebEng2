
import HomePage from '../pages/home.jsx';

//import DynamicRoutePage from '../pages/dynamic-route.jsx';
//import RequestAndLoad from '../pages/request-and-load.jsx';
import NotFoundPage from '../pages/404.jsx';

var routes = [
  {
    path: '/',
    component: HomePage,
  },
  {
    path: '(.*)',
    component: NotFoundPage,
  },
];

export default routes;
