import React from 'react';
import { Grid, IconButton, Tooltip } from '@material-ui/core';
import { VolumeDown, VolumeOff, VolumeUp } from '@material-ui/icons';
import { Slider } from '../commonComponents/Slider';

export interface VolumeProps {
    volumeLevel: number,
    isMuted: boolean,
    volumeChange?: (value: number | number[]) => any,
    toggleMute: () => void,
}

const Volume: React.FunctionComponent<VolumeProps> = ({ volumeLevel, isMuted, volumeChange, toggleMute }) => {
    return <Grid container spacing={2}>
        <Grid item>
            <Tooltip title={isMuted ? 'Unmute' : 'Mute'}>
                <IconButton onClick={() => toggleMute()}>
                    {isMuted && <VolumeOff />}
                    {!isMuted && <VolumeDown />}
                </IconButton>
            </Tooltip>
        </Grid>
        <Grid item xs>
            <Slider value={volumeLevel}
                min={0}
                max={1}
                step={0.05}
                valueLabelFormat={(labelValue) => `${Math.floor(labelValue*100)}%`}
                onChangeCommitted={(e, value) => { volumeChange && volumeChange(value); }} />
        </Grid>
        <Grid item>
            <IconButton >
                <VolumeUp />
            </IconButton>
        </Grid>
    </Grid>
}

Volume.defaultProps = {
    volumeChange: () => { },
}

export default Volume;