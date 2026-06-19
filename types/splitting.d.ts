declare module "splitting" {
  interface SplittingOptions {
    target?: string | Element | Element[]
    by?: string
  }

  function Splitting(options?: SplittingOptions): unknown[]
  export default Splitting
}

declare module "splitting/dist/splitting.css"
declare module "splitting/dist/splitting-cells.css"
