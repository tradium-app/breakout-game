import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonButtons,
  IonPage,
  IonTitle,
  IonCheckbox,
  IonBackButton,
  IonLabel,
  IonList,
  IonCard,
  IonCardContent,
  IonItem,
} from '@ionic/react';
import './Home.css';

const Settings = () => {
  return (
    <IonPage>
      <IonHeader className="ion-no-border" translucent={true}>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/" />
          </IonButtons>
          <IonTitle>Settings</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen={true}>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Settings</IonTitle>
          </IonToolbar>
        </IonHeader>

        <IonCard>
          <IonCardContent>
            <IonList lines="none">
              <IonItem>
                <IonLabel>Show EMA 26</IonLabel>
                <IonCheckbox slot="start" />
              </IonItem>
            </IonList>
          </IonCardContent>
        </IonCard>
      </IonContent>
    </IonPage>
  );
};

export default Settings;
