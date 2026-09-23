import React from "react";
import "./App.css";
import { PlayersTable, RacesTable } from "./TournamentTable";
import { tournamentManager } from "./TournamentManager";
import { useSyncExternalStore } from "react";
import { DeleteConfirmButton } from "./DeleteConfirmButton";
import { ResumeTournamentDialog } from "./ResumeTournamentDialog";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";

export default function App() {
  const tournament = useSyncExternalStore(
    (l) => tournamentManager.subscribe(l),
    () => tournamentManager.getCurrentTournament(),
  );
  const pendingResume = useSyncExternalStore(
    (l) => tournamentManager.subscribe(l),
    () => tournamentManager.getPendingResume(),
  );

  if (pendingResume != null) {
    return (
      <ResumeTournamentDialog
        tournament={pendingResume}
        onResume={() => tournamentManager.resumePending()}
        onDiscard={() => tournamentManager.discardPending()}
      />
    );
  }

  if (tournament == null) {
    return null;
  }

  return (
    <Stack direction="column" spacing={2}>
      <PlayersTable
        players={tournament.players}
        onReroll={() => tournamentManager.rerollRacers()}
      />
      <RacesTable
        courses={tournament.courses}
        onSelect={(course) => tournamentManager.selectCourse(course)}
        onReroll={() => tournamentManager.rerollLatestRaceOptions()}
        onReset={() => tournamentManager.reset()}
      />
      <DeleteConfirmButton
        onConfirm={() => tournamentManager.clearRecentHistory()}
      />
    </Stack>
  );
}
