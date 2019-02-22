import { initialise as initialiseSmsWorker } from "./sms-worker";
import { initialise as initialiseEmailWorker } from "./email-worker";

const initialise = () => {
  initialiseSmsWorker();
  initialiseEmailWorker();
};

const workers = Object.freeze({
  initialise
});

export default workers;
