/**
 * Merges "source" and "target". If fields have equal name, merge them recursively.
 *
 * @return the merged object
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const deepMerge = (sourceObj: any, targetObj: any): any => {
  // If either source or target is not an object/array, return the target
  if (sourceObj === null || typeof sourceObj !== 'object') {
    return targetObj;
  }

  if (targetObj === null || typeof targetObj !== 'object') {
    return targetObj;
  }

  // If both are arrays, merge them uniquely
  if (Array.isArray(sourceObj) && Array.isArray(targetObj)) {
    const mergedArray = [...sourceObj];

    for (const targetItem of targetObj) {
      if (!sourceObj.some(sourceItem => areObjectsEqual(sourceItem, targetItem))) {
        mergedArray.push(targetItem);
      }
    }

    return mergedArray;
  }

  // If one is array and other is not, return target
  if (Array.isArray(sourceObj) !== Array.isArray(targetObj)) {
    return targetObj;
  }

  // If both are objects, deep merge them
  const mergedObj = { ...sourceObj };

  for (const key in targetObj) {
    if (Object.prototype.hasOwnProperty.call(targetObj, key)) {
      if (key === 'format_version') {
        // Override if the key is 'format_version'
        mergedObj[key] = targetObj[key];
      } else if (Object.prototype.hasOwnProperty.call(sourceObj, key)) {
        mergedObj[key] = deepMerge(sourceObj[key], targetObj[key]);
      } else {
        mergedObj[key] = targetObj[key];
      }
    }
  }

  return mergedObj;
};

/**
 * Helper function to compare two objects for equality
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const areObjectsEqual = (obj1: any, obj2: any): boolean => {
  if (obj1 === obj2) {
    return true;
  }

  if (obj1 === null || obj2 === null) {
    return false;
  }

  if (typeof obj1 !== 'object' || typeof obj2 !== 'object') {
    return false;
  }

  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) {
    return false;
  }

  for (const key of keys1) {
    if (!keys2.includes(key) || !areObjectsEqual(obj1[key], obj2[key])) {
      return false;
    }
  }

  return true;
};
