// components/DropzoneBox.tsx

import React, { useMemo, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { styled } from "@mui/system";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import {
  Box,
  Paper,
  Grid,
  Typography,
  SvgIcon,
  PaperProps,
} from "@mui/material";

interface DropzoneBoxProps extends PaperProps {
  isdragactive?: number;
  onFilesChange?: (files: File[]) => void;
}

const DropzoneArea = styled(Paper)<DropzoneBoxProps>(
  ({ theme, isdragactive }) => ({
    padding: theme.spacing(3, 2),
    border: isdragactive ? "3px solid #aaa" : "3px dotted #aaa",
    color: "#aaa",
    background: isdragactive ? "#eee" : "transparent",
    boxShadow: "none",
  })
);

export default function DropzoneBox({ onFilesChange }: DropzoneBoxProps) {
  const onDrop = useCallback(
    (newAcceptedFiles: File[]) => {
      if (onFilesChange) {
        onFilesChange(newAcceptedFiles);
      }
    },
    [onFilesChange]
  );

  const { acceptedFiles, getRootProps, getInputProps, isDragActive } =
    useDropzone({ onDrop });

  const style = useMemo(
    () => ({
      isDragActive,
    }),
    [isDragActive]
  );

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
    </Box>
  );
}
