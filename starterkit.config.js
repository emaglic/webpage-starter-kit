const config = {
  publicPath: "./public",
  pages: [
    {
      html: "./src/pages/index.html",
      js: "./src/pages/index.js",
      css: "./src/pages/index.scss",
      name: "index",
      // includeComponents: [],
      // outputFileName: "index",
      outputPath: "",
      // inject: true,
    },
    {
      html: "./src/pages/test/test.html",
      js: "./src/pages/test/test.js",
      css: "./src/pages/test/test.scss",
      name: "test",
      // outputFileName: "test",
      // includeComponents: [],
      outputPath: "pages/test",
      // inject: true,
    },
  ],
  // components: [],
  copyFolders: [
    { from: "./src/images", to: "images" },
    { from: "./src/dependencies", to: "dependencies" },
  ],
};

module.exports = config;
