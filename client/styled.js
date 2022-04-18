import { styled } from '@mui/system';

export const PageBody = styled("div")({
  width: "100%",
  height: "100%",
  padding: "2em",
})

export const TabHead = styled("div")({
  "border-bottom": "1px solid black",
  display: "flex",
  background: "black"
})

export const TabContainer = styled("div")({
  "webkit-box-shadow": "-1px 0px 5px 0px rgba(184, 184, 184, 1)",
  "-moz-box-shadow": "-1px 0px 5px 0px rgba(184, 184, 184, 1)",
  "box-shadow": "-1px 0px 5px 0px rgba(184, 184, 184, 1)",
  position: "absolute",
  top: 0,
  bottom: 0,
  left: 0,
  right: 0,
  overflow: "hidden",
  "z-index": -1 /* Remove this line if it's not going to be a background! */
})

export const TabBody = styled("div")({
  height: "100%"
})

export const Tab = styled("div")`
  padding: 1em;
  background: ${({ selected }) => (selected ? "grey" : "black")};
  * {
    color: white;
  }
`

export const RightButton = styled("button")({
  variant: "contained",
  "margin-left": "auto"
})

export const MintButton = styled("button")({
})
