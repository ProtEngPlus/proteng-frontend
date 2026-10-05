import {
  CreateJobDetail,
  PipelineItem,
  PipelineItems,
} from "../interfaces/CreateJob.interface";
import { RunType } from "../interfaces/Job.interface";

// default create job detail
export const defaultCreateJobDetail: CreateJobDetail = {
  name: "",
  description: "",
  input_protein:
    "MSIQFFRVALIPFFAAFCLPVFAHPETLVKVKDAEDQLGARVGYIELDLNSGKILESFRPEERFPMMSTFKVLLCGAVLSRVDAGQEQLGRRIHYSQNDLVEYSPVTEKHLTDGMTVRELCSAAITMSDNTAANLLLTTIGGPKELTAFLHNMGDHVTRLDRWEPELNEAIPNDERDTTMPAAMATTLRKLLTGELLTLASRQQLIDWMEADKVAGPLLRSALPAGWFIADKSGAGERGSRGIIAALGPDGKPSRIVVIYTTGSQATMDERNRQIAEIGASLIKHW",
  lab_result: [],
  run_type: "one-step",
  is_notification_on: true,
  artifact: null,
};
// default for inputProtein
export const inputProteinProtSeq =
  "MSIQFFRVALIPFFAAFCLPVFAHPETLVKVKDAEDQLGARVGYIELDLNSGKILESFRPEERFPMMSTFKVLLCGAVLSRVDAGQEQLGRRIHYSQNDLVEYSPVTEKHLTDGMTVRELCSAAITMSDNTAANLLLTTIGGPKELTAFLHNMGDHVTRLDRWEPELNEAIPNDERDTTMPAAMATTLRKLLTGELLTLASRQQLIDWMEADKVAGPLLRSALPAGWFIADKSGAGERGSRGIIAALGPDGKPSRIVVIYTTGSQATMDERNRQIAEIGASLIKHW";
export const inputProteinUniprotId = "P62593";

// all pipelines
export const Pipelines: PipelineItems[] = [
  { method: "Protein Query", subMethod: ["Blast", "MMseqs2"] },
  { method: "Protein Representation", subMethod: ["Unirep", "ESM"] },
  { method: "Top Model", subMethod: ["RidgeCV"] },
  { method: "Mutation", subMethod: ["Mutation"] },
];

// default pipeline
export const defaultPipeline: PipelineItem[] = [
  { method: "Protein Query", subMethod: "Blast" },
  { method: "Protein Representation", subMethod: "Unirep" },
  { method: "Top Model", subMethod: "RidgeCV" },
  { method: "Mutation", subMethod: "Mutation" },
];

// format input and helper text
export const formatInput: Record<
  number,
  {
    input: string;
    helperText: string;
    insideHelperText: (value: MethodParameter) => string;
  }
> = {
  1: {
    input: "flex flex-row gap-x-[5%] gap-y-4 flex-wrap",
    helperText: "flex flex-row gap-x-[5%] gap-y-4 flex-wrap",
    insideHelperText: () => "grid grid-cols-[2fr,3fr] w-[30%] gap-x-3",
  },
  2: {
    input: "grid grid-cols-[1fr,1fr] gap-y-4 w-fit gap-x-[250px]",
    helperText: "grid grid-cols-[1fr,1fr] gap-y-4 w-fit gap-x-[150px]",
    insideHelperText: (value) =>
      value.type === "rangeNumber"
        ? "flex flex-col space-y-2"
        : "grid grid-cols-[1fr,2fr] gap-x-3",
  },

  3: {
    input: "flex flex-col gap-y-4",
    helperText: "space-y-5 w-fit",
    insideHelperText: () => "grid grid-cols-[1fr,4fr] space-x-3 text-start",
  },
  4: {
    input: "flex flex-col gap-y-4",
    helperText: "space-y-5 w-fit",
    insideHelperText: () => "grid grid-cols-[1fr,2fr] space-x-3 text-start",
  },
};

