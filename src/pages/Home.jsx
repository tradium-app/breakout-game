import { useEffect, useRef, useState } from 'react';
import gql from 'graphql-tag';
import { useQuery } from '@apollo/client';
import { createChart } from 'lightweight-charts';
import {
  IonContent,
  IonPage,
  IonRow,
  IonCol,
  IonFab,
  IonFabButton,
  IonChip,
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
  volumeSeriesOptions,
  markerOptions,
} from './configs';

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

  useEffect(() => {
    containerId.current = createChart(containerId.current, {
      width: window.innerWidth,
      height: window.innerHeight,
    });
    setCandleSeries(containerId.current.addCandlestickSeries({}));

    const volSeries =
      containerId.current.addHistogramSeries(volumeSeriesOptions);
    setVolumeSeries(volSeries);
    containerId.current.timeScale().applyOptions({ rightOffset: 15 });
  }, []);

  let priceData, volumeData;

  if (!loading && !error && data) {
    ({ priceData, volumeData } = computeChartData(data.getNewGame));
  }

  useEffect(() => {
    if (priceData) {
      for (
        let index = data.getNewGame.price_history.length;
        index < priceData.length;
        index++
      ) {
        candleSeries.update(priceData[index]);
        volumeSeries.update(volumeData[index]);
      }
    }
  }, [predicted]);

  if (!loading && !error && priceData && !predicted) {
    candleSeries.setData(
      priceData.slice(0, data.getNewGame.price_history.length),
    );
    volumeSeries.setData(
      volumeData.slice(0, data.getNewGame.price_history.length),
    );

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
    if (predicted) {
      showToast({
        ...toastOptions,
        message:
          (prediction === actual
            ? 'Yo! you were right.'
            : 'Yo! you were wrong.') + ' Now press Next button',
      });
      return;
    }

    if (prediction === actual) {
      showToast({ ...toastOptions, message: 'Bravo!!' });
    } else {
      showToast({ ...toastOptions, message: 'Oops!' });
    }

    const newBalance = computeNewBalance(
      action,
      balance,
      priceData[data.getNewGame.price_history.length - 1].close,
      priceData[priceData.length - 1].close,
    );
    setBalance(newBalance);
    setTransactions(transactions + 1);

    containerId.current.applyOptions({
      ...afterPredictionChartOptions,
      watermark: {
        ...afterPredictionChartOptions.watermark,
        text: data.getNewGame.symbol,
      },
    });
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
          message="Predict 10% stock movement and buy/short stock."
          isOpen
          buttons={[{ text: 'Start' }]}
        />

        <IonLoading isOpen={loading} message={'Please wait...'} />

        <IonFab
          vertical="top"
          horizontal="end"
          slot="fixed"
          className="top-balance"
        >
          <IonChip onClick={resetBalance}>
            <IonLabel>
              Balance:{' '}
              {balance.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </IonLabel>
          </IonChip>
          <IonChip>
            <IonLabel>Transactions: {transactions}</IonLabel>
          </IonChip>
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
            {'➤'}
            <br />
            {'Next'}
          </IonFabButton>
        </IonFab>
      </IonContent>
    </IonPage>
  );
};

export const GET_NEW_GAME_QUERY = gql`
  query getNewGame {
    getNewGame {
      _id
      symbol
      timeStamp
      willPriceIncrease
      willPriceDecrease
      price_history {
        timeStamp
        close
        open
        high
        low
        volume
      }
      future_price_history {
        timeStamp
        close
        open
        high
        low
        volume
      }
    }
  }
`;

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
  return { priceData, volumeData };
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
