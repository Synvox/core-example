import Debug from "debug";

const debug = {
  log: Debug("app:log"),
  info: Debug("app:info"),
  error: Debug("app:error"),
};

export default debug;
