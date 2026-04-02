declare module "*.(ts|tsx)" {
  const modules: object[];
  export default modules;
  export const filenames: string[];
}
