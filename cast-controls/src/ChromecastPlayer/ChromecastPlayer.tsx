import { CircularProgress, styled, Tooltip } from '@material-ui/core';
import React, { useState, useEffect } from 'react';
import { CastButton, CastProvider, useCast } from 'react-cast-sender';
import Player, { PlayerProps } from './components/Player';

export interface ChromecastPlayerProps extends PlayerProps {
  receiverApplicationId?: string,
  resumeSavedSession?: boolean,
}

const Wrapper = styled(`div`)({
  position: 'relative',
});

const ConnectionBox = styled(`div`)({
  position: 'absolute',
  right: '0',
  margin: '10px',
  width: '50px',
});


const ChromecastPlayer: React.FunctionComponent<ChromecastPlayerProps> = (props) => {
  const { receiverApplicationId, resumeSavedSession, ...playerProps } = props;
  const [castSDKLoaded, setCastSdkLoaded] = useState<boolean>(false);
  const [devicesAvailable, setDevicesAvailable] = useState<boolean>(false);

  useEffect(() => {
    const handler = ({ castState }: cast.framework.CastStateEventData) => setDevicesAvailable(castState !== cast.framework.CastState.NO_DEVICES_AVAILABLE);

    if (castSDKLoaded) {
      cast.framework.CastContext.getInstance().addEventListener(cast.framework.CastContextEventType.CAST_STATE_CHANGED, handler)
      handler(new cast.framework.CastStateEventData(cast.framework.CastContext.getInstance().getCastState())); // initial state, we're a bit late with the listener
    }
    return () => {
      if (castSDKLoaded)
        cast.framework.CastContext.getInstance().removeEventListener(cast.framework.CastContextEventType.CAST_STATE_CHANGED, handler)
    }
  }, [castSDKLoaded]);

  return <Wrapper>
    <ConnectionBox>
      {!devicesAvailable && <Tooltip title="Looking for devices"><CircularProgress /></Tooltip>}
      <CastButton />
    </ConnectionBox>
    {/* TODO allow other CastProvider Props */}
    <CastProvider resumeSavedSession={resumeSavedSession} receiverApplicationId={receiverApplicationId}>
      <Player {...playerProps} sdkLoadComplete={() => setCastSdkLoaded(true)} />
    </CastProvider>
  </Wrapper>
}

ChromecastPlayer.defaultProps = {
  receiverApplicationId: 'CC1AD845', // TODO chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID;
  resumeSavedSession: true,
}

export default ChromecastPlayer;