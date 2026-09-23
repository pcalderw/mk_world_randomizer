import React from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";

function ordinal(day) {
  if (day % 10 == 1 && day != 11) return `${day}st`;
  if (day % 10 == 2 && day != 12) return `${day}nd`;
  if (day % 10 == 3 && day != 13) return `${day}rd`;
  return `${day}th`;
}

function formatStartedAt(ts) {
  const date = new Date(ts);
  const month = date.toLocaleString(undefined, { month: "long" });
  const time = date.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
  return `${month} ${ordinal(date.getDate())} at ${time}`;
}

export function ResumeTournamentDialog({ tournament, onResume, onDiscard }) {
  if (tournament == null) {
    return null;
  }
  const startedAt = formatStartedAt(tournament.startTs);
  return (
    <Dialog
      open={true}
      onClose={onDiscard}
      aria-labelledby="resume-dialog-title"
      aria-describedby="resume-dialog-description"
    >
      <DialogTitle id="resume-dialog-title">
        Resume in-progress tournament?
      </DialogTitle>
      <DialogContent>
        <DialogContentText id="resume-dialog-description">
          You have a tournament for {tournament.numPlayers} player
          {tournament.numPlayers == 1 ? "" : "s"} started {startedAt} that
          hasn&apos;t finished. Resume it, or start a new one?
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onDiscard}>Start New</Button>
        <Button onClick={onResume} autoFocus>
          Resume
        </Button>
      </DialogActions>
    </Dialog>
  );
}
