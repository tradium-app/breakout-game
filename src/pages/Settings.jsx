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
  IonGrid,
  IonRow,
  IonCol,
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
      <IonContent fullscreen={false}>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Settings</IonTitle>
          </IonToolbar>
        </IonHeader>

        <IonGrid>
          <IonRow className="center-content">
            <IonCol size="8">
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
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default Settings;
