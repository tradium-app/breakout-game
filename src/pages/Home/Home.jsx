import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@apollo/client';
import { createChart } from 'lightweight-charts';
import {
  IonContent,
  IonPage,
  IonRow,
  IonCol,
  IonFab,
  IonFabButton,
  IonButton,
  IonLabel,
  IonLoading,
  IonAlert,
  useIonAlert,
  useIonToast,
  IonIcon,
} from '@ionic/react';
import './Home.css';
import { settingsSharp } from 'ionicons/icons';
import { useIonicStorage } from '../../common/useIonicStorage';
import {
  emaPeriod,
  toastOptions,
  defaultChartOptions,
  afterPredictionChartOptions,
  candleSeriesOptions,
  volumeSeriesOptions,
  markerOptions,
  emaSeriesOptions,
} from './configs';
import { GET_NEW_GAME_QUERY } from './Home_Query';
import computeChartData from './computeChartData';

const Home = () => {
  const [score, setScore] = useIonicStorage('score', 0);
  const [transactions, setTransactions] = useIonicStorage('transactions', 0);
  const [balance, setBalance] = useIonicStorage('balance', 10000);
  const [currentProfit, setCurrentProfit] = useIonicStorage('profit', 0);
  const [showEma26] = useIonicStorage('ema26', 1);

  const [showToast] = useIonToast();
  const [showAlert] = useIonAlert();
  const containerId = useRef(null);
  const { loading, error, data, refetch } = useQuery(GET_NEW_GAME_QUERY, {
    fetchPolicy: 'no-cache',
    notifyOnNetworkStatusChange: true,
  });
  const [predicted, setPredicted] = useState(false);
  const [skipped, setSkipped] = useState(false);
  const [candleSeries, setCandleSeries] = useState(null);
  const [volumeSeries, setVolumeSeries] = useState(null);
  const [emaSeries, setEmaSeries] = useState(null);

  useEffect(() => {
    containerId.current = createChart(containerId.current, {
      width: window.innerWidth,
      height: window.innerHeight,
    });
    setCandleSeries(
      containerId.current.addCandlestickSeries(candleSeriesOptions),
    );

    const volSeries =
      containerId.current.addHistogramSeries(volumeSeriesOptions);
    setVolumeSeries(volSeries);

    const emaSeries = containerId.current.addLineSeries(emaSeriesOptions);
    setEmaSeries(emaSeries);

    containerId.current.timeScale().applyOptions({ rightOffset: 15 });
  }, []);

  let priceData, volumeData, emaData, predictionPoint;

  if (!loading && !error && data.getNewGame) {
    ({ priceData, volumeData, emaData } = computeChartData(data.getNewGame));
    predictionPoint = priceData[data.getNewGame.price_history.length].time;
  }

  useEffect(() => {
    if ((predicted || skipped) && priceData) {
      for (
        let index = data.getNewGame.price_history.length;
        index < priceData.length;
        index++
      ) {
        candleSeries.update(priceData[index]);
        volumeSeries.update(volumeData[index]);
      }

      showEma26 &&
        emaData
          .filter(ed => ed.time > predictionPoint)
          .forEach(ed => {
            emaSeries.update(ed);
          });
    }
  }, [predicted, skipped]);

  if (!loading && !error && priceData && !predicted && !skipped) {
    candleSeries.setData(
      priceData.slice(0, data.getNewGame.price_history.length),
    );
    volumeSeries.setData(
      volumeData.slice(0, data.getNewGame.price_history.length),
    );
    showEma26 &&
      emaSeries.setData(emaData.filter(ed => ed.time <= predictionPoint));

    containerId.current.applyOptions(defaultChartOptions);
    containerId.current.timeScale().fitContent();

    const lastTimeStamp =
      priceData[data.getNewGame.price_history.length - 1].time;

    const markers = [
      {
        ...markerOptions,
        time: lastTimeStamp,
      },
    ];

    candleSeries.setMarkers(markers);
  }

  const predict = action => {
    if (predicted) {
      let message = `You already ${
        currentProfit > 0 ? 'gained' : 'lost'
      } ${Math.abs(currentProfit).toLocaleString(undefined, {
        maximumFractionDigits: 0,
      })}.  Press Next for new prediction.`;

      showToast({
        ...toastOptions,
        message,
      });

      return;
    } else if (skipped) {
      showToast({
        ...toastOptions,
        message: 'Press Next for new prediction.',
      });
      return;
    }

    const newBalance = computeNewBalance(
      action,
      balance,
      priceData[data.getNewGame.price_history.length - 1].close,
      priceData[priceData.length - 1].close,
    );

    const change = Math.abs(newBalance - balance).toLocaleString(undefined, {
      maximumFractionDigits: 0,
    });

    let message = newBalance > balance ? 'Bravo!. ' : 'Oops!. ';
    message += `You ${newBalance > balance ? 'gained' : 'lost'} ${change}.`;

    showToast({
      ...toastOptions,
      message,
    });

    setCurrentProfit(newBalance - balance);
    setBalance(newBalance);
    setTransactions(transactions + 1);
    newBalance > balance && setScore(score + 1);

    containerId.current.applyOptions(afterPredictionChartOptions);
    setPredicted(true);
  };

  const nextGame = () => {
    setPredicted(false);
    setSkipped(false);
    refetch();
  };

  const skipGame = () => {
    setSkipped(true);
  };

  const resetBalance = () => {
    showAlert({
      header: 'Losing money 😅 ?',
      message: 'Want to reset balance to 10,000?',
      buttons: [
        'Cancel',
        {
          text: 'Yes',
          handler: () => {
            setBalance(10000);
            setScore(0);
            setTransactions(0);
          },
        },
      ],
    });
  };

  return (
    <IonPage>
      <IonContent fullscreen>
        <div ref={containerId} slot="fixed"></div>

        <IonAlert
          header="BreakOut Game"
          message="Predict if the stock will move 10% up/down in next 10 days."
          isOpen
          buttons={[{ text: 'Start' }]}
        />

        <IonLoading isOpen={loading} message={'Loading game...'} />

        <IonFab horizontal="start" vertical="top" slot="fixed">
          <IonLabel>{predicted && data?.getNewGame?.symbol}</IonLabel>
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

        <IonFab
          vertical="top"
          horizontal="end"
          slot="fixed"
          className="top-balance"
        >
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

        <IonFab vertical="bottom" horizontal="start" slot="fixed">
          <IonRow>
            <IonCol>
              <IonFabButton onClick={() => predict('buy')} color="success">
                {'▲'}
                <br />
                {'Buy'}
              </IonFabButton>
            </IonCol>
            <IonCol>
              <IonFabButton onClick={() => predict('short')} color="danger">
                {'▼'}
                <br />
                {'Short'}
              </IonFabButton>
            </IonCol>
          </IonRow>
        </IonFab>

        <IonFab vertical="bottom" horizontal="end" slot="fixed">
          <IonFabButton onClick={predicted || skipped ? nextGame : skipGame}>
            {'►'}
            <br />
            {predicted || skipped ? 'Next' : 'Skip'}
          </IonFabButton>
        </IonFab>
      </IonContent>
    </IonPage>
  );
};

const computeNewBalance = (
  action,
  initialBalance,
  purchasePrice,
  sellPrice,
) => {
  const percentChange = (sellPrice - purchasePrice) / purchasePrice;

  return action === 'buy'
    ? initialBalance * (1 + percentChange)
    : initialBalance * (1 - percentChange);
};

export default Home;
