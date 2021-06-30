import { ApolloProvider } from '@apollo/client/react';
import { IonApp, isPlatform } from '@ionic/react';
import Home from './pages/Home';
import graphqlClient from './graphql-client';
import { FirebaseAnalytics } from '@ionic-native/firebase-analytics';

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
import { useEffect } from 'react';

const App: React.FC = () => {
  useEffect(() => {
    isPlatform('cordova') &&
      FirebaseAnalytics.logEvent('page_view', { page: 'dashboard' });
  }, []);

  return (
    <ApolloProvider client={graphqlClient}>
      <IonApp>
        <Home />
      </IonApp>
    </ApolloProvider>
  );
};

export default App;
