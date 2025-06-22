/**
 *
 * @param {*} glob_files
 * @param {*} path
 * @returns a keyed object
 */
export async function glob_to_ids(glob_files, path) {
  const obj = Object.keys(glob_files).reduce((acc, file) => {
    const id = file.replace(path, "").replace(".svg", "");
    const icon = glob_files[file].default;
    acc[id] = icon;
    return acc;
  }, {});
  return obj;
}
