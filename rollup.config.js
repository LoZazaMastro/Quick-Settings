import deckyPlugin from "@decky/rollup";

// Standard Decky build pipeline. Externalises React / @decky/ui / @decky/api
// to the globals the Decky loader injects (SP_REACT, SP_JSX, DFL, ...).
export default deckyPlugin();
