import { Organisation } from "./experiment-organisation";
import { Metadata } from "./experiment-metadata";
import { Resistance } from "./experiment-resistance";
import { Susceptibility } from "./experiment-susceptibility";
import { DrugPhase } from "./experiment-drug-phase";
import { Patient } from "./experiment-metadata-patient";
import { Sample } from "./experiment-metadata-sample";
import { Genotyping } from "./experiment-metadata-genotyping";
import { Phenotyping } from "./experiment-metadata-phenotyping";
import { Treatment } from "./experiment-metadata-treatment";
import { Outcome } from "./experiment-metadata-outcome";
import { Result } from "./experiment-result";

const definitions = {
  Organisation,
  Metadata,
  Resistance,
  Susceptibility,
  DrugPhase,
  Patient,
  Sample,
  Genotyping,
  Phenotyping,
  Treatment,
  Outcome,
  Result
};

export { definitions };
