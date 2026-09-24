import React, { useState } from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { styled } from "@mui/material/styles";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import Box from "@mui/material/Box";
import { lightGreen } from "@mui/material/colors";

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: "#fff",
  ...theme.typography.caption,
  textAlign: "center",
  padding: "1px",
}));

const Cell = styled(TableCell)(({ theme }) => ({
  position: "relative",
  verticalAlign: "top",
}));

const Caption = styled(Typography)(({ theme }) => ({
  hyphens: "auto",
  overflowWrap: "break-word",
}));

export function PlayersTable({ players, onReroll }) {
  if (players.length == 0) {
    return <div></div>;
  }
  return (
    <TableContainer
      component={Paper}
      sx={{
        width: "100%",
        margin: "auto",
        overflowX: "auto", // Adds a horizontal scrollbar only when the screen shrinks
      }}
    >
      <Table sx={{ mWidth: 400 }} aria-label="simple table">
        <TableHead>
          <TableRow>
            {players.map((player, index) => (
              <TableCell>Player {index + 1}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
            {players.map((player) => (
              <Cell component="th" scope="row">
                <Stack
                  direction="column"
                  spacing={1}
                  //   alignItems="center"
                  //   justifyContent="flex-start"
                  sx={{
                    width: 60,
                    textAlign: "center",
                  }}
                >
                  <img
                    src={player.racer.img}
                    alt={player.racer.name}
                    loading="lazy"
                    style={{ borderRadius: "15px" }}
                  />
                  <Item>
                    <Caption variant="caption">{player.racer.name}</Caption>
                  </Item>
                </Stack>
              </Cell>
            ))}
          </TableRow>
          <TableRow sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
            {players.map((player) => (
              <Cell component="th" scope="row">
                <Stack
                  direction="column"
                  spacing={1}
                  //   alignItems="center"
                  //   justifyContent="center"
                  sx={{
                    width: 60,
                    textAlign: "center",
                  }}
                >
                  <img
                    src={player.kart.img}
                    alt={player.kart.name}
                    loading="lazy"
                    style={{ borderRadius: "10px" }}
                  />
                  <Item>
                    <Caption variant="caption">{player.kart.name}</Caption>
                  </Item>
                </Stack>
              </Cell>
            ))}
          </TableRow>
          <TableRow>
            <TableCell align="center" colSpan={100}>
              <RerollButton onClick={onReroll} />
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export function RacesTable({
  courses,
  isEnded,
  onReroll,
  onSelect,
  onReset,
}) {
  return (
    <TableContainer
      component={Paper}
      sx={{
        width: "100%",
        margin: "auto",
        overflowX: "auto", // Adds a horizontal scrollbar only when the screen shrinks
      }}
    >
      <Table sx={{ mWidth: 400 }} aria-label="simple table">
        <TableHead>
          <TableRow>
            {[...Array(4).keys()].map((_, index) => (
              <TableCell>Race {index + 1}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
            {courses.map((course) => (
              <RaceSelectionCell
                course={course.course1}
                connector={course.connector1}
                isSelected={
                  course.isCourse1Selected != null
                    ? course.isCourse1Selected
                    : null
                }
                onSelect={onSelect}
              />
            ))}
          </TableRow>
          <TableRow sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
            {courses.map((course) => (
              <RaceSelectionCell
                course={course.course2}
                connector={course.connector2}
                isSelected={
                  course.isCourse1Selected != null
                    ? !course.isCourse1Selected
                    : null
                }
                onSelect={onSelect}
              />
            ))}
          </TableRow>
          <TableRow>
            {courses.length > 1 && (
              <TableCell
                align="center"
                colSpan={courses.length - 1}
              ></TableCell>
            )}
            <TableCell align="center">
              {isEnded ? (
                <RerollButton onClick={onReset} text={"Restart"} />
              ) : (
                <RerollButton onClick={onReroll} />
              )}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export function PastTournamentsTable({ tournaments }) {
  if (tournaments.length == 0) {
    return null;
  }
  return (
    <TableContainer
      component={Paper}
      sx={{ width: "100%", margin: "auto", overflowX: "auto" }}
    >
      <Typography variant="h6" sx={{ p: 2 }}>
        Past tournaments
      </Typography>
      <Table aria-label="past tournaments">
        <TableHead>
          <TableRow>
            <TableCell>Date</TableCell>
            {[...Array(4).keys()].map((index) => (
              <TableCell key={index}>Race {index + 1}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {[...tournaments].reverse().map((tournament, rowIndex) => (
            <TableRow
              key={tournament.endTs}
              sx={{ backgroundColor: rowIndex % 2 == 0 ? "#fff" : "#f0f0f0" }}
            >
              <TableCell>
                {new Date(tournament.endTs).toLocaleString([], {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </TableCell>
              {tournament.races.map(({ course, connector }, index) => (
                <TableCell key={index}>
                  <Stack spacing={1} sx={{ width: 90, textAlign: "center" }}>
                    {connector == null ? (
                      <img
                        src={course.img}
                        alt={course.name}
                        loading="lazy"
                        style={{ borderRadius: "10px" }}
                      />
                    ) : (
                      <DiagonalSplitImage
                        topCourse={course}
                        bottomCourse={connector}
                      />
                    )}
                    <Item>
                      <Caption variant="caption">
                        {connector == null
                          ? course.name
                          : `${course.name} → ${connector.name}`}
                      </Caption>
                    </Item>
                  </Stack>
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

function RerollButton({ onClick, text = "Reroll" }) {
  const [isAnimating, setIsAnimating] = useState(false);
  return (
    <Button
      variant="contained"
      endIcon={
        <RestartAltIcon
          className={isAnimating ? "rotate-animation" : ""}
          onAnimationEnd={() => setIsAnimating(false)}
        />
      }
      onClick={() => {
        setIsAnimating(true);
        onClick();
      }}
    >
      {text}
    </Button>
  );
}

function RaceSelectionCell({ course, connector, isSelected, onSelect }) {
  if (course == null) {
    return <Cell component="th" scope="row" />;
  }
  const caption =
    connector == null ? course.name : `${course.name} → ${connector.name}`;
  return (
    <Cell component="th" scope="row">
      <Stack
        direction="column"
        spacing={1}
        // alignItems="center"
        // justifyContent="flex-start"
        sx={{
          position: "relative",
          width: 90,
          textAlign: "center",
        }}
      >
        {isSelected == true && (
          <Box sx={{ position: "absolute", top: 4, right: 4, zIndex: 4 }}>
            <CheckCircleIcon fontSize="small" sx={{ color: lightGreen[500] }} />
          </Box>
        )}
        {connector == null && (
          <img
            src={course.img}
            alt={course.name}
            loading="lazy"
            style={{ borderRadius: "10px" }}
          />
        )}
        {connector != null && (
          <DiagonalSplitImage topCourse={course} bottomCourse={connector} />
        )}
        <Item>
          <Caption variant="caption">{caption}</Caption>
        </Item>
        {isSelected == null && (
          <Button variant="contained" onClick={() => onSelect(course.id)}>
            Select
          </Button>
        )}
      </Stack>
    </Cell>
  );
}

const DiagonalSplitImage = ({ topCourse, bottomCourse }) => {
  const imageBaseStyle = {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    objectFit: "cover",
  };
  const topImageStyle = {
    ...imageBaseStyle,
    clipPath: "polygon(0 0, 0% 100%, 100% 0)",
    zIndex: 2,
  };

  const bottomImageStyle = {
    ...imageBaseStyle,
    zIndex: 1,
  };

  const borderWidth = "1px";
  const borderColor = "#ffffff";
  const svgOverlayStyle = {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    zIndex: 3,
    pointerEvents: "none", // Clicks pass through to the images
  };

  return (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        aspectRatio: "1/1", // Keeps images proportional; change as needed
        overflow: "hidden",
      }}
    >
      <img
        src={topCourse.img}
        alt={topCourse.name}
        style={topImageStyle}
        className="top-image"
      />
      <img
        src={bottomCourse.img}
        alt={bottomCourse.name}
        style={bottomImageStyle}
        className="bottom-image"
      />
      <svg style={svgOverlayStyle} xmlns="http://w3.org">
        <line
          x1="0%"
          y1="100%"
          x2="100%"
          y2="0%"
          stroke={borderColor}
          strokeWidth={borderWidth}
        />
      </svg>
    </Box>
  );
};
