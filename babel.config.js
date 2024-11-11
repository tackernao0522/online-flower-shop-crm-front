module.exports = {
  presets: [
    ["next/babel"],
    ["@babel/preset-react", { runtime: "automatic" }],
    ["@babel/preset-env", { targets: { node: "current" } }],
    "@babel/preset-typescript",
  ],
  plugins: [
    "@babel/plugin-proposal-private-methods",
    "@babel/plugin-proposal-class-properties",
    "@babel/plugin-proposal-private-property-in-object",
  ],
  env: {
    test: {
      presets: [
        ["@babel/preset-env", { targets: { node: "current" } }],
        "@babel/preset-typescript",
        ["@babel/preset-react", { runtime: "automatic" }],
      ],
    },
  },
};
