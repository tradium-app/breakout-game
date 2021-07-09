import { IonFab, IonLabel } from '@ionic/react';

const LeftLegend = ({
  showSymbol,
  symbol,
  showEma26,
  emaPeriod,
  showRSI,
  rsiPeriod,
  score,
  transactions,
}) => (
  <IonFab horizontal="start" vertical="top" slot="fixed">
    <IonLabel>{showSymbol && symbol}</IonLabel>
    <br />
    <IonLabel className="tiny-labels">
      Total Transactions: {transactions}
      <br />
      Accuracy:{' '}
      {transactions > 0
        ? ((score * 100) / transactions).toLocaleString(undefined, {
            maximumFractionDigits: 0,
          }) + '%'
        : ''}
      <br />
      {'. . . . .'}
    </IonLabel>
    <br />
    {!!showEma26 && (
      <IonLabel className="tiny-labels">
        EMA: {emaPeriod}
        <br />
      </IonLabel>
    )}

    {!!showRSI && <IonLabel className="tiny-labels">RSI: {rsiPeriod}</IonLabel>}
  </IonFab>
);

export default LeftLegend;
