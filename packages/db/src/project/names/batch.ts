import { logger } from "@truffle/db/logger";
const debug = logger("db:project:names:batch");

import { _, IdObject } from "@truffle/db/project/process";
import * as Batch from "@truffle/db/process/batch";

type Config = {
  assignment: {};
  properties: {};
  entry?: any;
  result?: any;
};

type Assignment<C extends Config> = { resource: IdObject } & C["assignment"];
type Properties<C extends Config> = C["properties"];

type Structure<_C extends Config> = {
  project: IdObject<DataModel.Project>;
  collectionName: string;
  assignments: _[];
};

type Breadcrumb<_C extends Config> = {
  assignmentIndex: number;
};

type Input<C extends Config> = Assignment<C>;

type Entry<C extends Config> = C["entry"];
type Result<C extends Config> = C["result"];

type Output<C extends Config> = Input<C> & Properties<C>;

type Batch<C extends Config> = {
  structure: Structure<C>;
  breadcrumb: Breadcrumb<C>;
  input: Input<C>;
  output: Output<C>;
  entry: Entry<C>;
  result: Result<C>;
};

type Options<C extends Config> = Omit<
  Batch.Options<Batch<C>>,
  "iterate" | "find" | "initialize" | "merge"
>;

export const generate = <C extends Config>(options: Options<C>) =>
  Batch.configure<Batch<C>>({
    *iterate<_I, _O>({ inputs }) {
      for (const [
        assignmentIndex,
        assignment
      ] of inputs.assignments.entries()) {
        yield {
          input: assignment,
          breadcrumb: {
            assignmentIndex
          }
        };
      }
    },

    find<_I, _O>({ inputs, breadcrumb }) {
      const { assignmentIndex } = breadcrumb;

      return inputs.assignments[assignmentIndex];
    },

    initialize<I, O>({ inputs }) {
      return {
        project: inputs.project,
        collectionName: inputs.collectionName,
        assignments: inputs.assignments.map(assignment => assignment as I & O)
      };
    },

    merge<I, O>({ outputs, breadcrumb, output }) {
      const { assignmentIndex } = breadcrumb;

      const assignmentsBefore = outputs.assignments.slice(0, assignmentIndex);
      const assignment: I & O = output;
      const assignmentsAfter = outputs.assignments.slice(assignmentIndex + 1);

      return {
        project: outputs.project,
        collectionName: outputs.collectionName,
        assignments: [...assignmentsBefore, assignment, ...assignmentsAfter]
      };
    },

    ...options
  });
