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
  IonIcon,
  IonAlert,
  IonChip,
  IonLabel,
  useIonAlert,
  useIonToast,
} from '@ionic/react';
import './Home.css';
import { arrowDownOutline, arrowUpOutline } from 'ionicons/icons';
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
  });
  const [score, setScore] = useIonicStorage('score', 0);
  const [attempts, setAttempts] = useIonicStorage('attempts', 0);
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
    containerId.current.timeScale().applyOptions({ rightOffset: 10 });
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

  const predict = (prediction, actual) => {
    if (predicted) {
      showToast({
        ...toastOptions,
        message: 'Yo! Press Next button',
      });
      return;
    }

    if (prediction === actual) {
      showToast({ ...toastOptions, message: 'Bravo!!' });
      setScore(score + 1);
    } else {
      showToast({ ...toastOptions, message: 'Oops!' });
    }
    setAttempts(attempts + 1);

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

  const resetScore = () => {
    showAlert({
      header: 'Hard to predict 😅 ?',
      message: 'Want to reset score?',
      buttons: [
        'Cancel',
        {
          text: 'Yes',
          handler: () => {
            setScore(0);
            setAttempts(0);
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
          message="Predict 10% stock move by pressing ↑ or ↓ arrow below."
          isOpen
          buttons={[{ text: 'Start' }]}
        />

        <IonFab vertical="top" horizontal="end" slot="fixed">
          <IonChip onClick={resetScore}>
            <IonLabel>Score: {score}</IonLabel>
          </IonChip>
          <IonChip onClick={resetScore}>
            <IonLabel>Attempts: {attempts}</IonLabel>
          </IonChip>
        </IonFab>

        <IonFab vertical="bottom" horizontal="start" slot="fixed">
          <IonRow>
            <IonCol>
              <IonFabButton
                onClick={() =>
                  predict(true, data?.getNewGame?.willPriceIncrease)
                }
              >
                <IonIcon icon={arrowUpOutline} />
              </IonFabButton>
            </IonCol>
            <IonCol>
              <IonFabButton
                onClick={() =>
                  predict(true, data?.getNewGame?.willPriceDecrease)
                }
              >
                <IonIcon icon={arrowDownOutline} />
              </IonFabButton>
            </IonCol>
          </IonRow>
        </IonFab>

        <IonFab vertical="bottom" horizontal="end" slot="fixed">
          <IonFabButton onClick={nextGame}>
            {'➜'}
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

export default Home;
