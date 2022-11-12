const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const config = require("./StarterKit.config");

let configEntries = [];
if (config.pages) {
  configEntries = [...configEntries, ...config.pages];
}
if (config.components) {
  configEntries = [...configEntries, ...config.components];
}

// You can now include partials (partial html pieces) in your index.html file like this
// You can also use partials inside of partials, everything is relativ to the src directory.
//<include src="relative/path/to/partial">
const INCLUDE_PATTERN = /<include src="(.+)"\s*\/?>(?:<\/include>)?/gi;
const processNestedHtml = (content, loaderContext, dir = "./src") => {
  return !INCLUDE_PATTERN.test(content.replace(/(\r\n|\n|\r)/gm, ""))
    ? content
    : content.replace(INCLUDE_PATTERN, (m, src) => {
        const filePath = path.resolve(dir || loaderContext.context, src);
        loaderContext.dependency(filePath);
        return processNestedHtml(loaderContext.fs.readFileSync(filePath, "utf8"), loaderContext, path.dirname(filePath));
      });
};

const getItem = (name) => {
  let item = configEntries.find((_item, index) => {
    return _item.name === name;
  });
  if (item) return item;
  return null;
};

const getChunks = (name, type) => {
  let chunks = [];
  let item = configEntries.find((_item, index) => {
    return _item.name === name;
  });
  if (!item) return chunks;
  if (type === "js") {
    if (item.js) chunks = [item.name];
    if (item.includeComponents) chunks = [...chunks, ...item.includeComponents];
    return chunks;
  }
};

// Gets all the JS Entries from starterkit.config.js
// -----------------------------------------------------------------------------
const getEntries = () => {
  let ret = {};
  configEntries.forEach((item, index) => {
    let _entry = item.js ? item.js : "";
    if (_entry) ret[item.name] = item.js;
  });
  return ret;
};
// -----------------------------------------------------------------------------

// Instantiates HTMLWebpackPlugin Instances from starterkit.config.js
// -----------------------------------------------------------------------------
const getCopyWebpagePlugins = (env) => {
  let ret = [];
  configEntries.forEach((item, index) => {
    const filename = item.outputFileName ? item.ouputFileName : "index";
    ret.push(
      new HtmlWebpackPlugin({
        template: item.html,
        filename: item.outputPath ? `${item.outputPath}/${filename}.html` : `${filename}.html`,
        chunks: getChunks(item.name, "js"),
        cache: false,
        minify: false,
        inject: (() => {
          if (item.inject || item.inject === false) {
            return item.inject;
          } else {
            return "body";
          }
        })(),
      })
    );
  });
  return ret;
};
// -----------------------------------------------------------------------------
module.exports = (env) => {
  return {
    entry: getEntries(),
    output: {
      path: path.join(__dirname, "public"),
      filename: ({ chunk }) => {
        let item = getItem(chunk.name);
        return item.outputPath ? `${item.outputPath}/${item.name}.js` : `${chunk.name}.js`;
      },
    },
    plugins: [new CleanWebpackPlugin(), ...getCopyWebpagePlugins()],
    resolve: {
      alias: {
        images: path.resolve(__dirname, "src/images"),
        public: path.resolve(__dirname, "src/public"),
        root: path.resolve(__dirname, "./"),
        src: path.resolve(__dirname, "./src"),
        js: path.resolve(__dirname, "./src/js"),
        scss: path.resolve(__dirname, "./src/scss"),
      },
    },
    module: {
      rules: [
        {
          test: /\.m?js$/,
          exclude: /(node_modules|bower_components)/,
          use: {
            loader: "babel-loader",
            options: {
              presets: ["@babel/preset-env"],
            },
          },
        },
        {
          test: /\.html$/,
          loader: "html-loader",
          options: {
            minimize: false,
            sources: false,
            preprocessor: processNestedHtml,
          },
        },
        {
          test: /\.(woff|woff2|eot|ttf|otf)$/,
          use: {
            loader: "url-loader",
          },
        },
        {
          test: /\.(svg|jpg|jpeg|png|webp|gif)$/,
          use: [
            {
              loader: "file-loader",
              options: {
                publicPath: "../images",
                outputPath: "images",
                name: "[contenthash].[ext]",
                esModule: false,
              },
            },
          ],
        },
        {
          test: /\.s[ac]ss$/i,
          use: [
            // Creates `style` nodes from JS strings
            "style-loader",
            // Translates CSS into CommonJS
            "css-loader",
            // Compiles Sass to CSS
            "sass-loader",
          ],
        },
      ],
    },
    watch: env.WEBPACK_WATCH ? true : false,
    watchOptions: {
      ignored: /node_modules/,
    },
  };
};
