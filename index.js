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

// 取得隨機值
const getRandom = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const getRandomPrize = (prizeGroups) => {
  const pool = [];
  const itemCount = [0, 3, 6, 10];

  prizeGroups.forEach((prizeGroup, index) => {
    for (let i = 0; i < itemCount[prizeGroup.length]; i++) {
      pool.push(index);
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
    const bgImageFile = Vue.ref(undefined);
    const bgImage = Vue.ref("bg.jpg");
    const prizeCount = 30;
    const prizeCountPerRow = 10;
    const latencies = [0, 200, 100, 50];
    const startBtnClickable = Vue.ref(true);
    const prizes = Vue.reactive(createPrizes(prizeCount));
    const prizeRounds = Vue.ref(-1);
    const rounds = Vue.ref(-1);
    const prizeIndex = Vue.ref(-1);
    const latency = Vue.ref(100);
    const showModal = Vue.ref(false);
    const pickedPrize = Vue.ref({});

    Vue.watch(bgImageFile, (value) => {
      bgImage.value = URL.createObjectURL(value);
    });

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
        showModal.value = true;
        pickedPrize.value = unpickedPrizes.value[prizeIndex.value];
        pickedPrize.value.isBorderShow = false;
        pickedPrize.value.isPicked = true;
        rounds.value = prizeIndex.value - 1;
        prizeRounds.value = -1;
        latency.value = 100;
        startBtnClickable.value = true;

        return;
      }

      if (!!unpickedPrizes.value[prizeIndex.value]) {
        unpickedPrizes.value[prizeIndex.value].isBorderShow = false;
      }

      rounds.value++;
      prizeIndex.value = rounds.value % unpickedPrizes.value.length;

      if (!!unpickedPrizes.value[prizeIndex.value]) {
        unpickedPrizes.value[prizeIndex.value].isBorderShow = true;
      }

      if (prizeRounds.value - rounds.value <= 10) {
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

      const prize = getRandomPrize(prizeGroups);

      let rr = -1;
      unpickedPrizes.value.forEach((item, index) => {
        if (item.index == prize) {
          rr = index;
        }
      });

      prizeRounds.value = unpickedPrizes.value.length * getRandom(3, 5) + rr;

      runPickAnime();
    };

    return {
      bgImageFile,
      bgImage,
      startBtnClickable,
      showModal,
      groupedPrizes,
      pickedPrize,
      pickUp,
    };
  },
});

app.use(Quasar);
app.mount("#q-app");
