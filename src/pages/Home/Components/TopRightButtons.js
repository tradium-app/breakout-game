import {
  IonButton,
  IonCol,
  IonFab,
  IonIcon,
  IonLabel,
  IonRow,
} from '@ionic/react';
import { settingsSharp } from 'ionicons/icons';

const TopRightButtons = ({ balance, resetBalance }) => (
  <IonFab vertical="top" horizontal="end" slot="fixed" className="top-balance">
    <IonRow>
      <IonCol>
        <IonButton onClick={resetBalance} color="warning">
          <IonLabel>
            {'Balance: '}
            {balance.toLocaleString(undefined, {
              maximumFractionDigits: 0,
            })}
          </IonLabel>
        </IonButton>
      </IonCol>
      <IonCol>
        <IonButton routerLink="/settings" color="light">
          <IonIcon icon={settingsSharp} />
        </IonButton>
      </IonCol>
    </IonRow>
  </IonFab>
);

export default TopRightButtons;
