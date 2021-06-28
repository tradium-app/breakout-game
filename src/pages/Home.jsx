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
} from '@ionic/react';
import './Home.css';
import moment from 'moment';
import { useIonicStorage } from '../common/useIonicStorage';
import {
  toastOptions,
  defaultChartOptions,
  afterPredictionChartOptions,
  candleSeriesOptions,
  volumeSeriesOptions,
  markerOptions,
  emaSeriesOptions,
} from './configs';
import { ema } from 'technicalindicators';
import { GET_NEW_GAME_QUERY } from './Home_Query';

const emaPeriod = 26;

const Home = () => {
  const [showToast] = useIonToast();
  const [showAlert] = useIonAlert();
  const containerId = useRef(null);
  const { loading, error, data, refetch } = useQuery(GET_NEW_GAME_QUERY, {
    fetchPolicy: 'no-cache',
    notifyOnNetworkStatusChange: true,
  });
  const [transactions, setTransactions] = useIonicStorage('transactions', 0);
  const [balance, setBalance] = useIonicStorage('balance', 10000);
  const [predicted, setPredicted] = useState(false);
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
    if (predicted && priceData) {
      for (
        let index = data.getNewGame.price_history.length;
        index < priceData.length;
        index++
      ) {
        candleSeries.update(priceData[index]);
        volumeSeries.update(volumeData[index]);
      }

      emaData
        .filter(ed => ed.time > predictionPoint)
        .forEach(ed => {
          emaSeries.update(ed);
        });
    }
  }, [predicted]);

  if (!loading && !error && priceData && !predicted) {
    candleSeries.setData(
      priceData.slice(0, data.getNewGame.price_history.length),
    );
    volumeSeries.setData(
      volumeData.slice(0, data.getNewGame.price_history.length),
    );
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

  const predict = (action, prediction, actual) => {
    const message = composeResultMessage(prediction, actual, action);

    showToast({
      ...toastOptions,
      message: message + (predicted ? ' Press Next for new prediction.' : ''),
    });

    if (predicted) return;

    const newBalance = computeNewBalance(
      action,
      balance,
      priceData[data.getNewGame.price_history.length - 1].close,
      priceData[priceData.length - 1].close,
    );
    setBalance(newBalance);
    setTransactions(transactions + 1);

    containerId.current.applyOptions(afterPredictionChartOptions);
    setPredicted(true);
  };

  const nextGame = () => {
    setPredicted(false);
    refetch();
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
          <IonLabel className="tiny-labels">EMA:{emaPeriod}</IonLabel>
          <br />
          <IonLabel className="tiny-labels">
            Transactions:{transactions}
          </IonLabel>
        </IonFab>

        <IonFab
          vertical="top"
          horizontal="end"
          slot="fixed"
          className="top-balance"
        >
          <IonButton onClick={resetBalance} color="warning">
            <IonLabel>
              Balance:{' '}
              {balance.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </IonLabel>
          </IonButton>
        </IonFab>

        <IonFab vertical="bottom" horizontal="start" slot="fixed">
          <IonRow>
            <IonCol>
              <IonFabButton
                onClick={() =>
                  predict('buy', true, data?.getNewGame?.willPriceIncrease)
                }
              >
                {'▲'}
                <br />
                {'Buy'}
              </IonFabButton>
            </IonCol>
            <IonCol>
              <IonFabButton
                onClick={() =>
                  predict('short', true, data?.getNewGame?.willPriceDecrease)
                }
              >
                {'▼'}
                <br />
                {'Short'}
              </IonFabButton>
            </IonCol>
          </IonRow>
        </IonFab>

        <IonFab vertical="bottom" horizontal="end" slot="fixed">
          <IonFabButton onClick={nextGame}>
            {'►'}
            <br />
            {predicted ? 'Next' : 'Skip'}
          </IonFabButton>
        </IonFab>
      </IonContent>
    </IonPage>
  );
};

const computeChartData = gameData => {
  let priceData = [...gameData.price_history, ...gameData.future_price_history];

  priceData = priceData
    .sort((a, b) => (a.timeStamp > b.timeStamp ? 1 : -1))
    .map(price => {
      return {
        open: price.open,
        close: price.close,
        low: price.low,
        high: price.high,
        volume: price.volume,
        time: moment.unix(price.timeStamp / 1000).format('YYYY-MM-DD'),
      };
    });

  const volumeData = priceData.map(d => ({
    time: d.time,
    value: d.volume,
    color: d.open > d.close ? 'rgba(255,82,82, 0.2)' : 'rgba(0, 150, 136, 0.2)',
  }));

  const emaInputData = priceData.map(d => d.close);
  const emaOnClose = ema({ period: emaPeriod, values: emaInputData });
  const emaData = priceData.slice(emaPeriod).map((d, index) => ({
    time: d.time,
    close: d.close,
    value: emaOnClose[index],
  }));

  return { priceData, volumeData, emaData };
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

const composeResultMessage = (prediction, actual, action) => {
  let message = '';

  if (prediction === actual) {
    message += 'Yep! ';
    if (action === 'buy') {
      message += 'It went up.';
    } else {
      message += 'It went down.';
    }
  } else {
    message += 'Nope! ';
    if (action === 'buy') {
      message += 'It went down.';
    } else {
      message += 'It went up.';
    }
  }
  return message;
};

export default Home;
