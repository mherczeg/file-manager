const ffmpeg = require("fluent-ffmpeg");
const fs = require("fs-extra");

const isTextSubStream = ({ codec_type, codec_name }) =>
  codec_type === "subtitle" && ["ass", "subrip"].includes(codec_name); // TODO, other codec types could work

const extractSubtitles = (path) =>
  new Promise((resolve, reject) => {
    const baseFile = path.split(".").slice(0, -1).join(".");
    const commands = [];
    ffmpeg.ffprobe(path, (err, metadata) => {
      if (err) reject(err);
      metadata.streams.filter(isTextSubStream).forEach(({ index, tags }) => {
        commands.push(
          new Promise((resolve, reject) => {
            ffmpeg(path)
              .on("end", resolve)
              .on("error", reject)
              .noAudio()
              .noVideo()
              .outputOptions("-map", "0:" + index, "-c:s:0", "webvtt")
              .output(`${baseFile}.${tags.language}.vtt`)
              .run();
          })
        );
      });

      Promise.all(commands).then(resolve).catch(reject);
    });
  });

const rewriteCodec = (path) => {
  const tempFile = `temp-${new Date().getTime()}.mkv`;
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(path, (err, metadata) => {
      if (err) reject(err);
      const { codec_name } =
        metadata.streams.find(({ codec_type }) => codec_type === "audio") || {};

      if (codec_name !== "flac") {
        ffmpeg(path)
	  .on("start", console.log)
          .on("end", resolve)
          .on("error", reject)
          .audioCodec("flac")
          .videoCodec("copy")
          .outputOptions("-map", "0") // this makes sure that all the tracks are kept
          .output(tempFile)
          .run();
      } else {
        reject();
      }
    });
  })
    .then(() => new Promise((resolve) => fs.unlink(path, resolve)))
    .then(() => new Promise((resolve) => fs.move(tempFile, path, resolve)));
};

module.exports = { extractSubtitles, rewriteCodec };
