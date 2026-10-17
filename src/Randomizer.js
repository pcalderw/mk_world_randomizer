import courses from "./constants/courses.json";
import karts from "./constants/karts.json";
import racers from "./constants/racers.json";

export const randomizeKart = () => {
  return karts[Math.floor(Math.random() * karts.length)];
};

export const randomizeCoursePair = (recentHistory) => {
  let randomCourses = Array();
  while (randomCourses.length < 2) {
    let candidate = courses[Math.floor(Math.random() * courses.length)];
    if (recentHistory.includes(candidate.id)) {
      console.log(`Dupe found ${candidate.id} in ${recentHistory}`);
      continue;
    }
    randomCourses.push(candidate);
  }

  return randomCourses;
};

export const randomizeRacer = () => {
  return weightedRandomizer(racers);
};

function weightedRandomizer(data) {
  const totalWeight = data.reduce((sum, d) => sum + (d.weight ?? 0), 0);

  let roll = Math.random() * totalWeight;
  for (const item of data) {
    roll -= item.weight ?? 0;
    if (roll < 0) {
      return item;
    }
  }
  return data[0]; //
}
