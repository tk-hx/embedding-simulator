import React, { useMemo } from "react";
import { useDropzone } from "react-dropzone";
import { styled } from "@mui/system";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import ListItem from "@mui/material/ListItem";
import List from "@mui/material/List";
import ListItemText from "@mui/material/ListItemText";
import { PaperProps } from "@mui/material/Paper";
import SvgIcon from "@mui/material/SvgIcon";
import AttachFileIcon from "@mui/icons-material/AttachFile";

interface DropzoneBoxProps extends PaperProps {
  isdragactive: number;
}

const DropzoneArea = styled(Paper)<DropzoneBoxProps>(
  ({ theme, isdragactive }) => ({
    padding: theme.spacing(4, 4),
    border: isdragactive ? "3px solid #aaa" : "3px dotted #aaa",
    color: "#aaa",
    background: isdragactive ? "#eee" : "transparent",
    boxShadow: "none",
  })
);

export default function DropzoneBox() {
  const { acceptedFiles, getRootProps, getInputProps, isDragActive } =
    useDropzone();

  const style = useMemo(
    () => ({
      isDragActive,
    }),
    [isDragActive]
  );

  const files = acceptedFiles.map((file: File) => (
    <ListItem key={file.name} component="div">
      <ListItemText primary={file.name} /> - {file.size} bytes
    </ListItem>
  ));

  return (
    <Box>
      <DropzoneArea {...getRootProps()} isdragactive={isDragActive ? 1 : 0}>
        <input {...getInputProps()} />
        {isDragActive ? (
          <Grid container alignItems="center" spacing={1}>
            <Grid item>
              <SvgIcon component={AttachFileIcon} />
            </Grid>
            <Grid item>
              <Typography>Drop the file here ...</Typography>
            </Grid>
          </Grid>
        ) : (
          <Grid container alignItems="center" spacing={1}>
            <Grid item>
              <SvgIcon component={AttachFileIcon} />
            </Grid>
            <Grid item>
              <Typography>Drag and drop file here !!</Typography>
            </Grid>
          </Grid>
        )}
      </DropzoneArea>
      <Box component="aside">
        <List>{files}</List>
      </Box>
    </Box>
  );
}
