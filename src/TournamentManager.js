import { CourseRepo } from "./CourseRepo";

import {
  randomizeCoursePair,
  randomizeKart,
  randomizeRacer,
} from "./Randomizer";

class TournamentManager {
  #repo = new CourseRepo();
  #currentTournament = null;
  #pendingResume = null;
  #isConfiguring = false;
  #listeners = new Set();
  #pastTournaments = this.#repo.getTournamentHistory();

  // Might want to allow num races in tournament to be configurable but for now UI will assume 4
  begin() {
    if (
      this.#currentTournament != null ||
      this.#pendingResume != null ||
      this.#isConfiguring
    ) {
      return;
    }
    const saved = this.#repo.getInProgress();
    if (saved != null && !saved.isEnded) {
      this.#pendingResume = saved;
    } else {
      this.#isConfiguring = true;
    }
    this.#updateSubscribers();
  }

  // Called once the player has decided whether to resume the tournament found on load.
  resumePending() {
    if (this.#pendingResume == null) {
      return;
    }
    this.#currentTournament = this.#pendingResume;
    this.#pendingResume = null;
    this.#updateSubscribers();
  }

  discardPending() {
    this.#pendingResume = null;
    this.#repo.clearInProgress();
    this.#isConfiguring = true;
    this.#updateSubscribers();
  }

  getPendingResume() {
    return this.#pendingResume;
  }

  getIsConfiguring() {
    return this.#isConfiguring;
  }

  getLastNumPlayers() {
    return this.#repo.getLastNumPlayers();
  }

  // Leaves the configure state and generates the first pair of races.
  start(numPlayers) {
    if (!this.#isConfiguring) {
      return;
    }
    this.#isConfiguring = false;
    this.#repo.saveLastNumPlayers(numPlayers);
    this.#startNew(numPlayers);
  }

  #startNew(numPlayers) {
    this.#currentTournament = {
      numPlayers: numPlayers,
      startTs: Date.now(),
      players: Array.from({ length: numPlayers }, () => ({
        racer: randomizeRacer(),
        kart: randomizeKart(),
      })),
      courses: [this.#randomizeNextSelections()],
      isEnded: false,
    };
    this.#updateSubscribers();
  }

  reset() {
    this.#repo.clearInProgress();
    this.#currentTournament = null;
    this.#isConfiguring = true;
    this.#updateSubscribers();
  }

  rerollLatestRaceOptions() {
    if (this.#currentTournament == null) {
      return;
    }
    this.#currentTournament.courses[
      this.#currentTournament.courses.length - 1
    ] = this.#randomizeNextSelections();
    this.#currentTournament.courses = [...this.#currentTournament.courses];
    this.#updateSubscribers();
  }

  rerollRacers() {
    if (this.#currentTournament == null) {
      return;
    }
    const numPlayers = this.#currentTournament.numPlayers;
    const newPlayers = Array.from({ length: numPlayers }, () => ({
      racer: randomizeRacer(),
      kart: randomizeKart(),
    }));
    this.#currentTournament = {
      ...this.#currentTournament,
      players: newPlayers,
    };
    this.#updateSubscribers();
  }

  end() {
    if (this.#currentTournament == null || this.#currentTournament.isEnded) {
      return;
    }
    this.#currentTournament.isEnded = true;
    this.#pastTournaments = this.#repo.addTournamentToHistory({
      endTs: Date.now(),
      races: this.#currentTournament.courses.map((race) => {
        const isFirst = race.isCourse1Selected !== false;
        return {
          course: isFirst ? race.course1 : race.course2,
          connector: isFirst ? race.connector1 : race.connector2,
        };
      }),
    });
    this.#updateSubscribers();
  }

  // Oldest first.
  getPastTournaments() {
    return this.#pastTournaments;
  }

  randomizeNextRacesOptions() {
    if (this.#currentTournament == null) {
      return;
    }
    this.#currentTournament.courses.push(this.#randomizeNextSelections());
    this.#updateSubscribers();
  }

  selectCourse(course) {
    const currentOptions = this.#currentTournament.courses.at(-1);
    const isCourse1Selected = currentOptions.course1.id == course;
    if (
      (currentOptions.course1.id == course &&
        currentOptions.connector1 == null) ||
      (currentOptions.course2?.id == course &&
        currentOptions.connector2 == null)
    ) {
      this.#repo.updateRecent(course);
      this.#repo.updateSelected(course);
    }
    this.#currentTournament.courses.at(-1).isCourse1Selected =
      isCourse1Selected;
    if (this.#currentTournament.courses.length < 4) {
      this.randomizeNextRacesOptions();
    } else {
      this.end();
    }
  }

  #randomizeNextSelections() {
    const randomCourses = randomizeCoursePair(this.#repo.getRecent());
    const course1 = randomCourses.at(0);
    const course2 = randomCourses.at(1);
    if (course1.id == course2.id) {
      return {
        course1: course1,
        connector1: null,
        course2: null,
        connector2: null,
        isCourse1Selected: null,
      };
    }
    const isConnector1 = course1.connectors.includes(course2.id);
    const isConnector2 = course2.connectors.includes(course1.id);
    const isConnector = isConnector1 || isConnector2;

    if (!isConnector) {
      return {
        course1: course1,
        connector1: null,
        course2: course2,
        connector2: null,
        isCourse1Selected: null,
      };
    } else if (isConnector1 && !isConnector2) {
      return {
        course1: course1,
        connector1: course2,
        course2: null,
        connector2: null,
        isCourse1Selected: null,
      };
    } else if (isConnector2 && !isConnector1) {
      return {
        course1: course2,
        connector1: course1,
        course2: null,
        connector2: null,
        isCourse1Selected: null,
      };
    } else {
      return {
        course1: course1,
        connector1: course2,
        course2: course2,
        connector2: course1,
        isCourse1Selected: null,
      };
    }
  }

  getCurrentTournament() {
    return this.#currentTournament;
  }

  // Methods for allowing react to subscribe & be notified of changes
  subscribe(listener) {
    this.#listeners.add(listener);
    return () => this.#listeners.delete(listener);
  }

  #updateSubscribers() {
    if (this.#currentTournament != null) {
      this.#currentTournament = { ...this.#currentTournament };
      if (this.#currentTournament.isEnded) {
        this.#repo.clearInProgress();
      } else {
        this.#repo.saveInProgress(this.#currentTournament);
      }
    }
    this.#listeners.forEach((listener) => listener());
  }

  clearRecentHistory() {
    this.#repo.clearRecent();
  }
}

export const tournamentManager = new TournamentManager();
tournamentManager.begin();
