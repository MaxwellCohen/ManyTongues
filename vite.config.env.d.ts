declare module "@rolldown/plugin-babel" {
  import type { Plugin } from "vite";

  interface BabelOptions {
    presets?: unknown[];
  }

  function babel(options: BabelOptions): Plugin | Promise<Plugin>;
  export default babel;
}
