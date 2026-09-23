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
  #pendingNumPlayers = null;
  #listeners = new Set();

  // Might want to allow num races in tournament to be configurable but for now UI will assume 4
  begin(numPlayers) {
    if (this.#currentTournament != null || this.#pendingResume != null) {
      return;
    }
    const saved = this.#repo.getInProgress();
    if (saved != null && !saved.isEnded) {
      this.#pendingResume = saved;
      this.#pendingNumPlayers = numPlayers;
      this.#updateSubscribers();
      return;
    }
    this.#startNew(numPlayers);
  }

  // Called once the player has decided whether to resume the tournament found on load.
  resumePending() {
    if (this.#pendingResume == null) {
      return;
    }
    this.#currentTournament = this.#pendingResume;
    this.#pendingResume = null;
    this.#pendingNumPlayers = null;
    this.#updateSubscribers();
  }

  discardPending() {
    const numPlayers = this.#pendingNumPlayers ?? this.#pendingResume?.numPlayers;
    this.#pendingResume = null;
    this.#pendingNumPlayers = null;
    this.#repo.clearInProgress();
    this.#startNew(numPlayers);
  }

  getPendingResume() {
    return this.#pendingResume;
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

  reset(numPlayers) {
    this.#repo.clearInProgress();
    this.#currentTournament = null;
    this.begin(numPlayers);
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
    if (this.#currentTournament == null) {
      return;
    }
    this.#currentTournament.isEnded = true;
    this.#updateSubscribers();
    this.#repo.clearInProgress();
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
      (currentOptions.course2.id == course && currentOptions.connector2 == null)
    ) {
      this.#repo.updateRecent(course);
      this.#repo.updateSelected(course);
    }
    this.#currentTournament.courses.at(-1).isCourse1Selected =
      isCourse1Selected;
    if (this.#currentTournament.courses.length < 4) {
      this.randomizeNextRacesOptions();
    } else {
      this.#updateSubscribers();
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
      this.#repo.saveInProgress(this.#currentTournament);
    }
    this.#listeners.forEach((listener) => listener());
  }

  clearRecentHistory() {
    this.#repo.clearRecent();
  }
}

export const tournamentManager = new TournamentManager();
tournamentManager.begin(4);
