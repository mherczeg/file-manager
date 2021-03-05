import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@material-ui/core';
import FileInfo, { FileInfoProps } from './FileInfo';
import Seeker from './Seeker';
import PlayerButtons from './PlayerButtons';
import Volume from './Volume';
import { useCast, useCastPlayer } from 'react-cast-sender';
import TrackControls from './TrackControls';

const CONNECT_MESSAGE = 'Select Casting Device';

export interface Subtitle {
    url: string,
    language: string,
    name?: string,
}

export interface PlayerProps {
    mediaLoadComplete?: () => void,
    videoUrl?: string,
    videoMime?: string,
    title?: string,
    images?: string[],
    subtitles?: Subtitle[],
    sdkLoadComplete?: () => void,
}

const getRequest = (videoUrl: string, videoMime: string, title: string, images: string[], subtitles: Subtitle[]) => {
    const mediaInfo = new chrome.cast.media.MediaInfo(
        videoUrl,
        videoMime
    );
    const metadata = new chrome.cast.media.MovieMediaMetadata();
    metadata.title = title;
    metadata.images = images.map((image) => new chrome.cast.Image(image));
    mediaInfo.metadata = metadata;
    mediaInfo.tracks = subtitles.map(({ url, language, name }, index) => {
        const trackNum = index + 1;
        const track = new chrome.cast.media.Track(trackNum, chrome.cast.media.TrackType.TEXT);
        track.trackContentId = url;
        track.trackContentType = 'text/vtt';
        track.subtype = chrome.cast.media.TextTrackType.SUBTITLES;
        track.name = name || language;
        track.language = language;
        return track;
    });
    return new chrome.cast.media.LoadRequest(mediaInfo);
}

const Player: React.FunctionComponent<PlayerProps> = (props) => {
    const { mediaLoadComplete, sdkLoadComplete, videoUrl, videoMime } = props;
    const fileTitle = props.title || 'Video File';
    const fileImages = props.images || [];
    const fileSubtitles = props.subtitles || [];

    const { initialized, connected, deviceName, player, playerController } = useCast();
    const {
        isMediaLoaded,
        currentTime,
        duration,
        isPaused,
        isMuted,
        tracks,
        title,
        thumbnail,
        loadMedia,
        togglePlay,
        toggleMute,
        seek,
        setVolume,
        editTracks
    } = useCastPlayer();

    const [fileInfo, setFileInfo] = useState<FileInfoProps>({
        title: fileTitle,
        deviceName: connected ? deviceName : CONNECT_MESSAGE,
        coverImage: fileImages[0] || ''
    });

    const [subtitleTracks, setSubtitlesTracks] = useState<chrome.cast.media.Track[]>([]);
    const [activeTracks, setActiveTracks] = useState<number[]>([]);

    useEffect(() => {
        if (initialized && sdkLoadComplete) sdkLoadComplete();
    }, [initialized])

    useEffect(() => {
        if (videoUrl && videoMime) loadMedia(getRequest(videoUrl, videoMime, fileTitle, fileImages, fileSubtitles))
            .then(() => mediaLoadComplete && mediaLoadComplete());
    }, [connected])

    useEffect(() => {
        if (isMediaLoaded) { togglePlay(); togglePlay(); } // poor man's update-player-info-on-resume
    }, [isMediaLoaded]);

    useEffect(() => {
        setFileInfo({
            title: title || fileTitle,
            deviceName,
            coverImage: thumbnail || fileImages[0]
        });
    }, [title, thumbnail]);

    useEffect(() => {
        setSubtitlesTracks(tracks.filter(({ subtype }) => subtype === chrome.cast.media.TextTrackType.SUBTITLES))
    }, [tracks]);

    useEffect(() => {
        const handler = () => setActiveTracks(cast.framework.CastContext.getInstance().getCurrentSession()?.getMediaSession()?.activeTrackIds || []);
        if (playerController) playerController.addEventListener(cast.framework.RemotePlayerEventType.MEDIA_INFO_CHANGED, handler);
        return () => {
            if (playerController) playerController.removeEventListener(cast.framework.RemotePlayerEventType.MEDIA_INFO_CHANGED, handler);
        };
    }, [playerController])

    return <Card>
        <CardContent>
            {fileInfo && <FileInfo {...fileInfo} />}

            {initialized && <Seeker
                currentTime={currentTime}
                duration={duration}
                disabled={!isMediaLoaded}
                sliderChange={(value) => seek(value)} />}

            <PlayerButtons disabled={!isMediaLoaded}
                isPlaying={!isPaused}
                replayClick={() => seek(Math.max(currentTime - 30, 0))}
                stopClick={() => playerController && playerController.stop()}
                togglePlay={togglePlay} />

            <Volume volumeLevel={player && player.volumeLevel ? player.volumeLevel : 0}
                isMuted={isMuted}
                volumeChange={(value) => setVolume(value)}
                toggleMute={toggleMute}
            />

            <TrackControls subtitles={subtitleTracks}
                selectSubtitle={(trackId) => editTracks(trackId ? [trackId] : [])}
                activeTracks={activeTracks} />

        </CardContent>
    </Card>
}

export default Player;