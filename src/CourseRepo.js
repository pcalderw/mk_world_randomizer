const SELECTED_HISTORY_KEY = "mkw_selected_courses";
const PRESENTED_HISTORY_KEY = "mkw_presented_courses";
const RECENT_HISTORY_KEY = "mkw_recent_courses";
const ONGOING_TOURNAMENT_KEY = "mkw_inprogress_courses";
const RECENT_HISTORY_LIMIT = 15;

export class CourseRepo {
  getHistory() {
    return (
      JSON.parse(localStorage.getItem(PRESENTED_HISTORY_KEY)) ?? {
        startTS: Date.now(),
        courses: [],
      }
    );
  }

  updateHistory(course1, connector1, course2, connector2, isCourse1Selected) {
    let history = this.getHistory();
    history.courses.push({
      course1: course1,
      connector1: connector1,
      course2: course2,
      connector2: connector2,
      isCourse1Selected: isCourse1Selected,
      ts: Date.now(),
    });
    localStorage.setItem(PRESENTED_HISTORY_KEY, JSON.stringify(history));
  }

  getSelected() {
    return JSON.parse(localStorage.getItem(SELECTED_HISTORY_KEY) ?? "[]");
  }

  updateSelected(course) {
    let history = this.getSelected();
    history.push(course);
    localStorage.setItem(SELECTED_HISTORY_KEY, JSON.stringify(history));
  }

  getRecent() {
    return JSON.parse(localStorage.getItem(RECENT_HISTORY_KEY)) ?? [];
  }

  updateRecent(course) {
    let recent = this.getRecent();
    recent.push(course);
    const latest = recent.slice(-RECENT_HISTORY_LIMIT);
    localStorage.setItem(RECENT_HISTORY_KEY, JSON.stringify(latest));
  }

  clearRecent() {
    localStorage.setItem(RECENT_HISTORY_KEY, JSON.stringify([]));
  }

  getInProgress() {
    return JSON.parse(localStorage.getItem(ONGOING_TOURNAMENT_KEY)) ?? null;
  }

  saveInProgress(tournament) {
    localStorage.setItem(ONGOING_TOURNAMENT_KEY, JSON.stringify(tournament));
  }

  clearInProgress() {
    localStorage.removeItem(ONGOING_TOURNAMENT_KEY);
  }
}
