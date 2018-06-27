import { Organisation } from "./experiment-organisation";
import { Metadata } from "./experiment-metadata";
import { Location } from "./experiment-location";
import { Resistance } from "./experiment-resistance";
import { Distance } from "./experiment-distance";
import { Susceptibility } from "./experiment-susceptibility";
import { SusceptibilityNotTestedReason } from "./experiment-susceptibility-not-tested-reason";
import { DrugOutsidePhase } from "./experiment-drug-outside-phase";
import { DrugOutsidePhaseStartDate } from "./experiment-drug-outside-phase-start-date";
import { DrugOutsidePhaseEndDate } from "./experiment-drug-outside-phase-end-date";

const definitions = {
  Organisation,
  Metadata,
  Location,
  Resistance,
  Distance,
  Susceptibility,
  SusceptibilityNotTestedReason,
  DrugOutsidePhase,
  DrugOutsidePhaseStartDate,
  DrugOutsidePhaseEndDate
};

export { definitions };
