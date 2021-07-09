import { IonFab, IonLabel } from '@ionic/react';

const LeftLegend = ({ predicted, symbol, emaPeriod, score, transactions }) => (
  <IonFab horizontal="start" vertical="top" slot="fixed">
    <IonLabel>{predicted && symbol}</IonLabel>
    <br />
    <IonLabel className="tiny-labels">EMA: {emaPeriod}</IonLabel>
    <br />
    <IonLabel className="tiny-labels">
      {'. . . . .'}
      <br />
      Total Transactions: {transactions}
      <br />
      Accuracy:{' '}
      {transactions > 0
        ? ((score * 100) / transactions).toLocaleString(undefined, {
            maximumFractionDigits: 0,
          }) + '%'
        : ''}
    </IonLabel>
  </IonFab>
);

export default LeftLegend;
