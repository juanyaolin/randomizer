const prizeGroups = [
  [0, 10, 20],
  [1, 11, 21],
  [2, 12, 22],
  [3, 13, 23],
  [4, 14, 24],
  [5, 15, 25],
  [6, 16, 26],
  [7, 17, 27],
  [8, 18, 28],
  [9, 19, 29],
];

// 建立選項
const createPrizes = (count) => {
  const prizes = [];

  for (let index = 0; index < count; index++) {
    prizes.push({
      key: `prize-${index + 1}`,
      index: index,
      value: index + 1,
      isPicked: false,
      isBorderShow: false,
    });
  }

  return prizes;
};

const sound = new Audio("assets/sound/disconnect.mp3");
const meowSound = new Audio("assets/sound/buling.mp3");
const finishedCount = 15;

// 取得隨機值
const getRandom = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const getRandomPrize = (playCount, prizeGroups) => {
  const pool = [];
  const itemCount = [0, 0, 3, 10];

  prizeGroups.forEach((prizeGroup, index) => {
    if (playCount.value < finishedCount) {
      for (let i = 0; i < itemCount[prizeGroup.length]; i++) {
        pool.push(index);
      }
    } else {
      if (prizeGroup.length == 1) {
        pool.push(index);
      }
    }
  });

  const prizeGroupIndex = pool[getRandom(0, pool.length - 1)];
  const prizeGroupLength = prizeGroups[prizeGroupIndex].length;
  const prizeIndex =
    prizeGroups[prizeGroupIndex][getRandom(0, prizeGroupLength - 1)];
  prizeGroups[prizeGroupIndex] = prizeGroups[prizeGroupIndex].filter((item) => {
    return item != prizeIndex;
  });

  return prizeIndex;
};

const app = Vue.createApp({
  setup() {
    const prizeCount = 30;
    const prizeCountPerRow = 10;
    const latencies = [0, 200, 100, 50];
    const startBtnClickable = Vue.ref(true);
    const prizes = Vue.reactive(createPrizes(prizeCount));
    const prizeRounds = Vue.ref(-1);
    const rounds = Vue.ref(-1);
    const prizeIndex = Vue.ref(-1);
    const latency = Vue.ref(100);
    const pickedPrize = Vue.ref({});
    const playCount = Vue.ref(0);
    const stopCount = Vue.ref(0);

    const groupedPrizes = Vue.computed(() => {
      const groupedPrizes = [];

      prizes.forEach((prize) => {
        const rowIndex = Math.floor(prize.index / prizeCountPerRow);
        const rowPrizes = groupedPrizes[rowIndex] || [];

        rowPrizes.push(prize);

        groupedPrizes[rowIndex] = rowPrizes;
      });

      return groupedPrizes;
    });

    const pickedPrizes = Vue.computed(() => {
      return prizes.filter((prize) => prize.isPicked);
    });
    const unpickedPrizes = Vue.computed(() => {
      return prizes.filter((prize) => !prize.isPicked);
    });

    const runPickAnime = () => {
      if (rounds.value == prizeRounds.value) {
        pickedPrize.value = unpickedPrizes.value[prizeIndex.value];
        pickedPrize.value.isBorderShow = false;
        pickedPrize.value.isPicked = true;
        rounds.value = prizeIndex.value - 1;
        prizeRounds.value = -1;
        latency.value = 100;
        meowSound.play();

        const element = document.querySelector("#test").classList;
        element.add("talk-dialog-in");
        element.remove("hide");

        if (playCount.value < finishedCount) {
          startBtnClickable.value = true;
        }

        return;
      }

      if (!!unpickedPrizes.value[prizeIndex.value]) {
        unpickedPrizes.value[prizeIndex.value].isBorderShow = false;
      }

      rounds.value++;
      prizeIndex.value = rounds.value % unpickedPrizes.value.length;

      if (!!unpickedPrizes.value[prizeIndex.value]) {
        unpickedPrizes.value[prizeIndex.value].isBorderShow = true;
        sound.play();
      }

      if (prizeRounds.value - rounds.value <= stopCount.value) {
        latency.value += latencies[prizeRounds.value - rounds.value] | 20;
      } else if (rounds.value < prizeRounds.value) {
        latency.value -= 10;
      }

      if (latency.value <= 40) {
        latency.value = 40;
      }

      setTimeout(() => {
        runPickAnime();
      }, latency.value);
    };

    const pickUp = () => {
      if (!startBtnClickable.value) {
        return;
      }

      startBtnClickable.value = false;
      playCount.value++;

      const prize = getRandomPrize(playCount, prizeGroups);

      let rr = -1;
      unpickedPrizes.value.forEach((item, index) => {
        if (item.index == prize) {
          rr = index;
        }
      });

      prizeRounds.value = unpickedPrizes.value.length * getRandom(2, 3) + rr;
      stopCount.value = 10 + getRandom(-2, 2);
      console.log(stopCount.value);

      runPickAnime();
    };

    return {
      startBtnClickable,
      pickedPrize,
      groupedPrizes,
      pickUp,
    };
  },
});

app.use(Quasar);
app.mount("#q-app");
