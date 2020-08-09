if (process.env.NODE_ENV === "production") {
  require("./dist");
} else {
  const path = require("path");
  const nodemon = require("nodemon");

  const resolve = (p) => path.resolve(__dirname, p);

  nodemon({
    script: "dev.js",
    ext: "js ts json",
    ignore: ["./src/schema.ts", "./schema.json"].map(resolve),
  });
}
