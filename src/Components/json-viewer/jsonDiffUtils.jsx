/**
 * Compare two JSON objects and return a diff structure
 */
export function compareJSON(obj1, obj2) {
  const summary = {
    added: 0,
    removed: 0,
    modified: 0
  };

  function compare(oldVal, newVal, path = []) {
    // Both are null or undefined
    if (oldVal === newVal) {
      return { type: 'unchanged', oldValue: oldVal, newValue: newVal };
    }

    // Value was removed
    if (newVal === undefined) {
      summary.removed++;
      return { type: 'removed', oldValue: oldVal };
    }

    // Value was added
    if (oldVal === undefined) {
      summary.added++;
      return { type: 'added', newValue: newVal };
    }

    // Different types or primitive values
    if (
      typeof oldVal !== typeof newVal ||
      typeof oldVal !== 'object' ||
      oldVal === null ||
      newVal === null ||
      Array.isArray(oldVal) !== Array.isArray(newVal)
    ) {
      if (oldVal !== newVal) {
        summary.modified++;
        return { type: 'modified', oldValue: oldVal, newValue: newVal };
      }
      return { type: 'unchanged', oldValue: oldVal, newValue: newVal };
    }

    // Both are objects or arrays
    const children = {};
    let hasChanges = false;

    // Handle arrays
    if (Array.isArray(oldVal)) {
      const maxLength = Math.max(oldVal.length, newVal.length);
      for (let i = 0; i < maxLength; i++) {
        const childDiff = compare(oldVal[i], newVal[i], [...path, i]);
        if (childDiff.type !== 'unchanged') {
          hasChanges = true;
        }
        children[i] = childDiff;
      }
    } else {
      // Handle objects
      const allKeys = new Set([...Object.keys(oldVal), ...Object.keys(newVal)]);
      for (const key of allKeys) {
        const childDiff = compare(oldVal[key], newVal[key], [...path, key]);
        if (childDiff.type !== 'unchanged') {
          hasChanges = true;
        }
        children[key] = childDiff;
      }
    }

    return {
      type: hasChanges ? 'modified' : 'unchanged',
      oldValue: oldVal,
      newValue: newVal,
      children: Object.keys(children).length > 0 ? children : undefined
    };
  }

  const diff = compare(obj1, obj2);
  return { diff, summary };
}
