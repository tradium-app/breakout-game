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
import { useIonicStorage } from '../../common/useIonicStorage';

const Settings = () => {
  const [ema26, setEma26] = useIonicStorage('ema26', 1);
  const [showRSI, setShowRSI] = useIonicStorage('showRSI', 1);

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
                      <IonCheckbox
                        slot="start"
                        checked={ema26}
                        onIonChange={e => setEma26(e.detail.checked ? 1 : 0)}
                      />
                    </IonItem>
                    <IonItem>
                      <IonLabel>Show RSI</IonLabel>
                      <IonCheckbox
                        slot="start"
                        checked={showRSI}
                        onIonChange={e => setShowRSI(e.detail.checked ? 1 : 0)}
                      />
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
