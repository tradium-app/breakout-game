import moment from 'moment';
import { ema } from 'technicalindicators';
import { emaPeriod } from './configs';

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

export default computeChartData;
