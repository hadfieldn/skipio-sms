let env;
if (typeof window !== 'undefined') {
  env = window.__Environment;
} else if (typeof global !== 'undefined') {
  env = global.__Environment;
}

export default env;
