var path = require("path");
var autoprefixer = require("autoprefixer");
var webpack = require("webpack");
var HtmlWebpackPlugin = require("html-webpack-plugin");
var ExtractTextPlugin = require("extract-text-webpack-plugin");
var url = require("url");
var paths = require("./paths");
var env = require("./env");
if(env["process.env.NODE_ENV"] !== '"production"') {
	throw new Error("Production builds must have NODE_ENV=production.")
}
var homepagePath = require(paths.appPackageJson).homepage;
var publicPath = homepagePath ? url.parse(homepagePath).pathname : "/";
if(!publicPath.endsWith("/")) {
	publicPath += "/"
}
module.exports = {
	bail: true,
	devtool: "source-map",
	entry: [require.resolve("./polyfills"), path.join(paths.appSrc, "index")],
	output: {
		path: paths.appBuild,
		filename: "static/js/[name].[chunkhash:8].js",
		chunkFilename: "static/js/[name].[chunkhash:8].chunk.js",
		publicPath: publicPath
	},
	resolve: {
		extensions: [".js", ".json", ""],
		alias: {
			"babel-runtime/regenerator": require.resolve("babel-runtime/regenerator"),
			"react-native": "react-native-web"
		}
	},
	resolveLoader: {
		root: paths.ownNodeModules,
		moduleTemplates: ["*-loader"]
	},
	module: {
		preLoaders: [{
			test: /\.js$/,
			loader: "eslint",
			include: paths.appSrc
		}],
		loaders: [{
			test: /\.js$/,
			include: paths.appSrc,
			loader: "babel",
			query: require("./babel.prod")
		}, {
			test: /\.css$/,
			include: [paths.appSrc, paths.appNodeModules],
			loader: ExtractTextPlugin.extract("style", "css?-autoprefixer!postcss")
		}, {
			test: /\.json$/,
			include: [paths.appSrc, paths.appNodeModules],
			loader: "json"
		}, {
			test: /\.(ico|jpg|png|gif|eot|svg|ttf|woff|woff2)(\?.*)?$/,
			exclude: /\/favicon.ico$/,
			include: [paths.appSrc, paths.appNodeModules],
			loader: "file",
			query: {
				name: "static/media/[name].[hash:8].[ext]"
			}
		}, {
			test: /\/favicon.ico$/,
			include: [paths.appSrc],
			loader: "file",
			query: {
				name: "favicon.ico?[hash:8]"
			}
		}, {
			test: /\.(mp4|webm)(\?.*)?$/,
			include: [paths.appSrc, paths.appNodeModules],
			loader: "url",
			query: {
				limit: 10000,
				name: "static/media/[name].[hash:8].[ext]"
			}
		}, {
			test: /\.html$/,
			loader: "html",
			query: {
				attrs: ["link:href"],
			}
		}]
	},
	eslint: {
		configFile: path.join(__dirname, "eslint.js"),
		useEslintrc: false
	},
	postcss: function() {
		return [autoprefixer({
			browsers: [">1%", "last 4 versions", "Firefox ESR", "not ie < 9", ]
		}), ]
	},
	plugins: [new HtmlWebpackPlugin({
		inject: true,
		template: paths.appHtml,
		minify: {
			removeComments: true,
			collapseWhitespace: true,
			removeRedundantAttributes: true,
			useShortDoctype: true,
			removeEmptyAttributes: true,
			removeStyleLinkTypeAttributes: true,
			keepClosingSlash: true,
			minifyJS: true,
			minifyCSS: true,
			minifyURLs: true
		}
	}), new webpack.DefinePlugin(env), new webpack.optimize.OccurrenceOrderPlugin(), new webpack.optimize.DedupePlugin(), new webpack.optimize.UglifyJsPlugin({
		compress: {
			screw_ie8: true,
			warnings: false
		},
		mangle: {
			screw_ie8: true
		},
		output: {
			comments: false,
			screw_ie8: true
		}
	}), new ExtractTextPlugin("static/css/[name].[contenthash:8].css")]
};