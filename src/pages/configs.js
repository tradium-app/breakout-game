export const toastOptions = {
  position: 'top',
  duration: 1000,
  cssClass: 'toast',
};

export const defaultChartOptions = {
  watermark: {
    visible: false,
  },
  rightPriceScale: {
    visible: false,
  },
};

export const afterPredictionChartOptions = {
  watermark: {
    color: 'red',
    visible: true,
    fontSize: 16,
    horzAlign: 'left',
    vertAlign: 'top',
  },
  rightPriceScale: {
    visible: true,
  },
};

export const volumeSeriesOptions = {
  priceFormat: {
    type: 'volume',
  },
  priceScaleId: '',
  priceLineVisible: false,
  scaleMargins: {
    top: 0.8,
    bottom: 0,
  },
};

export const markerOptions = {
  position: 'aboveBar',
  color: '#5d58e0',
  shape: 'arrowDown',
  text: 'Buy/Short?',
  size: 2,
};
