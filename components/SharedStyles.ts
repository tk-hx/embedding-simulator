import { Container } from "@mui/material";
import { styled } from "@mui/system";

export const BaseContainer = styled(Container)({
  minHeight: "80vh",
  padding: "32px",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
});

export const InputContainer = styled("div")({
  maxWidth: "800px",
  width: "100%",
  padding: "32px",
  borderRadius: "5px",
  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
});
