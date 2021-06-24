import { useEffect, useRef } from "react";
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
  const containerId = useRef(null);
  const { loading, error, data, refetch } = useQuery(GET_NEW_GAME_QUERY, {
    fetchPolicy: "no-cache",
  });
  const [present] = useIonToast();

  useEffect(() => {
    containerId.current = createChart(containerId.current, {
      width: window.innerWidth,
      height: window.innerHeight,
    });
  }, []);

  if (!loading && !error) {
    const candleSeries = containerId.current.addCandlestickSeries({});
    console.log("containerId.current", containerId.current);

    let chartData = [...data.getNewGame.price_history];
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

    console.log("candleSeries", candleSeries.data);
    chartData && candleSeries.setData(chartData);
    containerId.current.timeScale().fitContent();
  }

  const predictUp = () => {
    const willPriceIncrease = data.getNewGame.willPriceIncrease;

    if (willPriceIncrease) {
      present("you fking right", 3000);
    } else {
      present("you fking wrong", 3000);
    }

    refetch();
  };

  const predictDown = () => {
    const willPriceDecrease = data.getNewGame.willPriceDecrease;

    if (willPriceDecrease) {
      present("you fking right", 3000);
    } else {
      present("you fking wrong", 3000);
    }

    refetch();
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
            12
            <br />
            Score
          </IonFabButton>
        </IonFab>

        <IonFab vertical="bottom" horizontal="start" slot="fixed">
          <IonRow>
            <IonCol>
              <IonFabButton>
                <IonIcon icon={arrowUpOutline} onClick={predictUp} />
              </IonFabButton>
            </IonCol>
            <IonCol>
              <IonFabButton>
                <IonIcon icon={arrowDownOutline} onClick={predictDown} />
              </IonFabButton>
            </IonCol>
            <IonCol>
              <IonFabButton>
                <IonIcon
                  icon={arrowForwardOutline}
                  onClick={() => {
                    alert("going sideways?");
                  }}
                />
              </IonFabButton>
            </IonCol>
          </IonRow>
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
