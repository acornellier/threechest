import type {
  JsonTemplateArray,
  JsonTemplateContainer,
  JsonTemplateObject,
  JsonTemplateObjectDeep} from './index.ts';
import {
  assertIsJsonTemplate
} from './index.ts'
import type { Delta} from './diff-json.ts';
import { DeltaType, diff, OperationType, patch } from './diff-json.ts'
import { deepNormalizeJson } from './normalize-json.ts'

type DeepPartial<T> = { [P in keyof T]?: DeepPartial<T[P]> | undefined }

function removeDeletionDeltas<T extends Delta>(delta: T): void {
  // We intentially do the same filtering in both cases, just to please TypeScript's type system
  if (delta.type === DeltaType.Array) {
    delta.operations = delta.operations.filter((x) => x.operationType !== OperationType.Deletion)
  } else {
    delta.operations = delta.operations.filter((x) => x.operationType !== OperationType.Deletion)
  }
  for (const operation of delta.operations) {
    if (operation.operationType === OperationType.Nested) {
      removeDeletionDeltas(operation.delta)
    }
  }
  return
}

// After application, objectToMutate will contain everything in newState.
// Keys in objectToMutate are untouched if not present in newState.
// Reference equality in objectToMutate is preserved whenever possible.
// `undefined` values are removed
export function deepMergeJson<T extends JsonTemplateObjectDeep>(
  objectToMutate: T,
  newState: DeepPartial<T>,
): void {
  assertIsJsonTemplate(objectToMutate)
  assertIsJsonTemplate(newState)
  const delta = diff(objectToMutate, newState as unknown[])
  removeDeletionDeltas(delta)
  patch(objectToMutate, delta)
  deepNormalizeJson(objectToMutate)
}

// After application, objectToMutate will be deep-value-equal to newState.
// Reference equality in objectToMutate is preserved whenever possible.
// `undefined` values are removed
export function deepPatchJson<T extends JsonTemplateObject>(objectToMutate: T, newState: T): void
export function deepPatchJson<T extends JsonTemplateArray>(objectToMutate: T, newState: T): void
export function deepPatchJson<T extends JsonTemplateContainer>(
  objectToMutate: T,
  newState: T,
): void {
  assertIsJsonTemplate(objectToMutate)
  assertIsJsonTemplate(newState)

  patch(objectToMutate, diff(objectToMutate, newState))
  deepNormalizeJson(objectToMutate)
}
