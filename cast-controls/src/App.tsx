import React, { useEffect, useState } from 'react';
// import { CastButton, CastProvider, useCast, useCastPlayer } from 'react-cast-sender';
import './App.css';
import ChromecastPlayer from './ChromecastPlayer/ChromecastPlayer';
// import NewPlayer from './ChromecastPlayer/components/Player';
import { PlayerProps } from './ChromecastPlayer/components/Player';

/*
const UseCastInfo: React.FunctionComponent = () => {
  const { initialized, connected, deviceName } = useCast();
  return <ul>
    <li>{window.chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID}</li>
    <li>initlized: {String(initialized)}</li>
    {connected && <li>Connected to: {deviceName}</li>}
  </ul>
}
const MediaInfo: React.FunctionComponent = () => {
  const { loadMedia } = useCastPlayer();
  const { connected } = useCast();
  const castMedia = sessionStorage.getItem('cast-media');
  if (!castMedia) {
    return <div>no new media selected</div>
  } else {
    const { videoUrl, videoMime, title, images, subtitles } = JSON.parse(castMedia || '') as CastMedia;

    const getRequest = () => {
      const mediaInfo = new window.chrome.cast.media.MediaInfo(
        videoUrl,
        videoMime
      );
      const metadata = new window.chrome.cast.media.MovieMediaMetadata();
      metadata.title = title || 'defaultTitle';
      metadata.images = images.map((image) => new window.chrome.cast.Image(image));
      mediaInfo.metadata = metadata;
      mediaInfo.tracks = subtitles.map((subtitle, index) => {
        const trackNum = index + 1;
        const track = new window.chrome.cast.media.Track(trackNum, chrome.cast.media.TrackType.TEXT);
        track.trackContentId = subtitle;
        track.trackContentType = 'text/vtt';
        track.subtype = chrome.cast.media.TextTrackType.SUBTITLES;
        track.name = `Subtitles ${trackNum}`;
        track.language = 'en';
        return track;
      });
      sessionStorage.removeItem('cast-media');
      return new window.chrome.cast.media.LoadRequest(mediaInfo);
    }

    return <ul>
      <li><strong>Load new File</strong></li>
      <li>Title: {title}</li>
      <li>videoUrl: {videoUrl}</li>
      <li>videoMime: {videoMime}</li>
      {images.map((image) => <li key={image}><img src={image} height="100px" /></li>)}
      {subtitles.map((subtitle) => <li key={subtitle}>{subtitle}</li>)}
      <li><button disabled={!connected} onClick={() => loadMedia(getRequest())}>Cast</button></li>
    </ul>
  }
}

const Player: React.FunctionComponent = () => {
  const { tracks, editTracks, currentTime, duration, togglePlay, isPaused } = useCastPlayer();
  const { player, playerController } = useCast();
  const myPlayer = player || { duration, currentTime };

  return <ul>
    <li>{myPlayer.currentTime}/{myPlayer.duration}</li>
    <li>{playerController && playerController.getSeekPosition(myPlayer.currentTime, myPlayer.duration)}</li>
    <li><button onClick={() => togglePlay()}>{isPaused ? 'Resume' : 'Pause'}</button></li>
    <li><button onClick={() => playerController?.stop()}>Stop</button></li>
    {tracks
      .filter(({ subtype }) => subtype === chrome.cast.media.TextTrackType.SUBTITLES)
      .map((track) => <li key={track.name}><button onClick={() => { editTracks([track.trackId]) }}>Select Subtitle: {track.name}</button></li>)}
  </ul>
}

const CastBody: React.FunctionComponent = ({ children }) => {
  const { initialized, player } = useCast();
  const { isMediaLoaded, togglePlay } = useCastPlayer();

  useEffect(() => {
    if (isMediaLoaded) { togglePlay(); togglePlay(); } // poor man's update-player-info-on-resume
  }, [isMediaLoaded]);

  useEffect(() => {
    console.log(player?.mediaInfo)
  }, [player?.mediaInfo]);

  return <>
    {initialized && <UseCastInfo />}
    {initialized && <MediaInfo />}
    {isMediaLoaded && <Player />}
    {children}
  </>
}
*/
const CAST_MEDIA_STORAGE_KEY = 'cast-media';


interface CastMedia {
  videoUrl: PlayerProps['videoUrl'],
  videoMime: PlayerProps['videoMime'],
  title: PlayerProps['title'],
  images: PlayerProps['images'],
  subtitles: PlayerProps['subtitles'],
}

const App: React.FunctionComponent = () => {
  // TODO chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID;
  const receiverApplicationId = "CC1AD845";
  const [mediaToLoad, setMediaToLoad] = useState<PlayerProps>();

  useEffect(() => {
    const cookie = document.cookie
      .split('; ')
      .find(row => row.startsWith(`${CAST_MEDIA_STORAGE_KEY}=`));
    const castMedia = (cookie || "").split('=')[1];
    if (castMedia) {
      const { videoUrl, videoMime, title, images, subtitles } = JSON.parse(castMedia || '') as CastMedia;
      if (videoUrl && videoMime) {
        setMediaToLoad({ videoUrl, videoMime, title, images, subtitles });
      }
    }
  }, [])

  return (
    <ChromecastPlayer resumeSavedSession={true}
      receiverApplicationId={receiverApplicationId}
      mediaLoadComplete={() => {
        console.log('media load complete');
        // delete cookie
        document.cookie = `${CAST_MEDIA_STORAGE_KEY}=; Max-Age=-99999999;`;
      }}
      {...mediaToLoad} />
  );
}

export default App;
