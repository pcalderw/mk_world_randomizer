import React, { useState } from "react";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { tournamentManager } from "./TournamentManager";

const MAX_PLAYERS = 8;
const DEFAULT_NUM_PLAYERS = 4;

export function ConfigureTournament({ onStart }) {
  const [numPlayers, setNumPlayers] = useState(
    () => tournamentManager.getLastNumPlayers() ?? DEFAULT_NUM_PLAYERS,
  );
  return (
    <Paper sx={{ p: 2 }}>
      <Stack direction="column" spacing={2} alignItems="flex-start">
        <Typography variant="h6">New Tournament</Typography>
        <TextField
          select
          label="Players"
          value={numPlayers}
          onChange={(e) => setNumPlayers(Number(e.target.value))}
          sx={{ minWidth: 120 }}
        >
          {Array.from({ length: MAX_PLAYERS }, (_, i) => i + 1).map((n) => (
            <MenuItem key={n} value={n}>
              {n}
            </MenuItem>
          ))}
        </TextField>
        <Button variant="contained" onClick={() => onStart(numPlayers)}>
          Start
        </Button>
      </Stack>
    </Paper>
  );
}
