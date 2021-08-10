const conjecture = (previous) => {
  let myMap = {};
  console.time();
  for (let i = 0; i < 1000000; i++) {
    myMap[i] = Math.random();
  }
  console.timeEnd();
};
conjecture();
