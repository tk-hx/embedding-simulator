import { useState } from "react";
import { TextField, Button, Typography, Snackbar, Alert, Grid, Link, SnackbarCloseReason } from "@mui/material";
import { AlertColor } from "@mui/material/Alert";
import SaveIcon from "@mui/icons-material/Save";
import { useSettings } from "../lib/useSettings";
import { BaseContainer, InputContainer } from "../components/SharedStyles";

export default function Settings() {
  const { apiKey, setApiKey } = useSettings();
  const [inputApiKey, setInputApiKey] = useState(apiKey || "");
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");  
  const [severity, setSeverity] = useState<AlertColor>("success");

  const handleClose = (event?: Event | React.SyntheticEvent<Element, Event>, reason?: SnackbarCloseReason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpen(false);
  };

  const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputApiKey(e.target.value);
  };

  const handleSaveApiKey = () => {
    if (inputApiKey.length <= 0) {
      setSeverity("error");
      setMessage("Please enter the api key.");
    } else {
      setSeverity("success");
      setMessage("Saved!");
      setApiKey(inputApiKey);
    }
    setOpen(true);
  };

  return (
    <BaseContainer>
      <InputContainer>
        <Typography variant="h4" gutterBottom>
          Settings
        </Typography>
        <Grid container alignItems="center" spacing={2}>
          <Grid item xs={12} sm={12}>
            <Link rel="noreferrer" href="https://platform.openai.com/account/api-keys" target="_blank">
              Create OpenAI API Key
            </Link>
          </Grid>
          <Grid item xs={12} sm={10}>
            <TextField
              id="apiKey"
              label="API Key"
              variant="outlined"
              fullWidth
              type="password"
              value={inputApiKey}
              onChange={handleApiKeyChange}
              sx={{ flexGrow: 1, marginRight: 1 }}
            />
          </Grid>
          <Grid item xs={12} sm={2}>
            <Button
              variant="contained"
              color="primary"
              endIcon={<SaveIcon />}
              onClick={handleSaveApiKey}
            >
              Save
            </Button>
          </Grid>
        </Grid>
      </InputContainer>
      <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
        <Alert onClose={() => setOpen(false)} severity={severity} sx={{ width: "100%" }}>
          {message}
        </Alert>
      </Snackbar>
    </BaseContainer>
  );
}
