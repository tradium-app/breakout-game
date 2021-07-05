import { useEffect } from 'react';
import { ApolloProvider } from '@apollo/client/react';
import { IonApp, isPlatform, IonRouterOutlet } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { Route, Switch } from 'react-router-dom';
import { FirebaseAnalytics } from '@ionic-native/firebase-analytics';
import graphqlClient from './graphql-client';

import Home from './pages/Home';
import Settings from './pages/Settings';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/* Theme variables */
import './theme/variables.css';

const App: React.FC = () => {
  useEffect(() => {
    isPlatform('cordova') &&
      FirebaseAnalytics.logEvent('page_view', { page: 'dashboard' });
  }, []);

  return (
    <ApolloProvider client={graphqlClient}>
      <IonApp>
        <IonReactRouter>
          <IonRouterOutlet>
            <Switch>
              <Route exact path="/">
                <Home />
              </Route>
              <Route exact path="/settings">
                <Settings />
              </Route>
            </Switch>
          </IonRouterOutlet>
        </IonReactRouter>
      </IonApp>
    </ApolloProvider>
  );
};

export default App;
