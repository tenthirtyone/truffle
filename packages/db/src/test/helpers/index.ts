export const testContractData = {
  name: "contract",
  abi: {},
  compilation: {},
  source: {}
};

export const testCompilationData = {
  compiler: "solc-compiler-major-minor-patch",
  sources: "rofl rofl rofl",
  processedSources: "rofl-link-rofl"
};

const testCollectionData: { [key: string]: object } = {
  contracts: { ...testContractData },
  compilations: { ...testCompilationData }
};

export function createBatchOps(collection: string, count: number) {
  let ops: { type: string; key: string; value: object }[] = [];
  for (let i = 0; i < count; i++) {
    const key = `${collection}-${i}`;
    ops.push({
      type: "put",
      key,
      value: {
        ...testCollectionData[collection],
        name: key
      }
    });
  }

  return ops;
}
