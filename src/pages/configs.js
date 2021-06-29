export const toastOptions = {
  position: 'top',
  duration: 1000,
  cssClass: 'toast',
};

export const defaultChartOptions = {
  handleScale: {
    axisPressedMouseMove: {
      time: true,
      price: false,
    },
  },
  rightPriceScale: {
    visible: false,
  },
  crosshair: {
    mode: 0,
  },
};

export const afterPredictionChartOptions = {
  rightPriceScale: {
    visible: true,
  },
};

export const candleSeriesOptions = {
  priceLineVisible: false,
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

export const emaSeriesOptions = {
  lastValueVisible: false,
  priceLineVisible: false,
  crosshairMarkerVisible: false,
  lineWidth: 1,
  lineStyle: 2,
};

export const markerOptions = {
  position: 'aboveBar',
  color: '#5d58e0',
  shape: 'arrowDown',
  text: 'Buy/Short?',
  size: 2,
};