export interface CreateJobConfig {
  [method: string]: {
    description: string;
    tool: {
      [subMethod: string]: {
        formatInput: number;
        description: string;
        parameters: MethodParameter[];
      };
    };
  };
}

export interface MethodParameter {
  name: string;
  id: string;
  type:
    | "dropdown"
    | "string"
    | "number"
    | "rangeNumber"
    | "percent"
    | "multiNumberDropdown"
    | "boolean"
    | RunType
    | "rangePercent";
  description: string;
  default?: string | number | number[] | boolean | RunType;
  low?: number;
  high?: number;
  dropdownItems?: string[] | number[];
  additionalValidation?: ValidationRule;
}

export interface ValidationRule {
  required?: { value: boolean; message: string };
  min?: { value: number; message: string };
  max?: { value: number; message: string };
  minLength?: { value: number; message: string };
  maxLength?: { value: number; message: string };
  pattern?: { value: RegExp; message: string };
  validate?(
    value: string | number | number[] | boolean | RunType,
  ): boolean | string;
}

const wholeNumber =
  (label: string): NonNullable<ValidationRule["validate"]> =>
  (value) =>
    Number.isInteger(Number(value)) || `${label} must be a whole number.`;

export const createJobConfig: CreateJobConfig = {
  "Protein Input": {
    description:
      "Protein sequence to be mutated and scored, provided in FASTA format or UniProt ID.",
    tool: {
      "Query Result": {
        formatInput: 1,
        description: "",
        parameters: [
          {
            name: "organism",
            id: "organism",
            type: "string",
            description:
              "The specific species or biological entity from which the protein sequence originates",
          },
          {
            name: "Percent Identity",
            id: "percent_identity_result",
            type: "rangePercent",
            description:
              "The minimum percentage of sequence identity in the database required for a match to the query sequence to be considered significant",
            additionalValidation: {
              min: {
                value: 0,
                message: "Percent Identity must be at least 0.",
              },
            },
          },
          {
            name: "E Value",
            id: "e_values_result",
            type: "rangeNumber",
            description:
              "The number of expected hits of similar quality (score) that could be found by chance. The smaller the E-value, the better the match.",
            additionalValidation: {
              min: { value: 0, message: "E Value must be at least 0." },
            },
          },
          {
            name: "Query Cover",
            id: "query_cover_result",
            type: "rangePercent",
            description:
              "The percentage of the query sequence (your specimen) that overlaps with the database sequence",
            additionalValidation: {
              min: { value: 0, message: "Query Cover must be at least 0." },
            },
          },
        ],
      },
    },
  },
  "Protein Query": {
    description:
      "Protein Query Tool to gather similar proteins from a global database",
    tool: {
      Blast: {
        formatInput: 2,
        description:
          "Tool used to compare a query protein sequence against a database of sequences by aligning sequences based on local matches.",
        parameters: [
          {
            name: "Program",
            id: "program",
            type: "dropdown",
            description: "Selected program for the tool",
            dropdownItems: ["blastp"],
            default: "blastp",
          },
          {
            name: "Database",
            id: "database",
            type: "dropdown",
            description: "Database targeted for protein query",
            dropdownItems: ["nr"],
            default: "nr",
            additionalValidation: {
              required: { value: true, message: "Database is required." },
            },
          },
          {
            name: "Hit Size",
            id: "hitlist_size",
            type: "number",
            description:
              "The maximum number of protein sequences returned from the database that match the query sequence",
            default: 50,
            additionalValidation: {
              required: { value: true, message: "Hit Size is required." },
              min: { value: 1, message: "Hit Size must be at least 1." },
              validate: wholeNumber("Hit Size"),
            },
          },
          {
            name: "E Value",
            id: "expect",
            type: "dropdown",
            description:
              "The number of expected hits of similar quality (score) that could be found by chance. The smaller the E-value, the better the match.",
            dropdownItems: [
              1000, 100, 10, 1, 0.1, 0.01, 0.001, 0.0001, 0.00001,
            ],
            default: 10,
            additionalValidation: {
              required: { value: true, message: "Expect is required." },
            },
          },
          {
            name: "Sequence Length",
            id: "seq_length",
            type: "number",
            description:
              "The expected length of protein sequences response from database",
            default: 300,
            additionalValidation: {
              required: {
                value: true,
                message: "Sequence Length is required.",
              },
              min: {
                value: 1,
                message: "Sequence Length must be at least 1.",
              },
              validate: wholeNumber("Sequence Length"),
            },
          },
          {
            name: "Percent Identity",
            id: "perc_ident",
            type: "percent",
            description:
              "The minimum percentage of sequence identity in the database required for a match to the query sequence to be considered significant",
            default: 85,
            additionalValidation: {
              required: {
                value: true,
                message: "Percent Indentity is required.",
              },
              min: {
                value: 0,
                message: "Percent Indentity must be at least 0.",
              },
            },
          },
          {
            name: "Random State",
            id: "random_state",
            type: "number",
            description:
              "Seed of the random number used in the query algorithm",
            default: 50,
            additionalValidation: {
              required: { value: true, message: "Random State is required." },
              min: { value: 0, message: "Random State must be at least 0." },
              validate: wholeNumber("Random State"),
            },
          },
          {
            name: "HSP Coverage",
            id: "hsp_cov",
            type: "number",
            description:
              "The minimum percentage of sequence identity in the database required for a match to the query sequence to be considered significant",
            default: 50,
            additionalValidation: {
              required: { value: true, message: "HSP Coverage is required." },
              min: { value: 0, message: "HSP Coverage must be at least 0." },
              max: {
                value: 100,
                message: "HSP Coverage must be at most 100.",
              },
              validate: wholeNumber("HSP Coverage"),
            },
          },
        ],
      },

      MMseqs2: {
        formatInput: 2,
        description:
          "Tool used for comparing query sequences against a target database using local alignments to identify similar sequences, optimized for large-scale searches.",
        parameters: [
          {
            name: "Maximum Sequences",
            id: "max_seqs",
            type: "number",
            description:
              "Maximum results allowed to pass the prefilter (affects sensitivity)",
            default: 70,
            additionalValidation: {
              required: {
                value: true,
                message: "Maximum Sequences is required.",
              },
              min: {
                value: 1,
                message: "Maximum Sequences must be at least 1.",
              },
              validate: wholeNumber("Maximum Sequences"),
            },
          },
          {
            name: "E Value",
            id: "e",
            type: "dropdown",
            description:
              "The number of expected hits of similar quality (score) that could be found by chance. The smaller the E-value, the better the match",
            dropdownItems: [
              1000, 100, 10, 1, 0.1, 0.01, 0.001, 0.0001, 0.00001,
            ],
            default: 0.001,
            additionalValidation: {
              required: { value: true, message: "Expect is required." },
            },
          },
          {
            name: "Minimum Sequence Identity",
            id: "min_seq_id",
            type: "percent",
            description:
              "The minimum percentage of sequence identity in the database required for a match to the query sequence to be considered significant",
            default: 70,
            additionalValidation: {
              required: {
                value: true,
                message: "Minimum Sequence Identity is required.",
              },
              min: {
                value: 0,
                message: "Minimum Sequence Identity must be at least 0.",
              },
            },
          },
          {
            name: "Minimum Alignment Length",
            id: "min_aln_len",
            type: "number",
            description:
              "The shortest length of the aligned region between two sequences for the match to be considered valid",
            default: 0,
            additionalValidation: {
              required: {
                value: true,
                message: "Minimum Alignment Length is required.",
              },
              min: {
                value: 0,
                message: "Minimum Alignment Length must be at least 0.",
              },
              validate: wholeNumber("Minimum Alignment Length"),
            },
          },
          {
            name: "Coverage Mode",
            id: "cov_mode",
            type: "dropdown",
            description:
              "0: coverage of query and target\n1: coverage of target\n2: coverage of query\n3: target seq. length has to be at least x% of query length\n4: query seq. length has to be at least x% of target length\n5: short seq. needs to be at least x% of the other seq. length",
            dropdownItems: [0, 1, 2, 3, 4, 5],
            default: 0,
            additionalValidation: {
              required: {
                value: true,
                message: "Coverage Mode is required.",
              },
            },
          },
          {
            name: "Coverage Threshold",
            id: "c",
            type: "percent",
            description:
              "The minimum fraction of a sequence that must be covered by the alignment to keep the result",
            default: 70,
            additionalValidation: {
              required: {
                value: true,
                message: "Coverage Threshold is required.",
              },
              min: {
                value: 0,
                message: "Coverage Threshold must be at least 0.",
              },
            },
          },
          {
            name: "Sequence Length",
            id: "seq_length",
            type: "number",
            description:
              "The expected length of protein sequences response from database",
            default: 300,
            additionalValidation: {
              required: {
                value: true,
                message: "Sequence Length is required.",
              },
              min: {
                value: 1,
                message: "Sequence Length must be at least 1.",
              },
              validate: wholeNumber("Sequence Length"),
            },
          },
          {
            name: "Random State",
            id: "random_state",
            type: "number",
            description:
              "Seed of the random number used in the query algorithm",
            default: 50,
            additionalValidation: {
              required: { value: true, message: "Random State is required." },
              min: { value: 0, message: "Random State must be at least 0." },
              validate: wholeNumber("Random State"),
            },
          },
        ],
      },
    },
  },
  "Protein Representation": {
    description:
      "A fine-tuning tool that combines features from both the global and local sequence landscapes and presents them in a holistic statistical summary",
    tool: {
      Unirep: {
        formatInput: 2,
        description:
          "Model that generates fixed-length numerical representations (embeddings) of protein sequences.",
        parameters: [
          {
            name: "N Trial",
            id: "n_trials",
            type: "number",
            description:
              "The number of trials for fine-tuning using the protein representation technique. The higher the number of trials, the greater the model consistency",
            default: 2,
            additionalValidation: {
              required: { value: true, message: "N Trial is required." },
              min: { value: 1, message: "N Trial must be at least 1." },
              validate: wholeNumber("N Trial"),
            },
          },
          {
            name: "N Splits",
            id: "n_splits",
            type: "number",
            description:
              "The number of dataset splits for training, validation, and testing. Each split consists of groups of datasets with different associated data More splits (N) reduce bias, prevent overfitting, and improve generalization",
            default: 2,
            additionalValidation: {
              required: { value: true, message: "N Splits is required." },
              min: { value: 2, message: "N Splits must be at least 2." },
              validate: wholeNumber("N Splits"),
            },
          },
          {
            name: "N Epoch",
            id: "n_epochs_config",
            type: "rangeNumber",
            description:
              "The minimum and maximum number of times the training model sees each sample in the dataset",
            low: 1,
            high: 2,
            additionalValidation: {
              required: { value: true, message: "N Epoch is required." },
              min: { value: 1, message: "N Epoch must be at least 1." },
              validate: wholeNumber("N Epoch"),
            },
          },
          {
            name: "Learning Rate",
            id: "learning_rate_config",
            type: "rangeNumber",
            description:
              "The minimum and maximum weight changes for the model during training",
            low: 0.00001,
            high: 0.001,
            additionalValidation: {
              required: {
                value: true,
                message: "Learning Rate - low is required.",
              },
              min: {
                value: 0,
                message: "Learning Rate - low must be at least 0.",
              },
            },
          },
        ],
      },
      ESM: {
        formatInput: 2,
        description:
          "Transformer-based model that generates fixed-length protein embeddings by averaging residue-level features.",
        parameters: [
          {
            name: "Weight Decay",
            id: "weight_decay",
            type: "number",
            description:
              "Regularization technique that penalizes large weights to improve generalization and prevent overfitting, promoting more consistent model behavior across training.",
            default: 0.01,
            additionalValidation: {
              required: { value: true, message: "Weight Decay is required." },
              min: { value: 0, message: "Weight Decay must be at least 0." },
              max: { value: 1, message: "Weight Decay must be at most 1." },
            },
          },
          {
            name: "N Epochs Config",
            id: "n_epochs_config",
            type: "number",
            description:
              "The number of training cycles over the dataset, more epochs can improve performance but risk overfitting if too high.",
            default: 2,
            additionalValidation: {
              required: {
                value: true,
                message: "N Epochs Config is required.",
              },
              min: { value: 1, message: "N Epochs Config must be at least 1." },
              validate: wholeNumber("N Epochs Config"),
            },
          },
        ],
      },
    },
  },
  "Top Model": {
    description: "Machine Learning model for training the dataset",
    tool: {
      RidgeCV: {
        formatInput: 3,
        description:
          "RidgeCV is a linear regression model that includes built-in cross-validation to automatically select the best regularization parameter (alpha). ",
        parameters: [
          {
            name: "Training Batch Sizes",
            id: "train_batch_sizes",
            type: "multiNumberDropdown",
            description:
              "The number of training examples the model sees before updating its internal parameters (number of samples per iteration) Multiple batch sizes can be selected to find the best one",
            dropdownItems: [24, 32, 64, 96, 128],
            default: [24, 32],
            additionalValidation: {
              required: {
                value: true,
                message: "Training Batch Sizes is required.",
              },
              validate: (value: number[]) =>
                value.length > 0 || "Training Batch Sizes must not be empty.",
            },
          },
          {
            name: "N Batch",
            id: "n_batch",
            type: "number",
            description:
              "The number of grouped training examples for each iteration",
            default: 56,
            additionalValidation: {
              required: { value: true, message: "N Batch is required." },
              min: { value: 1, message: "N Batch must be at least 1." },
              validate: wholeNumber("N Batch"),
            },
          },
          {
            name: "Alpha",
            id: "alpha",
            type: "dropdown",
            description:
              "A measure of how much the model is overfitting, Regularization Strength As alpha increases, strength increases, leading to more variance from the regular model",
            dropdownItems: [100, 10, 1, 0.1, 0.01, 0.001],
            default: 0.1,
            additionalValidation: {
              required: { value: true, message: "Alpha is required." },
            },
          },
        ],
      },
    },
  },
  Mutation: {
    description: "The output of the model",
    tool: {
      Mutation: {
        formatInput: 3,
        description:
          "This training model is designed to generate mutated protein sequences from the query sequence and predict assay scores.",
        parameters: [
          {
            name: "Number of Trajectories",
            id: "num_trajectories",
            type: "number",
            description:
              "The number of time protein position randomly selected to mutate",
            default: 5,
            additionalValidation: {
              required: {
                value: true,
                message: "Number of trajectories is required.",
              },
              min: {
                value: 1,
                message: "Number of trajectories must be at least 1.",
              },
              validate: wholeNumber("Number of trajectories"),
            },
          },
          {
            name: "Number of Iterations",
            id: "num_iterations",
            type: "number",
            description:
              "The number of mutation cycles, which is the number of times a protein sequence is mutated",
            default: 25,
            additionalValidation: {
              required: {
                value: true,
                message: "Number of iterations is required.",
              },
              min: {
                value: 1,
                message: "Number of iterations must be at least 1.",
              },
              validate: wholeNumber("Number of iterations"),
            },
          },
          {
            name: "Mutated Position Range",
            id: "mutate_pos_range",
            type: "number",
            description:
              "The range of positions from the current mutated position where the next mutation is located",
            default: 5,
            additionalValidation: {
              required: {
                value: true,
                message: "Mutated Position Range is required.",
              },
              min: {
                value: 1,
                message: "Mutated Position Range must be at least 1.",
              },
              validate: wholeNumber("Mutated Position Range"),
            },
          },
          {
            name: "Temperature",
            id: "temperature",
            type: "dropdown",
            description:
              "Determining whether the output is more random and creative (high temperature) or more predictable (low temperature)",
            dropdownItems: [10, 1, 0.1, 0.01, 0.001, 0.0001],
            default: 0.01,
            additionalValidation: {
              required: { value: true, message: "Temperature is required." },
            },
          },
        ],
      },
    },
  },
};
