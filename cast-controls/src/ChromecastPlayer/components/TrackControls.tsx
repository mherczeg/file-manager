import React, { useState } from 'react';
import { Grid, IconButton, Menu, MenuItem } from '@material-ui/core';
import { Subtitles, SubtitlesOutlined } from '@material-ui/icons';

export interface TrackControlsProps {
    subtitles: chrome.cast.media.Track[],
    activeTracks: number[],
    selectSubtitle: (trackId: number | undefined) => void
}

const TrackControls: React.FunctionComponent<TrackControlsProps> = ({ subtitles, activeTracks, selectSubtitle }) => {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleSelect = (trackId?: number) => {
        selectSubtitle(trackId);
        handleClose();
    }

    const subtitlesOn = subtitles.some(({ trackId }) => activeTracks.includes(trackId));

    return <Grid container spacing={2} justify="flex-end">
        <Grid item>
            <IconButton aria-controls="close-caption-menu" aria-haspopup="true" onClick={handleClick} disabled={subtitles.length === 0}>
                {subtitlesOn && <Subtitles />}
                {!subtitlesOn && <SubtitlesOutlined />}
            </IconButton>
            <Menu keepMounted
                anchorEl={anchorEl}                
                open={Boolean(anchorEl)}
                onClose={handleClose}>
                <MenuItem onClick={() => handleSelect()}>None</MenuItem>
                {subtitles.map((subtitle) =>
                    <MenuItem selected={activeTracks.includes(subtitle.trackId)}
                        onClick={() => handleSelect(subtitle.trackId)}>
                        {subtitle.name}
                    </MenuItem>)}
            </Menu>
        </Grid>
    </Grid>
}

TrackControls.defaultProps = {}

export default TrackControls;