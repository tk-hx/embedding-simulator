// pages/index.tsx

import { useState } from "react";
import Link from "next/link";

import axios from "axios";
import { EmbeddingData, generateVector, generateAnswer } from "../lib/openAi";
import { useSettings } from "../lib/useSettings";
import { BaseContainer, InputContainer } from "../components/SharedStyles";
import DropzoneBox from "../components/DropzoneBox";
import Spacer from "../components/Spacer";

import {
  Grid,
  Button,
  TextField,
  Typography,
  List,
  ListItem,
  ListItemText,
  Divider,
  Snackbar,
  SnackbarCloseReason,
  Alert,
  CircularProgress,
  LinearProgress,
} from "@mui/material";

import SendIcon from "@mui/icons-material/Send";
import AutoModeIcon from "@mui/icons-material/AutoMode";

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [generatedDataList, setGeneratedDataList] = useState<EmbeddingData[]>(
    []
  );
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState<JSX.Element | string>("");
  const [file, setFile] = useState<File>();
  const [simulateLoading, setSimulateLoading] = useState(false);
  const [progress, setProgress] = useState<number>(0);
  const [progressLoading, setProgressLoading] = useState(false);
  const [step, setStep] = useState("");
  const [current, setCurrent] = useState(0);
  const [total, setTotal] = useState(0);

  const { apiKey, mongoUri, mongoDbName } = useSettings();

  const handleClose = (
    event?: Event | React.SyntheticEvent<Element, Event>,
    reason?: SnackbarCloseReason
  ) => {
    if (reason === "clickaway") {
      return;
    }
    setOpen(false);
  };

  const handleSimulate = async () => {
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
      setSimulateLoading(true);
      const embeddingData = await generateVector(prompt, apiKey);
      const result = await fetchNearestVectors(embeddingData.vector);
      setGeneratedDataList(result);
      setSimulateLoading(false);
    }
  };

  const handleEmbedding = async () => {
    if (!file) {
      setMessage("Please select a file.");
      setOpen(true);
      return;
    }
    const reader = new FileReader();
    reader.onabort = () => {
      setMessage("File reading was aborted.");
      setProgressLoading(false);
      setOpen(true);
    };
    reader.onerror = () => {
      setMessage("File reading has failed.");
      setProgressLoading(false);
      setOpen(true);
    };
    reader.onloadstart = () => {
      setProgressLoading(true);
      setStep("[1/2] Load File");
      setCurrent(0);
      setTotal(0);
      setProgress(0);
    };
    reader.onprogress = (event) => {
      if (event.lengthComputable) {
        const percentLoaded = Math.round((event.loaded / event.total) * 100);
        setCurrent(event.loaded);
        setTotal(event.total);
        setProgress(percentLoaded);
      }
    };
    reader.onload = async () => {
      const binaryStr = reader.result;
      analyzeFile(binaryStr as string);
      setProgressLoading(false);
      setFile(undefined);
    };
    reader.readAsText(file);
  };

  const handleFilesChange = (files: File[]) => {
    setFile(files[0]);
  };

  const analyzeFile = async (fileStr: string) => {
    if (apiKey == null) {
      return;
    }
    setStep("[2/2] Analyze File");
    setCurrent(0);
    setTotal(0);
    setProgress(0);

    if (isBinary(fileStr)) {
      setMessage("The provided file seems to be a binary file.");
      setOpen(true);
      return;
    }
    const lines = fileStr.split("\n");
    const totalLines = lines.length;
    let currentLine = 0;
    for (const line of lines) {
      // Skip lines that don't have a comma
      if ((line.match(/,/g) || []).length !== 1) {
        continue;
      }
      // Skip lines that are too long
      if (line.length >= 2000) {
        continue;
      }
      const split = line.split(",");
      const embeddingData = await generateVector(split[0], apiKey);
      // If the line has an answer, use that
      if (split[1].length > 0) {
        embeddingData.answer = split[1];
      } else {
        embeddingData.answer = await generateAnswer(split[0], apiKey);
      }

      await insertMongoRecord(embeddingData);
      currentLine++;

      setCurrent(currentLine);
      setTotal(totalLines);
      setProgress(Math.round((currentLine / totalLines) * 100));
    }
  };

  const insertMongoRecord = async (embeddingData: EmbeddingData) => {
    if (!mongoUri || !mongoDbName) {
      setMessage("Please set the MongoDB settings in the Settings page.");
      setOpen(true);
    }

    try {
      const response = await axios.post("/api/saveVector", {
        mongoUri,
        mongoDbName,
        embeddingData,
      });
      if (response.status !== 200) {
        setMessage("Error saving vector to the database.");
        setOpen(true);
      }
    } catch (error) {
      setMessage("Error saving vector to the database.");
      setOpen(true);
      console.error(error);
    }
  };

  const fetchNearestVectors = async (
    inputVector: number[],
    limit = 10
  ): Promise<EmbeddingData[]> => {
    try {
      const response = await axios.post("/api/getNearestVectors", {
        mongoUri,
        mongoDbName,
        inputVector,
        limit,
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching nearest vectors:", error);
      return [];
    }
  };

  const isBinary = (text: string): boolean => {
    const controlChars = /[\x00-\x1F]/;
    return controlChars.test(text);
  };

  return (
    <BaseContainer>
      <InputContainer>
        <Typography variant="h4" gutterBottom>
          Embedding Simulator
        </Typography>
        <Spacer size={4} />
        <Grid container alignItems="center" spacing={2}>
          <Grid item xs={12} sm={12}>
            <Typography variant="h6" gutterBottom>
              Upload a file
            </Typography>
            <Spacer size={16} />
            <DropzoneBox onFilesChange={handleFilesChange} />
            <Spacer size={16} />
            {file !== undefined ? (
              <>
                <Typography>
                  {file?.name} - {file?.size} bytes
                </Typography>
                <Spacer size={16} />
                {progressLoading ? (
                  <>
                    <Typography>{step}</Typography>
                    <LinearProgress variant="determinate" value={progress} />
                    <Typography align="center">
                      {progress}% ({current} / {total})
                    </Typography>
                    <Spacer size={16} />
                  </>
                ) : null}
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleEmbedding}
                  startIcon={<AutoModeIcon />}
                >
                  Generate Embedding
                </Button>
              </>
            ) : null}
          </Grid>
          <Grid item xs={12} sm={12}>
            <Spacer size={16} />
            <Divider />
            <Spacer size={16} />
            <Typography variant="h6" gutterBottom>
              Simulate
            </Typography>
          </Grid>
          <Grid item xs={12} sm={10}>
            <TextField
              id="prompt"
              label="Please input a question."
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
              onClick={handleSimulate}
              startIcon={<SendIcon />}
            >
              Send
            </Button>
          </Grid>
          <Grid item xs={12} sm={12}>
            {simulateLoading ? (
              <>
                <Spacer size={20} />
                <CircularProgress />
              </>
            ) : (
              <List>
                {generatedDataList.map((embed, index) => (
                  <ListItem key={index}>
                    <ListItemText>
                      <Typography>Q. {embed.text}</Typography>
                      <Spacer size={4} />
                      <Typography>A. {embed.answer}</Typography>
                    </ListItemText>
                  </ListItem>
                ))}
              </List>
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
