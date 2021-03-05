const { PORT, FOLDER } = require("../env");
const LOCAL_IP = require("ip").address();
const URL = `http://${LOCAL_IP}:${PORT}`;

const path = require("path");
const mime = require("mime-types");
const iso6393 = require('iso-639-3')
const ffmpeg = require("ffmpeg");
const probe = require("node-ffprobe");

const toCastUrl = (file) => `${URL}/${file}`;

const isCastable = (filename) => {
  const extension = filename.split(".").pop();
  return ["mkv", "mp4"].includes(extension);
};

const isSubtitle = (filename) => {
  const extension = filename.split(".").pop();
  return ["srt", "sub", "vtt", "ssa", "ass"].includes(extension);
};

const getSubtitleConfig = (folder, filename) => {
  const url = toCastUrl(path.join(folder, filename).replace(`${FOLDER}/`, ""));
  const parts = filename.split(".");
  const language = parts[parts.length - 2];
  const { name } = iso6393.find(({iso6393, iso6391}) => iso6393 === language || iso6391 === language) || {};

  return name
    ? { url, filename, language, name }
    : { url, filename, language, name: `Unknown [${language}]`  };
};

const isVtt = (filename) =>
  filename.length - 4 === filename.lastIndexOf(".vtt"); // '.vtt' is the last 4 chars in the filename

const getCastMediaString = (folder, filename, directoryList) => {
  const filePath = path.join(folder, filename);
  const withoutExt = filename.split('.').slice(0, -1).join('.')
  const subtitles = directoryList
    .filter((filename) => isVtt(filename) && filename.includes(withoutExt))
    .map((filename) => getSubtitleConfig(folder, filename));

  return JSON.stringify({
    videoUrl: toCastUrl(filePath.replace(`${FOLDER}/`, "")),
    videoMime: mime.lookup(filename),
    title: filename,
    images: [
      // TODO cover image
    ],
    // TODO audio stream handling
    // audios: [metadata.streams.filter(({ codec_type, codec_name }) => codec_type === 'audio' && codec_name === 'mp3' )],
    subtitles,
  });
};

const readSubtitles = (file) =>
  probe(file).then((probeData) =>
    probeData.streams
      .filter(({ codec_type }) => codec_type === "subtitle")
      .map(({ index, tags }) => ({
        index,
        title: tags.title,
        language: tags.language,
      }))
  );

module.exports = {
  getCastMediaString,
  isCastable,
  isSubtitle,
  isVtt,
  readSubtitles,
};

/*const { ffprobe } = require("fluent-ffmpeg");
const getMetadata = async (filePath) => {
    return new Promise((resolve, reject) => {
      ffprobe(filePath, (err, metadata) => {
        if (err) {
          reject(err);
        } else {
          resolve(metadata);
        }
      });
    });
  };
  */
