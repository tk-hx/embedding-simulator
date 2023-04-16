// pages/index.tsx

import { useState, useMemo } from "react";
import Link from "next/link";

import { generateText } from "../lib/openai";
import { useSettings } from "../lib/useSettings";

import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import SendIcon from "@mui/icons-material/Send";
import { BaseContainer, InputContainer } from "../components/SharedStyles";
import DropzoneBox from "../components/DropzoneBox";
import Spacer from "../components/Spacer";
import {
  CircularProgress,
  Snackbar,
  SnackbarCloseReason,
  Alert,
  Divider,
} from "@mui/material";

import { useDropzone } from "react-dropzone";

const dropzoneStyle = {
  padding: "10px 20px",
  border: "3px dotted #aaa",
  color: "#aaa",
};

const borderNormalStyle = {
  border: "3px dotted #aaa",
};

const borderDragStyle = {
  border: "3px solid #aaa",
  background: "#eee",
};

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [generatedText, setGeneratedText] = useState("");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState<JSX.Element | string>("");

  const { apiKey, setApiKey } = useSettings();

  const { acceptedFiles, getRootProps, getInputProps, isDragActive } =
    useDropzone();

  const style = useMemo(
    () => ({
      ...dropzoneStyle,
      ...(isDragActive ? borderDragStyle : borderNormalStyle),
    }),
    [isDragActive]
  );

  const handleClose = (
    event?: Event | React.SyntheticEvent<Element, Event>,
    reason?: SnackbarCloseReason
  ) => {
    if (reason === "clickaway") {
      return;
    }
    setOpen(false);
  };

  const files = acceptedFiles.map((file: File) => (
    <li key={file.name}>
      {file.name} - {file.size} bytes
    </li>
  ));

  const handleSubmit = async () => {
    if (prompt.length <= 0) {
      setMessage("Please enter a prompt.");
      setOpen(true);
    } else if (apiKey == null) {
      setMessage(
        <>
          Please set the API key in the <Link href="/settings">Settings</Link>{" "}
          Page.
        </>
      );
      setOpen(true);
    } else {
      setLoading(true);
      const result = await generateText(prompt, apiKey);
      setLoading(false);
      setGeneratedText(result);
    }
  };

  return (
    <BaseContainer>
      <InputContainer>
        <Typography variant="h5" gutterBottom>
          Fine-Tune Simulator
        </Typography>
        <Grid container alignItems="center" columnSpacing={2}>
          <Grid item xs={12} sm={12}>
            <Typography variant="h6" gutterBottom>
              Upload a file
            </Typography>
            <DropzoneBox />
          </Grid>
          <Grid item xs={12} sm={12}>
            <Spacer size={32} />
            <Divider />
            <Spacer size={32} />
            <Typography variant="h6" gutterBottom>
              Simulate
            </Typography>
          </Grid>
          <Grid item xs={12} sm={10}>
            <TextField
              id="prompt"
              label="Prompt"
              variant="outlined"
              fullWidth
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={2}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmit}
              startIcon={<SendIcon />}
            >
              Send
            </Button>
          </Grid>
          <Spacer size={20} />
          <Grid item xs={12} sm={12}>
            {loading ? (
              <CircularProgress />
            ) : (
              <Typography>{generatedText}</Typography>
            )}
          </Grid>
        </Grid>
      </InputContainer>
      <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
        <Alert
          onClose={() => setOpen(false)}
          severity="error"
          sx={{ width: "100%" }}
        >
          {message}
        </Alert>
      </Snackbar>
    </BaseContainer>
  );
}
