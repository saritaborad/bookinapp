export function getQueryParameters() {
  const queryString = window.location.search;
  const params = new URLSearchParams(queryString);
  const paramObject = {};

  params.forEach((value, key) => {
    paramObject[key] = value;
  });
  return paramObject;
}

export const referenceObj = {
  city: "dubai",
  guests: "1",
  sort: "search:default",
  page: "1",
};

export function compareObjects(obj1, obj2) {
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) return false; // Check if the number of keys is the same

  for (const key of keys1) {
    if (!keys2.includes(key)) return false; // Check if the key exists in both objects
    if (obj1[key] !== obj2[key]) return false; // Check if the values for the same key are equal
  }
  return true;
}
