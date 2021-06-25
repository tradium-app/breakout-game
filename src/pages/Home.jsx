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
  useIonAlert,
  useIonToast,
} from '@ionic/react';
import './Home.css';
import { arrowDownOutline, arrowUpOutline } from 'ionicons/icons';
import moment from 'moment';
import { useLocalStorage } from '../common/useLocalStorage';

const Home = () => {
  const [present] = useIonToast();
  const [showAlert] = useIonAlert();
  const containerId = useRef(null);
  const { loading, error, data, refetch } = useQuery(GET_NEW_GAME_QUERY, {
    fetchPolicy: 'no-cache',
  });
  const [candleSeries, setCandleSeries] = useState(null);
  const [score, setScore] = useLocalStorage('score', 0);
  const [predicted, setPredicted] = useState(false);

  useEffect(() => {
    containerId.current = createChart(containerId.current, {
      width: window.innerWidth,
      height: window.innerHeight,
    });
    setCandleSeries(containerId.current.addCandlestickSeries({}));
  }, []);

  if (!loading && !error && data) {
    let chartData = [
      ...data.getNewGame.price_history,
      ...data.getNewGame.future_price_history,
    ];

    chartData = chartData
      .sort((a, b) => (a.timeStamp > b.timeStamp ? 1 : -1))
      .map(price => {
        return {
          open: price.open,
          close: price.close,
          low: price.low,
          high: price.high,
          time: moment.unix(price.timeStamp / 1000).format('YYYY-MM-DD'),
        };
      });

    if (predicted) {
      candleSeries.setData(chartData);
    } else {
      containerId.current.applyOptions({
        watermark: {
          visible: false,
        },
        rightPriceScale: {
          visible: false,
        },
      });
      candleSeries.setData(
        chartData.slice(0, data.getNewGame.price_history.length),
      );
    }

    containerId.current.timeScale().fitContent();
  }

  const predict = (prediction, actual) => {
    if (predicted) {
      present({
        message: 'Yo! Press Next button',
        position: 'top',
        duration: 300,
      });
      return;
    }

    if (prediction === actual) {
      present({ message: 'Bravo!!', position: 'top', duration: 300 });
      setScore(score + 1);
    } else {
      present({ message: 'Oops!', position: 'top', duration: 300 });
      setScore(score - 1);
    }

    containerId.current.applyOptions({
      watermark: {
        color: 'red',
        visible: true,
        text: data.getNewGame.symbol,
        fontSize: 16,
        horzAlign: 'left',
        vertAlign: 'top',
      },
      rightPriceScale: {
        visible: true,
      },
    });
    setPredicted(true);
  };

  const nextGame = () => {
    refetch();
    setPredicted(false);
  };

  const resetScore = () => {
    showAlert({
      message: 'Bad Score? ;) Want to reset Score?',
      buttons: ['Cancel', { text: 'Ok', handler: () => setScore(0) }],
    });
  };

  return (
    <IonPage>
      <IonContent fullscreen>
        <div ref={containerId} slot="fixed"></div>

        <IonAlert
          header="BreakOut Game"
          message="Press ↑ or ↓ arrow below to predict stock movement of 5%."
          isOpen
          buttons={[{ text: 'Start' }]}
        />

        <IonFab vertical="top" horizontal="end" slot="fixed">
          <IonFabButton color="danger" onClick={resetScore}>
            {score}
            <br />
            {'Score'}
          </IonFabButton>
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
      }
      future_price_history {
        timeStamp
        close
        open
        high
        low
      }
    }
  }
`;

export default Home;
