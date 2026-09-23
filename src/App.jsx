import React from "react";
import "./App.css";
import { PlayersTable, RacesTable, PastTournamentsTable } from "./TournamentTable";
import { tournamentManager } from "./TournamentManager";
import { useSyncExternalStore } from "react";
import { DeleteConfirmButton } from "./DeleteConfirmButton";
import { ResumeTournamentDialog } from "./ResumeTournamentDialog";
import { ConfigureTournament } from "./ConfigureTournament";
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

  const isConfiguring = useSyncExternalStore(
    (l) => tournamentManager.subscribe(l),
    () => tournamentManager.getIsConfiguring(),
  );

  const pastTournaments = useSyncExternalStore(
    (l) => tournamentManager.subscribe(l),
    () => tournamentManager.getPastTournaments(),
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

  if (isConfiguring) {
    return (
      <ConfigureTournament
        onStart={(numPlayers) => tournamentManager.start(numPlayers)}
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
      <PastTournamentsTable tournaments={pastTournaments} />
    </Stack>
  );
}
