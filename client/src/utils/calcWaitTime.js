export const calcWaitTime = (queuePosition, averageMinutes = 15) => {
  if (!queuePosition || queuePosition <= 1) return 0;
  return (queuePosition - 1) * averageMinutes;
};
