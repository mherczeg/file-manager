import React from 'react';
import { Grid, IconButton, Tooltip } from '@material-ui/core';
import { Pause, PlayArrow, Replay30, Stop } from '@material-ui/icons';

export interface SeekerProps {
    replayClick?: () => void,
    stopClick?: () => void,
    togglePlay: () => void,
    isPlaying: boolean,
    disabled: boolean,
}

const PlayerButtons: React.FunctionComponent<SeekerProps> = ({ disabled, replayClick, stopClick, isPlaying, togglePlay }) => {
    return <Grid container justify="center">
        <Grid item>
            {replayClick && <Tooltip title="Rewind">
                <IconButton disabled={disabled} onClick={() => replayClick()}>
                    <Replay30 />
                </IconButton>
            </Tooltip>}
        </Grid>
        <Grid item>
            <Tooltip title={isPlaying && !disabled ? 'Pause' : 'Play'}>
                <IconButton disabled={disabled} onClick={() => togglePlay && togglePlay()}>
                    {(isPlaying && !disabled) && <Pause />}
                    {(!isPlaying || disabled) && <PlayArrow />}
                </IconButton>
            </Tooltip>
        </Grid>
        <Grid item>
            {stopClick && <Tooltip title="Stop">
                <IconButton disabled={disabled} onClick={() => stopClick()}>
                    <Stop />
                </IconButton>
            </Tooltip>}
        </Grid>
    </Grid>
}

PlayerButtons.defaultProps = {
    replayClick: () => { },
    stopClick: () => { },
}

export default PlayerButtons;