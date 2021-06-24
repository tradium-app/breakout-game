import { useEffect, useRef, useState } from "react";
import gql from "graphql-tag";
import { useQuery } from "@apollo/client";
import {
  IonContent,
  IonPage,
  IonRow,
  IonCol,
  IonFab,
  IonFabButton,
  IonIcon,
  IonAlert,
  useIonToast,
} from "@ionic/react";
import "./Home.css";
import { createChart } from "lightweight-charts";
import {
  arrowDownOutline,
  arrowForwardOutline,
  arrowUpOutline,
} from "ionicons/icons";
import moment from "moment";

const Home: React.FC = () => {
  const [present] = useIonToast();
  const containerId = useRef(null);
  const { loading, error, data, refetch } = useQuery(GET_NEW_GAME_QUERY, {
    fetchPolicy: "no-cache",
  });
  const [candleSeries, setCandleSeries] = useState(null);
  const [score, setScore] = useState(0);
  const [predicted, setPredicted] = useState(false);

  useEffect(() => {
    containerId.current = createChart(containerId.current, {
      width: window.innerWidth,
      height: window.innerHeight,
    });
    setCandleSeries(containerId.current.addCandlestickSeries({}));
  }, []);

  if (!loading && !error) {
    let chartData = [
      ...data.getNewGame.price_history,
      ...data.getNewGame.future_price_history,
    ];

    chartData = chartData
      .sort((a, b) => (a.timeStamp > b.timeStamp ? 1 : -1))
      .map((price) => {
        return {
          open: price.open,
          close: price.close,
          low: price.low,
          high: price.high,
          time: moment.unix(price.timeStamp / 1000).format("YYYY-MM-DD"),
        };
      });

    if (predicted) {
      candleSeries.setData(chartData);
    } else {
      candleSeries.setData(
        chartData.slice(0, data.getNewGame.price_history.length)
      );
    }

    containerId.current.timeScale().fitContent();
  }

  const predict = (prediction, actual) => {
    if (predicted) {
      present({
        message: "Yo! Press Next button",
        position: "top",
        duration: 300,
      });
      return;
    }

    if (prediction === actual) {
      present({ message: "Bravo!!", position: "top", duration: 300 });
      setScore(score + 1);
    } else {
      present({ message: "Oops!", position: "top", duration: 300 });
      setScore(score - 1);
    }

    setPredicted(true);
  };

  const nextGame = () => {
    refetch();
    setPredicted(false);
  };

  return (
    <IonPage>
      <IonContent fullscreen>
        <div ref={containerId} slot="fixed"></div>

        <IonAlert
          header="Start Game"
          message="Predict if the stock will go up or down 10%."
          isOpen
          buttons={[{ text: "Start", handler: (d) => console.log("starting") }]}
        />

        <IonFab vertical="top" horizontal="end" slot="fixed">
          <IonFabButton color="danger">
            {score}
            <br />
            {"Score"}
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
            {"Next"}
            <IonIcon icon={arrowForwardOutline} />
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
